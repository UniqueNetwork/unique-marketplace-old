// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { NftCollectionInterface, TokenDetailsInterface } from '@polkadot/react-hooks/useCollections';

import { useMachine } from '@xstate/react';
import BN from 'bn.js';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { StatusContext } from '@polkadot/react-components/Status';
import { useApi, useBalance, useCollections, useNftContract } from '@polkadot/react-hooks';
import { formatBalance } from '@polkadot/util';

import marketplaceStateMachine from './stateMachine';

type UserActionType = 'BUY' | 'CANCEL' | 'SELL' | 'REVERT_UNUSED_MONEY' | 'UPDATE_TOKEN_STATE' | 'OFFER_TRANSACTION_FAIL' | 'SUBMIT_OFFER' | 'OFFER_TRANSACTION_SUCCESS';

export interface MarketplaceStagesInterface {
  cancelStep: boolean;
  deposited: BN | undefined;
  depositor: string | undefined;
  error: string | null;
  saleFee: BN | undefined;
  sendCurrentUserAction: (action: UserActionType) => void;
  setPrice: (price: string) => void;
  setTokenPriceForSale: (price: number) => void;
  setWithdrawAmount: (withdrawAmount: BN) => void;
  tokenAsk: { owner: string, price: BN } | undefined;
  tokenInfo: TokenDetailsInterface | undefined;
  tokenPriceForSale: number | undefined;
  transferStep: number;
  readyToAskPrice: boolean;
  withdrawAmount: BN | undefined;
}

export const useMarketplaceStages = (account: string, collectionInfo: NftCollectionInterface | undefined, tokenId: string): MarketplaceStagesInterface => {
  const { api } = useApi();
  const [state, send] = useMachine(marketplaceStateMachine);
  const [withdrawAmount, setWithdrawAmount] = useState<BN>();
  const [tokenInfo, setTokenInfo] = useState<TokenDetailsInterface>();
  const [saleFee, setSaleFee] = useState<BN>();
  const { getDetailedReFungibleTokenInfo, getDetailedTokenInfo } = useCollections();
  const { contractInstance, deposited, depositor, escrowAddress, findCallMethodByName, getDepositor, getTokenAsk, getUserDeposit, isContractReady, maxGas, tokenAsk } = useNftContract(account);
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
    if (!collectionInfo) {
      return;
    }

    const info = await getTokenInfo();
    const ask = await getTokenAsk(collectionInfo.id, tokenId);

    await getUserDeposit();

    console.log('info?.Owner?.toString()', info?.Owner?.toString());

    console.log('ask', ask, 'collectionInfo.id', collectionInfo.id, 'tokenId', tokenId);

    // the token is mine
    if (info?.Owner?.toString() === escrowAddress) {
      if (!ask || !ask.price) {
        const tokenDepositor = await getDepositor(collectionInfo.id, tokenId);

        console.log('tokenDepositor', tokenDepositor);

        if (tokenDepositor === account) {
          // the token is in escrow - waiting for deposit
          send('WAIT_FOR_DEPOSIT');
        }
      }
    }

    send('WAIT_FOR_USER_ACTION');
  }, [collectionInfo, getTokenInfo, account, escrowAddress, getUserDeposit, send, getTokenAsk, tokenId, getDepositor]);

  const getFee = useCallback((price: BN): BN => {
    return price.muln(0.02);
  }, []);

  const queueTransaction = useCallback((transaction: SubmittableExtrinsic, fail: string, start: string, success: string, update: string) => {
    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { send(fail); },
      txStartCb: () => { console.log(start); },
      txSuccessCb: () => { send(success); },
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

  const waitForNftDeposit = useCallback(async () => {
    if (collectionInfo) {
      const tokenDepositor = await getDepositor(collectionInfo.id, tokenId);

      console.log('tokenNftDepositor', tokenDepositor);

      if (tokenDepositor === account) {
        send('NFT_DEPOSIT_READY');
      } else if (tokenDepositor || (tokenAsk && tokenAsk.price)) {
        send('NFT_DEPOSIT_OTHER');
      } else {
        setTimeout(() => {
          void waitForNftDeposit();
        }, 5000);
      }
    }
  }, [account, collectionInfo, getDepositor, send, tokenAsk, tokenId]);

  const waitForTokenRevert = useCallback(async () => {
    const info = await getTokenInfo();

    if (info?.Owner?.toString() === account) {
      send('TOKEN_REVERT_SUCCESS');
    } else {
      setTimeout(() => {
        void waitForTokenRevert();
      }, 5000);
    }
  }, [account, getTokenInfo, send]);

  // @todo add transfer fees
  const depositNeeded = useCallback((userDeposit: BN, tokenPrice: BN): BN => {
    const feeFull = getFee(tokenPrice);
    const feePaid = getFee(userDeposit);
    const fee = feeFull.sub(feePaid);

    return tokenPrice.add(fee).sub(userDeposit);
  }, [getFee]);

  const isDepositEnough = useCallback((userDeposit: BN, tokenPrice: BN): boolean => {
    return !depositNeeded(userDeposit, tokenPrice).gtn(0);
  }, [depositNeeded]);

  const buy = useCallback(async () => {
    const userDeposit = await getUserDeposit();

    if (!tokenAsk || !userDeposit) {
      console.error('tokenAsk is undefined');

      send('WAIT_FOR_DEPOSIT');

      return;
    }

    if (!isDepositEnough(userDeposit, tokenAsk.price)) {
      const needed = depositNeeded(userDeposit, tokenAsk.price);

      if (balance?.free.lt(needed)) {
        const err = `Your KSM balance is too low: ${formatBalance(balance?.free)}. You need at least: ${formatBalance(needed)}`;

        setError(err);

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
      send('WAIT_FOR_DEPOSIT');
    }
    // buyStep3
  }, [api.tx.balances, balance?.free, depositNeeded, escrowAddress, getUserDeposit, isDepositEnough, queueTransaction, send, tokenAsk]);

  const checkDepositReady = useCallback(async () => {
    const userDeposit = await getUserDeposit();

    if (userDeposit && tokenAsk && isDepositEnough(userDeposit, tokenAsk.price)) {
      send('DEPOSIT_SUCCESS');
    } else {
      setTimeout(() => {
        void checkDepositReady();
      }, 5000);
    }
  }, [getUserDeposit, isDepositEnough, send, tokenAsk]);

  const sentTokenToAccount = useCallback(() => {
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
    const message = findCallMethodByName('withdraw');

    if (message && contractInstance) {
      const extrinsic = contractInstance.exec(message, {
        gasLimit: maxGas,
        value: 0
      }, 0, withdrawAmount);

      queueTransaction(
        extrinsic,
        'WITHDRAW_FAIL',
        'withdraw start',
        'WITHDRAW_SUCCESS',
        'withdraw update'
      );
    }
  }, [findCallMethodByName, contractInstance, maxGas, withdrawAmount, queueTransaction]);

  const askPrice = useCallback(() => {
    setReadyToAskPrice(true);
  }, [setReadyToAskPrice]);

  const registerSale = useCallback(() => {
    const message = findCallMethodByName('ask');

    if (message && contractInstance && collectionInfo) {
      const extrinsic = contractInstance.exec(message, { gasLimit: maxGas, value: 0 }, collectionInfo.id, tokenId, 0, tokenPriceForSale);

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
      case 'waitForSignTransfer':
        return 1;
      case 'waitForNftDeposit':
        return 2;
      case 'askPrice':
      case 'registerSale':
        return 3;
      case 'buy':
      case 'waitForSignMoneyTransfer':
        return 4;
      case 'checkDepositReady':
        return 5;
      case 'sentTokenToNewOwner':
      case 'waitForSignTokenBuy':
        return 6;
      default:
        return 0;
    }
  }, [state.value]);

  const cancelStep = useMemo((): boolean => {
    return state.matches('cancelSell') || state.matches('waitForTokenRevert');
  }, [state]);

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
      case state.matches('waitForNftDeposit'):
        void waitForNftDeposit();
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
  }, [state.value, loadingTokenInfo, state, buy, sell, sentTokenToAccount, waitForNftDeposit, askPrice, registerSale, revertMoney, checkDepositReady, cancelSell, waitForTokenRevert]);

  useEffect(() => {
    if (isContractReady) {
      send('UPDATE_TOKEN_STATE');
    }
  }, [send, isContractReady]);

  console.log('buy / sale stage', state.value);

  return {
    cancelStep,
    deposited,
    depositor,
    error,
    readyToAskPrice,
    saleFee,
    sendCurrentUserAction,
    setPrice,
    setTokenPriceForSale,
    setWithdrawAmount,
    tokenAsk,
    tokenInfo,
    tokenPriceForSale,
    transferStep,
    withdrawAmount
  };
};
