// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';
import type { TokenAskType } from '@polkadot/react-hooks/useNftContract';
import type { TokenDetailsInterface } from '@polkadot/react-hooks/useToken';

import { useMachine } from '@xstate/react';
import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';
import { useKusamaApi, useNftContract, useToken } from '@polkadot/react-hooks';

import marketplaceStateMachine from './stateMachine';
import { CrossAccountId, normalizeAccountId } from './utils';

type UserActionType = 'BUY' | 'CANCEL' | 'SELL' | 'REVERT_UNUSED_MONEY' | 'UPDATE_TOKEN_STATE' | 'ASK_NOT_FILLED';

export interface MarketplaceStagesInterface {
  cancelStep: boolean;
  checkWhiteList: (ethAddress: string) => Promise<boolean>;
  deposited: BN | undefined;
  depositor: string | undefined;
  escrowAddress?: string;
  error: string | null;
  formatKsmBalance: (value: BN | undefined) => string;
  getFee: (price: BN) => BN;
  getRevertedFee: (price: BN) => BN;
  getKusamaTransferFee: (recipient: string, value: BN) => Promise<BN | null>;
  kusamaAvailableBalance: BN | undefined;
  sendCurrentUserAction: (action: UserActionType) => void;
  setPrice: (price: BN) => void;
  setReadyToAskPrice: (ready: boolean) => void;
  setTokenPriceForSale: (price: BN) => void;
  setWithdrawAmount: (withdrawAmount: string) => void;
  tokenAsk: TokenAskType | undefined;
  tokenDepositor: string | undefined;
  tokenInfo: TokenDetailsInterface | undefined;
  tokenPriceForSale: BN | undefined;
  transferStep: number;
  readyToAskPrice: boolean;
  withdrawAmount: string;
}

export const useMarketplaceStages = (account: string | undefined, ethAccount: string | undefined, collectionInfo: NftCollectionInterface | undefined, tokenId: string): MarketplaceStagesInterface => {
  const [state, send] = useMachine(marketplaceStateMachine);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('0');
  const [tokenDepositor, setTokenDepositor] = useState<string>();
  const [tokenInfo, setTokenInfo] = useState<TokenDetailsInterface>();
  const { getTokenInfo } = useToken();
  const { addAsk, approveTokenToContract, buyToken, cancelAsk, checkWhiteList, deposited, depositor, evmCollectionInstance, getApproved, getTokenAsk, getUserDeposit, initCollectionAbi, isContractReady, tokenAsk, transferToken, withdrawAllKSM } = useNftContract(account, ethAccount);
  const [error, setError] = useState<string | null>(null);
  const [readyToAskPrice, setReadyToAskPrice] = useState<boolean>(false);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<BN>();
  const { formatKsmBalance, getKusamaTransferFee, kusamaApi, kusamaAvailableBalance, kusamaTransfer } = useKusamaApi(account);
  const kusamaExistentialDeposit = kusamaApi?.consts.balances?.existentialDeposit as unknown as BN;
  const { commission, escrowAddress } = envConfig;

  console.log('state', state.value);

  const sendCurrentUserAction = useCallback((userAction: UserActionType) => {
    send(userAction);
  }, [send]);

  const loadingTokenInfo = useCallback(async () => {
    if (!collectionInfo || !evmCollectionInstance) {
      return;
    }

    const info: TokenDetailsInterface = await getTokenInfo(collectionInfo, tokenId);

    setTokenInfo(info);

    const ask = await getTokenAsk(collectionInfo.id, tokenId);

    if (ask?.ownerAddr && ask.flagActive) {
      setTokenDepositor(ask.ownerAddr);
    } else {
      setTokenDepositor(undefined);
    }

    await getUserDeposit();

    // the token is mine
    if (info?.owner?.toString() === escrowAddress) {
      if (!ask || !ask.price || !ask.flagActive) {
        send('WAIT_FOR_DEPOSIT');

        return;
      }
    }

    send('WAIT_FOR_USER_ACTION');
  }, [collectionInfo, evmCollectionInstance, getTokenInfo, tokenId, getTokenAsk, getUserDeposit, escrowAddress, send]);

  const getRevertedFee = useCallback((price: BN): BN => {
    return price.div(new BN(commission + 100)).mul(new BN(commission));
  }, [commission]);

  const getFee = useCallback((price: BN): BN => {
    return price.mul(new BN(commission)).div(new BN(100));
  }, [commission]);

  const checkIsOnEthAddress = useCallback(async () => {
    if (collectionInfo) {
      const info: TokenDetailsInterface = await getTokenInfo(collectionInfo, tokenId);

      if (info?.owner?.Substrate === account) {
        send('IS_ON_SUB_ADDRESS');
      } else if (info?.owner?.Ethereum?.toLowerCase() === ethAccount) {
        send('IS_ON_ETH_ADDRESS');
      }
    }
  }, [account, collectionInfo, ethAccount, getTokenInfo, send, tokenId]);

  const checkMinDeposit = useCallback(async () => {
    if (ethAccount && collectionInfo) {
      return await checkWhiteList(ethAccount);
    }

    return false;
  }, [checkWhiteList, collectionInfo, ethAccount]);

  const sell = useCallback(async () => {
    const isInWhiteList = await checkMinDeposit();

    if (isInWhiteList) {
      send('HAS_MINT_DEPOSIT');
    } else {
      send('NO_MIN_DEPOSIT');
    }
  }, [checkMinDeposit, send]);

  const transferMinDeposit = useCallback(() => {
    if (kusamaExistentialDeposit && escrowAddress) {
      kusamaTransfer(escrowAddress, kusamaExistentialDeposit, send, send);
    }
  }, [escrowAddress, kusamaExistentialDeposit, kusamaTransfer, send]);

  const transferToEth = useCallback(() => {
    if (collectionInfo && ethAccount) {
      transferToken(collectionInfo.id, tokenId, normalizeAccountId({ Ethereum: ethAccount }), () => send('TRANSFER_START'), () => send('SIGN_SUCCESS'), () => send('SIGN_TRANSACTION_FAIL'));
    }
  }, [collectionInfo, ethAccount, send, transferToken, tokenId]);

  const transferToSub = useCallback(() => {
    if (account && collectionInfo && ethAccount) {
      // const mySubEthAddress = evmToAddress(ethAccount, 42, 'blake2');
      transferToken(collectionInfo.id, tokenId, normalizeAccountId({ Substrate: account }), () => send('TRANSFER_START'), () => send('SIGN_SUCCESS'), () => send('SIGN_TRANSACTION_FAIL'), ethAccount);
    }
  }, [account, ethAccount, collectionInfo, send, transferToken, tokenId]);

  const approveToken = useCallback(async () => {
    if (collectionInfo && ethAccount && tokenInfo) {
      const tokenOwner = tokenInfo.owner as CrossAccountId;
      const approved = await getApproved(collectionInfo.id, tokenId, tokenOwner);

      if (approved) {
        send('ALREADY_APPROVED');
      } else {
        await approveTokenToContract(tokenId,
          () => send('SIGN_TRANSACTION_FAIL'),
          () => send('SIGN_TRANSACTION_SUCCESS'));
      }
    }
  }, [approveTokenToContract, collectionInfo, ethAccount, getApproved, send, tokenId, tokenInfo]);

  const waitForWhiteListing = useCallback(async () => {
    if (ethAccount && collectionInfo) {
      const result = await checkWhiteList(ethAccount);

      if (result) {
        send('HAS_MINT_DEPOSIT');
      } else {
        setTimeout(() => {
          void waitForWhiteListing();
        }, 5000);
      }
    }
  }, [checkWhiteList, collectionInfo, ethAccount, send]);

  const waitForTokenRevert = useCallback(async () => {
    if (collectionInfo && ethAccount && account) {
      const info = await getTokenInfo(collectionInfo, tokenId);

      setTokenInfo(info);

      if (info?.owner?.Substrate === account) {
        send('IS_ON_SUB_ADDRESS');
      } else if (info?.owner?.Ethereum?.toLowerCase() === ethAccount) {
        // revert to substrate account
        send('IS_ON_ETH_ADDRESS');
      } else {
        setTimeout(() => {
          void waitForTokenRevert();
        }, 5000);
      }
    }
  }, [account, ethAccount, collectionInfo, getTokenInfo, send, tokenId]);

  const depositNeeded = useCallback((userDeposit: BN, tokenPrice: BN): BN => {
    return tokenPrice.sub(userDeposit);
  }, []);

  const isDepositEnough = useCallback((userDeposit: BN, tokenPrice: BN): boolean => {
    return !depositNeeded(userDeposit, tokenPrice).gtn(0);
  }, [depositNeeded]);

  const buy = useCallback(async () => {
    const userDeposit = await getUserDeposit();

    if (tokenAsk && userDeposit && escrowAddress) {
      if (!isDepositEnough(userDeposit, tokenAsk.price)) {
        const needed = depositNeeded(userDeposit, tokenAsk.price);

        if (kusamaAvailableBalance?.lt(needed)) {
          const err = `Your KSM balance is too low: ${formatKsmBalance(kusamaAvailableBalance)} KSM. You need at least: ${formatKsmBalance(needed)} KSM`;

          setError(err);

          return;
        }

        kusamaTransfer(escrowAddress, needed, send, send);
      } else {
        send('DEPOSIT_ENOUGH');
      }
    }
  }, [getUserDeposit, tokenAsk, isDepositEnough, depositNeeded, kusamaAvailableBalance, kusamaTransfer, escrowAddress, send, formatKsmBalance]);

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
    if (collectionInfo) {
      buyToken(collectionInfo.id, tokenId, () => send('SIGN_FAIL'), () => send('SIGN_SUCCESS'));
    }
  }, [buyToken, collectionInfo, tokenId, send]);

  const revertMoney = useCallback(() => {
    withdrawAllKSM(() => send('WITHDRAW_FAIL'), () => send('WITHDRAW_SUCCESS'));
  }, [send, withdrawAllKSM]);

  const checkAsk = useCallback(async () => {
    if (collectionInfo) {
      // check if we have ask
      const ask = await getTokenAsk(collectionInfo.id, tokenId);

      if (ask?.ownerAddr === ethAccount && ask?.flagActive === '1') {
        send('ASK_REGISTERED');
      } else {
        send('ASK_NOT_REGISTERED');
      }
    }
  }, [ethAccount, collectionInfo, getTokenAsk, send, tokenId]);

  const addTokenAsk = useCallback(() => {
    // @todo - add commission to ask - fixed?
    if (collectionInfo && tokenPriceForSale) {
      addAsk(collectionInfo.id, tokenId, tokenPriceForSale.add(getFee(tokenPriceForSale)),
        () => send('SIGN_TRANSACTION_FAIL'),
        () => send('SIGN_TRANSACTION_SUCCESS'));
    }
  }, [addAsk, collectionInfo, getFee, send, tokenPriceForSale, tokenId]);

  const openAskModal = useCallback(() => {
    setReadyToAskPrice(true);
  }, []);

  const cancelSell = useCallback(() => {
    if (collectionInfo) {
      cancelAsk(collectionInfo.id, tokenId, () => send('CANCEL_SELL_FAIL'), () => send('CANCEL_SELL_SUCCESS'));
    }
  }, [cancelAsk, collectionInfo, send, tokenId]);

  const setPrice = useCallback((price: BN) => {
    setTokenPriceForSale(price);
    setReadyToAskPrice(false);
    send('ASK_FILLED');
  }, [send]);

  const transferStep = useMemo((): number => {
    switch (state.value) {
      case 'sell':
      case 'checkIsOnEth':
      case 'transferToEth':
      case 'transferToEthStart':
      case 'transferMinDeposit':
      case 'waitForWhiteListing':
        return 1;
      case 'approveToken':
        return 2;
      case 'checkAsk':
      case 'addAsk':
      case 'openAskModal':
        return 3;
      case 'buy':
        return 4;
      case 'checkDepositReady':
        return 5;
      case 'buyToken':
        return 6;
      default:
        return 0;
    }
  }, [state.value]);

  const cancelStep = useMemo((): boolean => {
    return state.matches('cancelSell') || state.matches('waitForTokenRevert') || state.matches('transferToSub');
  }, [state]);

  const updateTokenInfo = useCallback(async () => {
    if (!collectionInfo) {
      return;
    }

    const info: TokenDetailsInterface = await getTokenInfo(collectionInfo, tokenId);

    setTokenInfo(info);
  }, [collectionInfo, getTokenInfo, tokenId]);

  const updateTokenAsk = useCallback(() => {
    if (collectionInfo) {
      void getTokenAsk(collectionInfo.id, tokenId);
    }
  }, [collectionInfo, getTokenAsk, tokenId]);

  useEffect(() => {
    switch (true) {
      // on load - update token state
      case state.matches('checkIsOnEth'):
        void checkIsOnEthAddress();
        break;
      case state.matches('transferToEth'):
        void transferToEth();
        break;
      case state.matches('approveToken'):
        void approveToken();
        break;
      case state.matches('checkAsk'):
        void checkAsk();
        break;
      case state.matches('addAsk'):
        void addTokenAsk();
        break;
      case state.matches('openAskModal'):
        void openAskModal();
        break;
      case state.matches('revertMoney'):
        void revertMoney();
        break;
      case state.matches('cancelSell'):
        void cancelSell();
        break;
      case state.matches('transferToSub'):
        void transferToSub();
        break;
      // on load - update token state
      case state.matches('buy'):
        void buy(); // occurs unexpected change of ref (in deps)
        break;
      case state.matches('buyToken'):
        void sentTokenToAccount();
        break;
      default:
        break;
    }
  }, [addTokenAsk, approveToken, checkAsk, openAskModal, state.value, state, cancelSell, revertMoney, sentTokenToAccount, sell, loadingTokenInfo, transferToEth, transferToSub, transferMinDeposit, checkIsOnEthAddress, buy, checkDepositReady, waitForWhiteListing]);

  useEffect(() => {
    if (state.matches('checkDepositReady')) {
      void checkDepositReady();
    }
  }, [state, checkDepositReady]);

  useEffect(() => {
    if (state.matches('waitForWhiteListing')) {
      void waitForWhiteListing();
    }
  }, [state, waitForWhiteListing]);

  useEffect(() => {
    if (state.matches('transferMinDeposit')) {
      void transferMinDeposit();
    }
  }, [state, transferMinDeposit]);

  useEffect(() => {
    if (state.matches('sell')) {
      void sell();
    }
  }, [state, sell]);

  useEffect(() => {
    if (state.matches('loadingTokenInfo')) {
      void loadingTokenInfo();
    }
  }, [state, loadingTokenInfo]);

  useEffect(() => {
    if (state.matches('waitForTokenRevert')) {
      void waitForTokenRevert();
    }
  }, [state, waitForTokenRevert]);

  useEffect(() => {
    if (isContractReady) {
      send('UPDATE_TOKEN_STATE');
    }
  }, [send, isContractReady]);

  useEffect(() => {
    updateTokenAsk();
  }, [updateTokenAsk]);

  useEffect(() => {
    void updateTokenInfo();
  }, [updateTokenInfo]);

  useEffect(() => {
    if (collectionInfo) {
      initCollectionAbi(collectionInfo.id);
    }
  }, [collectionInfo, initCollectionAbi]);

  return {
    cancelStep,
    checkWhiteList,
    deposited,
    depositor,
    error,
    escrowAddress,
    formatKsmBalance,
    getFee,
    getKusamaTransferFee,
    getRevertedFee,
    kusamaAvailableBalance,
    readyToAskPrice,
    sendCurrentUserAction,
    setPrice,
    setReadyToAskPrice,
    setTokenPriceForSale,
    setWithdrawAmount,
    tokenAsk,
    tokenDepositor,
    tokenInfo,
    tokenPriceForSale,
    transferStep,
    withdrawAmount
  };
};
