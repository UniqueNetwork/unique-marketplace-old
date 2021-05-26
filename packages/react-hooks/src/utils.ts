// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ContractPromise } from '@polkadot/api-contract';
import type { AbiMessage } from '@polkadot/api-contract/types';

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
