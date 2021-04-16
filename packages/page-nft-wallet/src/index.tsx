// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React, { useMemo, useState } from 'react';
import { Route, Switch } from 'react-router';
import { useLocation } from 'react-router-dom';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';

import { Dropdown, ManageCollection, ManageToken, NftDetails } from '@polkadot/react-components';
import Tabs from '@polkadot/react-components/Tabs';
// local imports and components
import { AppProps as Props } from '@polkadot/react-components/types';
import { useRegistry } from '@polkadot/react-hooks';

import NftWallet from './containers/NftWallet';
import TokensForSale from './containers/TokensForSale';

const createOptions = [
  {
    text: 'Create collection',
    value: 'collection'
  },
  {
    text: 'Create token',
    value: 'token'
  }
];

function App ({ account, basePath }: Props): React.ReactElement<Props> {
  const localRegistry = useRegistry();
  const location = useLocation();
  const [shouldUpdateTokens, setShouldUpdateTokens] = useState<string>();

  const items = useMemo(() => [
    {
      isRoot: true,
      name: 'tokens',
      text: 'Idle'
    },
    {
      name: 'tokens-for-sale',
      text: 'Listed for sale'
    }
  ], []);

  return (
    <div className='my-tokens'>
      { !location.pathname.includes('token-details') && !location.pathname.includes('manage-') && (
        <>
          <Header as='h1'>My Tokens</Header>
          <Header as='h4'>NFTs owned by me</Header>
          <Dropdown
            className='dropdown-button create-button'
            isItem
            isSimple
            options={createOptions}
            text='Create'
          />
          <header>
            <Tabs
              basePath={basePath}
              items={items}
            />
          </header>
        </>
      )}
      <Switch>
        <Route path={`${basePath}/token-details`}>
          <NftDetails
            account={account || ''}
            localRegistry={localRegistry}
            setShouldUpdateTokens={setShouldUpdateTokens}
          />
        </Route>
        <Route path={`${basePath}/manage-collection`}>
          <ManageCollection
            account={account}
            localRegistry={localRegistry}
            setShouldUpdateTokens={setShouldUpdateTokens}
          />
        </Route>
        <Route path={`${basePath}/manage-token`}>
          <ManageToken
            account={account}
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
    </div>
  );
}

export default React.memo(App);
