// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import Web3 from 'web3';

import envConfig from '@polkadot/apps-config/envConfig';
import { IKeyringPair } from '@polkadot/types/types';
import { addressToEvm } from '@polkadot/util-crypto';

const { commission } = envConfig;

export type CrossAccountId = {
  Substrate: string,
} | {
  Ethereum: string,
};

// decimals: 15 - opal, 18 - eth
function subToEthLowercase (eth: string): string {
  const bytes = addressToEvm(eth);

  return '0x' + Buffer.from(bytes).toString('hex');
}

export function subToEth (eth: string): string {
  return Web3.utils.toChecksumAddress(subToEthLowercase(eth));
}

export const getFee = (price: BN): BN => price.mul(new BN(commission)).div(new BN(100));

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
