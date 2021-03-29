// Copyright 2017-2021 @polkadot/apps-routing, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TFunction } from 'i18next';

import Component from '@polkadot/app-nft-all';

import { Route } from './types';

export default function create (t: TFunction): Route {
  return {
    Component,
    display: {
      needsApi: []
    },
    group: 'nft',
    icon: 'users',
    name: 'all-tokens',
    text: t('nav.allTokens', 'All tokens', { ns: 'apps-routing' })
  };
}
