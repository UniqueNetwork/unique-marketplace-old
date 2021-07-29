// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

// external imports
import React, { memo, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useHistory } from 'react-router';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';
import Dropdown, { DropdownProps } from 'semantic-ui-react/dist/commonjs/modules/Dropdown';

import ArrowDown from '@polkadot/app-nft-market/components/arrowDown';
import ArrowUp from '@polkadot/app-nft-market/components/arrowUp';
import clearIcon from '@polkadot/app-nft-wallet/components/CollectionSearch/clearIcon.svg';
import searchIcon from '@polkadot/app-nft-wallet/components/CollectionSearch/searchIcon.svg';
import envConfig from '@polkadot/apps-config/envConfig';
import { Input } from '@polkadot/react-components';
import { useCollections } from '@polkadot/react-hooks';

// local imports and components
import NftTokenCard from '../../components/NftTokenCard';
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
  seller?: string */
  traitsCount: string[];
  [key: string]: string | string[] | number;
}

const perPage = 20;

const BuyTokens = ({ account, setShouldUpdateTokens, shouldUpdateTokens }: BuyTokensProps): ReactElement => {
  const history = useHistory();

  const { getOffers, offers, offersCount, offersLoading, presetCollections } = useCollections();
  const [searchString, setSearchString] = useState<string>('');
  const [sortValue, setSortValue] = useState<string>();
  const [uniqueCollectionIds, setUniqueCollectionIds] = useState(envConfig.uniqueCollectionIds);

  const [collections, setCollections] = useState<NftCollectionInterface[]>([]);
  const [filters, setFilters] = useState<Filters>({ collectionIds: [...uniqueCollectionIds], traitsCount: [] });

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

  const clearSearch = useCallback(() => {
    setSearchString('');
  }, []);

  const optionNode = useCallback((active: boolean, order: string, text: string) => {
    return (
      <div className={active ? 'current active' : 'current'}>
        {text}
        {order === 'asc' && (
          <ArrowUp active={active} />
        )}
        {order === 'desc' && (
          <ArrowDown active={active} />
        )}
      </div>
    );
  }, []);

  const sortOptions = useMemo(() => ([
    { content: (optionNode(false, 'asc', 'Price')), key: 'PriceUp', text: 'Price', value: 'price-asc' },
    { content: (optionNode(false, 'desc', 'Price')), key: 'PriceDown', text: 'Price', value: 'price-desc' },
    { content: (optionNode(false, 'asc', 'Token ID')), key: 'TokenIDUp', text: 'Token ID', value: 'tokenId-asc' },
    { content: (optionNode(false, 'desc', 'Token ID')), key: 'TokenIDDown', text: 'Token ID', value: 'tokenId-desc' },
    { content: (optionNode(false, 'asc', 'Listing date')), key: 'ListingDateUp', text: 'Listing date', value: 'creationDate-asc' },
    { content: (optionNode(false, 'desc', 'Listing date')), key: 'ListingDateDown', text: 'Listing date', value: 'creationDate-desc' }
  ]), [optionNode]);

  const setSort = useCallback((event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const { value } = data;

    setSortValue(value?.toString());

    if (value) {
      setFilters({ ...filters, sort: `${value.toString().split('-')[1]}(${value.toString().split('-')[0]})` });
    }
  }, [filters]);

  const currentValue = useMemo(() => {
    if (sortValue) {
      const currentOption = sortOptions.find((opt: { value: string }) => opt.value === sortValue);

      if (currentOption) {
        return optionNode(false, sortValue.split('-')[1], currentOption.text);
      }
    }

    return optionNode(false, 'none', 'Sort by');
  }, [optionNode, sortOptions, sortValue]);

  const clearAllFilters = useCallback(() => {
    setFilters({ collectionIds: envConfig.uniqueCollectionIds, traitsCount: [] });
  }, []);

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

  const showSearch = false;

  return (
    <div className='nft-market'>
      <Header as='h1'>Market</Header>
      <div className='nft-market--panel'>
        <MarketFilters
          account={account}
          collections={collections}
          filters={filters}
          setFilters={setFilters}
          setUniqueCollectionIds={setUniqueCollectionIds}
        />
        <div className='marketplace-body'>
          <div className='collection-search-form'>
            <Form>
              <Form.Field className='search-results'>
                { offersCount && (
                  <>
                    <span>
                      {offersCount} items
                    </span>
                    <a onClick={clearAllFilters}>Clear all filters</a>
                  </>
                )}
              </Form.Field>
              { showSearch && (
                <Form.Field className='search-field'>
                  <Input
                    className='isSmall'
                    icon={
                      <img
                        alt='search'
                        className='search-icon'
                        src={searchIcon as string}
                      />
                    }
                    isDisabled={!Object.values(offers).length}
                    onChange={setSearchString}
                    placeholder='Find token by collection, name or attribute'
                    value={searchString}
                    withLabel
                  >
                    { offersLoading && (
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
              <Form.Field className='sort-field'>
                <Dropdown
                  onChange={setSort}
                  options={sortOptions}
                  trigger={currentValue}
                />
              </Form.Field>
            </Form>
          </div>
          {Object.keys(offers).length > 0 && (
            <div className='market-pallet'>
              <InfiniteScroll
                hasMore={hasMore}
                initialLoad={false}
                loadMore={fetchScrolledData}
                loader={searchString && searchString.length
                  ? <></>
                  : <Loader
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
                      key={`${token.collectionId}-${token.tokenId}`}
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
