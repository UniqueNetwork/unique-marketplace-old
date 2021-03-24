// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TradeType } from '@polkadot/react-hooks/useCollections';

import React, { useCallback, useEffect, useRef } from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';

import { ListComponent } from '@polkadot/react-components';
import { useCollections } from '@polkadot/react-hooks';

function TradeHistory (): React.ReactElement {
  const { getTrades, trades } = useCollections();

  const fetchTrades = useCallback(() => {
    getTrades();
  }, [getTrades]);

  const headerRef = useRef([
    ['Price', 'start', 2],
    ['Collection', 'start'],
    ['Token', 'start'],
    ['Buyer', 'start']
  ]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return (
    <div className='trades'>
      <Header as='h1'>Trades</Header>
      <Header as='h4'>Description</Header>
      <ListComponent
        empty={'No trades found'}
        header={headerRef.current}
      >
        { trades && trades.map((trade: TradeType) => (
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
