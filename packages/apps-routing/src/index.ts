// Copyright 2017-2021 @polkadot/apps-routing, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TFunction } from 'i18next';
import type { Routes } from './types';

import accounts from './accounts';
import contracts from './contracts';
import nftMarket from './nft-market';
import nftMint from './nft-mint';
import nftWallet from './nft-wallet';
import settings from './settings';

export default function create (t: TFunction): Routes {
  return [
    nftWallet(t),
    nftMint(t),
    nftMarket(t),
    accounts(t),
    contracts(t),
    settings(t)
  ];
}
