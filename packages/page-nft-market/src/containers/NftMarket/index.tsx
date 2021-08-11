// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

// external imports
import React, { memo, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useHistory } from 'react-router';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { SESSION_STORAGE_KEYS } from '@polkadot/app-nft-market/containers/marketFilters/constants';
import envConfig from '@polkadot/apps-config/envConfig';
import { OpenPanelType } from '@polkadot/apps-routing/types';
import { useCollections } from '@polkadot/react-hooks';

// local imports and components
import NftTokenCard from '../../components/NftTokenCard';
import SearchForm from '../../components/SearchForm';
import MarketFilters from '../marketFilters';

interface BuyTokensProps {
  account?: string | undefined;
  openPanel?: OpenPanelType;
  setOpenPanel?: (openPanel: OpenPanelType) => void;
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
const defaultFilters = {
  collectionIds: [...envConfig.uniqueCollectionIds],
  sort: 'desc(creationDate)',
  traitsCount: []
};

const NftMarket = ({ account, openPanel, setOpenPanel, setShouldUpdateTokens, shouldUpdateTokens }: BuyTokensProps): ReactElement => {
  const history = useHistory();

  const { getOffers, offers, offersCount, offersLoading, presetCollections } = useCollections();
  const [uniqueCollectionIds, setUniqueCollectionIds] = useState(envConfig.uniqueCollectionIds);
  const [allowClearCollections, setAllowClearCollections] = useState<boolean>(false);
  const [allowClearPricesAndSeller, setAllowClearPricesAndSeller] = useState<boolean>(false);

  const [collections, setCollections] = useState<NftCollectionInterface[]>([]);
  const [filters, setFilters] = useState<Filters>({ collectionIds: uniqueCollectionIds, sort: 'desc(creationDate)', traitsCount: [] });

  const nftMarketPanel = useRef<HTMLDivElement>(null);

  const hasMore = !!(offers && offersCount) && Object.keys(offers).length < offersCount;
  const openDetailedInformationModal = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/market/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const addMintCollectionToList = useCallback(async () => {
    const firstCollections: NftCollectionInterface[] = await presetCollections();

    setCollections(() => [...firstCollections]);
  }, [presetCollections]);

  // set scroll parent to initialize scroll container in mobile or desktop
  const getScrollParent = useCallback(() => {
    if (nftMarketPanel.current && nftMarketPanel.current.offsetWidth <= 1024) {
      return nftMarketPanel.current;
    }

    return null;
  }, [nftMarketPanel]);

  const fetchScrolledData = useCallback((page) => {
    getOffers(page, perPage, filters);
  }, [filters, getOffers]);

  const clearAllFilters = useCallback(() => {
    setAllowClearCollections(true);
    setAllowClearPricesAndSeller(true);
    setFilters(defaultFilters);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.FILTERS);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.PRICES);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED);

    setOpenPanel && setOpenPanel('tokens');
  }, [setAllowClearCollections, setFilters, setOpenPanel]);

  useEffect(() => {
    if (shouldUpdateTokens) {
      setShouldUpdateTokens(undefined);
      void getOffers(1, perPage, filters);
    }
  }, [getOffers, shouldUpdateTokens, setShouldUpdateTokens, filters]);

  useEffect(() => {
    void addMintCollectionToList();
  }, [addMintCollectionToList]);

  useEffect(() => {
    setShouldUpdateTokens('all');
  }, [setShouldUpdateTokens]);

  console.log('openPanel', openPanel);

  return (
    <div className='nft-market'>
      <Header as='h1'>Market</Header>
      <div
        className='nft-market--panel'
        ref={nftMarketPanel}
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
          allowClearCollections={allowClearCollections}
          allowClearPricesAndSeller={allowClearPricesAndSeller}
          collections={collections}
          filters={filters}
          openFilters={openPanel === 'filters'}
          setAllowClearCollections={setAllowClearCollections}
          setAllowClearPricesAndSeller={setAllowClearPricesAndSeller}
          setFilters={setFilters}
          setUniqueCollectionIds={setUniqueCollectionIds}
        />
        <div className={`marketplace-body ${openPanel === 'tokens' ? 'open' : ''}`}>
          <div className='collection-search-form'>
            <SearchForm
              clearAllFilters={clearAllFilters}
              filters={filters}
              offersCount={offersCount}
              offersLoading={offersLoading}
              setFilters={setFilters}
            />
          </div>
          {Object.keys(offers).length > 0 && (
            <div className='market-pallet'>
              <InfiniteScroll
                getScrollParent={getScrollParent}
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
                useWindow={!getScrollParent()}
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
      <div className={'nft-market--footer'}>
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
