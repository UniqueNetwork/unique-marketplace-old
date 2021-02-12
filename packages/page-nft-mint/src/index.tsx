// Copyright 2020 UseTech authors & contributors

// global app props and types
import { AppProps as Props } from '@polkadot/react-components/types';

// external imports
import React, { useMemo } from 'react';
import { Route, Switch } from 'react-router';

// local imports and components
import Tabs from '@polkadot/react-components/Tabs';
import NftCreator from './containers/NftMint';
import './styles.scss';

function App ({ basePath, className }: Props): React.ReactElement<Props> {

  const items = useMemo(() => [
    {
      isRoot: true,
      name: 'nftCreator',
      text: 'Nft Creator'
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
        <Route path={basePath}>
          <NftCreator />
        </Route>
      </Switch>
    </main>
  );
}

export default React.memo(App);
