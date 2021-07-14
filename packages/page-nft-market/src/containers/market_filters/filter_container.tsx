/* eslint-disable header/header */
// [object Object]
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { ChangeEvent, useState } from 'react';

import { useDecoder } from '@polkadot/react-hooks';

interface PropTypes {
  collections: NftCollectionInterface[]
  filteredOffers: any
  changeFilter: any
}

const FilterContainer: React.FC<PropTypes> = ({ changeFilter, collections, filteredOffers }) => {
  const { collectionName16Decoder } = useDecoder();
  const [inputChecked, setInputChecked] = useState<boolean>();
  const [isCheked, setIsCheked] = useState<boolean>(false);

  const filterCurrent = (e: ChangeEvent<HTMLInputElement>) => {
    setInputChecked();
    const filteredItem = filteredOffers.filter((el) => el.collectionId === Number(e.target.dataset.current));

    changeFilter([...filteredItem]);
  };

  const clearCheckedValues = () => {
    setInputChecked(false);
    changeFilter([...filteredOffers]);
  };

  return (
    <div className='filter-main'>

      <div className='switch-my-tokens'>
        <label className='switch'>
          <input
            checked={isCheked}
            onClick={() => setIsCheked((prev) => !prev)}
            type='checkbox'></input>
          <span className='slider round'></span>
        </label>
        <div>Only my tokens</div>

      </div>
      <div className='collection-title' >
        <div>Collections</div>
        <div onClick={clearCheckedValues}>
          <div>Clear</div>
          <div>^</div>
        </div>

      </div>
      <div className='collections-filter'>
        <input className='collection-search'
          placeholder='Search'
          type='text'>
        </input>
      </div>
      <div>
        {collections.map((collection) => {
          return (
            <div className='collections-main'
              key={collection.id}>
              <div className='collection-name-checkbox'>
                <div>
                  <input
                    checked={inputChecked && inputChecked}
                    data-current={collection.id}
                    onChange={filterCurrent}
                    type='checkbox'/>
                </div>
                <div className='collection-name'>{collectionName16Decoder(collection.Name)}</div>
              </div>
              <div className='collection-img'>
                  img
              </div>
            </div>
          );
        })}
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
