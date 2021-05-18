// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FieldRuleType, FieldType } from '@polkadot/react-components/util/protobufUtils';

export type TypeOption = {
  text: string;
  value: FieldType;
}

export type CountOption = {
  text: string;
  value: FieldRuleType;
}

export const TypeOptions: TypeOption[] = [
  {
    text: 'string',
    value: 'string'
  },
  {
    text: 'enumerable',
    value: 'enum'
  }
];

export const CountOptions: CountOption[] = [
  {
    text: 'optional',
    value: 'optional'
  },
  {
    text: 'required',
    value: 'required'
  },
  {
    text: 'repeated',
    value: 'repeated'
  }
];
