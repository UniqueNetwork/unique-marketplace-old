// Copyright 2017-2021 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeDef } from '@polkadot/react-components/types';

export const uniqueTheme: ThemeDef = {
  domain: 'whitelabel.market',
  theme: 'Unique'
};

export const nf3Theme: ThemeDef = {
  domain: 'nf3digital.com',
  theme: 'NF3Digital'
};

export const luvTheme: ThemeDef = {
  ip: 'localhost', // '18.206.14.88',
  theme: 'LUVNFT'
};

export const vernissageTheme: ThemeDef = {
  domain: '',
  theme: 'Vernissage'
};

export const Themes: ThemeDef[] = [uniqueTheme, nf3Theme, luvTheme, vernissageTheme];
