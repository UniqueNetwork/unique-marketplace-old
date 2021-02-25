// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { NftCollectionInterface, TokenDetailsInterface } from '@polkadot/react-hooks/useCollections';

import { useMachine } from '@xstate/react';
import BN from 'bn.js';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { StatusContext } from '@polkadot/react-components/Status';
import { useApi, useBalance, useCollections, useNftContract } from '@polkadot/react-hooks';

import marketplaceStateMachine from './stateMachine';

type UserActionType = 'BUY' | 'CANCEL' | 'SALE' | 'REVERT_UNUSED_MONEY' | 'UPDATE_TOKEN_STATE' | 'OFFER_TRANSACTION_FAIL' | 'SUBMIT_OFFER' | 'OFFER_TRANSACTION_SUCCESS';

export interface MarketplaceStagesInterface {
  cancelSale: () => void;
  deposited: BN | undefined;
  depositor: string | undefined;
  error: string | null;
  saleFee: BN | undefined;
  sendCurrentUserAction: (action: UserActionType) => void;
  setPrice: (price: string) => void;
  tokenInfo: TokenDetailsInterface | undefined;
  tokenPriceForSale: number | undefined;
  transferStep: number;
  readyToAskPrice: boolean;
  setTokenPriceForSale: (price: number) => void;
  submitTokenPrice: () => void;
}

// 0 == user owns token, no offers placed
// 1 == user pressed Trade button
// 2 == token sent to vault, waiting for deposit (ownership cannot be determined)
// 3 == deposit ready, user can place ask
// 4 == Ask placed, user can cancel
// 5 == Someone else owns token, no offers placed
// 6 == Token is for sale, can buy
// 7 == User pressed buy button, should deposit KSM
// 8 == User deposited KSM, waiting to register
// 9 == KSM deposited, Can sign buy transaction

// type saleStage = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';

export const useMarketplaceStages = (account: string, collectionInfo: NftCollectionInterface | undefined, tokenId: string): MarketplaceStagesInterface => {
  const { api } = useApi();
  const [state, send] = useMachine(marketplaceStateMachine);
  const [tokenInfo, setTokenInfo] = useState<TokenDetailsInterface>();
  const [saleFee, setSaleFee] = useState<BN>();
  const { getDetailedReFungibleTokenInfo, getDetailedTokenInfo } = useCollections();
  const { contractAddress, contractInstance, decimals, deposited, depositor, escrowAddress, findCallMethodByName, getDepositor, getTokenAsk, getUserDeposit, isContractReady, maxGas, tokenAsk, vaultAddress } = useNftContract(account);
  const { balance } = useBalance(account);
  const [error, setError] = useState<string | null>(null);
  const { queueExtrinsic } = useContext(StatusContext);
  const [readyToAskPrice, setReadyToAskPrice] = useState<boolean>(false);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<number>();

  const sendCurrentUserAction = useCallback((userAction: UserActionType) => {
    send(userAction);
  }, [send]);

  const getFee = useCallback((price: number): number => {
    if (price <= 0.001) {
      return 0;
    }

    if (price < 0.01) {
      return price + 0.01;
    }

    return price * 0.02;
  }, []);

  const queueTransaction = useCallback((transaction: SubmittableExtrinsic, fail: string, start: string, success: string, update: string) => {
    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => send(fail),
      txStartCb: () => send(start),
      txSuccessCb: () => send(success),
      txUpdateCb: () => send(update)
    });
  }, [account, queueExtrinsic, send]);

  const getSaleFee = useCallback(async () => {
    const fee = await api.tx.nft.transfer(contractAddress, collectionInfo, tokenId, 0).paymentInfo(account) as { partialFee: BN };

    if (fee) {
      setSaleFee(fee.partialFee);
      console.log('fee', fee);
    }
  }, [account, api.tx.nft, collectionInfo, contractAddress, tokenId]);

  /** user actions **/
  const sale = useCallback(async () => {
    // check balance to have enough fee
    await getSaleFee();

    if (saleFee && balance?.free.gte(saleFee) && collectionInfo) {
      queueTransaction(
        api.tx.nft
          .transfer(contractAddress, collectionInfo.id, tokenId, 0),
        'TRANSFER_NFT_TO_CONTRACT_FAIL',
        'deposit nft to contract start',
        'TRANSFER_NFT_TO_CONTRACT_SUCCESS',
        'deposit nft to contract update'
      );
    }
  }, [api.tx.nft, balance?.free, collectionInfo, contractAddress, getSaleFee, queueTransaction, saleFee, tokenId]);

  const waitForDeposit = useCallback(() => {
    if (!collectionInfo) {
      return;
    }

    console.log('depositor address', depositor);

    if (depositor === account) {
      // depositor is me
      send('NFT_DEPOSIT_READY');
    } else if (depositor) {
      send('NFT_DEPOSIT_OTHER');
    }
  }, [account, collectionInfo, depositor, send]);

  const buy = useCallback(() => {
    console.log('buy');

    // send deposit to contract
    // Check if KSM deposit is needed and deposit
    if (!tokenAsk) {
      console.error('tokenContractInfo is undefined');

      return;
    }

    if (!deposited) {
      console.error('deposited is undefined');

      return;
    }

    const price = tokenAsk.price.toNumber();
    const depositedNumber = deposited.toNumber();
    const feeFull = getFee(price);
    const feePaid = getFee(depositedNumber);

    if (depositedNumber < price) {
      const fee = feeFull - feePaid;
      const needed = price + fee - depositedNumber;

      if (balance?.free.ltn(needed)) {
        setError(`Your KSM balance is too low: ${balance?.free.toNumber()}. You need at least: ${needed} KSM`);

        return;
      }

      queueTransaction(
        api.tx.balances
          .transfer(vaultAddress, needed),
        'SEND_MONEY_FAIL',
        'transfer start',
        'SEND_MONEY_SUCCESS',
        'transfer update'
      );
    }
    // buyStep3
  }, [api.tx.balances, balance?.free, deposited, getFee, queueTransaction, tokenAsk, vaultAddress]);

  const checkDepositReady = useCallback(() => {
    setTimeout(() => {
      send('DEPOSIT_SUCCESS');
    }, 1000);
  }, [send]);

  const sentTokenToAccount = useCallback(() => {
    console.log('sentTokenToNewOwner');
    setTimeout(() => {
      send('DEPOSIT_SUCCESS');
    }, 1000);
    // tokenId, newOwner (account)

    const message = findCallMethodByName('buy');

    if (message && contractInstance && collectionInfo) {
      const extrinsic = contractInstance.exec(message, {
        gasLimit: maxGas,
        value: 0
      }, collectionInfo.id, tokenId);

      queueTransaction(
        extrinsic,
        'SEND_TOKEN_FAIL',
        'send token to account start',
        'SEND_TOKEN_SUCCESS',
        'send token to account update'
      );
    }
  }, [findCallMethodByName, contractInstance, send, maxGas, collectionInfo, tokenId, queueTransaction]);

  const revertMoney = useCallback(() => {
    /* При исполнении сделки, нужно посылать только сумму, указанную в withdraw.
    При снятии неиспользованных средств нужно также возмещать комиссию marketplace за вычетом комиссии сети Kusama (0.0027 KSM).
     */

    const expectedCommission = new BN(10).pow(decimals);
    const balance = deposited || new BN(0);
    const balanceToSend = balance.iadd(expectedCommission).integerValue(BN.ROUND_DOWN);

    const message = findCallMethodByName('withdraw');

    if (message && contractInstance) {
      const extrinsic = contractInstance.exec(message, {
        gasLimit: maxGas,
        value: 0
      }, 2, deposited);

      queueTransaction(
        extrinsic,
        'TRANSFER_NFT_TO_CONTRACT_FAIL',
        'deposit nft to contract start',
        'TRANSFER_NFT_TO_CONTRACT_SUCCESS',
        'deposit nft to contract update'
      );
    }
  }, [decimals, deposited, findCallMethodByName, contractInstance, maxGas, queueTransaction]);

  const submitTokenPrice = useCallback(() => {
    /* if (tokenPriceForSale && ((tokenPriceForSale < 0.01) || (tokenPriceForSale > 10000)))`
      Sorry, price should be in the range between 0.01 and 10000 KSM. You have input: ${price}
    `; */
    send('ASK_PRICE_SUCCESS');
  }, [send]);

  const askPrice = useCallback(() => {
    setReadyToAskPrice(true);
  }, [setReadyToAskPrice]);

  const registerSale = useCallback(() => {
    const message = findCallMethodByName('ask');

    if (message && contractInstance && collectionInfo) {
      const extrinsic = contractInstance.exec(message, { gasLimit: maxGas, value: 0 }, collectionInfo.id, tokenId, 2, tokenPriceForSale);

      queueTransaction(
        extrinsic,
        'REGISTER_SALE_FAIL',
        'registerSale start',
        'REGISTER_SALE_SUCCESS',
        'registerSale update'
      );
    }
  }, [collectionInfo, contractInstance, findCallMethodByName, maxGas, queueTransaction, tokenId, tokenPriceForSale]);

  const cancelSale = useCallback(() => {
    const message = findCallMethodByName('cancel');

    if (message && contractInstance && collectionInfo) {
      const extrinsic = contractInstance.exec(message, { gasLimit: maxGas, value: 0 }, collectionInfo.id, tokenId);

      queueTransaction(
        extrinsic,
        'CANCEL_SALE_FAIL',
        'cancelSale start',
        'CANCEL_SALE_SUCCESS',
        'cancelSale update'
      );
    }
  }, [collectionInfo, contractInstance, findCallMethodByName, maxGas, queueTransaction, tokenId]);

  const setPrice = useCallback((price) => {
    setTokenPriceForSale(price);
    setReadyToAskPrice(false);
    send('ASK_PRICE_SUCCESS');
  }, [send]);

  const transferStep = useMemo((): number => {
    switch (state.value) {
      case 'sale':
        return 1;
      case 'waitForDeposit':
        return 2;
      case 'askPrice':
        return 3;
      case 'buy':
        return 4;
      case 'checkDepositReady':
        return 5;
      case 'sentTokenToNewOwner':
        return 6;
      default:
        return 0;
    }
  }, [state.value]);

  const loadingTokenInfo = useCallback(async () => {
    console.log('loadingTokenInfo');

    let info;

    if (!collectionInfo) {
      return;
    }

    if (collectionInfo.Mode.isReFungible) {
      info = await getDetailedReFungibleTokenInfo(collectionInfo.id, tokenId);
    } else {
      info = await getDetailedTokenInfo(collectionInfo.id, tokenId);
    }

    setTokenInfo(info);

    // the token is mine
    if (info?.Owner?.toString() === account) {
      send('IDLE');
    } else if (info?.Owner?.toString() === escrowAddress) {
      getDepositor(collectionInfo.id, tokenId);
      // the token is in escrow - waiting for deposit
      send('WAIT_FOR_DEPOSIT');
    } else {
      // check the token price and user deposit
      getTokenAsk(collectionInfo.id, tokenId);
      getUserDeposit();
      send('WAIT_FOR_USER_ACTION');
    }
  }, [collectionInfo, account, escrowAddress, getDetailedReFungibleTokenInfo, tokenId, getDetailedTokenInfo, send, getDepositor, getTokenAsk, getUserDeposit]);

  useEffect(() => {
    switch (true) {
      // on load - update token state
      case state.matches('loadingTokenInfo'):
        void loadingTokenInfo();
        break;
      case state.matches('buy'):
        void buy();
        break;
      case state.matches('sale'):
        void sale();
        break;
      case state.matches('sentTokenToNewOwner'):
        void sentTokenToAccount();
        break;
      case state.matches('waitForDeposit'):
        void waitForDeposit();
        break;
      case state.matches('getDepositReady'):
        break;
      case state.matches('askPrice'):
        void askPrice();
        break;
      case state.matches('registerSale'):
        void registerSale();
        break;
      case state.matches('revertMoney'):
        void revertMoney();
        break;
      case state.matches('checkDepositReady'):
        void checkDepositReady();
        break;
      case state.matches('cancelSale'):
        void cancelSale();
        break;
      default:
        break;
    }
  }, [state.value, loadingTokenInfo, state, buy, sale, sentTokenToAccount, waitForDeposit, askPrice, registerSale, revertMoney, checkDepositReady, cancelSale]);

  useEffect(() => {
    console.log('isContractReady', isContractReady);

    if (isContractReady) {
      send('UPDATE_TOKEN_STATE');
    }
  }, [send, isContractReady]);

  console.log('state.value', state.value);
  console.log('contractInstance?.abi.messages', contractInstance);
  console.log('deposited', deposited);
  console.log('tokenAsk', tokenAsk);

  return {
    cancelSale,
    deposited,
    depositor,
    error,
    readyToAskPrice,
    saleFee,
    sendCurrentUserAction,
    setPrice,
    setTokenPriceForSale,
    submitTokenPrice,
    tokenInfo,
    tokenPriceForSale,
    transferStep
  };
};
