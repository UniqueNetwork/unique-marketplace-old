// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Abi, ContractPromise } from '@polkadot/api-contract';
import envConfig from '@polkadot/apps-config/envConfig';
import { web3Enable } from '@polkadot/extension-dapp';
import type { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { DEFAULT_DECIMALS } from '@polkadot/react-api';
import { useApi, useCall } from '@polkadot/react-hooks';
import { formatKsmBalance } from '@polkadot/react-hooks/useKusamaApi';
import keyring from '@polkadot/ui-keyring';
import { addressToEvm, evmToAddress } from '@polkadot/util-crypto';
import { subToEth } from './utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import marketplaceAbi from './abi/marketPlaceAbi.json';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import nonFungibleAbi from './abi/nonFungibleAbi.json';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import metadata from './abi/metadata28.10.21.json';
import { StatusContext } from '@polkadot/react-components';
import {BN_HUNDRED} from "@polkadot/util";

type EvmCollectionAbiMethods = {
  approve: (contractAddress: string, tokenId: string) => {
    encodeABI: () => any;
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
  addAsk: (price: bigint, currencyCode: string, address: string, tokenId: string) => {
    encodeABI: () => any;
  },
  balanceKSM: (ethAddress: string) => {
    call: () => Promise<string>;
  };
  buy: (collectionAddress: string, tokenId: string) => {
    encodeABI: () => any;
  };
  cancelAsk: (collectionId: string, tokenId: string) => {
    encodeABI: () => any;
  };
  getOrder: (collectionId: string, tokenId: string) => {
    call: () => Promise<TokenAskType>;
  };
  getOrdersLen: () => {
    call: () => Promise<number>;
  },
  orders: (orderNumber: number) => {
    call: () => Promise<TokenAskType>;
  },
  Withdrawn: (amount: string, currencyCode: string, address: string) => {
    call: {
      encodeABI: () => any;
    }
  }; // (amount: string, currencyCode: string, address: string) => any;
}

const { contractAddress, maxGas, minPrice, quoteId, value } = envConfig;

export interface AskOutputInterface {
  output: [string, string, string, BN, string]
}

// @todo use batch - .api.tx.utility
//   .batch(txs)
//   .signAndSend

export interface useNftContractInterface {
  // abi: Abi | undefined;
  addAsk: (collectionId: string, tokenId: string, amount: bigint, failCallBack: () => void, successCallBack: () => void) => void;
  approveTokenToContract: (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => void;
  buyToken: (collectionId: string, tokenId: string, price: bigint, failCallBack: () => void, successCallBack: () => void) => void;
  cancelAsk: (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => void;
  contractInstance: any | null;
  decimals: BN;
  deposited: BN | undefined;
  depositor: string | undefined;
  getDepositor: (collectionId: string, tokenId: string) => Promise<string | null>;
  getTokenAsk: (collectionId: string, tokenId: string) => Promise<{ owner: string, price: BN } | null>;
  getUserDeposit: () => Promise<BN | null>;
  isContractReady: boolean;
  sellToken: (collectionId: string, tokenId: string, successCallBack: () => void, errorCallBack: () => void) => void;
  tokenAsk: TokenAskType | undefined;
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
Execute ethereum method call using substrate account
 * @param to target contract
 * @param mkTx - closure, receiving `contract.methods`, and returning method call,
 * to be used as following (assuming `to` = erc20 contract):
 * `m => m.transfer(to, amount)`
 *
 * # Example
 * ```ts
 * executeEthTxOnSub(api, alice, erc20Contract, m => m.transfer(target, amount));
 * ```

export async function executeEthTxOnSub(web3: Web3, api: ApiPromise, from: IKeyringPair, to: any, call: any, {value = 0}: {value?: bigint | number} = { }) {
  const tx = api.tx.evm.call(
    subToEth(from.address),
    to.options.address,
    call.encodeABI(),
    value,
    GAS_ARGS.gas,
    await web3.eth.getGasPrice(),
    null,
  );
  const events = await submitTransactionAsync(from, tx);
  expect(events.some(({event: {section, method}}) => section == 'evm' && method == 'Executed')).to.be.true;
}
 */

/*
to sell:
1. Transfer NFT to your eth address mirror - subToEth(account);
2. Transfer money to your eth address mirror to pay fees (for approval);
3. Approve contract to get your NFT;
4. AddAsk with token price;
5.
 */

// https://docs.google.com/document/d/1WED9VP8Yj52Un4qmkGDpzjesQTzwwoDgYMk1Ty8yftQ/edit
export function useNftContract (account: string): useNftContractInterface {
  const { api } = useApi();
  const [decimals, setDecimals] = useState(new BN(15));
  const [web3Instance, setWeb3Instance] = useState<Web3>();
  // const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances?.all, [evmToAddress(subToEthLowercase(account))]);
  const [contractInstance, setContractInstance] = useState<Contract | null>(null);
  const [depositor, setDepositor] = useState<string>();
  const [deposited, setDeposited] = useState<BN>();
  const { queueExtrinsic } = useContext(StatusContext);
  const [tokenAsk, setTokenAsk] = useState<TokenAskType>();

  // this method should be called from matcher owner
  const approveTokenToContract = useCallback(async (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => {
    // await executeEthTxOnSub(web3, api, seller, evmCollection, m => m.approve(matcher.options.address, tokenId));
    if (web3Instance) {
      const matcherOwner = web3Instance.eth.accounts.privateKeyToAccount('8b9bcdcb9434d3584243f2ef066910f8f90b315b9b1cc79516f11a5a57db0a63').address;

      console.log('matcherOwner', matcherOwner);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const evmCollection = new web3Instance.eth.Contract(nonFungibleAbi as any, collectionIdToAddress(parseInt(collectionId, 10)), { from: matcherOwner });

      console.log('evmCollection', evmCollection, 'contractAddress', contractAddress, 'value', value);
      // const ethAddress = subToEth(account);
      // const addressBalance: string = await web3Instance.eth.getBalance(ethAddress);
      // const evmSubAddress = evmToAddress(ethAddress, 42, 'blake2');
      // const evmSubBalanse = await api.derive.balances?.all(evmSubAddress);

      // console.log('evmSubAddress', evmSubAddress, 'evmSubBalanse', evmSubBalanse.availableBalance.toString());

      try {
        if (contractInstance && web3Instance) {
          const extrinsic = api.tx.evm.call(
            subToEth(account),
            evmCollection.options.address,
            (evmCollection.methods as EvmCollectionAbiMethods).approve(contractAddress, tokenId).encodeABI(),
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
  }, [account, api, contractInstance, queueExtrinsic, web3Instance]);

  const balanceTransfer = useCallback((recipient: string, amount: BN, failCallBack: () => void, successCallBack: () => void) => {
    const extrinsic = api.tx.balances.transfer(recipient, amount);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic,
      isUnsigned: false,
      txFailedCb: () => failCallBack,
      txStartCb: () => { console.log('balanceTransfer start'); },
      txSuccessCb: () => successCallBack,
      txUpdateCb: () => { console.log('balanceTransfer update'); }
    });
  }, [account, api, queueExtrinsic]);

  /*
  const KSM = 10n ** 15n;
  10n * KSM
  check orders: orders(orderNumber);
   */
  const addAsk = useCallback(async (collectionId: string, tokenId: string, price: bigint, failCallBack: () => void, successCallBack: () => void) => {
    //  await executeEthTxOnSub(web3, api, seller, matcher, m => m.addAsk(PRICE, '0x0000000000000000000000000000000000000001', evmCollection.options.address, tokenId));
    if (web3Instance) {
      const matcherOwner = web3Instance.eth.accounts.privateKeyToAccount('8b9bcdcb9434d3584243f2ef066910f8f90b315b9b1cc79516f11a5a57db0a63').address;

      console.log('matcherOwner', matcherOwner);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const evmCollection = new web3Instance.eth.Contract(nonFungibleAbi as any, collectionIdToAddress(parseInt(collectionId, 10)), { from: matcherOwner });

      console.log('evmCollection', evmCollection, 'contractAddress', contractAddress, 'value', value, 'evmCollection.options.address', evmCollection.options.address);

      try {
        if (contractInstance && web3Instance) {
          const extrinsic = api.tx.evm.call(
            subToEth(account),
            contractAddress,
            (contractInstance.methods as MarketplaceAbiMethods).addAsk(price, '0x0000000000000000000000000000000000000001', evmCollection.options.address, tokenId).encodeABI(),
            0,
            GAS_ARGS.gas,
            await web3Instance.eth.getGasPrice(),
            null
          );

          queueExtrinsic({
            accountId: account && account.toString(),
            extrinsic,
            isUnsigned: false,
            txFailedCb: () => { console.log('addAsk fail'); },
            txStartCb: () => { console.log('addAsk start'); },
            txSuccessCb: () => { console.log('addAsk success'); },
            txUpdateCb: () => { console.log('addAsk update'); }
          });
        }
      } catch (e) {
        console.log('approveTokenToContract Error', e);
      }
    }
  }, [account, api, contractInstance, queueExtrinsic, web3Instance]);

  const buyToken = useCallback(async (collectionId: string, tokenId: string, price: bigint, failCallBack: () => void, successCallBack: () => void) => {
    //  await executeEthTxOnSub(web3, api, seller, matcher, m => m.addAsk(PRICE, '0x0000000000000000000000000000000000000001', evmCollection.options.address, tokenId));
    if (web3Instance) {
      const matcherOwner = web3Instance.eth.accounts.privateKeyToAccount('8b9bcdcb9434d3584243f2ef066910f8f90b315b9b1cc79516f11a5a57db0a63').address;

      console.log('matcherOwner', matcherOwner);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const evmCollection = new web3Instance.eth.Contract(nonFungibleAbi as any, collectionIdToAddress(parseInt(collectionId, 10)), { from: matcherOwner });

      console.log('evmCollection', evmCollection, 'contractAddress', contractAddress, 'value', value, 'evmCollection.options.address', evmCollection.options.address);

      try {
        if (contractInstance && web3Instance) {
          const extrinsic = api.tx.evm.call(
            subToEth(account),
            contractAddress,
            (contractInstance.methods as MarketplaceAbiMethods).buy(evmCollection.options.address, tokenId).encodeABI(),
            0,
            GAS_ARGS.gas,
            await web3Instance.eth.getGasPrice(),
            null
          );

          queueExtrinsic({
            accountId: account && account.toString(),
            extrinsic,
            isUnsigned: false,
            txFailedCb: () => { console.log('buyToken fail'); },
            txStartCb: () => { console.log('buyToken start'); },
            txSuccessCb: () => { console.log('buyToken success'); },
            txUpdateCb: () => { console.log('buyToken update'); }
          });
        }
      } catch (e) {
        console.log('approveTokenToContract Error', e);
      }
    }
  }, [account, api, contractInstance, queueExtrinsic, web3Instance]);

  const sellToken = useCallback((collectionId: string, tokenId: string, successCallBack: () => void, errorCallBack: () => void) => {
    console.log('sellToken');
    // To transfer item to matcher it first needs to be transferred to Eth account-mirror
    const ethAddress = subToEth(account);
    const extrinsic = api.tx.unique.transfer({ Ethereum: ethAddress }, collectionId, tokenId, 1);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic,
      isUnsigned: false,
      txFailedCb: () => errorCallBack,
      txStartCb: () => { console.log('sellToken start'); },
      txSuccessCb: () => successCallBack, // approveTokenToContract
      txUpdateCb: () => { console.log('sellToken update'); }
    });
  }, [account, api, queueExtrinsic]);

  const cancelAsk = useCallback(async (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => {
    try {
      if (contractInstance && web3Instance) {
        const matcherOwner = web3Instance.eth.accounts.privateKeyToAccount('8b9bcdcb9434d3584243f2ef066910f8f90b315b9b1cc79516f11a5a57db0a63').address;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const evmCollection = new web3Instance.eth.Contract(nonFungibleAbi as any, collectionIdToAddress(parseInt(collectionId, 10)), { from: matcherOwner });

        const extrinsic = api.tx.evm.call(
          subToEth(account),
          contractAddress,
          (contractInstance.methods as MarketplaceAbiMethods).cancelAsk(evmCollection.options.address, tokenId).encodeABI(),
          0,
          GAS_ARGS.gas,
          await web3Instance.eth.getGasPrice(),
          null
        );

        queueExtrinsic({
          accountId: account && account.toString(),
          extrinsic,
          isUnsigned: false,
          txFailedCb: () => failCallBack,
          txStartCb: () => { console.log('cancelAsk start'); },
          txSuccessCb: () => successCallBack,
          txUpdateCb: () => { console.log('cancelAsk update'); }
        });
      }
    } catch (e) {
      console.log('cancelAsk error', e);
    }
  }, [account, api, contractInstance, queueExtrinsic, web3Instance]);

  const withdrawKSM = useCallback(async (amount: number, failCallBack: () => void, successCallBack: () => void) => {
    if (!amount) {
      return;
    }

    try {
      if (contractInstance && web3Instance) {
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
          txFailedCb: () => failCallBack,
          txStartCb: () => { console.log('withdrawKSM start'); },
          txSuccessCb: () => successCallBack,
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
      if (contractInstance) {
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

  const getTokenAsk = useCallback(async (collectionId: string, tokenId: string) => {
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
      }
    } catch (e) {
      console.log('getTokenAsk error', e);

      setTokenAsk(undefined);
    }

    return null;
  }, [contractInstance]);

  const getDepositor = useCallback(async (collectionId: string, tokenId: string) => {
    await getTokenAsk(collectionId, tokenId);
  }, [getTokenAsk]);

  const initAbi = useCallback(() => {
    if (account) {
      const ethAddress = subToEth(account);

      console.log('account', account, 'ethAddress', ethAddress);

      console.log('mySubEthAddress', evmToAddress('0xCFB8D32364F173051C2CC43eB165701e9E6737DF', 42, 'blake2'));

      const provider = new Web3.providers.HttpProvider('https://rpc-opal.unique.network');

      const web3: Web3 = new Web3(provider);

      setWeb3Instance(web3);

      /* const evmSubBalanse = await api.derive.balances?.all(evmToAddress(subToEth(account), 42, 'blake2'));

      console.log('evmSubBalanse', evmSubBalanse.availableBalance.toString());

      const addressBalance: string = await web3.eth.getBalance(ethAddress);

      console.log('addressBalance', addressBalance); */

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const newContractInstance: Contract = new web3.eth.Contract((marketplaceAbi as { abi: any }).abi, contractAddress, {
        from: ethAddress
      });

      setContractInstance(newContractInstance);

      console.log('newContractInstance', newContractInstance);
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
    buyToken,
    cancelAsk,
    contractInstance,
    decimals,
    deposited,
    depositor,
    getDepositor,
    getTokenAsk,
    getUserDeposit,
    isContractReady,
    sellToken,
    tokenAsk,
    withdrawKSM
  };
}
