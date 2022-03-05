// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import Web3 from 'web3';

import envConfig from '@polkadot/apps-config/envConfig';
import { IKeyringPair } from '@polkadot/types/types';
import { formatBalance } from '@polkadot/util';
import { addressToEvm } from '@polkadot/util-crypto';

const { commission, decimals, minPrice } = envConfig;

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

export function subToEth (substrateAccount: string): string {
  return Web3.utils.toChecksumAddress(subToEthLowercase(substrateAccount));
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

export function fromStringToBnString (value: string, decimals: number): string {
  if (!value || !value.length) {
    return '0';
  }

  const numStringValue = value.replace(',', '.');
  const [left, right] = numStringValue.split('.');
  const decimalsFromLessZeroString = right?.length || 0;
  const bigValue = [...(left || []), ...(right || [])].join('').replace(/^0+/, '');

  return (Number(bigValue) * Math.pow(10, decimals - decimalsFromLessZeroString)).toString();
}

export function formatStrBalance (value: BN | undefined = new BN(0), incomeDecimals?: number): string {
  if (!value || value.toString() === '0') {
    return '0';
  }

  const tokenDecimals = incomeDecimals || formatBalance.getDefaults().decimals;

  if (value.lte(new BN(minPrice * Math.pow(10, tokenDecimals)))) {
    return ` ${minPrice}`;
  }

  // calculate number after decimal point
  const decNum = value?.toString().length - tokenDecimals;
  let balanceStr = '';

  if (decNum < 0) {
    balanceStr = ['0', '.', ...Array.from('0'.repeat(Math.abs(decNum))), ...value.toString()].join('');
  }

  if (decNum > 0) {
    balanceStr = [...value.toString().substr(0, decNum), '.', ...value.toString().substr(decNum, tokenDecimals - decNum)].join('');
  }

  if (decNum === 0) {
    balanceStr = ['0', '.', ...value.toString().substr(decNum, tokenDecimals - decNum)].join('');
  }

  const arr = balanceStr.toString().split('.');
  const afterZero = arr[1] ? `.${arr[1].substr(0, decimals)}`.replace(/0*$/, '') : '';
  const fullAfterZero = afterZero === '.' ? '' : afterZero;

  return `${arr[0]}${fullAfterZero}`;
}
