// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React, { useMemo } from 'react';
import { Route, Switch } from 'react-router';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';

import Tabs from '@polkadot/react-components/Tabs';
// local imports and components
import { AppProps as Props } from '@polkadot/react-components/types';

import TradeHistory from './containers/TradeHistory';

function App ({ account, basePath }: Props): React.ReactElement<Props> {
  const items = useMemo(() => [
    {
      isRoot: true,
      name: 'my-trades',
      text: 'My trades'
    },
    {
      name: 'all-trades',
      text: 'All trades'
    }
  ], []);

  return (
    <main className='nft--App'>
      <Header as='h1'>Trades</Header>
      <Header as='h4'>See the most recent successful trades</Header>
      <header>
        <Tabs
          basePath={basePath}
          items={items}
        />
      </header>
      <Switch>
        <Route path={`${basePath}/all-trades`}>
          <TradeHistory />
        </Route>
        <Route path={`${basePath}`}>
          <TradeHistory account={account} />
        </Route>
      </Switch>
    </main>
  );
}

export default React.memo(App);
