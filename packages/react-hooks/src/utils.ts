// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ContractPromise } from '@polkadot/api-contract';
import type { AbiMessage } from '@polkadot/api-contract/types';
import type { AccountId } from '@polkadot/types/interfaces';

import { IKeyringPair } from '@polkadot/types/types';

export type CrossAccountId = {
  Substrate: string,
} | {
  Ethereum: string,
};

export const findCallMethodByName = (contractInstance: ContractPromise | null, methodName: string): AbiMessage | null => {
  const message = contractInstance && Object.values(contractInstance.abi.messages).find((message) => message.identifier === methodName);

  return message || null;
};

export function strToUTF16 (str: string): any {
  const buf: number[] = [];

  for (let i = 0, strLen = str.length; i < strLen; i++) {
    buf.push(str.charCodeAt(i));
  }

  return buf;
}

export function normalizeAccountId (input: string | AccountId | CrossAccountId | IKeyringPair): CrossAccountId {
  if (typeof input === 'string') {
    if (input.length === 48 || input.length === 47) {
      return { Substrate: input };
    } else if (input.length === 42 && input.startsWith('0x')) {
      return { Ethereum: input.toLowerCase() };
    } else if (input.length === 40 && !input.startsWith('0x')) {
      return { Ethereum: '0x' + input.toLowerCase() };
    } else {
      throw new Error(`Unknown address format: "${input}"`);
    }
  }

  if ('address' in input) {
    return { Substrate: input.address };
  }

  if ('Ethereum' in input) {
    return {
      Ethereum: input.Ethereum.toLowerCase()
    };
  } else if ('ethereum' in input) {
    return {
      Ethereum: (input as { ethereum: string }).ethereum.toLowerCase()
    };
  } else if ('Substrate' in input) {
    return input;
  } else if ('substrate' in input) {
    return {
      Substrate: (input as { substrate: string }).substrate
    };
  }

  // AccountId
  return { Substrate: input.toString() };
}
