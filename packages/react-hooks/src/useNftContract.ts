// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import {useCallback, useContext, useEffect, useMemo, useState} from 'react';

import { Abi, ContractPromise } from '@polkadot/api-contract';
import envConfig from '@polkadot/apps-config/envConfig';
import { web3Enable } from '@polkadot/extension-dapp';
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
import { StatusContext } from "@polkadot/react-components";

const { contractAddress, maxGas, minPrice, quoteId, value } = envConfig;

export interface AskOutputInterface {
  output: [string, string, string, BN, string]
}

export interface useNftContractInterface {
  // abi: Abi | undefined;
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  return Web3.utils.toChecksumAddress(subToEthLowercase(eth)) as string;
}

export function collectionIdToAddress(address: number): string {
  if (address >= 0xffffffff || address < 0) {
    throw new Error('id overflow');
  }

  const buf = Buffer.from([0x17, 0xc4, 0xe6, 0x45, 0x3c, 0xc4, 0x9a, 0xaa, 0xae, 0xac, 0xa8, 0x94, 0xe6, 0xd9, 0x68, 0x3e,
    address >> 24,
    (address >> 16) & 0xff,
    (address >> 8) & 0xff,
    address & 0xff
  ]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  return Web3.utils.toChecksumAddress('0x' + buf.toString('hex')) as string;
}

// https://docs.google.com/document/d/1WED9VP8Yj52Un4qmkGDpzjesQTzwwoDgYMk1Ty8yftQ/edit
export function useNftContract (account: string): useNftContractInterface {
  const { api } = useApi();
  const [decimals, setDecimals] = useState(new BN(15));
  // const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances?.all, [evmToAddress(subToEthLowercase(account))]);
  const [contractInstance, setContractInstance] = useState<any | null>(null);
  const [depositor, setDepositor] = useState<string>();
  const [deposited, setDeposited] = useState<BN>();
  const { queueExtrinsic } = useContext(StatusContext);
  const [tokenAsk, setTokenAsk] = useState<{ owner: string, price: BN }>();

  /* const web3Integration = useCallback(async () => {
    console.log('account', account);

    if(!account) {
      return;
    }

    const injectedPromise = await web3Enable('polkadot-js/apps');

    // const web3Address = await web3FromAddress(account);

    console.log('injectedPromise', injectedPromise);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const web3 = new Web3('https://cloudflare-eth.com');

    console.log('addressFromEvm', evmToAddress('0xc96E34C891c6f4f6fcD5dC870cA04f1c3A895378'))

    // const provider = new Web3.providers.HttpProvider(config.frontierUrl);
    // const web3: Web3 = new Web3(provider);

    const daiToken = new Web3.eth.Contract(marketplaceAbi, '0xf4794aeb9d243c024cf59b85b30ed94f5014168a');

    const ethAddress = subToEthLowercase(account);

    console.log('ethAddress', ethAddress);

    daiToken.methods.balanceOf(ethAddress).call((err: any, res: any) => {
      if (err) {
        console.log('An error', err);

        return;
      }

      console.log('The balance is: ', res);
    });

    web3.eth.getBlockNumber((error: any, result: number) => {
      console.log('getBlockNumber', result);
    });
  }, [account]); */

  // get offers
  // if connection ID not specified, returns 30 last token sale offers
  const getUserDeposit = useCallback(async (): Promise<BN | null> => {
    try {
      if (contractInstance) {
        const result = await contractInstance.query.getBalance(account, { gasLimit: maxGas, value }, quoteId) as unknown as { output: BN };

        if (result.output) {
          Number(formatKsmBalance(result.output)) > minPrice ? localStorage.setItem('deposit', JSON.stringify(result.output)) : localStorage.removeItem('deposit');

          setDeposited(result.output);

          return result.output;
        }
      }

      return null;
    } catch (e) {
      console.log('getUserDeposit Error: ', e);

      return null;
    }
  }, [account, contractInstance]);

  const getDepositor = useCallback(async (collectionId: string, tokenId: string): Promise<string | null> => {
    try {
      if (contractInstance) {
        const result = await contractInstance.query.getNftDeposit(account, { gasLimit: maxGas, value }, collectionId, tokenId);

        // empty or 0 0 0 0
        if (result.output && result.output.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM') {
          const depositorResult = keyring.encodeAddress(result.output.toString());

          setDepositor(depositorResult);

          return depositorResult;
        }
      }

      return null;
    } catch (e) {
      console.log('getDepositor Error: ', e);

      return null;
    }
  }, [account, contractInstance]);

  const initAbi = useCallback(async () => {

    if (account) {
      const ethAddress = subToEth(account);

      console.log('account', account, 'ethAddress', ethAddress);

      console.log('mySubEthAddress', evmToAddress('0xCFB8D32364F173051C2CC43eB165701e9E6737DF', 42, 'blake2'));

      // const web3 = new Web3('https://rpc-opal.unique.network');

      // @ts-ignore
      const provider = new Web3.providers.HttpProvider('https://rpc-opal.unique.network');
      // @ts-ignore
      const web3 = new Web3(provider);

      /* const transaction = api.tx.balances.transfer(evmToAddress(ethAddress, 42, 'blake2'), 10 ** 15)

      queueExtrinsic({
        accountId: account && account.toString(),
        extrinsic: transaction,
        isUnsigned: false,
        txFailedCb: () => { console.log('FAIL'); },
        txStartCb: () => { console.log('START'); },
        txSuccessCb: () => { console.log('SUCCESS'); },
        txUpdateCb: () => { console.log('UPDATE'); }
      }); */

      /*
      export async function createEthAccountWithBalance(api: ApiPromise, web3: Web3) {
        const alice = privateKey('//Alice');
        const account = createEthAccount(web3);
        await transferBalanceToEth(api, alice, account);
        return account;
      }
      export async function transferBalanceToEth(api: ApiPromise, source: IKeyringPair, target: string, amount = 999999999999999) {
        const tx = api.tx.balances.transfer(evmToAddress(target), amount);
        const events = await submitTransactionAsync(source, tx);
        const result = getGenericResult(events);
        expect(result.success).to.be.true;
      }
       */

      console.log('web3', web3, 'marketplaceAbi', marketplaceAbi.abi);

      const evmSubBalanse = await api.derive.balances?.all(evmToAddress(subToEth(account), 42, 'blake2'));

      console.log('evmSubBalanse', evmSubBalanse.availableBalance.toString());

      const addressBalance: number = await web3.eth.getBalance(ethAddress) as number;

      console.log('addressBalance', addressBalance);

      /* const newContractInstance = new web3.eth.Contract(marketplaceAbi.abi, '0xf4794aeb9d243c024cf59b85b30ed94f5014168a', {
        from: ethAddress,
        gas: 0x1000000,
        gasPrice: '0x01'
      }); */

      const newContractInstance = new web3.eth.Contract(marketplaceAbi.abi, '0x1A75f02eeA6228C6249eFf4F0E4184C8BC2e02E0', {
        from: ethAddress
      });

      // const evmCollection = new web3.eth.Contract(nonFungibleAbi, collectionIdToAddress(collectionId), { from: matcherOwner });

      // const matcher = await newContractInstance.deploy({ data: (await readFile(`${__dirname}/MarketPlaceUNQ.bin`)).toString()}).send({from: matcherOwner});

      newContractInstance.methods.balanceKSM(ethAddress).call((err: any, res: any) => {
        if (err) {
          console.log('An error', err);

          return;
        }

        console.log('The ksm deposit is: ', res);
      });

      newContractInstance.methods.balanceOf(ethAddress).call((err: any, res: any) => {
        if (err) {
          console.log('An error', err);

          return;
        }

        console.log('The ksm deposit is: ', res);
      });

      // const deposit = await newContractInstance.balanceKSM(ethAddress);

      console.log('newContractInstance', newContractInstance);
    }

    // setContractInstance(newContractInstance);


    /* const jsonAbi = new Abi(metadata, api.registry.getChainProperties());
    const newContractInstance = new ContractPromise(api, jsonAbi, contractAddress);

    setAbi(jsonAbi);
    setContractInstance(newContractInstance); */
  }, [account, api]);

  const getTokenAsk = useCallback(async (collectionId: string, tokenId: string) => {
    if (contractInstance) {
      const askIdResult = await contractInstance.query.getAskIdByToken(contractAddress, { gasLimit: maxGas, value }, collectionId, tokenId) as unknown as { output: BN };

      if (askIdResult.output) {
        const askId = askIdResult.output.toNumber();

        if (askId !== 0) {
          const askResult = await contractInstance.query.getAskById(contractAddress, { gasLimit: maxGas, value }, askId) as unknown as AskOutputInterface;

          if (askResult.output) {
            const askOwnerAddress = keyring.encodeAddress(askResult.output[4].toString());
            const ask = {
              owner: askOwnerAddress,
              price: askResult.output[3]
            };

            setTokenAsk(ask);

            return ask;
          }
        }
      }
    }

    setTokenAsk(undefined);

    return null;
  }, [contractInstance]);

  const isContractReady = useMemo(() => {
    return !!(contractInstance);
  }, [contractInstance]);

  const fetchSystemProperties = useCallback(async () => {
    const properties = await api.rpc.system.properties();
    const tokenDecimals = properties.tokenDecimals.unwrapOr([DEFAULT_DECIMALS]);

    setDecimals(tokenDecimals[0]);
  }, [api]);

  /* const addExistingContract = useCallback(() => {
    try {
      const contract = keyring.getContract(contractAddress);

      if (!contract) {
        const json = {
          contract: {
            abi,
            genesisHash: api.genesisHash.toHex()
          },
          name: 'marketplaceContract',
          tags: []
        };

        keyring.saveContract(contractAddress, json);
      }
    } catch (error) {
      console.error(error);
    }
  }, [abi, api]); */

  useEffect(() => {
    void initAbi();
  }, [initAbi]);

  useEffect(() => {
    void fetchSystemProperties();
  }, [fetchSystemProperties]);

  // addContract
  /* useEffect(() => {
    addExistingContract();
  }, [addExistingContract]); */

  useEffect(() => {
    void getUserDeposit();
  }, [getUserDeposit]);

  /* useEffect(() => {
    void web3Integration();
  }, [web3Integration]); */

  return {
    contractInstance,
    decimals,
    deposited,
    depositor,
    getDepositor,
    getTokenAsk,
    getUserDeposit,
    isContractReady,
    tokenAsk
  };
}
