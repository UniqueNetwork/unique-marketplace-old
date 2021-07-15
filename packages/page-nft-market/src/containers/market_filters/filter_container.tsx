/* eslint-disable header/header */
// [object Object]
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useEffect, useState } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';
import { useDecoder, useMetadata } from '@polkadot/react-hooks';

const { uniqueCollectionIds: envIds } = envConfig;

interface PropTypes {
  changeuniqueCollectionIds: (arr: string[]) => void;
  uniqueCollectionIds: string[];
  collections: NftCollectionInterface[]
  filteredOffers: any
  changeFilter: any
}

const FilterContainer: React.FC<PropTypes> = ({ changeuniqueCollectionIds, collections, uniqueCollectionIds }) => {
  const { collectionName16Decoder } = useDecoder();
  const currentCollection = useMetadata();
  const [images, setImages] = useState<string[]>([]);
  const [inputChecked, setInputChecked] = useState([]);
  const [isCheked, setIsCheked] = useState<boolean>(false);
  const [isShowCollection, setisShowCollection] = useState<boolean>(false);

  const [checkedIds, setCheckedids] = useState<string[]>([]);

  const filterCurrent = (id) => {
    if (inputChecked.includes(id)) {
      const filteredData = inputChecked.filter((item) => item !== id);

      setInputChecked(filteredData);
    } else {
      setInputChecked([...inputChecked, id]);
    }

    if (id && checkedIds.length === 0) {
      changeuniqueCollectionIds([id]);
      setCheckedids([id]);
    } else if (!checkedIds.length) {
      changeuniqueCollectionIds(envIds);
      setCheckedids(envIds);
    } else if (!!checkedIds.length && checkedIds.includes(id)) {
      const _ = checkedIds.filter((item) => item !== id);
      let arg = null;

      if (_.length > 0) {
        arg = _;
      } else {
        arg = envIds;
      }

      setCheckedids(arg);
      changeuniqueCollectionIds(arg);
    } else {
      changeuniqueCollectionIds([...checkedIds, id]);
      setCheckedids([...checkedIds, id]);
    }
  };

  const clearCheckedValues = () => {
    setInputChecked([]);
    changeuniqueCollectionIds(envIds);
    setCheckedids([]);
  };

  useEffect(() => {
    collections.forEach((element) => {
      currentCollection.getTokenImageUrl(element, '1')
        .then((res) => {
          if (res) {
            setImages((prev) => [res, ...prev]);
          } else setImages((prev) => ['', ...prev]);
        });
    });
  }, [collections]);

  return (
    <div className='filter-main'>

      <div className='switch-my-tokens'>
        <label className='switch'>
          <input
            checked={isCheked}
            onChange={() => setIsCheked((prev) => !prev)}
            type='checkbox'></input>
          <span className='slider round'></span>
        </label>
        <div>Only my tokens</div>

      </div>
      <div className='collection-header' >
        <div className='collection-title' >Collections</div>
        <div onClick={clearCheckedValues}>
          <div className='clear'>
            <div className='clear-title'>Clear</div>
            <div className={`clear-icon ${isShowCollection ? 'rotate-icon' : ''}`}
              onClick={() => setisShowCollection(!isShowCollection)}>^</div>
          </div>
        </div>

      </div>
      <div className={`${isShowCollection ? 'collections-main-none' : ''}  `}>
        <div className='collection-filter'>
          <input className='collection-search'
            placeholder='Search'
            type='text'>
          </input>
        </div>
        <div className='collection-list'>
          {collections.map((collection, index) => {
            return (
              <div className='collections-main'
                key={collection.id}
                onClick={() => { filterCurrent(collection.id); }}>

                <div className='collection-name-checkbox'>
                  <div>
                    <input
                      checked={inputChecked && inputChecked.includes(String(collection.id))}
                      data-current={collection.id}
                      onChange={() => null}
                      type='checkbox'/>
                  </div>
                  <div className='collection-name'>{collectionName16Decoder(collection.Name)}</div>
                </div>
                {
                  images.length === collections.length && images[index] !== '' && (
                    <div className='collection-img'
                      style={ { backgroundImage: `url(${images.length === collections.length ? images[index] : ''})` }} />
                  )

                }
              </div>

            );
          })}
        </div>
      </div>
      <div className='price'>
        <div className='price-title'>
          <div>Price</div>
          <div>^</div>
        </div>
        <div className='price-main'>
          <input placeholder='min'
            type='text' />
          <p>to</p>
          <input placeholder='max'
            type='text' />
        </div>
        <div >

          <button className='price-btn'
          >Aplly</button>
        </div>
      </div>
    </div>
  );
};

export default FilterContainer;
