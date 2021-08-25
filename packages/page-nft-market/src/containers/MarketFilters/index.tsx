// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { memo, ReactElement } from 'react';

import { Filters } from '@polkadot/app-nft-market/containers/NftMarket';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import FilterContainer from './filterContainer';
import TreatsFilter from './TreatsFilter';

interface PropTypes {
  account: string | undefined;
  allowClearFilters: boolean;
  filters: Filters;
  collections: NftCollectionInterface[];
  openFilters: boolean;
  setAllowClearFilters: (allow: boolean) => void;
  setFilters: (filters: Filters) => void;
  setAreFiltersActive: (condition: boolean) => void;
}

const MarketFilters = ({ account, allowClearFilters, collections, filters, openFilters, setAllowClearFilters, setAreFiltersActive, setFilters }: PropTypes): ReactElement => {
  return (
    <div className={`filter-main ${openFilters ? 'open' : ''}`}>
      <FilterContainer
        account={account}
        allowClearFilters={allowClearFilters}
        collections={collections}
        filters={filters}
        setAllowClearFilters={setAllowClearFilters}
        setAreFiltersActive={setAreFiltersActive}
        setFilters={setFilters}
      />
      <TreatsFilter
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default memo(MarketFilters);
