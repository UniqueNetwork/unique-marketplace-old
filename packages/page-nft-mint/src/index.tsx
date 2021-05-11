// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { useMemo } from 'react';
import { Route, Switch } from 'react-router';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';

import { ManageCollection, ManageTokenAttributes,Tabs } from '@polkadot/react-components';
import { AppProps as Props } from '@polkadot/react-components/types';

function App ({ account, basePath }: Props): React.ReactElement<Props> {

  const items = useMemo(() => [
    {
      isRoot: true,
      name: 'manage-collections',
      text: 'Manage collections'
    },
    {
      name: 'mint-token',
      text: 'Mint token'
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
        <Route path={`${basePath}/mint-token`}>
          <ManageTokenAttributes
            account={account}
          />
        </Route>
        <Route path={`${basePath}`}>
          <ManageCollection
            account={account}
            addCollection={() => console.log('add collection')}
            basePath={`${basePath}/manage-collection`}
            setShouldUpdateTokens={() => console.log('add collection')}
          />
        </Route>
      </Switch>
    </main>
  );
}

export default React.memo(App);
