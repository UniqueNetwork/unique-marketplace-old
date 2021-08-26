// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import equal from 'deep-equal';
// external imports
import React, { memo, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useHistory } from 'react-router';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import envConfig from '@polkadot/apps-config/envConfig';
import { OpenPanelType } from '@polkadot/apps-routing/types';
import { useCollections } from '@polkadot/react-hooks';

// local imports and components
import NftTokenCard from '../../components/NftTokenCard';
import SearchForm from '../../components/SearchForm';
import MarketFilters from '../MarketFilters';
import { SESSION_STORAGE_KEYS } from '../MarketFilters/constants';
import noMyTokensIcon from '../MarketFilters/noMyTokens.svg';
import MarketSort from '../MarketSort';

interface BuyTokensProps {
  account?: string | undefined;
  openPanel?: OpenPanelType;
  setOpenPanel?: (openPanel: OpenPanelType) => void;
}

export interface Filters {
  collectionIds: string[];
  /* minPrice?: string;
  maxPrice?: string;
  traitsCount: string[];
  seller?: string;
  sort: string; */
  sort: string;
  traitsCount: string[];
  [key: string]: string | string[] | number;
}

const perPage = 20;
const defaultFilters = {
  collectionIds: [...envConfig.uniqueCollectionIds],
  sort: 'desc(creationDate)',
  traitsCount: []
};

const NftMarket = ({ account, openPanel, setOpenPanel }: BuyTokensProps): ReactElement => {
  const history = useHistory();
  const storageFilters = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEYS.FILTERS) as string) as Filters;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const initialFilters = storageFilters && !equal(storageFilters, defaultFilters) ? storageFilters : defaultFilters;
  const { getOffers, offers, offersCount, offersLoading, presetCollections } = useCollections();
  const [allowClearFilters, setAllowClearFilters] = useState<boolean>(false);
  const [areFiltersActive, setAreFiltersActive] = useState<boolean>(false);
  const [collections, setCollections] = useState<NftCollectionInterface[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);

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

  const clearAllFilters = useCallback(() => {
    setAllowClearFilters(true);
    setFilters(defaultFilters);
    setAreFiltersActive(false);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.FILTERS);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.PRICES);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED);

    setOpenPanel && setOpenPanel('tokens');
  }, [setFilters, setOpenPanel]);

  const marketClassName = useMemo((): string => {
    let className = 'nft-market';

    if (openPanel) {
      className = `${className} ${openPanel}`;
    }

    if (!account) {
      className = `${className} no-accounts`;
    }

    return className;
  }, [account, openPanel]);

  useEffect(() => {
    void addMintCollectionToList();
  }, [addMintCollectionToList]);

  useEffect(() => {
    void getOffers(1, perPage, filters);
  }, [filters, getOffers]);

  console.log('offersLoading', offersLoading);

  return (
    <div className={marketClassName}>
      <Header as='h1'>Market</Header>
      <div
        className={`nft-market--panel ${openPanel === 'sort' ? 'long' : ''}`}
      >
        { openPanel === 'tokens' && (
          <Header
            as='h1'
            className='mobile-header'
          >
            Market
          </Header>
        )}
        { (openPanel === 'filters' || openPanel === 'sort') && (
          <Button.Group>
            <Button
              onClick={setOpenPanel && setOpenPanel.bind(null, 'filters')}
              primary={openPanel === 'filters'}
            >
              Filter
            </Button>
            <Button
              onClick={setOpenPanel && setOpenPanel.bind(null, 'sort')}
              primary={openPanel === 'sort'}
            >
              Sort
            </Button>
          </Button.Group>
        )}
        <MarketFilters
          account={account}
          allowClearFilters={allowClearFilters}
          collections={collections}
          filters={filters}
          openFilters={openPanel === 'filters'}
          setAllowClearFilters={setAllowClearFilters}
          setAreFiltersActive={setAreFiltersActive}
          setFilters={setFilters}
        />
        <MarketSort
          filters={filters}
          openSort={openPanel === 'sort'}
          setFilters={setFilters}
        />
        <div className={`marketplace-body ${openPanel === 'tokens' ? 'open' : ''}`}>
          <div className='collection-search-form'>
            <SearchForm
              areFiltersActive = {areFiltersActive}
              clearAllFilters={clearAllFilters}
              filters={filters}
              offersCount={offersCount}
              offersLoading={offersLoading}
              setFilters={setFilters}
            />
          </div>
          {(Object.keys(offers).length === 0 && filters.seller) && (
            <div className='market-pallet empty'>
              <img
                alt='no tokens'
                src={noMyTokensIcon as string}
              />
              <p className='no-tokens-text'>You have no tokens</p>
            </div>
          )}
          { (Object.keys(offers).length > 0 || !offersLoading)
            ? (
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
                  useWindow={true}
                >
                  <div className='market-pallet__item'>
                    {Object.values(offers).map((token) => (
                      <NftTokenCard
                        account={account}
                        collectionId={token.collectionId.toString()}
                        key={`${token.collectionId}-${token.tokenId}`}
                        openDetailedInformationModal={openDetailedInformationModal}
                        token={token}
                      />
                    ))}
                  </div>
                </InfiniteScroll>
              </div>
            )
            : <div className='market-pallet empty'>
              <Loader
                active
                className='load-more'
                inline='centered'
                key={'nft-market'}
              />
            </div>}
        </div>
      </div>
      <div className={`nft-market--footer ${openPanel === 'sort' ? 'hide' : ''}`}>
        { openPanel === 'tokens' && (
          <>
            <Button
              className='footer-button'
              fluid
              onClick={setOpenPanel && setOpenPanel.bind(null, 'filters')}
              primary
            >
              Filters and sort
            </Button>
          </>
        )}
        { openPanel === 'filters' && (
          <Button
            className='footer-button clear'
            fluid
            onClick={clearAllFilters}
          >
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default memo(NftMarket);
