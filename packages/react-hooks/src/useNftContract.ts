// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AbiMessage } from '@polkadot/api-contract/types';
import type { Option } from '@polkadot/types';
import type { ContractInfo } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Abi, ContractPromise } from '@polkadot/api-contract';
import { DEFAULT_DECIMALS } from '@polkadot/react-api';
import { useApi, useCall } from '@polkadot/react-hooks';
import keyring from '@polkadot/ui-keyring';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import metadata from './metadata.json';

export interface AskOutputInterface {
  output: [string, string, string, BN, string]
}

interface EnvWindow {
  // eslint-disable-next-line camelcase
  process_env?: {
    escrowAddress?: string;
    MatcherContractAddress?: string;
    vaultAddress?: string;
    WS_URL: string;
  }
}

export interface useNftContractInterface {
  abi: Abi | undefined;
  contractAddress: string;
  contractInstance: ContractPromise | null;
  decimals: BN;
  deposited: BN | undefined;
  depositor: string | undefined;
  escrowAddress: string;
  findCallMethodByName: (methodName: string) => AbiMessage | null;
  getDepositor: (collectionId: string, tokenId: string) => Promise<string | null>;
  getTokenAsk: (collectionId: string, tokenId: string) => Promise<{ owner: string, price: BN } | null>;
  getUserDeposit: () => Promise<BN | null>;
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
  const [decimals, setDecimals] = useState(new BN(15));
  const [escrowAddress] = useState((window as EnvWindow)?.process_env?.escrowAddress || '5D73wtH5pqN99auP4b6KQRQAbketaSj4StkBJxACPBUAUdiq');
  const [vaultAddress] = useState((window as EnvWindow)?.process_env?.vaultAddress || '5D73wtH5pqN99auP4b6KQRQAbketaSj4StkBJxACPBUAUdiq');
  const [contractInstance, setContractInstance] = useState<ContractPromise | null>(null);
  const [abi, setAbi] = useState<Abi>();
  const [depositor, setDepositor] = useState<string>();
  const [deposited, setDeposited] = useState<BN>();
  const [tokenAsk, setTokenAsk] = useState<{ owner: string, price: BN }>();
  const [isStored, setIsStored] = useState(false);
  // local 5HpCCd2SufXC1NRANgWBvz6k3GnVCDcTceC24WNwERkBtfSk, remote 5Cym1pvyNgzpy88bPXvrgZddH9WEaKHPpsEkET5pSfahKGmK
  const [contractAddress] = useState<string>((window as EnvWindow)?.process_env?.MatcherContractAddress || '5Cym1pvyNgzpy88bPXvrgZddH9WEaKHPpsEkET5pSfahKGmK');
  const contractInfo = useCall<Option<ContractInfo>>(api.query.contracts.contractInfoOf, [contractAddress]);

  const findCallMethodByName = useCallback((methodName: string): AbiMessage | null => {
    const message = contractInstance && Object.values(contractInstance.abi.messages).find((message) => message.identifier === methodName);

    return message || null;
  }, [contractInstance]);

  // get offers
  // if connection ID not specified, returns 30 last token sale offers
  const getUserDeposit = useCallback(async (): Promise<BN | null> => {
    try {
      if (contractInstance) {
        const result = await contractInstance.read('getBalance', { gasLimit: maxGas, value }, 0).send(account) as unknown as { output: BN };

        if (result.output) {
          setDeposited(result.output);

          return result.output;
        }
      }

      return null;
    } catch (e) {
      console.log('getUserDeposit Error: ', e);

      return null;
    }
  }, [account, contractInstance, maxGas, value]);

  const getDepositor = useCallback(async (collectionId: string, tokenId: string): Promise<string | null> => {
    try {
      if (contractInstance) {
        const result = await contractInstance.read('getNftDeposit', { gasLimit: maxGas, value }, collectionId, tokenId).send(account);

        if (result.output) {
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
  }, [account, contractInstance, maxGas, value]);

  const initAbi = useCallback(() => {
    // const jsonAbi = getContractAbi(contractAddress) as Abi;
    const jsonAbi = new Abi(metadata, api.registry.getChainProperties());
    const newContractInstance = new ContractPromise(api, jsonAbi, contractAddress);

    setAbi(jsonAbi);
    setContractInstance(newContractInstance);
  }, [api, contractAddress]);

  const getTokenAsk = useCallback(async (collectionId: string, tokenId: string) => {
    if (contractInstance) {
      const askIdResult = await contractInstance.read('getAskIdByToken', value, maxGas, collectionId, tokenId).send(contractAddress) as unknown as { output: BN };

      if (askIdResult.output) {
        const askId = askIdResult.output.toNumber();
        const askResult = await contractInstance.read('getAskById', value, maxGas, askId).send(contractAddress) as unknown as AskOutputInterface;

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

    setTokenAsk(undefined);

    return null;
  }, [contractAddress, contractInstance, maxGas, value]);

  const isContractReady = useMemo(() => {
    return !!(abi && contractInstance);
  }, [abi, contractInstance]);

  const fetchSystemProperties = useCallback(async () => {
    const properties = await api.rpc.system.properties();
    const tokenDecimals = properties.tokenDecimals.unwrapOr([DEFAULT_DECIMALS]);

    setDecimals(tokenDecimals[0]);
  }, [api]);

  const addExistingContract = useCallback(() => {
    try {
      const contract = keyring.getContract(contractAddress);

      if (isStored && !contract) {
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
  }, [abi, api, contractAddress, isStored]);

  useEffect(() => {
    if (isStored) {
      initAbi();
    }
  }, [initAbi, isStored]);

  useEffect(() => {
    void fetchSystemProperties();
  }, [fetchSystemProperties]);

  useEffect((): void => {
    setIsStored(!!contractInfo?.isSome);
  }, [contractInfo]);

  // addContract
  useEffect(() => {
    addExistingContract();
  }, [addExistingContract]);

  return {
    abi,
    contractAddress,
    contractInstance,
    decimals,
    deposited,
    depositor,
    escrowAddress,
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
