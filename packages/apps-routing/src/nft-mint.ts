// Copyright 2017-2021 @polkadot/apps-routing, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TFunction } from 'i18next';

import Component from '@polkadot/app-nft-mint';

import { Route } from './types';

export default function create (t: TFunction): Route {
  return {
    Component,
    display: {
      needsApi: []
    },
    group: 'nft',
    icon: 'users',
    name: 'mint',
    text: t('nav.minNft', 'Mint', { ns: 'apps-routing' })
  };
}
