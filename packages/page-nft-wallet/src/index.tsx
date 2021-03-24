// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React, { useMemo, useState } from 'react';
import { Route, Switch } from 'react-router';

import { NftDetails } from '@polkadot/react-components';
import Tabs from '@polkadot/react-components/Tabs';
// local imports and components
import { AppProps as Props } from '@polkadot/react-components/types';
import { useRegistry } from '@polkadot/react-hooks';

import NftWallet from './containers/NftWallet';
import TokensForSale from './containers/TokensForSale';

function App ({ account, basePath }: Props): React.ReactElement<Props> {
  const localRegistry = useRegistry();
  const [shouldUpdateTokens, setShouldUpdateTokens] = useState<string>();

  const items = useMemo(() => [
    {
      isRoot: true,
      name: 'tokens',
      text: 'Tokens'
    },
    {
      name: 'tokens-for-sale',
      text: 'Tokens for sell'
    }
  ], []);

  return (
    <>
      <header>
        <Tabs
          basePath={basePath}
          items={items}
        />
      </header>
      <Switch>
        <Route path={`${basePath}/token-details`}>
          <NftDetails
            account={account || ''}
            localRegistry={localRegistry}
            setShouldUpdateTokens={setShouldUpdateTokens}
          />
        </Route>
        <Route path={`${basePath}/tokens-for-sale`}>
          <TokensForSale
            account={account}
            localRegistry={localRegistry}
            setShouldUpdateTokens={setShouldUpdateTokens}
            shouldUpdateTokens={shouldUpdateTokens}
          />
        </Route>
        <Route path={basePath}>
          <NftWallet
            account={account}
            localRegistry={localRegistry}
            setShouldUpdateTokens={setShouldUpdateTokens}
            shouldUpdateTokens={shouldUpdateTokens}
          />
        </Route>
      </Switch>
    </>
  );
}

export default React.memo(App);
