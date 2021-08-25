/* eslint-disable header/header */
// [object Object]
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import BN from 'bn.js';
import React, { useCallback, useEffect, useState } from 'react';

import { Filters } from '@polkadot/app-nft-market/containers/NftMarket';
import envConfig from '@polkadot/apps-config/envConfig';
import { useDecoder, useMetadata } from '@polkadot/react-hooks';

import { SESSION_STORAGE_KEYS } from './constants';

const { commission, uniqueCollectionIds } = envConfig;

// type FiltersCallBackType = (prevFilters: Filters) => Filters;

interface PropTypes {
  account: string|undefined;
  allowClearFilters: boolean;
  collections: NftCollectionInterface[];
  filters: Filters;
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

const FilterContainer: React.FC<PropTypes> = ({ account, allowClearFilters, collections, filters, setAllowClearFilters, setFilters, setAreFiltersActive }) => {
  const { collectionName16Decoder } = useDecoder();
  const { getTokenImageUrl } = useMetadata();
  const [images, setImages] = useState<string[]>([]);
  const [KSMPrices, setKSMPrices] = useState<PricesTypes>(defaultPrices);
  const [isShowCollection, setIsShowCollection] = useState<boolean>(true);
  const [isShowPrice, setIsShowPrice] = useState<boolean>(true);
  const [collectionsChecked, setCollectionsChecked] = useState<string[]>([]);
  const areAllCollectionsChecked = getFromStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED) as boolean;

  const changePrices = useCallback((minPrice: string | undefined, maxPrice: string | undefined) => {
    const filtersCopy = { ...filters };

    if (minPrice === '') {
      delete filtersCopy.minPrice;
    } else {
      const currentMinPrice = new BN(Number(minPrice) * 10000000000);

      filtersCopy.minPrice = String(currentMinPrice.mul(new BN(10)).div(new BN(1000 + commission * 10))) + '0000';
    }

    if (maxPrice === '') {
      delete filtersCopy.maxPrice;
    } else {
      const currentMaxPrice = new BN(Number(maxPrice) * 10000000000);

      filtersCopy.maxPrice = String(currentMaxPrice.mul(new BN(10)).div(new BN(1000 + commission * 10))) + '0000';
    }

    setFilters(filtersCopy);

    setInStorage(SESSION_STORAGE_KEYS.FILTERS, filtersCopy);
  }, [filters, setFilters]);

  const clearPrices = useCallback(() => {
    const pricesDefaultValue = { maxPrice: '', minPrice: '' };

    setKSMPrices(pricesDefaultValue);
    changePrices('', '');
    setInStorage(SESSION_STORAGE_KEYS.PRICES, pricesDefaultValue);
  }, [changePrices]);

  const setKSMPrice: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    let val = e.target.value;

    val = val.slice(0, 8);

    if (+val > 100000 || +val < 0) {
      return;
    }

    if (val.length === 2 && val[0] === '0' && val[1] !== '.') {
      val = '0';
    }

    const newKsmPrices = { ...KSMPrices, [e.target.name]: val };

    setKSMPrices(newKsmPrices);
    setInStorage(SESSION_STORAGE_KEYS.PRICES, newKsmPrices);
  };

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

    if (newIds.length === uniqueCollectionIds.length) {
      setInStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED, true);
    } else {
      setInStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED, false);
    }
  }, [collectionsChecked, filters, setFilters]);

  const clearCheckedValues = useCallback(() => {
    const newFilters = { ...filters, collectionIds: [] };

    setFilters(newFilters);
    setInStorage(SESSION_STORAGE_KEYS.FILTERS, newFilters);
    setInStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED, false);
  }, [filters, setFilters]);

  const updateImageUrl = useCallback(() => {
    collections.forEach((element) => {
      void getTokenImageUrl(element, '1')
        .then((res) => {
          if (res) {
            setImages((prev) => [...prev, res]);
          } else setImages((prev) => ['', ...prev]);
        });
    });
  }, [collections, getTokenImageUrl]);

  useEffect(() => {
    if (filters.collectionIds.length !== uniqueCollectionIds.length || areAllCollectionsChecked) {
      setCollectionsChecked(filters.collectionIds);
    }
  }, [areAllCollectionsChecked, filters]);

  useEffect(() => {
    void updateImageUrl();
  }, [updateImageUrl]);

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
      <div className='switch-my-tokens'>
        <label className='switch'>
          <input
            checked={!!filters.seller}
            disabled={!account}
            onChange={handleOnlyMyToken}
            type='checkbox'
          />
          <span className={`slider round ${account ? '' : 'disable-token'}`} />
        </label>
        <div className='title'>Only my tokens</div>
      </div>

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
              onClick={setIsShowCollection.bind(null, !isShowCollection)}
            />
          </div>
        </div>
        { isShowCollection && (
          <div className='filter--body'>
            {/* <div className='collection-filter'>
          <input className='collection-search'
            placeholder='Search'
            type='text'>
          </input>
        </div> */}
            <div className='collection-list'>
              {collections.map((collection, index) => {
                return (
                  <div
                    className={`collections-main ${collectionsChecked.includes(String(collection.id)) ? 'collections-main-background' : ''}`}
                    key={collection.id}
                    onClick={filterCurrent.bind(null, collection.id)}
                  >
                    <div className='custom-checkbox'>
                      <div className='checkbox-input'>
                        <input
                          checked={collectionsChecked.includes(String(collection.id))}
                          data-current={collection.id}
                          onChange={() => null}
                          type='checkbox'
                        />
                      </div>
                      <div className='checkbox-title'>{collectionName16Decoder(collection.Name)}</div>
                    </div>
                    { images.length === collections.length && images[index] !== '' && (
                      <div className='collection-img'
                        style={ { backgroundImage: `url(${images.length === collections.length ? images[index] : ''})` }} />
                    )}
                  </div>
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
              onClick={setIsShowPrice.bind(null, !isShowPrice)}
            />
          </div>
        </div>
        { isShowPrice && (
          <div className='filter--body'>
            <div className='price-main' >
              <input className='min-input'
                name='minPrice'
                onChange= {setKSMPrice}
                onKeyDown={(evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()}
                onKeyPress={(e) => e.charCode === 13 ? changePrices(KSMPrices.minPrice, KSMPrices.maxPrice) : null}
                placeholder='Min'
                type='number'
                value={KSMPrices.minPrice}
              />
              <p>to</p>
              <input name='maxPrice'
                onChange= {setKSMPrice}
                onKeyDown={(evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()}
                onKeyPress={(e) => e.charCode === 13 ? changePrices(KSMPrices.minPrice, KSMPrices.maxPrice) : null}
                placeholder='Max'
                type='number'
                value={KSMPrices.maxPrice}
              />

            </div>
            <button
              className={`price-btn ${(KSMPrices.minPrice || KSMPrices.maxPrice) ? 'price-btn-active' : ''}`}
              disabled={!KSMPrices.minPrice && !KSMPrices.maxPrice}
              onClick={() => changePrices(KSMPrices.minPrice, KSMPrices.maxPrice)}
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
