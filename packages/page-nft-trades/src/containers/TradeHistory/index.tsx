// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TradeType } from '@polkadot/react-hooks/useCollections';

import moment from 'moment';
import React, { ReactText, useCallback, useEffect, useRef, useState } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';
import { ListComponent } from '@polkadot/react-components';
import Pagination from '@polkadot/react-components/Pagination';
import { useCollections } from '@polkadot/react-hooks';

function TradeHistory ({ account }: { account?: string }): React.ReactElement {
  const { getTrades, myTrades, trades, tradesCount } = useCollections();
  const [tradesList, setTradesList] = useState<TradeType[]>();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [sortedValue, setSortedValue] = useState<[string, string] | undefined>();
  const { kusamaDecimals, uniqueCollectionIds } = envConfig;

  const fetchTrades = useCallback(() => {
    getTrades({ account, collectionIds: uniqueCollectionIds, page, pageSize, sort: sortedValue ? `${sortedValue[0]}(${sortedValue[1]})` : undefined });
  }, [account, getTrades, page, pageSize, sortedValue, uniqueCollectionIds]);

  const headerRef = useRef([
    ['Token', 'start', undefined, undefined, 'TokenId'],
    ['Collection', 'start', undefined, undefined, 'CollectionId'],
    ['Price', 'start', undefined, undefined, 'Price'],
    ['Date', 'start', undefined, undefined, 'TradeDate'],
    ['Buyer', 'start'],
    ['Seller', 'start']
  ]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  useEffect(() => {
    if (account) {
      setTradesList(myTrades);
    } else {
      setTradesList(trades);
    }
  }, [account, myTrades, trades]);

  const onSort = useCallback((newSort: string) => {
    setSortedValue((_value) => {
      const [order, sortedBy] = _value || [];

      return sortedBy === newSort
        ? (order === 'asc' ? ['desc', newSort] : ['asc', newSort])
        : ['asc', newSort];
    });
  }, [setSortedValue]);

  return (
    <div
      className='trades'
    >
      <ListComponent
        empty={'No trades found'}
        header={headerRef.current as ReactText[][]}
        onSort={onSort}
        sortedValue={sortedValue}
      >
        { tradesList && tradesList.map((trade: TradeType) => (
          <tr
            className='trades-row'
            key={`${trade.collectionId}-${trade.tokenId}-${trade.buyer || ''}-${Math.random() * 100}`}
          >
            <td
              className='overflow tradeList token-id'
            >
              <a
                href={`#/wallet/token-details?collectionId=${trade.collectionId}&tokenId=${trade.tokenId}`}
                rel='noopener noreferrer'
                target='_blank'
              >
                {trade.tokenId}
              </a>
            </td>
            <td className='overflow tradeList'>
              {trade.collectionId}
            </td>
            <td className='overflow tradeList price '>
              {parseFloat(trade.price) / Math.pow(10, kusamaDecimals)} KSM
            </td>
            <td className='overflow tradeList date'>
              {moment.utc(trade.tradeDate).local().format(' YYYY-MM-DD HH:mm:ss   (Z)')}
            </td>
            <td className='overflow tradeList box-buyer-seler'>
              {trade.buyer ? trade.buyer : ''}
            </td>
            <td className='overflow tradeList box-buyer-seler'>
              {trade.seller}
            </td>
          </tr>
        ))}
      </ListComponent>
      <Pagination
        itemsCount={tradesCount}
        onChangePage={setPage}
        onChangePageSize={setPageSize}
        page={page}
        perPage={pageSize}
      />
    </div>
  );
}

export default React.memo(TradeHistory);
