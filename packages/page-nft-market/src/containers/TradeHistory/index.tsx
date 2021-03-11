// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TradeType } from '@polkadot/react-hooks/useCollections';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';

import { AccountSelector, FormatBalance, ListComponent } from '@polkadot/react-components';
import { useBalance, useCollections } from '@polkadot/react-hooks';

function TradeHistory (): React.ReactElement {
  const [account, setAccount] = useState<string | null>(null);
  const { getTrades, trades } = useCollections();
  const { balance } = useBalance(account);

  const fetchTrades = useCallback(() => {
    if (account) {
      getTrades();
    }
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

  return (
    <div className='appreciation-actions'>
      <Header as='h1'>Trade History</Header>
      <Header as='h2'>Account</Header>
      <Grid className='account-selector'>
        <Grid.Row>
          <Grid.Column width={12}>
            <AccountSelector onChange={setAccount} />
          </Grid.Column>
          <Grid.Column width={4}>
            { balance && (
              <div className='balance-block'>
                <label>Your account balance is:</label>
                <FormatBalance
                  className='balance'
                  value={balance.free}
                />
              </div>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <br />
      <ListComponent
        empty={'No trades found'}
        header={headerRef.current}
      >
        { trades && trades.map((trade: TradeType) => (
          <tr key={`${trade.offer.collectionId}${trade.offer.tokenId}`}>
            <td
              className='start'
              colSpan={2}
            >
              {trade.offer.price}
            </td>
            <td className='overflow'>
              {trade.offer.collectionId}
            </td>
            <td className='overflow'>
              {trade.offer.tokenId}
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
