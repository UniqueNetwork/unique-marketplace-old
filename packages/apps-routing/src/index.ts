// Copyright 2017-2021 @polkadot/apps-routing, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TFunction } from 'i18next';
import type { Routes } from './types';

import envConfig from '@polkadot/apps-config/envConfig';

import accounts from './accounts';
import nftMarket from './nft-market';
import nftTrades from './nft-trades';
import nftWallet from './nft-wallet';
import faq from './faq';

const { walletMode } = envConfig;

export default function create (t: TFunction): Routes {
  if (walletMode) {
    return [
      nftWallet(t),
      accounts(t)
    ];
  }

  return [
    nftTrades(t),
    nftWallet(t),
    nftMarket(t),
    accounts(t),
    faq(t)
  ];
}
