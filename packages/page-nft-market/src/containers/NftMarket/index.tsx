// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

// external imports
import React, { memo, ReactElement, useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useHistory } from 'react-router';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import envConfig from '@polkadot/apps-config/envConfig';
import { useCollections } from '@polkadot/react-hooks';

// local imports and components
import NftTokenCard from '../../components/NftTokenCard';
import SearchForm from '../../components/SearchForm';
import MarketFilters from '../marketFilters';

interface BuyTokensProps {
  account?: string | undefined;
  setShouldUpdateTokens: (value?: string) => void;
  shouldUpdateTokens?: string;
}

export interface Filters {
  /* collectionIds?: string[];
  minPrice?: string;
  maxPrice?: string;
  traitsCount: string[];
  seller?: string;
  sort: string; */
  sort: string;
  traitsCount: string[];
  [key: string]: string | string[] | number;
}

const perPage = 20;

const BuyTokens = ({ account, setShouldUpdateTokens, shouldUpdateTokens }: BuyTokensProps): ReactElement => {
  const history = useHistory();

  const { getOffers, offers, offersCount, offersLoading, presetCollections } = useCollections();
  const [uniqueCollectionIds, setUniqueCollectionIds] = useState(envConfig.uniqueCollectionIds);
  const [allowClearCollections, setAllowClearCollections] = useState<boolean>(false);

  const [collections, setCollections] = useState<NftCollectionInterface[]>([]);
  const [filters, setFilters] = useState<Filters>({ collectionIds: uniqueCollectionIds, sort: 'desc(creationDate)', traitsCount: [] });

  const hasMore = !!(offers && offersCount) && Object.keys(offers).length < offersCount;
  const openDetailedInformationModal = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/market/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const addMintCollectionToList = useCallback(async () => {
    const firstCollections: NftCollectionInterface[] = await presetCollections();

    setCollections(() => [...firstCollections]);
  }, [presetCollections]);

  const fetchScrolledData = useCallback((page) => {
    getOffers(page, perPage, filters);
  }, [filters, getOffers]);

  useEffect(() => {
    if (shouldUpdateTokens) {
      setShouldUpdateTokens(undefined);
    }

    void getOffers(1, perPage, filters);
  }, [getOffers, shouldUpdateTokens, setShouldUpdateTokens, filters]);

  useEffect(() => {
    void addMintCollectionToList();
  }, [addMintCollectionToList]);

  useEffect(() => {
    setShouldUpdateTokens('all');
  }, [setShouldUpdateTokens]);

  return (
    <div className='nft-market'>
      <Header as='h1'>Market</Header>
      <div className='nft-market--panel'>
        <MarketFilters
          account={account}
          allowClearCollections={allowClearCollections}
          collections={collections}
          filters={filters}
          setAllowClearCollections={setAllowClearCollections}
          setFilters={setFilters}
          setUniqueCollectionIds={setUniqueCollectionIds}
        />
        <div className='marketplace-body'>
          <div className='collection-search-form'>
            <SearchForm
              filters={filters}
              offersCount={offersCount}
              offersLoading={offersLoading}
              setAllowClearCollections={setAllowClearCollections}
              setFilters={setFilters}
            />
          </div>
          {Object.keys(offers).length > 0 && (
            <div className='market-pallet'>
              <InfiniteScroll
                hasMore={hasMore}
                initialLoad={false}
                loadMore={fetchScrolledData}
                loader={<Loader
                  active
                  className='load-more'
                  inline='centered'
                  key={'nft-market'}
                />}
                pageStart={1}
                threshold={200}
              >
                <div className='market-pallet__item'>
                  {Object.values(offers).map((token) => (
                    <NftTokenCard
                      account={account}
                      collectionId={token.collectionId.toString()}
                      key={`${token.collectionId}-${token.tokenId}-${Math.random() * 100}`}
                      openDetailedInformationModal={openDetailedInformationModal}
                      token={token}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(BuyTokens);
