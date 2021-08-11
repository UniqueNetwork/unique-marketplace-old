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
  allowClearCollections: boolean;
  allowClearPricesAndSeller: boolean;
  filters: Filters;
  collections: NftCollectionInterface[];
  openFilters: boolean;
  setAllowClearCollections: (allow: boolean) => void;
  setAllowClearPricesAndSeller: (allow: boolean) => void;
  setFilters: (filters: Filters) => void;
  setUniqueCollectionIds: (collectionIds: string[]) => void;
}

const MarketFilters = ({ account, allowClearCollections, allowClearPricesAndSeller, collections, filters, openFilters, setAllowClearCollections, setAllowClearPricesAndSeller, setFilters, setUniqueCollectionIds }: PropTypes): ReactElement => {
  return (
    <div className={`filter-main ${openFilters ? 'open' : ''}`}>
      <FilterContainer
        account={account}
        allowClearCollections={allowClearCollections}
        allowClearPricesAndSeller={allowClearPricesAndSeller}
        collections={collections}
        filters={filters}
        setAllowClearCollections={setAllowClearCollections}
        setAllowClearPricesAndSeller={setAllowClearPricesAndSeller}
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
