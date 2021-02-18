// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Abi, ContractPromise } from '@polkadot/api-contract';
import { DEFAULT_DECIMALS } from '@polkadot/react-api';
import { getContractAbi } from '@polkadot/react-components/util';
import { useApi } from '@polkadot/react-hooks';
import keyring from '@polkadot/ui-keyring';

export interface AskOutputInterface {
  output: [string, string, string, BN, string]
}

export interface useNftContractInterface {
  abi: Abi | undefined;
  contractAddress: string;
  contractInstance: ContractPromise | null;
  decimals: number;
  deposited: BN | undefined;
  getDepositor: (collectionId: string, tokenId: string, readerAddress: string) => Promise<string | null>;
  getTokenAsk: (collectionId: string, tokenId: string) => Promise<{ owner: string, price: BN } | null>;
  getUserDeposit: () => void;
  isContractReady: boolean;
  maxGas: number;
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
  const [contractAddress] = useState<string>('5DgdtKSx5okmPb42hgfNbkEdu3zhZ8k8nSWzbCtKKK9iKduJ');

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

      console.log('askIdResult', askIdResult);

      if (askIdResult.output) {
        const askId = askIdResult.output.toNumber();

        console.log('Token Ask ID: ', askId);
        const askResult = await contractInstance.read('get_ask_by_id', value, maxGas, askId).send(contractAddress) as unknown as AskOutputInterface;

        if (askResult.output) {
          const askOwnerAddress = keyring.encodeAddress(askResult.output[4].toString());

          console.log('Ask owner: ', askOwnerAddress);

          return {
            owner: askOwnerAddress,
            price: askResult.output[3]
          };
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
    getDepositor,
    getTokenAsk,
    getUserDeposit,
    isContractReady,
    maxGas,
    value,
    vaultAddress
  };
}
