// Copyright 2020 @polkadot/app-nft authors & contributors

// import { PunkForSaleInterface, Punk } from '../types';
// import { url, path, attributes } from '../constants';

import {useCallback, useContext, useEffect, useState} from 'react';
import { useMachine } from '@xstate/react';
import { useCollections, TokenInfo, useNftContract, useApi } from '@polkadot/react-hooks';

import marketplaceStateMachine from './stateMachine';
import useBalance from '@polkadot/app-nft-wallet/src/hooks/useBalance';
import { StatusContext } from '@polkadot/react-components/Status';

const vaultAddress = '5Gs3Vmbsr2xaBLCKwTqvUfT511u14QB9jqks2WEsQyWvNvLC';

interface MarketplaceStagesInterface {
  error: string | null;
  sentCurrentUserAction: (action: 'BUY' | 'CANCEL' | 'SALE' | 'REVERT_UNUSED_KSM') => void;
  tokenInfo: any;
}

interface NftTokenInterface {
  collectionId: string;
  data: any;
  price: string;
  sellerAddress: string;
  tokenId: string;
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
  const { getUserDeposit } = useNftContract(account);
  const { balance } = useBalance(account);
  const [error, setError] = useState();
  const { queueExtrinsic } = useContext(StatusContext);

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
  }, []);

  const buy = useCallback(async () => {
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
          .transfer(vaultAddress, needed),
        isUnsigned: false,
        txFailedCb: () => send('DEPOSIT_FAIL'),
        txStartCb: () => console.log('transfer start'),
        txSuccessCb: () => send('DEPOSIT_SUCCESS'),
        txUpdateCb: () => console.log('transfer update')
      });
    }
    // buyStep3
  }, [account, api, getFee, getUserDeposit, queueExtrinsic, token]);

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
  }, []);

  const registerDeposit = useCallback(() => {
    console.log('registerDeposit');
  }, []);

  const getDepositReady = useCallback(() => {
    console.log('getDepositReady');
  }, []);

  const askPrice = useCallback(() => {
    console.log('askPrice');
  }, []);

  const sentKsm = useCallback(() => {
    console.log('sentKsm');
  }, []);

  console.log('current', state);

  useEffect(() => {
    switch (state.value) {
      case 'loadingTokenInfo':
        loadingTokenInfo();
        break;
      case 'revertKsm':
        revertKsm();
        break;
      case 'cancelSale':
        cancelSale();
        break;
      case 'sale':
        sale();
        break;
      case 'registerDeposit':
        registerDeposit();
        break;
      case 'getDepositReady':
        getDepositReady();
        break;
      case 'askPrice':
        askPrice();
        break;
      case 'buy':
        buy();
        break;
      case 'sentKsm':
        sentKsm();
        break;
      default:
        break;
    }
  }, [state.value, loadingTokenInfo]);

  useEffect(() => {
    send('OPEN_TOKEN_WINDOW');
  }, [send]);

  return { error, sentCurrentUserAction, tokenInfo }
};

export default useMarketplaceStages;
