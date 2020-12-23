// Copyright 2020 UseTech authors & contributors

// global app props and types
import { NftCollectionInterface, useApi, useCollections, useNftTests } from '@polkadot/react-hooks';

// external imports
import React, { memo, ReactElement, useCallback, useEffect, useState, useMemo } from 'react';
import { Route, Switch } from 'react-router-dom'
import { useHistory } from 'react-router';
import List from 'semantic-ui-react/dist/commonjs/elements/List';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Dropdown from 'semantic-ui-react/dist/commonjs/modules/Dropdown';
import { AccountSelector, Input } from '@polkadot/react-components';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';

// local imports and components
import NftDetailsModal from '../../components/NftDetailsModal';
import NftTokenCard from '../../components/NftTokenCard';

import { filterOptions } from './filterOptions';
import './styles.scss';

interface BuyTokensProps {
  className?: string;
}

/* const collectionsForSale: Array<NftCollectionInterface> = [
  {
    decimalPoints: 0,
    description: 'Remake of classic CryptoPunks game',
    id: 4,
    isReFungible: false,
    name: 'Substrapunks',
    offchainSchema: 'https://ipfs-gateway.usetech.com/ipns/QmaMtDqE9nhMX9RQLTpaCboqg7bqkb6Gi67iCKMe8NDpCE/images/punks/image{id}.pn',
    prefix: 'PNK'
  },
  {
    decimalPoints: 0,
    description: 'The NFT collection for artists to mint and display their work',
    id: 14,
    isReFungible: false,
    name: 'Unique Gallery',
    offchainSchema: 'https://uniqueapps.usetech.com/api/images/{id',
    prefix: 'GAL',
  }
]; */

const BuyTokens = ({ className }: BuyTokensProps): ReactElement<BuyTokensProps> => {
  const { api } = useApi();
  const history = useHistory();
  const [account, setAccount] = useState<string | null>(null);
  const { presetTokensCollections, getDetailedCollectionInfo, getTokensOfCollection } = useCollections();
  const [collectionsAvailable, setCollectionsAvailable] = useState<Array<NftCollectionInterface>>([]);
  const [collectionSearchString, setCollectionSearchString] = useState<string>('');
  const [tokenSearchString, setTokenSearchString] = useState<string>('');
  // const [selectedCollection, setSelectedCollection] = useState<NftCollectionBigInterface>();
  const [selectedCollection, setSelectedCollection] = useState<NftCollectionInterface | null>(null);
  const [tokensListForTrade, setTokensListForTrade] = useState<Array<string>>([]);
  const { createToken } = useNftTests(account);

  const getCollections = useCallback(async () => {
    const collections = await presetTokensCollections();
    if (collections && collections.length) {
      setCollectionsAvailable(collections);
    }
  }, []);

  const selectCollection = useCallback(async (collection: NftCollectionInterface) => {
    setSelectedCollection(await getDetailedCollectionInfo(collection.id));
  }, [setSelectedCollection]);

  const openDetailedInformationModal = useCallback((collection: NftCollectionInterface, tokenId) => {
    history.push(`/store/token-details?collectionId=${collection.id}&tokenId=${tokenId}`)
  }, []);

  const setTokensList = useCallback(async () => {
    if (selectedCollection && account) {
      const tokensOfCollection = (await getTokensOfCollection(selectedCollection.id, account)) as any;
      console.log('tokensOfCollection', tokensOfCollection);
      setTokensListForTrade(tokensOfCollection);
    }
  }, [account, selectedCollection, getTokensOfCollection]);

  const collectionsFiltered = useMemo(() => {
    return collectionsAvailable.filter(item => item.name.toLowerCase().indexOf(collectionSearchString) !== -1);
  }, [collectionsAvailable, collectionSearchString]);

  const tokensFiltered = useMemo(() => {
    return tokensListForTrade.filter(item => item.toString().toLowerCase().indexOf(tokenSearchString) !== -1);
  }, [tokensListForTrade, tokenSearchString]);

  useEffect(() => {
    void getCollections();
  }, [api]);

  useEffect(() => {
    void setTokensList();
  }, [setTokensList]);

  useEffect(() => {
    if (!selectedCollection && collectionsAvailable.length) {
      void selectCollection(collectionsAvailable[0]);
    }
  }, [collectionsAvailable, selectCollection, selectedCollection]);

  useEffect(() => {
    if (account && api) {
      // createToken();
    }
  }, [account, api, createToken]);

  return (
    <div className='nft-store'>
      <Header as='h2'>Nft Tokens</Header>
      <Grid className='account-selector'>
        <Grid.Row>
          <Grid.Column width={6}>
            <AccountSelector onChange={setAccount} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={6}>
            <Input
              className='explorer--query input-search'
              help={<span>Find and select your token collection. For example, you can find tokens from <a href='https://ipfs-gateway.usetech.com/ipns/QmaMtDqE9nhMX9RQLTpaCboqg7bqkb6Gi67iCKMe8NDpCE/' target='_blank' rel='noopener noreferrer'>SubstraPunks</a></span>}
              isDisabled={!collectionsAvailable.length}
              label={'Find collection'}
              onChange={setCollectionSearchString}
              value={collectionSearchString}
              placeholder='Search...'
              withLabel
            />
            <div className='nft-collections'>
              <List divided relaxed>
                { collectionsFiltered.map((collection) => (
                <List.Item onClick={selectCollection.bind(null, collection)} key={collection.id}>
                  <List.Content>
                    <List.Header as='a'>{collection.name}</List.Header>
                    <List.Description as='a'>{collection.description}</List.Description>
                  </List.Content>
                </List.Item>
                ))}
              </List>
            </div>
          </Grid.Column>
          <Grid.Column width={8}>
            <Grid>
              <Grid.Row>
                <Grid.Column width={12}>
                  <Input
                    className='explorer--query input-search'
                    help={<span>Find your token. For example, 1</span>}
                    isDisabled={!collectionsAvailable.length}
                    label={'Find token'}
                    onChange={setTokenSearchString}
                    value={tokenSearchString}
                    placeholder='Search...'
                    withLabel
                  />
                </Grid.Column>
                <Grid.Column width={4}>
                  <Dropdown
                    placeholder='Filter'
                    fluid
                    multiple
                  >
                    <Dropdown.Menu>
                      {filterOptions.map((group) => (
                        <React.Fragment key={group.key}>
                          <Dropdown.Header content={`Filter by ${group.name}`} />
                          <Dropdown.Divider />
                          { group.items.map((item) => (
                            <Dropdown.Item key={item.key}>{item.text}</Dropdown.Item>
                          ))}
                        </React.Fragment>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <div className='nft-tokens'>
                  { account && selectedCollection && tokensFiltered.map((token) => (
                    <NftTokenCard
                      account={account}
                      canTransferTokens={true}
                      collection={selectedCollection}
                      key={token}
                      openDetailedInformationModal={openDetailedInformationModal}
                      token={token}
                    />
                  )) }
                </div>
              </Grid.Row>
            </Grid>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      { account && selectedCollection && (
        <Switch>
          <Route
            path="*/token-details"
            key="TokenDetailsModal"
          >
            <NftDetailsModal account={account} />
          </Route>
        </Switch>
      )}
    </div>
  )
};

export default memo(BuyTokens);

