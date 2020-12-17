// Copyright 2020 @polkadot/app-nft authors & contributors

import { useCallback, useContext, useEffect, useState } from 'react';
import { useMachine } from '@xstate/react';
import { useCollections, TokenInfo, useNftContract, useApi, useBalance } from '@polkadot/react-hooks';

import marketplaceStateMachine from './stateMachine';
import { StatusContext } from '@polkadot/react-components/Status';
import config from '../config';

interface MarketplaceStagesInterface {
  cancelSale: () => void;
  error: string | null;
  sentCurrentUserAction: (action: 'BUY' | 'CANCEL' | 'SALE' | 'REVERT_UNUSED_KSM') => void;
  tokenInfo: any;
  tokenPriceForSale: number | undefined;
  readyToAskPrice: boolean;
  revertKsm: () => void;
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

const useMarketplaceStages = (account: string, collectionId: string, tokenId: string): MarketplaceStagesInterface => {
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

  const queueTransaction = useCallback((transaction, fail: string, start: string, success: string, update: string) => {
    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => send(fail),
      txStartCb: () => send(start),
      txSuccessCb: () => send(success),
      txUpdateCb: () => send(update)
    });
  }, [account, queueExtrinsic]);

  /**********user actions*************/
  const sale = useCallback(() => {
    console.log('sale');
    // checkBalance(nft, owner) - is nft on balance/ is balance > fee?
    // deposit nft to contract
    queueTransaction(
      api.tx.nft
        .transfer(config.vaultAddress, collectionId, tokenId, 0),
      'TRANSFER_NFT_TO_CONTRACT_FAIL',
      'deposit nft to contract start',
      'TRANSFER_NFT_TO_CONTRACT_SUCCESS',
      'deposit nft to contract update'
    )
  }, [api, queueTransaction]);

  const buy = useCallback(async () => {
    // send deposit to contract
    // Check if KSM deposit is needed and deposit
    console.log('buy');
    const deposited = parseFloat(await getUserDeposit() || '');
    console.log("Deposited KSM: ", deposited);
    const price = parseFloat('0');
    const feeFull = getFee(price);
    const feePaid = getFee(deposited);
    if (deposited < price) {
      const fee = feeFull - feePaid;
      const needed = price + fee - deposited;
      if (balance < needed) {
        setError(`Your KSM balance is too low: ${balance}. You need at least: ${needed} KSM`);
        return;
      }
      queueTransaction(
        api.tx.balances
          .transfer(config.vaultAddress, needed),
        'DEPOSIT_FAIL',
        'transfer start',
        'DEPOSIT_SUCCESS',
        'transfer update'
      );
    }
    // buyStep3
  }, [account, api, getFee, getUserDeposit, queueTransaction]);

  const sentTokenToAccount = useCallback(() => {
    // tokenId, newOwner (account)
    if (abi) {
      queueTransaction(
        api.tx.contracts
          .call(config.marketContractAddress, config.value, config.maxgas, abi.messages.buy(collectionId, tokenId)),
        'SEND_TOKEN_FAIL',
        'send token to account start',
        'SEND_TOKEN_SUCCESS',
        'send token to account update'
      );
    }
  }, [account, abi, api, queueTransaction]);

  const revertKsm = useCallback(async () => {
    console.log('revertKsm');
    const deposited = parseFloat(await getUserDeposit() || '');
    console.log('deposited', deposited);
    /*
    const ksmexp = BigNumber(10).pow(this.ksmDecimals);
    const balance = new BigNumber(amount);
    const balanceToSend = balance.multipliedBy(ksmexp).integerValue(BigNumber.ROUND_DOWN);
     */
    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: api.tx.contracts
        .call(config.marketContractAddress, config.value, config.maxgas, abi.messages.withdraw(2, deposited)),
      isUnsigned: false,
      txFailedCb: () => send('TRANSFER_NFT_TO_CONTRACT_FAIL'),
      txStartCb: () => console.log('deposit nft to contract start'),
      txSuccessCb: () => send('TRANSFER_NFT_TO_CONTRACT_SUCCESS'),
      txUpdateCb: () => console.log('deposit nft to contract update')
    });
  }, [account, abi, api]);

  const loadingTokenInfo = useCallback(async () => {
    console.log('loadingTokenInfo');
    const tokenInfo = await getDetailedTokenInfo(collectionId, tokenId);
    setTokenInfo(tokenInfo);
  }, [setTokenInfo]);

  const registerDeposit = useCallback(async () => {
    console.log('registerDeposit');
    const address = await getDepositor(collectionId, tokenId, account);
    if (address === account) {
      // depositor is me
      send('NFT_DEPOSIT_READY');
    } else {
      setTimeout(() => {
        send('NFT_DEPOSIT_FAIL');
      }, 6000)
    }
  }, [account, collectionId, tokenId]);

  const submitTokenPrice = useCallback(() => {
   /* if (tokenPriceForSale && ((tokenPriceForSale < 0.01) || (tokenPriceForSale > 10000)))`
      Sorry, price should be in the range between 0.01 and 10000 KSM. You have input: ${price}
    `;*/
    send('ASK_PRICE_SUCCESS');
  }, []);

  const askPrice = useCallback(() => {
    console.log('askPrice');
    setReadyToAskPrice(true);
  }, []);

  const registerSale = useCallback(() => {
    //  // Transaction #2: Invoke ask method on market contract to set the price
    //     await this.askAsync(punkId, priceBN.toString(), ownerAddress);
    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: api.tx.contracts
        .call(config.marketContractAddress, config.value, config.maxgas, abi.messages.ask(collectionId, tokenId, 2, tokenPriceForSale)),
      isUnsigned: false,
      txFailedCb: () => send('REGISTER_SALE_FAIL'),
      txStartCb: () => console.log('registerSale start'),
      txSuccessCb: () => send('REGISTER_SALE_SUCCESS'),
      txUpdateCb: () => console.log('registerSale update')
    });
  }, [account, api, collectionId, tokenId]);

  const cancelSale = useCallback(() => {
    console.log('cancelSale');
    // cancelAsync(punkId, punk.owner)
    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: api.tx.contracts
        .call(config.marketContractAddress, config.value, config.maxgas, abi.messages.cancel(collectionId, tokenId)),
      isUnsigned: false,
      txFailedCb: () => send('CANCEL_SALE_FAIL'),
      txStartCb: () => console.log('cancelSale start'),
      txSuccessCb: () => send('CANCEL_SALE_SUCCESS'),
      txUpdateCb: () => console.log('cancelSale update')
    });
  }, [account, api, collectionId, tokenId]);

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
      case 'REGISTER_SALE_SUCCESS':
      case 'CANCEL_SALE_SUCCESS':
      case 'CANCEL_SALE_FAIL':
        void send('UPDATE_TOKEN_STATE');
        break;
      case 'TRANSFER_NFT_TO_CONTRACT_SUCCESS':
        void registerDeposit();
        break;
      case 'NFT_DEPOSIT_FAIL':
        void registerDeposit();
        break;
      case 'NFT_DEPOSIT_READY':
      case 'REGISTER_SALE_FAIL':
        void askPrice();
      case 'ASK_PRICE_SUCCESS':
        void registerSale();
        break;
      default:
        break;
    }
  }, [state.value, loadingTokenInfo]);

  useEffect(() => {
    send('OPEN_TOKEN_WINDOW');
  }, [send]);

  return {
    cancelSale,
    error,
    sentCurrentUserAction,
    tokenInfo,
    tokenPriceForSale,
    readyToAskPrice,
    revertKsm,
    setTokenPriceForSale,
    submitTokenPrice,
  }
};

export default useMarketplaceStages;
