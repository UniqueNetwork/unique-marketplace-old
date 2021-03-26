// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { OfferType } from '@polkadot/react-hooks/useCollections';

// external imports
import React, { memo, ReactElement, useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { Input } from '@polkadot/react-components';
import { useCollections, useDecoder } from '@polkadot/react-hooks';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollections';
import { TypeRegistry } from '@polkadot/types';

// local imports and components
import NftTokenCard from '../../components/NftTokenCard';

interface BuyTokensProps {
  account?: string;
  localRegistry?: TypeRegistry;
  setShouldUpdateTokens: (value?: string) => void;
  shouldUpdateTokens?: string;
}

const BuyTokens = ({ account, localRegistry, setShouldUpdateTokens, shouldUpdateTokens }: BuyTokensProps): ReactElement => {
  const history = useHistory();
  const { getOffers, offers, presetMintTokenCollection } = useCollections();
  const [searchString, setSearchString] = useState<string>('');
  // const [collectionSearchString, setCollectionSearchString] = useState<string>('');
  const [collections, setCollections] = useState<NftCollectionInterface[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<OfferType[]>([]);
  const { collectionName16Decoder } = useDecoder();

  const openDetailedInformationModal = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/market/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const addMintCollectionToList = useCallback(async () => {
    const firstCollections: NftCollectionInterface[] = await presetMintTokenCollection();

    setCollections(() => [...firstCollections]);
  }, [presetMintTokenCollection]);

  useEffect(() => {
    setFilteredOffers(offers && offers.length ? offers.filter((item: OfferType) => item.collectionId.toString().includes(searchString.toLowerCase()) || item.tokenId.toString().includes(searchString.toLowerCase())) : []);
  }, [offers, searchString]);

  useEffect(() => {
    if (shouldUpdateTokens) {
      void getOffers();
      setShouldUpdateTokens(undefined);
    }
  }, [getOffers, shouldUpdateTokens, setShouldUpdateTokens]);

  useEffect(() => {
    void addMintCollectionToList();
  }, [addMintCollectionToList]);

  useEffect(() => {
    setShouldUpdateTokens('all');
  }, [setShouldUpdateTokens]);

  return (
    <div className='nft-market'>
      <Header as='h1'>Market</Header>
      <Header as='h4'>Art gallery collections</Header>
      <Grid>
        <Grid.Row>
          <Grid.Column width={4}>
            <Header as='h5'>Collections</Header>
            {/* <Input
              className='isSmall search'
              help={<span>Find and select tokens collection.</span>}
              isDisabled={!offers || !offers.length}
              label={'Find collection by name'}
              onChange={setSearchString}
              placeholder='Find collection by name or id'
              value={searchString}
              withLabel
            /> */}
            <ul className='collections-list'>
              { collections.map((collection) => (
                <li
                  className='collections-list__item'
                  key={collection.id}
                >
                  <div className='collections-list__img'>
                    {/* <Image src={} /> */}
                  </div>
                  <div className='collections-list__name'>{collectionName16Decoder(collection.Name)}</div>
                </li>
              ))}
            </ul>
            <hr/>
          </Grid.Column>
          <Grid.Column width={12}>
            <Grid>
              <Grid.Row>
                <Grid.Column width={16}>
                  <Input
                    className='isSmall search'
                    help={<span>Find and select token.</span>}
                    isDisabled={!offers || !offers.length}
                    label={'Find token by name or collection'}
                    onChange={setSearchString}
                    placeholder='Search...'
                    value={searchString}
                    withLabel
                  />
                </Grid.Column>
              </Grid.Row>
              { (!account || !offers) && (
                <Loader
                  active
                  inline='centered'
                >
                  Loading...
                </Loader>
              )}
              {(account && filteredOffers.length > 0) && (
                <Grid.Row>
                  <Grid.Column width={16}>
                    <div className='market-pallet'>
                      <div className='market-pallet__item'>
                        {filteredOffers.map((token) => (
                          <NftTokenCard
                            account={account}
                            collectionId={token.collectionId.toString()}
                            key={token.tokenId}
                            localRegistry={localRegistry}
                            openDetailedInformationModal={openDetailedInformationModal}
                            token={token}
                          />
                        ))}
                      </div>
                    </div>
                  </Grid.Column>
                </Grid.Row>
              )}
            </Grid>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default memo(BuyTokens);
