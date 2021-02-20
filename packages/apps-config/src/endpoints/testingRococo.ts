// Copyright 2017-2021 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TFunction } from 'i18next';
import type { LinkOption } from '../settings/types';

import { expandEndpoints } from './util';

/* eslint-disable sort-keys */

// The available endpoints that will show in the dropdown. For the most part (with the exception of
// Polkadot) we try to keep this to live chains only, with RPCs hosted by the community/chain vendor
//   info: The chain logo name as defined in ../ui/logos/index.ts in namedLogos (this also needs to align with @polkadot/networks)
//   text: The text to display on the dropdown
//   value: The actual hosted secure websocket endpoint

// Based on history, this will expand so keep it as a singular chunk
export function createRococo (t: TFunction): LinkOption[] {
  return expandEndpoints(t, [{
    dnslink: 'rococo',
    genesisHash: '0xf60989b1d5edd03c1947d557dc56982800a3fec377702be5e87ee6f30b6298f9',
    info: 'rococo',
    text: t('rpc.rococo', 'Rococo', { ns: 'apps-config' }),
    providers: {
      Parity: 'wss://rococo-rpc.polkadot.io',
      OnFinality: 'wss://rococo.api.onfinality.io/public-ws',
      'Patract Elara': 'wss://rococo.elara.patract.io',
      'Ares Protocol': 'wss://rococo.aresprotocol.com'
    },
    linked: [
      // these are the base chains
    ]
  }]);
}
