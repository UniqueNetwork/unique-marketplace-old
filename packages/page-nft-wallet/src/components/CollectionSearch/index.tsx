// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import { Input, Table } from '@polkadot/react-components';
import { useCollections, useDecoder } from '@polkadot/react-hooks';

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
            <Grid.Column width={14}>
              { account && (
                <Form.Field>
                  <Input
                    className='isSmall'
                    isDisabled={!collectionsAvailable.length}
                    label={<span>Find and add your token collection. For example, you can add tokens from <a href='https://ipfs-gateway.usetech.com/ipns/QmaMtDqE9nhMX9RQLTpaCboqg7bqkb6Gi67iCKMe8NDpCE/'
                      rel='noopener noreferrer'
                      target='_blank'>SubstraPunks</a></span>}
                    onChange={setSearchString}
                    placeholder='Search...'
                    value={searchString}
                    withLabel
                  />
                </Form.Field>
              )}
            </Grid.Column>
            <Grid.Column width={2}>
              <Form.Field>
                <Button
                  content={'Search'}
                  onClick={searchCollection}
                />
              </Form.Field>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <Header as='h3'>
                  Search results
              </Header>
              <Table
                empty={'No results'}
                header={[]}
              >
                {collectionsMatched.map((item) => (
                  <tr
                    className='collection-row'
                    key={item.id}
                  >
                    <td className='collection-name'>
                    Collection name: <strong>{collectionName16Decoder(item.Name)}</strong>
                    </td>
                    <td className='collection-actions'>
                      <Button
                        disabled={hasThisCollection(item)}
                        onClick={addCollectionToAccount.bind(null, item)}
                      >
                        Add collection
                      </Button>
                    </td>
                  </tr>
                ))}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </div>
  );
}

export default React.memo(CollectionSearch);
