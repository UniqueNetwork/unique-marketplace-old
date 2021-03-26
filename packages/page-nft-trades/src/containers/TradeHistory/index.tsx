// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TradeType } from '@polkadot/react-hooks/useCollections';

import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ListComponent } from '@polkadot/react-components';
import { useCollections } from '@polkadot/react-hooks';
import { KUSAMA_DECIMALS } from '@polkadot/react-hooks/useKusamaApi';
import { keyring } from '@polkadot/ui-keyring';
import { base64Decode } from '@polkadot/util-crypto';

function TradeHistory ({ account }: { account?: string }): React.ReactElement {
  const { getTrades, myTrades, trades } = useCollections();
  const [tradesList, setTradesList] = useState<TradeType[]>();

  const fetchTrades = useCallback(() => {
    getTrades(account);
  }, [account, getTrades]);

  const headerRef = useRef([
    ['Token', 'start'],
    ['Price', 'start'],
    ['Date', 'start'],
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

  return (
    <div className='trades'>
      <ListComponent
        empty={'No trades found'}
        header={headerRef.current}
      >
        { tradesList && tradesList.map((trade: TradeType) => (
          <tr key={`${trade.collectionId}-${trade.tokenId}-${trade.buyer || ''}`}>
            <td className='overflow'>
              {trade.tokenId}
            </td>
            <td className='overflow'>
              {parseFloat(trade.price) / Math.pow(10, KUSAMA_DECIMALS)} KSM
            </td>
            <td className='overflow'>
              {moment(trade.tradeDate).format('YYYY-MM-DD')}
            </td>
            <td className='overflow'>
              {trade.buyer ? keyring.encodeAddress(base64Decode(trade.buyer)) : ''}
            </td>
            <td className='overflow'>
              {keyring.encodeAddress(base64Decode(trade.seller))}
            </td>
          </tr>
        ))}
      </ListComponent>
    </div>
  );
}

export default React.memo(TradeHistory);
