// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React, { useCallback, useMemo, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';

import { ManageCollection, ManageTokenAttributes, NftDetails } from '@polkadot/react-components';
import Tabs from '@polkadot/react-components/Tabs';
// local imports and components
import { AppProps as Props } from '@polkadot/react-components/types';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import NftWallet from './containers/NftWallet';
import TokensForSale from './containers/TokensForSale';

function App ({ account, basePath }: Props): React.ReactElement<Props> {
  const location = useLocation();
  const history = useHistory();
  const [shouldUpdateTokens, setShouldUpdateTokens] = useState<string>();
  const collectionsStorage: NftCollectionInterface[] = JSON.parse(localStorage.getItem('tokenCollections') || '[]') as NftCollectionInterface[];
  const [collections, setCollections] = useState<NftCollectionInterface[]>(collectionsStorage);

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

  const createCollection = useCallback(() => {
    history.push('/wallet/manage-collection');
  }, [history]);

  const addCollection = useCallback((collection: NftCollectionInterface) => {
    setCollections((prevCollections: NftCollectionInterface[]) => {
      let newCollections = [...prevCollections];

      if (!prevCollections.find((prevCollection) => prevCollection.id === collection.id)) {
        newCollections = [...prevCollections, collection];
      }

      localStorage.setItem('tokenCollections', JSON.stringify(newCollections));

      return newCollections;
    });
  }, []);

  const canCreateCollection = false;

  return (
    <div className='my-tokens'>
      { !location.pathname.includes('token-details') && !location.pathname.includes('manage-') && (
        <>
          <Header as='h1'>My Tokens</Header>
          <Header as='h4'>NFTs owned by me</Header>
          { canCreateCollection && (
            <Button
              className='create-button'
              onClick={createCollection}
              primary
            >
              Create collection
            </Button>
          )}
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
            setShouldUpdateTokens={setShouldUpdateTokens}
          />
        </Route>
        <Route path={`${basePath}/manage-collection`}>
          <ManageCollection
            account={account}
            addCollection={addCollection}
            basePath={`${basePath}/manage-collection`}
            setShouldUpdateTokens={setShouldUpdateTokens}
          />
        </Route>
        <Route path={`${basePath}/manage-token`}>
          <ManageTokenAttributes
            account={account}
            setShouldUpdateTokens={setShouldUpdateTokens}
          />
        </Route>
        <Route path={`${basePath}/tokens-for-sale`}>
          <TokensForSale
            account={account}
            setShouldUpdateTokens={setShouldUpdateTokens}
            shouldUpdateTokens={shouldUpdateTokens}
          />
        </Route>
        <Route path={basePath}>
          <NftWallet
            account={account}
            addCollection={addCollection}
            collections={collections}
            setCollections={setCollections}
            setShouldUpdateTokens={setShouldUpdateTokens}
            shouldUpdateTokens={shouldUpdateTokens}
          />
        </Route>
      </Switch>
    </div>
  );
}

export default React.memo(App);
