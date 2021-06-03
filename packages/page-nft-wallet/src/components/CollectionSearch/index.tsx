// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { Input } from '@polkadot/react-components';
import { useCollections, useDecoder } from '@polkadot/react-hooks';

import clearIcon from './clearIcon.svg';
import searchIcon from './searchIcon.svg';

interface Props {
  account: string | null | undefined;
  addCollection: (item: NftCollectionInterface) => void;
  collections: NftCollectionInterface[];
}

function CollectionSearch ({ account, addCollection, collections }: Props): React.ReactElement<Props> {
  const [collectionsAvailable, setCollectionsAvailable] = useState<Array<NftCollectionInterface>>([]);
  const [collectionsMatched, setCollectionsMatched] = useState<Array<NftCollectionInterface>>([]);
  const [searchString, setSearchString] = useState<string>('');
  const { presetTokensCollections } = useCollections();
  const currentAccount = useRef<string | null | undefined>();
  const { collectionName16Decoder } = useDecoder();

  const searchCollection = useCallback(() => {
    const filteredCollections = collectionsAvailable.filter((collection) => {
      const collectionName = collectionName16Decoder(collection.Name).toLowerCase();

      if (collectionName.indexOf(searchString.toLowerCase()) !== -1 || collection.id.toString().toLowerCase().indexOf(searchString.toLowerCase()) !== -1
      ) {
        return collection;
      }

      return null;
    });

    setCollectionsMatched(filteredCollections);
  }, [collectionName16Decoder, collectionsAvailable, searchString]);

  const hasThisCollection = useCallback((collectionInfo: NftCollectionInterface) => {
    return !!collections.find((collection: NftCollectionInterface) => collection.id === collectionInfo.id);
  }, [collections]);

  const addCollectionToAccount = useCallback((item: NftCollectionInterface) => {
    addCollection({
      ...item,
      DecimalPoints: item.DecimalPoints,
      Description: item.Description,
      Name: item.Name,
      OffchainSchema: item.OffchainSchema,
      TokenPrefix: item.TokenPrefix,
      id: item.id
    });
  }, [addCollection]);

  const getCollections = useCallback(async () => {
    const collections = await presetTokensCollections();

    if (collections && collections.length) {
      setCollectionsAvailable(collections);
    }
  }, [presetTokensCollections]);

  const clearSearch = useCallback(() => {
    setSearchString('');
    setCollectionsMatched([]);
  }, []);

  const onAddCollection = useCallback((item, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    addCollectionToAccount(item);
  }, [addCollectionToAccount]);

  useEffect(() => {
    if (searchString.length >= 3) {
      searchCollection();
    }
  }, [searchCollection, searchString]);

  // clear search results if account changed
  useEffect(() => {
    if (currentAccount.current && currentAccount.current !== account) {
      setCollectionsMatched([]);
      setSearchString('');
    }

    currentAccount.current = account;
  }, [account]);

  useEffect(() => {
    void getCollections();
  }, [getCollections]);

  return (
    <div className='collection-search'>
      <Form
        className='collection-search-form'
        onSubmit={searchCollection}
      >
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <Header as='h3'>
                Find token collection
              </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              { account && (
                <Form.Field
                  className={ collectionsMatched?.length > 0 ? 'search-field with-results' : 'search-field'}
                >
                  <Input
                    className='isSmall'
                    icon={
                      <img
                        alt='search'
                        className='search-icon'
                        src={searchIcon as string}
                      />
                    }
                    isDisabled={!collectionsAvailable.length}
                    onChange={setSearchString}
                    placeholder='Enter collection number or name'
                    value={searchString}
                    withLabel
                  >
                    { !collectionsAvailable.length && (
                      <Loader
                        active
                        inline='centered'
                      />
                    )}
                    { searchString?.length > 0 && (
                      <img
                        alt='clear'
                        className='clear-icon'
                        onClick={clearSearch}
                        src={clearIcon as string}
                      />
                    )}
                  </Input>
                </Form.Field>
              )}
              { collectionsMatched?.length > 0 && (
                <div className='collection-search-results'>
                  {collectionsMatched.map((item) => (
                    <div
                      className='collection-search-result'
                      key={item.id}
                    >
                      <span className='collection-name'>
                        {collectionName16Decoder(item.Name)}
                      </span>
                      { hasThisCollection(item) && (
                        <span className='collection-added'>
                          Collection already added
                        </span>
                      )}
                      { !hasThisCollection(item) && (
                        <a
                          className='collection-add'
                          onClick={onAddCollection.bind(null, item)}
                        >
                          Add collection
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </div>
  );
}

export default React.memo(CollectionSearch);
