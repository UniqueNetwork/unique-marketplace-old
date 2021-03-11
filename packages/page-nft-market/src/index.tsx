// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React, { useMemo } from 'react';
import { Route, Switch } from 'react-router';

// local imports and components
import Tabs from '@polkadot/react-components/Tabs';
import { AppProps as Props } from '@polkadot/react-components/types';

import NftMarket from './containers/NftMarket';
import TradeHistory from './containers/TradeHistory';

function App ({ basePath }: Props): React.ReactElement<Props> {

  const items = useMemo(() => [
    {
      isRoot: true,
      name: 'nftMarket',
      text: 'NFT Market'
    },
    {
      name: 'trade-history',
      text: 'Trade History'
    }
  ], []);

  return (
    <main className='nft--App'>
      <header>
        <Tabs
          basePath={basePath}
          items={items}
        />
      </header>
      <Switch>
        <Route path={`${basePath}/trade-history`}>
          <TradeHistory />
        </Route>
        <Route path={basePath}>
          <NftMarket />
        </Route>
      </Switch>
    </main>
  );
}

export default React.memo(App);
