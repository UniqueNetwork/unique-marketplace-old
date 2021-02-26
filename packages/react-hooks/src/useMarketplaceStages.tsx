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

type UserActionType = 'BUY' | 'CANCEL' | 'SELL' | 'REVERT_UNUSED_MONEY' | 'UPDATE_TOKEN_STATE' | 'OFFER_TRANSACTION_FAIL' | 'SUBMIT_OFFER' | 'OFFER_TRANSACTION_SUCCESS';

export interface MarketplaceStagesInterface {
  deposited: BN | undefined;
  depositor: string | undefined;
  error: string | null;
  saleFee: BN | undefined;
  sendCurrentUserAction: (action: UserActionType) => void;
  setPrice: (price: string) => void;
  tokenAsk: { owner: string, price: BN } | undefined;
  tokenInfo: TokenDetailsInterface | undefined;
  tokenPriceForSale: number | undefined;
  transferStep: number;
  readyToAskPrice: boolean;
  setTokenPriceForSale: (price: number) => void;
}

export const useMarketplaceStages = (account: string, collectionInfo: NftCollectionInterface | undefined, tokenId: string): MarketplaceStagesInterface => {
  const { api } = useApi();
  const [state, send] = useMachine(marketplaceStateMachine);
  const [tokenInfo, setTokenInfo] = useState<TokenDetailsInterface>();
  const [saleFee, setSaleFee] = useState<BN>();
  const { getDetailedReFungibleTokenInfo, getDetailedTokenInfo } = useCollections();
  const { contractInstance, decimals, deposited, depositor, escrowAddress, findCallMethodByName, getDepositor, getTokenAsk, getUserDeposit, isContractReady, maxGas, tokenAsk } = useNftContract(account);
  const { balance } = useBalance(account);
  const [error, setError] = useState<string | null>(null);
  const { queueExtrinsic } = useContext(StatusContext);
  const [readyToAskPrice, setReadyToAskPrice] = useState<boolean>(false);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<number>();

  const sendCurrentUserAction = useCallback((userAction: UserActionType) => {
    send(userAction);
  }, [send]);

  const getTokenInfo = useCallback(async () => {
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

    return info;
  }, [collectionInfo, getDetailedReFungibleTokenInfo, getDetailedTokenInfo, tokenId]);

  const loadingTokenInfo = useCallback(async () => {
    console.log('loadingTokenInfo');

    if (!collectionInfo) {
      return;
    }

    const info = await getTokenInfo();

    // the token is mine
    if (info?.Owner?.toString() === account) {
      send('WAIT_FOR_USER_ACTION');
    } else if (info?.Owner?.toString() === escrowAddress) {
      // if we have ask - wait for action
      if (tokenAsk && tokenAsk.price) {
        send('WAIT_FOR_USER_ACTION');
      } else {
        // check the token price and user deposit
        const ask = await getTokenAsk(collectionInfo.id, tokenId);

        if (ask && ask.price) {
          send('WAIT_FOR_USER_ACTION');
        } else {
          const tokenDepositor = await getDepositor(collectionInfo.id, tokenId);

          console.log('tokenDepositor', tokenDepositor);

          // the token is in escrow - waiting for deposit
          send('WAIT_FOR_DEPOSIT');
        }
      }
    } else {
      send('WAIT_FOR_USER_ACTION');
    }

    await getUserDeposit();
  }, [collectionInfo, getTokenInfo, account, escrowAddress, getUserDeposit, send, tokenAsk, getTokenAsk, tokenId, getDepositor]);

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
      txFailedCb: () => { console.log(fail); send(fail); },
      txStartCb: () => { console.log(start); },
      txSuccessCb: () => { console.log(success); send(success); },
      txUpdateCb: () => { console.log(update); }
    });
  }, [account, queueExtrinsic, send]);

  const getSaleFee = useCallback(async () => {
    const fee = await api.tx.nft.transfer(escrowAddress, collectionInfo?.id, tokenId, 0).paymentInfo(account) as { partialFee: BN };

    if (fee) {
      setSaleFee(fee.partialFee);

      return fee.partialFee;
    }

    return null;
  }, [account, api.tx.nft, collectionInfo, escrowAddress, tokenId]);

  /** user actions **/
  const sell = useCallback(async () => {
    // check balance to have enough fee
    const fee = await getSaleFee();

    if (fee && balance?.free.gte(fee) && collectionInfo) {
      queueTransaction(
        api.tx.nft
          .transfer(escrowAddress, collectionInfo.id, tokenId, 0),
        'TRANSFER_FAIL',
        'deposit nft to contract start',
        'TRANSFER_SUCCESS',
        'deposit nft to contract update'
      );
      send('TRANSACTION_READY');
    }
  }, [api.tx.nft, balance?.free, collectionInfo, escrowAddress, getSaleFee, queueTransaction, send, tokenId]);

  const waitForDeposit = useCallback(() => {
    // we selling it, price was set
    if (depositor === account) {
      // depositor is me
      send('NFT_DEPOSIT_READY');
    } else if (depositor || (tokenAsk && tokenAsk.price)) {
      send('NFT_DEPOSIT_OTHER');
    } else {
      setTimeout(() => {
        waitForDeposit();
      }, 5000);
    }
  }, [account, depositor, send, tokenAsk]);

  const waitForTokenRevert = useCallback(async () => {
    const info = await getTokenInfo();

    if (info?.Owner?.toString() === account) {
      send('TOKEN_REVERT_SUCCESS');
    } else {
      setTimeout(() => {
        send('TOKEN_REVERT_FAIL');
      }, 5000);
    }
  }, [account, getTokenInfo, send]);

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

    console.log('feeFull', feeFull);
    console.log('feePaid', feePaid);

    if (depositedNumber < price) {
      const fee = feeFull - feePaid;
      const needed = price + fee - depositedNumber;

      console.log('price', price);
      console.log('needed', needed);

      if (balance?.free.ltn(needed)) {
        setError(`Your KSM balance is too low: ${balance?.free.toNumber()}. You need at least: ${needed} KSM`);

        return;
      }

      send('SIGN_SUCCESS');

      queueTransaction(
        api.tx.balances
          .transfer(escrowAddress, needed),
        'SEND_MONEY_FAIL',
        'SIGN_SUCCESS',
        'SEND_MONEY_SUCCESS',
        'transfer update'
      );
    } else {
      send('DEPOSIT_ENOUGH');
    }
    // buyStep3
  }, [api.tx.balances, balance?.free, deposited, escrowAddress, getFee, queueTransaction, send, tokenAsk]);

  const checkDepositReady = useCallback(async () => {
    const userDeposit = await getUserDeposit();

    if (userDeposit) {
      send('DEPOSIT_SUCCESS');
    } else {
      setTimeout(() => {
        send('DEPOSIT_FAIL');
      }, 5000);
    }
  }, [getUserDeposit, send]);

  const sentTokenToAccount = useCallback(() => {
    console.log('sentTokenToNewOwner');
    const message = findCallMethodByName('buy');

    if (message && contractInstance && collectionInfo) {
      send('SIGN_SUCCESS');

      const extrinsic = contractInstance.exec(message, {
        gasLimit: maxGas,
        value: 0
      }, collectionInfo.id, tokenId);

      queueTransaction(
        extrinsic,
        'SEND_TOKEN_FAIL',
        'buy start',
        'SEND_TOKEN_SUCCESS',
        'buy update'
      );
    } else {
      send('SIGN_FAIL');
    }
  }, [findCallMethodByName, contractInstance, collectionInfo, send, maxGas, tokenId, queueTransaction]);

  const revertMoney = useCallback(() => {
    /* При исполнении сделки, нужно посылать только сумму, указанную в withdraw.
    При снятии неиспользованных средств нужно также возмещать комиссию marketplace за вычетом комиссии сети Kusama (0.0027 KSM).
     */

    /*
    1. Адрес
    2. Упакованные ID: collection_id * 0x100000000 + token_id
     */

    const expectedCommission = new BN(10).pow(decimals);
    const balance = deposited || new BN(0);
    const balanceToSend = balance.mul(expectedCommission);

    const message = findCallMethodByName('withdraw');

    if (message && contractInstance) {
      const extrinsic = contractInstance.exec(message, {
        gasLimit: maxGas,
        value: 0
      }, 2, deposited);

      queueTransaction(
        extrinsic,
        'WITHDRAW_FAIL',
        'withdraw start',
        'WITHDRAW_SUCCESS',
        'withdraw update'
      );
    }
  }, [decimals, deposited, findCallMethodByName, contractInstance, maxGas, queueTransaction]);

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

  const cancelSell = useCallback(() => {
    const message = findCallMethodByName('cancel');

    if (message && contractInstance && collectionInfo) {
      const extrinsic = contractInstance.exec(message, { gasLimit: maxGas, value: 0 }, collectionInfo.id, tokenId);

      queueTransaction(
        extrinsic,
        'CANCEL_SELL_FAIL',
        'cancelSell start',
        'CANCEL_SELL_SUCCESS',
        'cancelSell update'
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
      case 'sell':
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

  useEffect(() => {
    switch (true) {
      // on load - update token state
      case state.matches('loadingTokenInfo'):
        void loadingTokenInfo();
        break;
      case state.matches('buy'):
        void buy();
        break;
      case state.matches('sell'):
        void sell();
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
      case state.matches('cancelSell'):
        void cancelSell();
        break;
      case state.matches('waitForTokenRevert'):
        void waitForTokenRevert();
        break;
      default:
        break;
    }
  }, [state.value, loadingTokenInfo, state, buy, sell, sentTokenToAccount, waitForDeposit, askPrice, registerSale, revertMoney, checkDepositReady, cancelSell, waitForTokenRevert]);

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
    deposited,
    depositor,
    error,
    readyToAskPrice,
    saleFee,
    sendCurrentUserAction,
    setPrice,
    setTokenPriceForSale,
    tokenAsk,
    tokenInfo,
    tokenPriceForSale,
    transferStep
  };
};
