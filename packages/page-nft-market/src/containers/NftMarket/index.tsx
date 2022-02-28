// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import equal from 'deep-equal';
import React, { memo, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useHistory } from 'react-router';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import envConfig from '@polkadot/apps-config/envConfig';
import { OpenPanelType } from '@polkadot/apps-routing/types';
import { useCollections, useIsMountedRef } from '@polkadot/react-hooks';
import { OfferType } from '@polkadot/react-hooks/useCollections';

import NftTokenCard from '../../components/NftTokenCard';
import SearchForm from '../../components/SearchForm';
import MarketFilters from '../MarketFilters';
import { SESSION_STORAGE_KEYS } from '../MarketFilters/constants';
import noMyTokensIcon from '../MarketFilters/noMyTokens.svg';
import MarketSort from '../MarketSort';

interface NftMarketProps {
  account?: string | undefined;
  openPanel?: OpenPanelType;
  setOpenPanel?: (openPanel: OpenPanelType) => void;
}

export interface Filters {
  collectionIds: string[];
  sort: string;
  traitsCount: string[];
  [key: string]: string | string[] | number;
}

const perPage = 20;

const defaultFilters = {
  collectionIds: envConfig.uniqueCollectionIds || [],
  sort: 'desc(creationDate)',
  traitsCount: []
};

const NftMarket = ({ account, openPanel, setOpenPanel }: NftMarketProps): ReactElement => {
  const history = useHistory();
  const storageFilters = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEYS.FILTERS) as string) as Filters;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const initialFilters = storageFilters && !equal(storageFilters, defaultFilters) ? storageFilters : defaultFilters;
  const { getOffers, offers, offersCount, offersLoading, presetCollections } = useCollections();
  const [loadedOffers, setLoadedOffers] = useState<OfferType[]>([]);
  const [allowClearFilters, setAllowClearFilters] = useState<boolean>(false);
  const [areFiltersActive, setAreFiltersActive] = useState<boolean>(false);
  const [collections, setCollections] = useState<NftCollectionInterface[]>([]);
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [loadingCollections, setLoadingCollections] = useState<boolean>(false);
  const mountedRef = useIsMountedRef();
  const filtersRef = useRef<Filters>();

  const maxPages = offersCount / perPage;
  const hasMore = offersCount > 0 && loadedOffers?.length < offersCount;

  const openDetailedInformationModal = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/market/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const addMintCollectionToList = useCallback(async () => {
    mountedRef.current && setLoadingCollections(true);

    const firstCollections: NftCollectionInterface[] = await presetCollections();

    if (!mountedRef.current) {
      return;
    }

    setCollections((prevCollections) => {
      if (JSON.stringify(firstCollections) !== JSON.stringify(prevCollections)) {
        return [...firstCollections];
      } else {
        return prevCollections;
      }
    });
    setLoadingCollections(false);
  }, [mountedRef, presetCollections]);

  const fetchScrolledData = useCallback(() => {
    if (!offersLoading && hasMore && page < maxPages) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, maxPages, offersLoading, page]);

  const clearAllFilters = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }

    sessionStorage.removeItem(SESSION_STORAGE_KEYS.FILTERS);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.PRICES);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED);

    setAllowClearFilters(true);
    setFilters(defaultFilters);
    setAreFiltersActive(false);

    setOpenPanel && setOpenPanel('tokens');
  }, [mountedRef, setFilters, setOpenPanel]);

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
    setLoadedOffers((prevOffers: OfferType[]) => {
      const newOffers = [...prevOffers];

      offers.forEach((offer) => {
        if (!prevOffers.find((prevOffer: OfferType) => prevOffer.collectionId === offer.collectionId && prevOffer.tokenId === offer.tokenId)) {
          newOffers.push(offer);
        }
      });

      return newOffers;
    });
  }, [offers]);

  useEffect(() => {
    if (filtersRef.current !== filters) {
      setPage(1);
      setLoadedOffers([]);
    }

    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    void getOffers(page, perPage, filters);
  }, [filters, getOffers, page]);

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
          loadingCollections={loadingCollections}
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
              areFiltersActive={areFiltersActive}
              clearAllFilters={clearAllFilters}
              filters={filters}
              offersCount={offersCount}
              offersLoading={offersLoading}
              setFilters={setFilters}
            />
          </div>
          { !offersCount && (
            <div className='market-pallet empty'>
              <img
                alt='no tokens'
                src={noMyTokensIcon as string}
              />
              <p className='no-tokens-text'>
                { filters.seller ? 'You have no tokens on sale' : 'No tokens on sale' }
              </p>
            </div>
          )}
          { offersCount > 0 && (
            <div className='market-pallet'>
              <InfiniteScroll
                hasMore={hasMore}
                initialLoad={false}
                loadMore={fetchScrolledData}
                pageStart={1}
                threshold={200}
                useWindow={true}
              >
                <div className='market-pallet__item'>
                  { loadedOffers.map((offer: OfferType) => (
                    <NftTokenCard
                      account={account}
                      collectionId={offer.collectionId.toString()}
                      key={`${offer.collectionId}-${offer.tokenId}`}
                      openDetailedInformationModal={openDetailedInformationModal}
                      token={offer}
                    />
                  ))}
                </div>
              </InfiniteScroll>
              { offersLoading && (
                <Loader
                  active
                  className='load-more'
                  inline='centered'
                  key={'nft-market'}
                />
              )}
            </div>
          )}
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
