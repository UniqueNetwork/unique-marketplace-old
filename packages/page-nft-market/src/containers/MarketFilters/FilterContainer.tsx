// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useEffect, useState } from 'react';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { Filters } from '@polkadot/app-nft-market/containers/NftMarket';
import envConfig from '@polkadot/apps-config/envConfig';
import { Switcher } from '@polkadot/react-components';
import { fromStringToBnString } from '@polkadot/react-hooks/utils';

import { SESSION_STORAGE_KEYS } from './constants';
import FilterContainerItem from './FilterContainerItem';

interface PropTypes {
  account: string|undefined;
  allowClearFilters: boolean;
  collections: NftCollectionInterface[];
  filters: Filters;
  loadingCollections: boolean;
  setAllowClearFilters: (allow: boolean) => void;
  setFilters: (filters: Filters) => void;
  setAreFiltersActive: (condition: boolean) => void;
}

interface PricesTypes{
  minPrice: string;
  maxPrice: string;
}

const getFromStorage = (storageKey: string) => {
  return JSON.parse(sessionStorage.getItem(storageKey) as string) as Filters | boolean | PricesTypes;
};

const setInStorage = (storageKey: string, data: Filters | boolean | PricesTypes) => {
  return sessionStorage.setItem(storageKey, JSON.stringify(data));
};

const defaultPrices: PricesTypes = { maxPrice: '', minPrice: '' };
const maxFilterValue = 100000;

const FilterContainer: React.FC<PropTypes> = ({ account, allowClearFilters, collections, filters, loadingCollections, setAllowClearFilters, setAreFiltersActive, setFilters }) => {
  const [KSMPrices, setKSMPrices] = useState<PricesTypes>(defaultPrices);
  const [isShowCollection, setIsShowCollection] = useState<boolean>(true);
  const [isShowPrice, setIsShowPrice] = useState<boolean>(true);
  const [collectionsChecked, setCollectionsChecked] = useState<string[]>([]);
  const areAllCollectionsChecked = getFromStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED) as boolean;
  const { kusamaDecimals, uniqueCollectionIds } = envConfig;

  const changePrices = useCallback((minPrice: string | undefined, maxPrice: string | undefined) => {
    const filtersCopy = { ...filters };

    if (!minPrice?.length) {
      delete filtersCopy.minPrice;
    } else {
      filtersCopy.minPrice = fromStringToBnString(minPrice, kusamaDecimals);
    }

    if (!maxPrice?.length) {
      delete filtersCopy.maxPrice;
    } else {
      filtersCopy.maxPrice = fromStringToBnString(maxPrice, kusamaDecimals);
    }

    setFilters(filtersCopy);

    setInStorage(SESSION_STORAGE_KEYS.FILTERS, filtersCopy);
  }, [filters, kusamaDecimals, setFilters]);

  const clearPrices = useCallback(() => {
    const pricesDefaultValue = { maxPrice: '', minPrice: '' };

    setKSMPrices(pricesDefaultValue);
    changePrices('', '');
    setInStorage(SESSION_STORAGE_KEYS.PRICES, pricesDefaultValue);
  }, [changePrices]);

  const setKSMPrice: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    let val = e.target.value;

    val = val.slice(0, 8);

    if (+val > maxFilterValue || +val < 0) {
      return;
    }

    if (val.length === 2 && val[0] === '0' && val[1] !== '.') {
      val = '0';
    }

    const newKsmPrices = { ...KSMPrices, [e.target.name]: val };

    setKSMPrices(newKsmPrices);
    setInStorage(SESSION_STORAGE_KEYS.PRICES, newKsmPrices);
  }, [KSMPrices]);

  const handleOnlyMyToken = useCallback(() => {
    let filtersCopy: Filters = { ...filters };

    if (!filters.seller && account) {
      filtersCopy = { ...filters, seller: account };
      setFilters(filtersCopy);
    } else {
      delete filtersCopy.seller;
      setFilters(filtersCopy);
    }

    setInStorage(SESSION_STORAGE_KEYS.FILTERS, filtersCopy);
  }, [account, filters, setFilters]);

  const updateSeller = useCallback(() => {
    if (filters.seller && account) {
      const filtersCopy = { ...filters, seller: account };

      if (JSON.stringify(filters) !== JSON.stringify(filtersCopy)) {
        setFilters(filtersCopy);
        setInStorage(SESSION_STORAGE_KEYS.FILTERS, filtersCopy);
      }
    }
  }, [account, filters, setFilters]);

  const filterCurrent = useCallback((id: string) => {
    let newIds: string[] = [];

    if (collectionsChecked.includes(id)) {
      newIds = collectionsChecked.filter((item) => item !== id);
    } else {
      newIds = [...collectionsChecked, id];
    }

    const newFilters = { ...filters, collectionIds: newIds };

    setCollectionsChecked(newIds);
    setFilters(newFilters);
    setInStorage(SESSION_STORAGE_KEYS.FILTERS, newFilters);

    if (newIds.length === uniqueCollectionIds?.length) {
      setInStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED, true);
    } else {
      setInStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED, false);
    }
  }, [collectionsChecked, filters, setFilters, uniqueCollectionIds?.length]);

  const clearCheckedValues = useCallback(() => {
    const newFilters = { ...filters, collectionIds: [] };

    setFilters(newFilters);
    setInStorage(SESSION_STORAGE_KEYS.FILTERS, newFilters);
    setInStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED, false);
  }, [filters, setFilters]);

  const onSetCurrentFilter = useCallback(() => {
    setIsShowCollection(!isShowCollection);
  }, [isShowCollection, setIsShowCollection]);

  const onApplyPrices = useCallback(() => {
    changePrices(KSMPrices.minPrice, KSMPrices.maxPrice);
  }, [changePrices, KSMPrices]);

  const onKeyDown = useCallback((evt: React.KeyboardEvent) => {
    ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault();
  }, []);

  const onSetShowPrices = useCallback(() => {
    setIsShowPrice(!isShowPrice);
  }, [isShowPrice, setIsShowPrice]);

  const onCheckBoxMockFunc = useCallback(() => null, []);

  useEffect(() => {
    if (filters.collectionIds.length !== uniqueCollectionIds?.length || areAllCollectionsChecked) {
      setCollectionsChecked(filters.collectionIds);
    }
  }, [areAllCollectionsChecked, filters, uniqueCollectionIds]);

  useEffect(() => {
    updateSeller();
  }, [account, updateSeller]);

  useEffect(() => {
    const storagePrices = getFromStorage(SESSION_STORAGE_KEYS.PRICES) as PricesTypes;

    storagePrices && setKSMPrices(storagePrices);
  }, []);

  useEffect(() => {
    // if we clear all filters
    if (allowClearFilters) {
      setKSMPrices(defaultPrices);
      setCollectionsChecked([]);
      setInStorage(SESSION_STORAGE_KEYS.PRICES, defaultPrices);
      setInStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED, false);
      setAllowClearFilters(false);
    }
  }, [allowClearFilters, setAllowClearFilters]);

  useEffect(() => {
    // listen changes of filters and show or hide <Clear all filters> button.
    setAreFiltersActive(!!filters.seller || !!filters.minPrice || !!filters.maxPrice || !!collectionsChecked.length || !!filters.traitsCount.length);
  }, [collectionsChecked.length, filters.maxPrice, filters.minPrice, filters.seller, filters.traitsCount.length, setAreFiltersActive]);

  return (
    <>
      <Switcher
        checked={!!filters.seller}
        childClassName={`${account ? '' : 'disable-token'}`}
        disabled={!account}
        onChange={handleOnlyMyToken}
        text='Only my tokens'
      />
      <div className='filter'>
        <div className='filter--title'>
          <div>Collections</div>
          <div className='clear'>
            <div
              className={`clear-title ${collectionsChecked.length ? 'clear-title-active' : ''}`}
              onClick={clearCheckedValues}
            >
              Clear
            </div>
            <div
              className={`filter-arrow-icon ${isShowCollection ? 'rotate-icon' : ''}`}
              onClick={onSetCurrentFilter}
            />
          </div>
        </div>
        { isShowCollection && (
          <div className='filter--body'>
            <div className='collection-list'>
              { loadingCollections && (
                <Loader
                  active
                  className='load-more'
                  inline='centered'
                />
              )}
              {collections.map((collection) => {
                return (
                  <FilterContainerItem
                    collection={collection}
                    collectionsChecked={collectionsChecked}
                    filterCurrent={filterCurrent}
                    key={collection.id}
                    onCheckBoxMockFunc={onCheckBoxMockFunc}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className='filter'>
        <div className='filter--title'>
          <div>Price</div>
          <div className='clear'>
            <div
              className={`clear-title ${(KSMPrices.minPrice || KSMPrices.maxPrice || filters.minPrice || filters.maxPrice) ? 'clear-title-active' : ''}`}
              onClick={clearPrices}
            >
              Clear
            </div>
            <div
              className={`filter-arrow-icon ${isShowPrice ? 'rotate-icon' : ''}`}
              onClick={onSetShowPrices}
            />
          </div>
        </div>
        { isShowPrice && (
          <div className='filter--body'>
            <div className='price-main'>
              <input
                className='min-input'
                name='minPrice'
                onChange= {setKSMPrice}
                onKeyDown={onKeyDown}
                placeholder='Min'
                type='number'
                value={KSMPrices.minPrice}
              />
              <p>to</p>
              <input
                name='maxPrice'
                onChange={setKSMPrice}
                onKeyDown={onKeyDown}
                placeholder='Max'
                type='number'
                value={KSMPrices.maxPrice}
              />

            </div>
            <button
              className={`price-btn ${(KSMPrices.minPrice || KSMPrices.maxPrice) ? 'price-btn-active' : ''}`}
              disabled={!KSMPrices.minPrice && !KSMPrices.maxPrice}
              onClick={onApplyPrices}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default FilterContainer;
