// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, ReactElement, useCallback, useState } from 'react';

import { Filters } from '@polkadot/app-nft-market/containers/NftMarket';

import { SESSION_STORAGE_KEYS } from './constants';

interface PropTypes {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const traitsArray = [
  '0-traiters',
  '1-traiters',
  '2-traiters',
  '3-traiters',
  '4-traiters',
  '5-traiters',
  '6-traiters',
  '7-traiters',
  '8-traiters'
];

const TreatsFilter = ({ filters, setFilters }: PropTypes): ReactElement => {
  const [isShowTraitsFilter, setIsShowTraitsFilter] = useState<boolean>(true);

  const clearFilter = useCallback(() => {
    const newFilters = { ...filters };

    newFilters.traitsCount = [];

    setFilters(newFilters);
    sessionStorage.setItem(SESSION_STORAGE_KEYS.FILTERS, JSON.stringify(newFilters));
  }, [filters, setFilters]);

  const onClickCheckbox = useCallback((item: string) => {
    let newState: Filters;

    if (filters.traitsCount.includes(item)) {
      newState = { ...filters, sort: 'desc(creationDate)', traitsCount: filters.traitsCount.filter((traitsCount) => traitsCount !== item) };
    } else {
      newState = { ...filters, sort: 'desc(creationDate)', traitsCount: [...filters.traitsCount, item] };
    }

    setFilters(newState);
    sessionStorage.setItem(SESSION_STORAGE_KEYS.FILTERS, JSON.stringify(newState));
  }, [filters, setFilters]);

  return (
    <div className='filter'>
      <div className='filter--title
      '>
        <div>Traits</div>
        <div className='clear'>
          <div
            className={`clear-title ${filters.traitsCount.length ? 'clear-title-active' : ''}`}
            onClick={clearFilter}
          >
            Clear
          </div>
          <div
            className={`filter-arrow-icon ${isShowTraitsFilter ? 'rotate-icon' : ''}`}
            onClick={setIsShowTraitsFilter.bind(null, !isShowTraitsFilter)}
          />
        </div>
      </div>
      { isShowTraitsFilter && (
        <div className='filter--body'>
          { traitsArray.map((item, index) => (
            <div
              className={`collections-main ${filters.traitsCount.includes(index.toString()) ? 'collections-main-background' : ''}`}
              key={item}
              onClick={onClickCheckbox.bind(null, index.toString())}
            >
              <div className='custom-checkbox'>
                <div className='checkbox-input'>
                  <input
                    checked={filters.traitsCount.includes(index.toString())}
                    data-current={'1'}
                    onChange={() => null}
                    type='checkbox'
                  />
                </div>
                <div className='checkbox-title'>{item}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(TreatsFilter);
