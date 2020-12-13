// Copyright 2020 @polkadot/app-nft authors & contributors

import { NftTokenInterface } from '../types';

import {useCallback, useContext, useEffect, useState} from 'react';
import { useMachine } from '@xstate/react';
import { useCollections, TokenInfo, useNftContract, useApi } from '@polkadot/react-hooks';

import marketplaceStateMachine from './stateMachine';
import useBalance from '@polkadot/app-nft-wallet/src/hooks/useBalance';
import { StatusContext } from '@polkadot/react-components/Status';
import config from '../config';

interface MarketplaceStagesInterface {
  error: string | null;
  sentCurrentUserAction: (action: 'BUY' | 'CANCEL' | 'SALE' | 'REVERT_UNUSED_KSM') => void;
  tokenInfo: any;
  tokenPriceForSale: number | undefined;
  readyToAskPrice: boolean;
  setTokenPriceForSale: (price: number) => void;
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

const useMarketplaceStages = (account: string, token: NftTokenInterface): MarketplaceStagesInterface => {
  const { api } = useApi();
  const [state, send] = useMachine(marketplaceStateMachine);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null | undefined>();
  const { getDetailedTokenInfo } = useCollections();
  const { abi, getDepositor, getUserDeposit } = useNftContract(account);
  const { balance } = useBalance(account);
  const [error, setError] = useState<string | null>(null);
  const { queueExtrinsic } = useContext(StatusContext);
  const [readyToAskPrice, setReadyToAskPrice] = useState<boolean>(false);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<number>();

  const sentCurrentUserAction = useCallback((userAction: 'BUY' | 'CANCEL' | 'SALE' | 'REVERT_UNUSED_KSM') => {
    send(userAction);
  }, [send]);

  const getFee = useCallback((price) => {
    if (price <= 0.001) return 0;
    // if (fee < 0.01) fee = 0.01;
    return price * 0.02;
  }, []);

  /**********user actions*************/
  const sale = useCallback(() => {
    console.log('sale');
    // checkBalance(nft, owner) - is nft on balance/ is balance > fee?
    // deposit nft to contract
    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: api.tx.nft
        .transfer(config.vaultAddress, token.collectionId, token.tokenId, 0),
      isUnsigned: false,
      txFailedCb: () => send('TRANSFER_NFT_TO_CONTRACT_FAIL'),
      txStartCb: () => console.log('deposit nft to contract start'),
      txSuccessCb: () => send('TRANSFER_NFT_TO_CONTRACT_SUCCESS'),
      txUpdateCb: () => console.log('deposit nft to contract update')
    });
  }, []);

  const buy = useCallback(async () => {
    // send deposit to contract
    // Check if KSM deposit is needed and deposit
    console.log('buy');
    const deposited = parseFloat(await getUserDeposit() || '');
    console.log("Deposited KSM: ", deposited);
    const price = parseFloat(token.price);
    const feeFull = getFee(price);
    const feePaid = getFee(deposited);
    if (deposited < price) {
      const fee = feeFull - feePaid;
      const needed = price + fee - deposited;
      if (balance < needed) {
        setError(`Your KSM balance is too low: ${balance}. You need at least: ${needed} KSM`);
        return;
      }
      queueExtrinsic({
        accountId: account && account.toString(),
        extrinsic: api.tx.balances
          .transfer(config.vaultAddress, needed),
        isUnsigned: false,
        txFailedCb: () => send('DEPOSIT_FAIL'),
        txStartCb: () => console.log('transfer start'),
        txSuccessCb: () => send('DEPOSIT_SUCCESS'),
        txUpdateCb: () => console.log('transfer update')
      });
    }
    // buyStep3
  }, [account, api, getFee, getUserDeposit, queueExtrinsic, token]);

  const sentTokenToAccount = useCallback(() => {
    // tokenId, newOwner (account)
    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: api.tx.contracts
        .call(config.marketContractAddress, config.value, config.maxgas, abi.messages.buy(token.collectionId, token.tokenId)),
      isUnsigned: false,
      txFailedCb: () => send('SEND_TOKEN_FAIL'),
      txStartCb: () => console.log('send token to account start'),
      txSuccessCb: () => send('SEND_TOKEN_SUCCESS'),
      txUpdateCb: () => console.log('send token to account update')
    });
  }, [account, api, queueExtrinsic]);

  const cancelSale = useCallback(() => {
    console.log('cancelSale');
  }, []);

  const revertKsm = useCallback(() => {
    console.log('revertKsm');
  }, []);

  const loadingTokenInfo = useCallback(async () => {
    console.log('loadingTokenInfo');
    const tokenInfo = await getDetailedTokenInfo(token.collectionId, token.tokenId);
    setTokenInfo(tokenInfo);
  }, [setTokenInfo]);

  const registerDeposit = useCallback(async () => {
    console.log('registerDeposit');
    const address = await getDepositor(token.tokenId, account);
    if (address === account) {
      // depositor is me
      send('NFT_DEPOSIT_READY');
    } else {
      send('NFT_DEPOSIT_FAIL');
    }
    // Wait for Vault transaction
    /* while (true) {
      const address = await getDepositor(token.tokenId, account);
      if (depositorAddressList.includes(address)) {
        this.notifyTxObserver(`Waiting for deposit: ${block} of 3 block(s) passed`);
        return address;
      } else {
        this.notifyTxObserver(`Waiting for deposit: ${block} of 3 block(s) passed`);
        if (block < 3) block++;
        await delay(6000);
      }
    }; */
  }, []);

  const getDepositReady = useCallback(() => {
    console.log('getDepositReady');
  }, []);

  const askPrice = useCallback(() => {
    console.log('askPrice');
    setReadyToAskPrice(true);
  }, []);

  const sentKsm = useCallback(() => {
    console.log('sentKsm');
  }, []);

  console.log('current', state);

  useEffect(() => {
    switch (state.value) {
      case 'UPDATE_TOKEN_STATE':
        void loadingTokenInfo();
        break;
      case 'BUY':
        void buy();
        break;
      case 'SALE':
        void sale();
        break;
      case 'DEPOSIT_SUCCESS':
        void sentTokenToAccount();
        break;
      case 'DEPOSIT_FAIL':
      case 'SEND_TOKEN_FAIL':
      case 'SEND_TOKEN_SUCCESS':
        void send('UPDATE_TOKEN_STATE');
        break;
      case 'TRANSFER_NFT_TO_CONTRACT_SUCCESS':
        void registerDeposit();
        break;
      case 'NFT_DEPOSIT_FAIL':
        void registerDeposit();
        break;
      case 'NFT_DEPOSIT_READY':
        void askPrice();
        break;
      default:
        break;
    }
  }, [state.value, loadingTokenInfo]);

  useEffect(() => {
    send('OPEN_TOKEN_WINDOW');
  }, [send]);

  useEffect(() => {
    if (readyToAskPrice && tokenPriceForSale) {
      /*
      if ((parseFloat(price) < 0.01) || (parseFloat(price) > 10000) || isNaN(parseFloat(price))) throw `
      Sorry, price should be in the range between 0.01 and 10000 KSM. You have input: ${price}`;
       */
      // await n.trade(punkId, price, owner);
    }
  }, [tokenPriceForSale, readyToAskPrice]);

  return {
    error,
    sentCurrentUserAction,
    tokenInfo,
    tokenPriceForSale,
    readyToAskPrice,
    setTokenPriceForSale
  }
};

export default useMarketplaceStages;
