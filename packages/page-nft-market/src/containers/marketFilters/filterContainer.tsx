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
import {SESSION_STORAGE_KEYS} from "@polkadot/app-nft-market/containers/marketFilters/constants";

const { commission, uniqueCollectionIds } = envConfig;

interface PropTypes {
  account: string|undefined;
  allowClearCollections: boolean;
  allowClearPricesAndSeller: boolean;
  collections: NftCollectionInterface[];
  filters: Filters;
  setAllowClearCollections: (allow: boolean) => void;
  setAllowClearPricesAndSeller: (allow: boolean) => void;
  setFilters: (filters: Filters) => void;
  setUniqueCollectionIds: (collectionIds: string[]) => void;
}

interface PricesTypes{
  minPrice: string;
  maxPrice: string;
}

const getFromStorage = (storageKey:string)=>{
  return JSON.parse(sessionStorage.getItem(storageKey) as string);
}

const setInStorage = (storageKey:string, data: object|boolean)=>{
  return sessionStorage.setItem(storageKey, JSON.stringify(data));
}

const FilterContainer: React.FC<PropTypes> = ({ account, allowClearCollections, allowClearPricesAndSeller,collections, filters, setAllowClearCollections, setAllowClearPricesAndSeller, setFilters, setUniqueCollectionIds }) => {
  const { collectionName16Decoder } = useDecoder();
  const { getTokenImageUrl } = useMetadata();
  const [images, setImages] = useState<string[]>([]);
  const [inputChecked, setInputChecked] = useState<string[]>([]);
  const [isOnlyMyToken, setIsOnlyMyToken] = useState(false);
  const [KSMPrices, setKSMPrices] = useState<PricesTypes>({ maxPrice: '', minPrice: '' });
  const [isShowCollection, setIsShowCollection] = useState<boolean>(true);
  const [isShowPrice, setIsShowPrice] = useState<boolean>(true);
  // Data from local storage
  const storagePrices = getFromStorage(SESSION_STORAGE_KEYS.PRICES);
  const storageFilters = getFromStorage(SESSION_STORAGE_KEYS.FILTERS);
  const areAllCollectionsChecked = getFromStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED);


  const changePrices = (minPrice: string | undefined, maxPrice: string | undefined) => {
    const filtersCopy = { ...filters };

    if (minPrice === '') {
      delete filtersCopy.minPrice;
    } else {
      const currentMinPrice = new BN(Number(minPrice) * 10000000000)
      filtersCopy.minPrice = String(currentMinPrice.mul(new BN(10)).div(new BN(1000 + commission * 10))) + '0000';
    }

    if (maxPrice === '') {
      delete filtersCopy.maxPrice;
    } else {
      const currentMaxPrice = new BN(Number(maxPrice) * 10000000000)
      filtersCopy.maxPrice = String(currentMaxPrice.mul(new BN(10)).div(new BN(1000 + commission * 10))) + '0000';
    }
    setInStorage(SESSION_STORAGE_KEYS.PRICES, KSMPrices);
    setFilters({ ...filtersCopy });
  };

  const filterBySeller = useCallback((onlyMyTokens: boolean) => {
    if (onlyMyTokens && account) {
      setFilters({ ...filters, seller: account });
    } else {
      const filtersCopy = { ...filters };

      delete filtersCopy.seller;
      setFilters({ ...filtersCopy });
    }
  }, [account, filters, setFilters]);

  const clearPrices = () => {
    const pricesDefaultValue = { maxPrice: '', minPrice: '' };
    setKSMPrices(pricesDefaultValue);
    changePrices('', '');
    setInStorage(SESSION_STORAGE_KEYS.PRICES, pricesDefaultValue)
  };

  const setKSMPrice: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    let val = e.target.value;

    val = val.slice(0, 8);
    if (+val > 100000 || +val < 0) return;
    if (val.length === 2 && val[0] === '0' && val[1] !== '.') val = '0';

    setKSMPrices({ ...KSMPrices, [e.target.name]: val });
  };

  const handleOnlyMyToken = () => {
    setIsOnlyMyToken(!isOnlyMyToken);
    filterBySeller(!isOnlyMyToken);
  };

  const changeUniqueCollectionIds = useCallback((newIds: string[]) => {
    setUniqueCollectionIds(newIds);
    setFilters({ ...filters, collectionIds: newIds });
  }, [filters, setUniqueCollectionIds, setFilters]);
  const filterCurrent = useCallback((id: string) => {
    if (inputChecked.includes(id)) {
      const filteredData = inputChecked.filter((item) => item !== id);

      setInputChecked(filteredData);
      changeUniqueCollectionIds(filteredData);
    } else {
      setInputChecked([...inputChecked, id]);
      changeUniqueCollectionIds([...inputChecked, id]);
    }

  }, [changeUniqueCollectionIds, inputChecked]);

  const clearCheckedValues = () => {
    setInputChecked([]);
    changeUniqueCollectionIds(uniqueCollectionIds);
  };

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

  const resetFromFilter = useCallback(() => {
    if (!filters.maxPrice && !filters.minPrice) {
      setKSMPrices({ maxPrice: '', minPrice: '' });
    }

    if (!filters.seller) {
      setIsOnlyMyToken(false);
    }

    const filteredCollections = filters.collectionIds as string[];

    if (filteredCollections.length === uniqueCollectionIds.length) {
      setInputChecked((prevState) => {
        if (prevState.length === uniqueCollectionIds.length) {
          return prevState;
        } else {
          return [];
        }
      });
    }
  }, [filters]);

  useEffect(() => {
    void updateImageUrl();
  }, [updateImageUrl]);

  useEffect(() => {
    if (storagePrices && !storagePrices.minPrice && !storagePrices.maxPrice ) {
      resetFromFilter();
    }
  }, [resetFromFilter]);

  useEffect(() => {
    storagePrices && setKSMPrices(storagePrices);
    if(storageFilters){
      setFilters(storageFilters)
      setIsOnlyMyToken(!!storageFilters.seller)
      areAllCollectionsChecked && setInputChecked([...storageFilters.collectionIds])
    } ;
  }, []);
  useEffect(() => {

    setInStorage(SESSION_STORAGE_KEYS.FILTERS, filters)
    if(inputChecked.length>0){
      setInStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED, true)
    }else setInStorage(SESSION_STORAGE_KEYS.ARE_ALL_COLLECTIONS_CHECKED, false)
  }, [filters]);

  useEffect(() => {
    if (allowClearPricesAndSeller) {
      setKSMPrices({ maxPrice: '', minPrice: '' })
      setIsOnlyMyToken(false);
      setAllowClearPricesAndSeller(false);
    }
  }, [allowClearPricesAndSeller, setAllowClearPricesAndSeller]);

  useEffect(() => {
    if (allowClearCollections) {
      setInputChecked([]);
      setAllowClearCollections(false);
    }
  }, [allowClearCollections, setAllowClearCollections]);

  return (
    <>
      <div className='switch-my-tokens'>
        <label className='switch'>
          <input
            checked={isOnlyMyToken}
            disabled={!account}
            onChange={handleOnlyMyToken}
            type='checkbox'
          />
          <span className={` slider round ${account ? '' : 'disable-token'}`} />
        </label>
        <div className='title'>Only my tokens</div>
      </div>

      <div className='filter'>
        <div className='filter--title'>
          <div>Collections</div>
          <div className='clear'>
            <div
              className={`clear-title ${inputChecked.length ? 'clear-title-active' : ''}`}
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
                    className={`collections-main ${inputChecked.includes(String(collection.id)) ? 'collections-main-background' : ''}`}
                    key={collection.id}
                    onClick={filterCurrent.bind(null, collection.id)}
                  >
                    <div className='custom-checkbox'>
                      <div className='checkbox-input'>
                        <input
                          checked={inputChecked.includes(String(collection.id))}
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
              className={`clear-title ${(KSMPrices.minPrice || KSMPrices.maxPrice) ? 'clear-title-active' : ''}`}
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
