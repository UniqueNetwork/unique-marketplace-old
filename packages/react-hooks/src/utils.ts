// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ContractPromise } from '@polkadot/api-contract';
import type { AbiMessage } from '@polkadot/api-contract/types';

export const maxGas = 1000000000000;
export const value = 0;
export const escrowAddress = '5FdzbgdBGRM5FDALrnSPRybWhqKv4eiy6QUpWUdBt3v3omAU';
export const contractAddress = '5FgbNg55FCFT3j1KokxsHaEgp4wfnDMGazCLw3mqC359bY72';
export const quoteId = 2;
export const KUSAMA_DECIMALS = 12;
export const UNIQUE_COLLECTION_ID = '2';

export const findCallMethodByName = (contractInstance: ContractPromise | null, methodName: string): AbiMessage | null => {
  const message = contractInstance && Object.values(contractInstance.abi.messages).find((message) => message.identifier === methodName);

  return message || null;
};
