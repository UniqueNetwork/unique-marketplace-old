// Copyright 2017-2021 @polkadot/apps-routing authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TFunction } from 'i18next';
import type { Routes } from './types';

// import nftMarket from './nft-market';
// import nftMint from './nft-mint';
import nftWallet from './nft-wallet';

export default function create (t: TFunction): Routes {
  return [
    nftWallet(t)
  ];
}
