// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, ReactElement, useCallback } from 'react';

import { Filters } from '@polkadot/app-nft-market/containers/NftMarket';
import envConfig from '@polkadot/apps-config/envConfig';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import FilterContainer from './filterContainer';
import TreatsFilter from './TreatsFilter';

const { commission } = envConfig;

interface PropTypes {
  account: string|undefined;
  filters: Filters;
  collections: NftCollectionInterface[]
  setFilters: (filters: Filters) => void;
  setUniqueCollectionIds: (collectionIds: string[]) => void;
}

const MarketFilters = ({ account, collections, filters, setFilters, setUniqueCollectionIds }: PropTypes): ReactElement => {
  const changePrices = (minPrice: string | undefined, maxPrice: string | undefined) => {
    const filtersCopy = { ...filters };

    if (minPrice === '') {
      delete filtersCopy.minPrice;
    } else {
      minPrice = String(Math.trunc(Number(minPrice) * 1000000000000 / (1 + (+commission / 100))));
      filtersCopy.minPrice = minPrice;
    }

    if (maxPrice === '') {
      delete filtersCopy.maxPrice;
    } else {
      maxPrice = String(Math.trunc(Number(maxPrice) * 1000000000000 / (1 + (+commission / 100))));
      filtersCopy.maxPrice = maxPrice;
    }

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

  const changeUniqueCollectionIds = useCallback((newIds: string[]) => {
    setUniqueCollectionIds(newIds);
    setFilters({ ...filters, collectionIds: newIds });
  }, [filters, setUniqueCollectionIds, setFilters]);

  return (
    <div className='filter-main'>
      <FilterContainer
        account={account}
        changePrices={changePrices}
        changeuniqueCollectionIds={changeUniqueCollectionIds}
        collections={collections}
        filterBySeller={filterBySeller}
      />
      <TreatsFilter
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default memo(MarketFilters);
