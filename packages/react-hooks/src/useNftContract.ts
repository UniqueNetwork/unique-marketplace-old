// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import {useCallback, useContext, useEffect, useMemo, useState} from 'react';

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

type MarketplaceAbiMethods = {
  approve: (contractAddress: string, tokenId: string) => {
    call: {
      encodeABI: () => any;
    }
  }
  balanceKSM: (ethAddress: string) => {
    call: () => Promise<string>;
  };
  cancelAsk: (collectionId: string, tokenId: string) => {
    call: {
      encodeABI: () => any;
    }
  };
  getOrder: (collectionId: string, tokenId: string) => {
    call: () => Promise<{ ownerAddr: string, price: string }>;
  };
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

export interface useNftContractInterface {
  // abi: Abi | undefined;
  cancelAsk: () => void;
  contractInstance: any | null;
  decimals: BN;
  deposited: BN | undefined;
  depositor: string | undefined;
  getDepositor: (collectionId: string, tokenId: string) => Promise<string | null>;
  getTokenAsk: (collectionId: string, tokenId: string) => Promise<{ owner: string, price: BN } | null>;
  getUserDeposit: () => Promise<BN | null>;
  isContractReady: boolean;
  tokenAsk: { owner: string, price: BN } | undefined;
}

// decimals: 15 - opal, 18 - eth

function subToEthLowercase (eth: string): string {
  const bytes = addressToEvm(eth);

  return '0x' + Buffer.from(bytes).toString('hex');
}

export function subToEth (eth: string): string {
  return Web3.utils.toChecksumAddress(subToEthLowercase(eth));
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
  const [tokenAsk, setTokenAsk] = useState<{ owner: string, price: BN }>();

  const approveTokenToContract = useCallback(async (tokenId: string) => {
    // await executeEthTxOnSub(web3, api, seller, evmCollection, m => m.approve(matcher.options.address, tokenId));
    try {
      if (contractInstance && web3Instance) {
        const extrinsic = api.tx.evm.call(
          subToEth(account),
          contractAddress,
          // m => m.approve(matcher.options.address, tokenId) === mkTx(to.methods).encodeABI()
          (contractInstance.methods as MarketplaceAbiMethods).approve(contractAddress, tokenId).call.encodeABI(),
          value,
          GAS_ARGS.gas,
          await web3Instance.eth.getGasPrice(),
          null
        );

        queueExtrinsic({
          accountId: account && account.toString(),
          extrinsic,
          isUnsigned: false,
          txFailedCb: () => { console.log('approveTokenToContract fail'); },
          txStartCb: () => { console.log('approveTokenToContract start'); },
          txSuccessCb: () => { console.log('approveTokenToContract success'); },
          txUpdateCb: () => { console.log('approveTokenToContract update'); }
        });
      }
    } catch (e) {
      console.log('approveTokenToContract Error', e);
    }
  }, [account, api, contractInstance, queueExtrinsic, web3Instance]);

  const sellToken = useCallback((collectionId, tokenId, successCallBack: () => void, errorCallBack: () => void) => {
    // To transfer item to matcher it first needs to be transfered to EVM account
    // await transferExpectSuccess(collectionId, tokenId, seller, { Ethereum: subToEth(seller.address) });
    const ethAddress = subToEth(account);
    const extrinsic = api.tx.unique.transfer({ Ethereum: ethAddress }, collectionId, tokenId, 1);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic,
      isUnsigned: false,
      txFailedCb: () => errorCallBack,
      txStartCb: () => { console.log('cancelAsk start'); },
      txSuccessCb: () => approveTokenToContract, // successCallBack,
      txUpdateCb: () => { console.log('cancelAsk update'); }
    });
  }, [account, api, approveTokenToContract, queueExtrinsic]);

  const cancelAsk = useCallback(async (collectionId: string, tokenId: string) => {
    try {
      if (contractInstance && web3Instance) {
        const extrinsic = api.tx.evm.call(
          subToEth(account),
          contractAddress,
          // m => m.approve(matcher.options.address, tokenId) === mkTx(to.methods).encodeABI()
          (contractInstance.methods as MarketplaceAbiMethods).cancelAsk(collectionIdToAddress(parseInt(collectionId, 10)), tokenId).call.encodeABI(),
          value,
          GAS_ARGS.gas,
          await web3Instance.eth.getGasPrice(),
          null
        );

        queueExtrinsic({
          accountId: account && account.toString(),
          extrinsic,
          isUnsigned: false,
          txFailedCb: () => { console.log('cancelAsk fail'); },
          txStartCb: () => { console.log('cancelAsk start'); },
          txSuccessCb: () => { console.log('cancelAsk success'); },
          txUpdateCb: () => { console.log('cancelAsk update'); }
        });
      }
    } catch (e) {
      console.log('cancelAsk error', e);
    }
  }, [account, api, contractInstance, queueExtrinsic, web3Instance]);

  const withdrawKSM = useCallback(async (amount: BN) => {
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
          txFailedCb: () => { console.log('withdrawKSM fail'); },
          txStartCb: () => { console.log('withdrawKSM start'); },
          txSuccessCb: () => { console.log('withdrawKSM success'); },
          txUpdateCb: () => { console.log('withdrawKSM update'); }
        });

        /* const extrinsic = contractInstance.tx.cancel({ gasLimit: maxGas, value: 0 }, collectionInfo.id, tokenId);

        queueTransaction(
          extrinsic,
          'CANCEL_SELL_FAIL',
          'cancelSell start',
          'CANCEL_SELL_SUCCESS',
          'cancelSell update'
        ); */
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

  const getTokenAsk = useCallback(async (collectionId: string, tokenId: string) => {
    try {
      if (contractInstance) {
        const { ownerAddr, price }: { price: string, ownerAddr: string } = await (contractInstance.methods as MarketplaceAbiMethods).getOrder(collectionIdToAddress(parseInt(collectionId, 10)), tokenId).call();

        const ask = {
          owner: ownerAddr,
          price: new BN(price)
        };

        // '10000000000000000000' - 10 * 10n18
        // '0x0000000000000000000000000000000000000000'
        console.log('ask', ask);

        setTokenAsk(ask);
        setDepositor(evmToAddress(ownerAddr, 42, 'blake2'));
      }
    } catch (e) {
      console.log('getTokenAsk error', e);

      setTokenAsk(undefined);
    }

    return null;
  }, [contractInstance]);

  const getDepositor = useCallback(async (collectionId: string, tokenId: string): Promise<string | null> => {
    await getTokenAsk(collectionId, tokenId);
  }, [getTokenAsk]);

  const initAbi = useCallback(async () => {

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
      const newContractInstance: Contract = new web3.eth.Contract((marketplaceAbi as { abi: any }).abi, '0x1A75f02eeA6228C6249eFf4F0E4184C8BC2e02E0', {
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

  return {
    cancelAsk,
    contractInstance,
    decimals,
    deposited,
    depositor,
    getDepositor,
    getTokenAsk,
    getUserDeposit,
    isContractReady,
    tokenAsk,
    withdrawKSM
  };
}
