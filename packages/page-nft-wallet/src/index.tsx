// Copyright 2020 UseTech authors & contributors

// global app props and types
import './styles.scss';

// external imports
import React, { useMemo } from 'react';
import { Route, Switch } from 'react-router';

// local imports and components
import Tabs from '@polkadot/react-components/Tabs';
import { AppProps as Props } from '@polkadot/react-components/types';

import NftWallet from './containers/NftWallet';

function App ({ basePath }: Props): React.ReactElement<Props> {
  const items = useMemo(() => [
    {
      isRoot: true,
      name: 'wallet',
      text: 'NFT Wallet'
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
          <NftWallet />
        </Route>
      </Switch>
    </main>
  );
}

export default React.memo(App);
