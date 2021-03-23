// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React from 'react';

// local imports and components
import { AppProps as Props } from '@polkadot/react-components/types';

import NftMarket from './containers/NftMarket';

function App ({ account }: Props): React.ReactElement<Props> {

  return (
    <NftMarket account={account} />
  );
}

export default React.memo(App);
