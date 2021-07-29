// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, ReactElement } from 'react';

import { Filters } from '@polkadot/app-nft-market/containers/NftMarket';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import FilterContainer from './filterContainer';
import TreatsFilter from './TreatsFilter';

interface PropTypes {
  account: string|undefined;
  filters: Filters;
  collections: NftCollectionInterface[]
  setFilters: (filters: Filters) => void;
  setUniqueCollectionIds: (collectionIds: string[]) => void;
}

const MarketFilters = ({ account, collections, filters, setFilters, setUniqueCollectionIds }: PropTypes): ReactElement => {

  return (
    <div className='filter-main'>
      <FilterContainer
        account={account}
        collections={collections}
        filters={filters}
        setFilters={setFilters}
        setUniqueCollectionIds={setUniqueCollectionIds}
      />
      <TreatsFilter
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default memo(MarketFilters);
