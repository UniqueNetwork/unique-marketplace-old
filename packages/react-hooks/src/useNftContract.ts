// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {Abi, ContractPromise as Contract, ContractPromise} from '@polkadot/api-contract';
import { DEFAULT_DECIMALS } from '@polkadot/react-api';
import { getContractAbi } from '@polkadot/react-components/util';
import { useApi } from '@polkadot/react-hooks';
import keyring from '@polkadot/ui-keyring';
import {AbiMessage} from "@polkadot/api-contract/types";

export interface AskOutputInterface {
  output: [string, string, string, BN, string]
}

export interface useNftContractInterface {
  abi: Abi | undefined;
  contractAddress: string;
  contractInstance: ContractPromise | null;
  decimals: number;
  deposited: BN | undefined;
  findCallMethodByName: (methodName: string) => AbiMessage | null;
  getDepositor: (collectionId: string, tokenId: string, readerAddress: string) => Promise<string | null>;
  getTokenAsk: (collectionId: string, tokenId: string) => void;
  getUserDeposit: () => void;
  isContractReady: boolean;
  maxGas: number;
  tokenAsk: { owner: string, price: BN } | undefined;
  value: number;
  vaultAddress: string;
}

// https://docs.google.com/document/d/1WED9VP8Yj52Un4qmkGDpzjesQTzwwoDgYMk1Ty8yftQ/edit
export function useNftContract (account: string): useNftContractInterface {
  const { api } = useApi();
  const [value] = useState(0);
  const [maxGas] = useState(200000000000);
  const [decimals, setDecimals] = useState(15);
  const [vaultAddress] = useState('5CYN9j3YvRkqxewoxeSvRbhAym4465C57uMmX5j4yz99L5H6');
  const [contractInstance, setContractInstance] = useState<ContractPromise | null>(null);
  const [abi, setAbi] = useState<Abi>();
  const [deposited, setDeposited] = useState<BN>();
  const [tokenAsk, setTokenAsk] = useState<{ owner: string, price: BN }>();
  const [contractAddress] = useState<string>('5F7HdoCMynZKjnp6e2784SaJyCPdbymJ54ozPeFTmZvg9X34');

  const findCallMethodByName = useCallback((methodName: string): AbiMessage | null => {
    const message = contractInstance && Object.values(contractInstance.abi.messages).find((message) => message.identifier === methodName);

    console.log('message!!!', message);

    return message || null;
  }, [contractInstance]);

  // get offers
  // if connection ID not specified, returns 30 last token sale offers
  const getUserDeposit = useCallback(async () => {
    try {
      if (contractInstance) {
        const result = await contractInstance.read('get_balance', value, maxGas, 2).send(account) as unknown as { output: BN };

        if (result.output) {
          setDeposited(result.output);
        }
      }
    } catch (e) {
      console.log('getUserDeposit Error: ', e);
    }
  }, [account, contractInstance, maxGas, value]);

  const getDepositor = useCallback(async (collectionId: string, tokenId: string, readerAddress: string) => {
    try {
      if (contractInstance) {
        // const keyring = new keyring({ type: 'sr25519' });
        const result = await contractInstance.read('get_nft_deposit', value, maxGas, collectionId, tokenId).send(readerAddress);

        console.log('result!!!', result);

        if (result.output) {
          const address = keyring.encodeAddress(result.output.toString());

          console.log('Deposit address: ', address);

          return address;
        }
      }

      return null;
    } catch (e) {
      console.log('getDepositor Error: ', e);
    }

    return null;
  }, [contractInstance, maxGas, value]);

  const initAbi = useCallback(() => {
    console.log('contractAddress', contractAddress);
    const jsonAbi = getContractAbi(contractAddress) as Abi;
    const newContractInstance = new ContractPromise(api, jsonAbi, contractAddress);

    console.log('newContractInstance', newContractInstance);

    setAbi(jsonAbi);
    setContractInstance(newContractInstance);
  }, [api, contractAddress]);

  const getTokenAsk = useCallback(async (collectionId: string, tokenId: string) => {
    if (contractInstance) {
      const askIdResult = await contractInstance.read('get_ask_id_by_token', value, maxGas, collectionId, tokenId).send(contractAddress) as unknown as { output: BN };

      if (askIdResult.output) {
        const askId = askIdResult.output.toNumber();
        const askResult = await contractInstance.read('get_ask_by_id', value, maxGas, askId).send(contractAddress) as unknown as AskOutputInterface;

        if (askResult.output) {
          const askOwnerAddress = keyring.encodeAddress(askResult.output[4].toString());

          setTokenAsk({
            owner: askOwnerAddress,
            price: askResult.output[3]
          });
        }
      }
    }

    return null;
  }, [contractAddress, contractInstance, maxGas, value]);

  const isContractReady = useMemo(() => {
    return !!(abi && contractInstance);
  }, [abi, contractInstance]);

  const fetchSystemProperties = useCallback(async () => {
    const properties = await api.rpc.system.properties();
    const tokenDecimals = properties.tokenDecimals.unwrapOr([DEFAULT_DECIMALS]);

    setDecimals(tokenDecimals[0].toNumber());
  }, [api]);

  useEffect(() => {
    initAbi();
  }, [initAbi]);

  useEffect(() => {
    void getUserDeposit();
  }, [getUserDeposit]);

  useEffect(() => {
    void fetchSystemProperties();
  }, [fetchSystemProperties]);

  return {
    abi,
    contractAddress,
    contractInstance,
    decimals,
    deposited,
    findCallMethodByName,
    getDepositor,
    getTokenAsk,
    getUserDeposit,
    isContractReady,
    maxGas,
    tokenAsk,
    value,
    vaultAddress
  };
}
