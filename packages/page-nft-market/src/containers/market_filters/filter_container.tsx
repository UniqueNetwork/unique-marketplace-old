/* eslint-disable header/header */
// [object Object]
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useEffect, useState } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';
import { useDecoder, useMetadata } from '@polkadot/react-hooks';

const { uniqueCollectionIds: envIds } = envConfig;

interface PropTypes {
  account: string|undefined
  filterBySeller: (isOnlyMyToken: boolean) => void;
  changeuniqueCollectionIds: (arr: string[]) => void;
  collections: NftCollectionInterface[]
  changePrices: (minPrice: string, maxPrice: string) => void

}
interface PricesTypes{
  minPrice: string;
  maxPrice: string;
}

const FilterContainer: React.FC<PropTypes> = ({ account, changePrices, changeuniqueCollectionIds, collections, filterBySeller }) => {
  const { collectionName16Decoder } = useDecoder();
  const { getTokenImageUrl } = useMetadata();
  const [images, setImages] = useState<string[]>([]);
  const [inputChecked, setInputChecked] = useState<string[]>([]);
  const [isOnlyMyToken, setisOnlyMyToken] = useState(false);
  const [KSMPrices, setKSMPrices] = useState<PricesTypes>({ maxPrice: '', minPrice: '' });

  const [isShowCollection, setisShowCollection] = useState<boolean>(false);
  const [isShowPrice, setisShowPrice] = useState<boolean>(false);

  const [checkedIds, setCheckedids] = useState<string[]>([]);

  const clearPrices = () => {
    setKSMPrices({ maxPrice: '', minPrice: '' });
    changePrices('', '');
  };

  const setKSMPrice: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    let val = e.target.value;

    val = val.slice(0, 8);
    if (+val > 100000 || +val < 0) return;
    if (val.length === 2 && val[0] === '0' && val[1] !== '.') val = '0';

    setKSMPrices({ ...KSMPrices, [e.target.name]: val });
  };

  const handleOnlyMyToken = () => {
    setisOnlyMyToken(!isOnlyMyToken);
    filterBySeller(!isOnlyMyToken);
  };

  const filterCurrent = (id: string) => {
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

      if (_.length > 0) {
        changeuniqueCollectionIds(_);
        setCheckedids(_);
      } else {
        setCheckedids([]);
        changeuniqueCollectionIds(envIds);
      }
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
    void updateImageUrl();
  }, [updateImageUrl]);

  return (
    <div className='filter-main'>

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
      <div className='collection'>
        <div className='collection-header' >
          <div className='collection-title' >Collections</div>
          <div >
            <div className='clear'>
              <div
                className={`clear-title ${inputChecked.length ? 'clear-title-active' : ''}`}
                onClick={clearCheckedValues}>Clear</div>
              <div
                className={`clear-icon ${isShowCollection ? 'rotate-icon' : ''}`}
                onClick={() => setisShowCollection(!isShowCollection)}
              />
            </div>
          </div>

        </div>
        <div className={`${isShowCollection ? 'display-none' : ''}  `}>
          {/* <div className='collection-filter'>
          <input className='collection-search'
            placeholder='Search'
            type='text'>
          </input>
        </div> */}
          <div className='collection-list'>
            {collections.map((collection, index) => {
              return (
                <div className={`collections-main ${inputChecked.includes(String(collection.id)) ? 'collections-main-background' : ''}`}
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
      </div>
      <div className='price'>
        <div className='price-title'>
          <div>Price</div>
          <div className='clear'>
            <div
              className={`clear-title ${(KSMPrices.minPrice || KSMPrices.maxPrice) ? 'clear-title-active' : ''}`}
              onClick={clearPrices}
            >
              Clear
            </div>
            <div
              className={`clear-icon ${isShowPrice ? 'rotate-icon' : ''}`}
              onClick={() => setisShowPrice(!isShowPrice)}
            />
          </div>
        </div>
        <div className={`  ${isShowPrice ? 'display-none' : ''}  `}>
          <div className='price-main' >
            <input className='min-input'
              name='minPrice'
              onChange= {setKSMPrice}
              onKeyDown={(evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()}
              placeholder='Min'
              type='number'
              value={KSMPrices.minPrice}
            />
            <p>to</p>
            <input name='maxPrice'
              onChange= {setKSMPrice}
              onKeyDown={(evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()}
              placeholder='Max'
              type='number'
              value={KSMPrices.maxPrice}
            />

          </div>
          <button
            className={`price-btn ${(KSMPrices.minPrice || KSMPrices.maxPrice) ? 'price-btn-active' : ''}`}
            disabled={!KSMPrices.minPrice && !KSMPrices.maxPrice}
            onClick={() => changePrices(KSMPrices.minPrice, KSMPrices.maxPrice)}
          >Apply</button>
        </div>
        <div >
        </div>
      </div>
    </div>
  );
};

export default FilterContainer;
