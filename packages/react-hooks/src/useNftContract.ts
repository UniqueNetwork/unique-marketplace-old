// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Contract } from 'web3-eth-contract';

import BN from 'bn.js';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Web3 from 'web3';

import envConfig from '@polkadot/apps-config/envConfig';
import { DEFAULT_DECIMALS } from '@polkadot/react-api';
import { StatusContext } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import { formatKsmBalance } from '@polkadot/react-hooks/useKusamaApi';
import { evmToAddress } from '@polkadot/util-crypto';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import marketplaceAbi from './abi/marketPlaceAbi.json';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import nonFungibleAbi from './abi/nonFungibleAbi.json';
import { subToEth } from './utils';

type EvmCollectionAbiMethods = {
  approve: (contractAddress: string, tokenId: string) => {
    encodeABI: () => any;
  },
  getApproved: (tokenId: string | number) => {
    call: () => Promise<string>;
  }
}
export type TokenFullAskType = {
  currencyCode: string; // "0x0000000000000000000000000000000000000001"
  flagActive: '0' | '1';
  idCollection: string; //  "0x17C4e6453cC49AAaaEaCA894E6D9683e00000001"
  idNFT: string; //  "1"
  name: string; // "UniqueBabies"
  ownerAddr: string; // "0x2E065a5eaccA1c533a931545f2bFb3C18F7c439b"
  price: string; // "10000000000000000"
  symbol: string; // "UBaby"
  time: string; // "1639056948"
  tokenURI: string; // "\nH{\"ipfs\":\"Qmeyy5uhgfE5e3tgYBaqQQNcrRY4TEiN6SvzJovHtHLhr8\",\"type\":\"image\"}\u0010\u0001\u0018\u0001\"\u0002\u0000\u0002"
}
export type TokenAskType = { flagActive: '0' | '1', ownerAddr: string, price: BN };

type MarketplaceAbiMethods = {
  addAsk: (price: string, currencyCode: string, address: string, tokenId: string) => {
    encodeABI: () => any;
  },
  balanceKSM: (ethAddress: string) => {
    call: () => Promise<string>;
  };
  buyKSM: (collectionAddress: string, tokenId: string, buyer: string, receiver: string) => {
    encodeABI: () => any;
  };
  cancelAsk: (collectionId: string, tokenId: string) => {
    encodeABI: () => any;
  };
  depositKSM: (price: number) => {
    encodeABI: () => any;
  },
  getOrder: (collectionId: string, tokenId: string) => {
    call: () => Promise<TokenAskType>;
  };
  getOrdersLen: () => {
    call: () => Promise<number>;
  },
  orders: (orderNumber: number) => {
    call: () => Promise<TokenAskType>;
  },
  setEscrow: (escrow: string) => {
    encodeABI: () => any;
  },
  Withdrawn: (amount: string, currencyCode: string, address: string) => {
    call: {
      encodeABI: () => any;
    }
  }; // (amount: string, currencyCode: string, address: string) => any;
}

const { contractAddress, matcherOwnerAddress, minPrice, uniqueSubstrateApiRpc, value } = envConfig;

export interface AskOutputInterface {
  output: [string, string, string, BN, string]
}

export interface useNftContractInterface {
  // abi: Abi | undefined;
  addAsk: (collectionId: string, tokenId: string, amount: BN, failCallBack: () => void, successCallBack: () => void) => void;
  approveTokenToContract: (tokenId: string, failCallBack: () => void, successCallBack: () => void) => void;
  balanceTransfer: (recipient: string, amount: BN, failCallBack: () => void, successCallBack: () => void) => void;
  buyToken: (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => void;
  cancelAsk: (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => void;
  contractInstance: any | null;
  decimals: BN;
  deposited: BN | undefined;
  depositor: string | undefined;
  getApproved: (tokenId: string) => Promise<boolean>;
  getTokenAsk: (collectionId: string, tokenId: string) => Promise<TokenAskType | null>;
  getUserDeposit: () => Promise<BN | null>;
  initCollectionAbi: (collectionId: string) => void;
  isContractReady: boolean;
  tokenAsk: TokenAskType | undefined;
  transferToken: (collectionId: string, tokenId: string, address: { Ethereum?: string, Substrate?: string }, successCallBack: () => void, errorCallBack: () => void) => void;
  withdrawKSM: (amount: number, failCallBack: () => void, successCallBack: () => void) => void;
}

export const GAS_ARGS = { gas: 2500000 };

export function collectionIdToAddress (address: number): string {
  if (address >= 0xffffffff || address < 0) {
    throw new Error('id overflow');
  }

  const buf = Buffer.from([0x17, 0xc4, 0xe6, 0x45, 0x3c, 0xc4, 0x9a, 0xaa, 0xae, 0xac, 0xa8, 0x94, 0xe6, 0xd9, 0x68, 0x3e,
    address >> 24,
    (address >> 16) & 0xff,
    (address >> 8) & 0xff,
    address & 0xff
  ]);

  return Web3.utils.toChecksumAddress('0x' + buf.toString('hex'));
}

/*
to sell:
1. Transfer NFT to your eth address mirror - subToEth(account);
2. Transfer money to your eth address mirror to pay fees (for approval);
3. Approve contract to get your NFT;
4. AddAsk with token price;
5.
 */

// https://docs.google.com/document/d/1WED9VP8Yj52Un4qmkGDpzjesQTzwwoDgYMk1Ty8yftQ/edit
export function useNftContract (account: string | undefined): useNftContractInterface {
  const { api } = useApi();
  const [decimals, setDecimals] = useState(new BN(15));
  const [web3Instance, setWeb3Instance] = useState<Web3>();
  // const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances?.all, [evmToAddress(subToEthLowercase(account))]);
  const [contractInstance, setContractInstance] = useState<Contract | null>(null);
  const [evmCollectionInstance, setEvmCollectionInstance] = useState<Contract | null>(null);
  const [depositor, setDepositor] = useState<string>();
  const [deposited, setDeposited] = useState<BN>();
  const { queueExtrinsic } = useContext(StatusContext);
  const [tokenAsk, setTokenAsk] = useState<TokenAskType>();

  const getApproved = useCallback(async (tokenId: string): Promise<boolean> => {
    try {
      if (contractInstance && evmCollectionInstance) {
        const approvedAddress = await (evmCollectionInstance.methods as EvmCollectionAbiMethods).getApproved(tokenId).call();

        console.log('approvedAddress', approvedAddress);

        return approvedAddress === account;
      }
    } catch (e) {
      console.log('getUserDeposit Error: ', e);
    }

    return false;
  }, [account, contractInstance, evmCollectionInstance]);

  // this method should be called from matcher owner
  const approveTokenToContract = useCallback(async (tokenId: string, failCallBack: () => void, successCallBack: () => void) => {
    if (account && web3Instance && evmCollectionInstance) {
      try {
        if (contractInstance && web3Instance) {
          const extrinsic = api.tx.evm.call(
            subToEth(account),
            evmCollectionInstance.options.address,
            (evmCollectionInstance.methods as EvmCollectionAbiMethods).approve(contractAddress, tokenId).encodeABI(),
            1,
            GAS_ARGS.gas,
            await web3Instance.eth.getGasPrice(),
            null
          );

          queueExtrinsic({
            accountId: account && account.toString(),
            extrinsic,
            isUnsigned: false,
            txFailedCb: () => failCallBack(),
            txStartCb: () => { console.log('approveTokenToContract start'); },
            txSuccessCb: () => successCallBack(),
            txUpdateCb: () => { console.log('approveTokenToContract update'); }
          });
        }
      } catch (e) {
        console.log('approveTokenToContract Error', e);
      }
    }
  }, [account, api, contractInstance, evmCollectionInstance, queueExtrinsic, web3Instance]);

  const balanceTransfer = useCallback((recipient: string, amount: BN, failCallBack: () => void, successCallBack: () => void) => {
    const extrinsic = api.tx.balances.transfer(recipient, amount);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic,
      isUnsigned: false,
      txFailedCb: () => failCallBack(),
      txStartCb: () => { console.log('balanceTransfer start'); },
      txSuccessCb: () => successCallBack(),
      txUpdateCb: () => { console.log('balanceTransfer update'); }
    });
  }, [account, api, queueExtrinsic]);

  /*
  const KSM = 10n ** 15n;
  10n * KSM
  check orders: orders(orderNumber);
   */
  const addAsk = useCallback(async (collectionId: string, tokenId: string, price: BN, failCallBack: () => void, successCallBack: () => void) => {
    //  await executeEthTxOnSub(web3, api, seller, matcher, m => m.addAsk(PRICE, '0x0000000000000000000000000000000000000001', evmCollection.options.address, tokenId));
    if (account && web3Instance && evmCollectionInstance) {
      try {
        if (contractInstance && web3Instance) {
          const extrinsic = api.tx.evm.call(
            subToEth(account),
            contractAddress,
            (contractInstance.methods as MarketplaceAbiMethods).addAsk(price.toString(), '0x0000000000000000000000000000000000000001', evmCollectionInstance.options.address, tokenId).encodeABI(),
            0,
            GAS_ARGS.gas,
            await web3Instance.eth.getGasPrice(),
            null
          );

          queueExtrinsic({
            accountId: account && account.toString(),
            extrinsic,
            isUnsigned: false,
            txFailedCb: () => failCallBack(),
            txStartCb: () => { console.log('addAsk start'); },
            txSuccessCb: () => successCallBack(),
            txUpdateCb: () => { console.log('addAsk update'); }
          });
        }
      } catch (e) {
        console.log('approveTokenToContract Error', e);
      }
    }
  }, [account, api, contractInstance, evmCollectionInstance, queueExtrinsic, web3Instance]);

  const buyToken = useCallback(async (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => {
    if (account && web3Instance && evmCollectionInstance && contractInstance) {
      try {
        console.log('buyToken from', account, 'ehtAcc', subToEth(account), 'evmCollectionInstance.options.address', evmCollectionInstance.options.address, 'tokenId', tokenId);

        const ethAccount = subToEth(account);
        const extrinsic = api.tx.evm.call(
          ethAccount,
          contractAddress,
          (contractInstance.methods as MarketplaceAbiMethods).buyKSM(evmCollectionInstance.options.address, tokenId, ethAccount, ethAccount).encodeABI(),
          0,
          GAS_ARGS.gas,
          await web3Instance.eth.getGasPrice(),
          null
        );

        console.log('extrinsic', extrinsic);

        queueExtrinsic({
          accountId: account && account.toString(),
          extrinsic,
          isUnsigned: false,
          txFailedCb: () => failCallBack(),
          txStartCb: () => { console.log('buyToken start'); },
          txSuccessCb: () => successCallBack(),
          txUpdateCb: () => { console.log('buyToken update'); }
        });
      } catch (e) {
        console.log('approveTokenToContract Error', e);
      }
    }
  }, [account, api, contractInstance, evmCollectionInstance, queueExtrinsic, web3Instance]);

  const transferToken = useCallback((collectionId: string, tokenId: string, address: { Ethereum?: string, Substrate?: string }, successCallBack: () => void, errorCallBack: () => void) => {
    // To transfer item to matcher it first needs to be transferred to Eth account-mirror
    const extrinsic = api.tx.unique.transfer(address, collectionId, tokenId, 1);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic,
      isUnsigned: false,
      txFailedCb: () => errorCallBack,
      txStartCb: () => { console.log('transferToken start'); },
      txSuccessCb: () => successCallBack,
      txUpdateCb: () => { console.log('transferToken update'); }
    });
  }, [account, api, queueExtrinsic]);

  const cancelAsk = useCallback(async (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => {
    try {
      if (account && contractInstance && evmCollectionInstance && web3Instance) {
        const extrinsic = api.tx.evm.call(
          subToEth(account),
          contractAddress,
          (contractInstance.methods as MarketplaceAbiMethods).cancelAsk(evmCollectionInstance.options.address, tokenId).encodeABI(),
          0,
          GAS_ARGS.gas,
          await web3Instance.eth.getGasPrice(),
          null
        );

        queueExtrinsic({
          accountId: account && account.toString(),
          extrinsic,
          isUnsigned: false,
          txFailedCb: () => failCallBack(),
          txStartCb: () => { console.log('cancelAsk start'); },
          txSuccessCb: () => successCallBack(),
          txUpdateCb: () => { console.log('cancelAsk update'); }
        });
      }
    } catch (e) {
      console.log('cancelAsk error', e);
    }
  }, [account, api, contractInstance, evmCollectionInstance, queueExtrinsic, web3Instance]);

  const withdrawKSM = useCallback(async (amount: number, failCallBack: () => void, successCallBack: () => void) => {
    try {
      if (account && amount && contractInstance && web3Instance) {
        // currency_code 0x0000000000000000000000000000000000000001
        // const extrinsic = (contractInstance.methods as MarketplaceAbiMethods).Withdrawn(amount.toString(), '0x0000000000000000000000000000000000000001', account);
        const extrinsic = api.tx.evm.call(
          subToEth(account),
          contractAddress,
          (contractInstance.methods as MarketplaceAbiMethods).Withdrawn(amount.toString(), '0x0000000000000000000000000000000000000001', account).call.encodeABI(),
          value,
          GAS_ARGS.gas,
          await web3Instance.eth.getGasPrice(),
          null
        );

        queueExtrinsic({
          accountId: account && account.toString(),
          extrinsic,
          isUnsigned: false,
          txFailedCb: () => failCallBack(),
          txStartCb: () => { console.log('withdrawKSM start'); },
          txSuccessCb: () => successCallBack(),
          txUpdateCb: () => { console.log('withdrawKSM update'); }
        });
      }

      return null;
    } catch (e) {
      console.log('withdrawKSM Error: ', e);

      return null;
    }
  }, [account, api, contractInstance, queueExtrinsic, web3Instance]);

  const getUserDeposit = useCallback(async (): Promise<BN | null> => {
    try {
      if (account && contractInstance) {
        const ethAddress = subToEth(account);
        const result = await (contractInstance.methods as MarketplaceAbiMethods).balanceKSM(ethAddress).call();

        console.log('userDeposit', result);

        if (result) {
          const deposit = new BN(result);

          Number(formatKsmBalance(deposit)) > minPrice ? localStorage.setItem('deposit', JSON.stringify(result)) : localStorage.removeItem('deposit');

          setDeposited(deposit);

          return deposit;
        }
      }

      return null;
    } catch (e) {
      console.log('getUserDeposit Error: ', e);

      return null;
    }
  }, [account, contractInstance]);

  const getTokenOrder = useCallback(async (orderNumber: number) => {
    if (contractInstance) {
      // Error: Returned error: VM Exception while processing transaction: revert
      try {
        const order = await (contractInstance.methods as MarketplaceAbiMethods).orders(orderNumber).call();

        console.log('getTokenOrder order', order);
      } catch (e) {
        console.log('getTokenOrder error', e);
      }
    }
  }, [contractInstance]);

  const getTokenOrders = useCallback(async () => {
    if (contractInstance) {
      try {
        const ordersLength: number = await (contractInstance.methods as MarketplaceAbiMethods).getOrdersLen().call();

        await getTokenOrder(3);

        console.log('getTokenOrders ordersLength', ordersLength);
      } catch (e) {
        console.log('getTokenOrders error', e);
      }
    }
  }, [contractInstance, getTokenOrder]);

  const getTokenAsk = useCallback(async (collectionId: string, tokenId: string): Promise<TokenAskType | null> => {
    try {
      if (contractInstance) {
        const { flagActive, ownerAddr, price }: TokenAskType = await (contractInstance.methods as MarketplaceAbiMethods).getOrder(collectionIdToAddress(parseInt(collectionId, 10)), tokenId).call();

        const ask: TokenAskType = {
          flagActive,
          ownerAddr: ownerAddr,
          price: new BN(price)
        };

        // '10000000000000000000' - 10 * 10n18
        // '0x0000000000000000000000000000000000000000'
        console.log('getTokenAsk ask', ask, 'collectionId', collectionId, 'tokenId', tokenId);

        setTokenAsk(ask);
        setDepositor(evmToAddress(ownerAddr, 42, 'blake2'));

        return ask;
      }
    } catch (e) {
      console.log('getTokenAsk error', e);

      setTokenAsk(undefined);
    }

    return null;
  }, [contractInstance]);

  const initCollectionAbi = useCallback((collectionId) => {
    if (web3Instance) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const evmCollection = new web3Instance.eth.Contract(nonFungibleAbi as any, collectionIdToAddress(parseInt(collectionId, 10)), { from: matcherOwnerAddress });

      setEvmCollectionInstance(evmCollection);
    }
  }, [web3Instance]);

  const initAbi = useCallback(() => {
    if (account) {
      const ethAddress = subToEth(account);

      console.log('account', account, 'ethAddress', ethAddress);
      console.log('mySubEthAddress', evmToAddress(ethAddress, 42, 'blake2'));

      const provider = new Web3.providers.HttpProvider(uniqueSubstrateApiRpc);
      // const web3 = new Web3(window.ethereum);
      const web3 = new Web3(provider);

      try {
        // await window.ethereum.enable();

        setWeb3Instance(web3);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const newContractInstance: Contract = new web3.eth.Contract((marketplaceAbi as { abi: any }).abi, contractAddress, {
          from: ethAddress
        });

        setContractInstance(newContractInstance);

        console.log('newContractInstance', newContractInstance);

        // await newContractInstance.methods.depositKSM(2000n, ethAddress).send({ from: matcherOwnerAddress });
      } catch (e) {
        // User has denied account access to DApp...
      }
    }
  }, [account]);

  const isContractReady = useMemo(() => {
    return !!(contractInstance);
  }, [contractInstance]);

  const fetchSystemProperties = useCallback(async () => {
    const properties = await api.rpc.system.properties();
    const tokenDecimals = properties.tokenDecimals.unwrapOr([DEFAULT_DECIMALS]);

    setDecimals(tokenDecimals[0]);
  }, [api]);

  useEffect(() => {
    void initAbi();
  }, [initAbi]);

  useEffect(() => {
    void fetchSystemProperties();
  }, [fetchSystemProperties]);

  useEffect(() => {
    void getUserDeposit();
  }, [getUserDeposit]);

  useEffect(() => {
    void getTokenOrders();
  }, [getTokenOrders]);

  return {
    addAsk,
    approveTokenToContract,
    balanceTransfer,
    buyToken,
    cancelAsk,
    contractInstance,
    decimals,
    deposited,
    depositor,
    getApproved,
    getTokenAsk,
    getUserDeposit,
    initCollectionAbi,
    isContractReady,
    tokenAsk,
    transferToken,
    withdrawKSM
  };
}
