// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TradeType } from '@polkadot/react-hooks/useCollections';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ListComponent } from '@polkadot/react-components';
import { useCollections } from '@polkadot/react-hooks';

function TradeHistory ({ account }: { account?: string }): React.ReactElement {
  const { getTrades, myTrades, trades } = useCollections();
  const [tradesList, setTradesList] = useState<TradeType[]>();

  const fetchTrades = useCallback(() => {
    getTrades(account);
  }, [account, getTrades]);

  const headerRef = useRef([
    ['Price', 'start', 2],
    ['Collection', 'start'],
    ['Token', 'start'],
    ['Buyer', 'start']
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

  return (
    <div className='trades'>
      <ListComponent
        empty={'No trades found'}
        header={headerRef.current}
      >
        { tradesList && tradesList.map((trade: TradeType) => (
          <tr key={`${trade.collectionId}-${trade.tokenId}-${trade.buyer || ''}`}>
            <td
              className='start'
              colSpan={2}
            >
              {trade.price}
            </td>
            <td className='overflow'>
              {trade.collectionId}
            </td>
            <td className='overflow'>
              {trade.tokenId}
            </td>
            <td className='overflow'>
              {trade.buyer}
            </td>
          </tr>
        ))}
      </ListComponent>
    </div>
  );
}

export default React.memo(TradeHistory);
