// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TradeType } from '@polkadot/react-hooks/useCollections';

import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';

import envConfig from '@polkadot/apps-config/envConfig';
import { ListComponent } from '@polkadot/react-components';
import { useCollections } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';
import { base64Decode } from '@polkadot/util-crypto';

const { kusamaDecimals, uniqueCollectionIds } = envConfig;

function TradeHistory ({ account }: { account?: string }): React.ReactElement {
  const { getTrades, myTrades, trades } = useCollections();
  const [tradesList, setTradesList] = useState<TradeType[]>();
  const history = useHistory();

  const fetchTrades = useCallback(() => {
    getTrades({ account, collectionIds: uniqueCollectionIds, page: 1, pageSize: 100 });
  }, [account, getTrades]);

  const headerRef = useRef([
    ['Token', 'start'],
    ['Collection', 'start'],
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

  const openDetailedInformationModal = useCallback((collectionId: string | number, tokenId: string | number) => {
    history.push(`/wallet/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  return (
    <div
      className='trades'
    >

      <ListComponent
        empty={'No trades found'}
        header={headerRef.current}
      >
        { tradesList && tradesList.map((trade: TradeType) => (
          <tr
            className='trades-row'
            key={`${trade.collectionId}-${trade.tokenId}-${trade.buyer || ''} + ${Math.random() * 100}  `}

          >
            <td className='overflow tradeList token-id'
              onClick={openDetailedInformationModal.bind(null, trade.collectionId, trade.tokenId)}
            >
              {trade.tokenId}
            </td>
            <td className='overflow tradeList'>
              {trade.collectionId}
            </td>
            <td className='overflow tradeList price '>
              {parseFloat(trade.price) / Math.pow(10, kusamaDecimals)} KSM
            </td>
            <td className='overflow tradeList date'>
              {moment.utc(trade.tradeDate).local().format(' YYYY-DD-MM HH:mm:ss   (Z)')}
            </td>
            <td className='overflow tradeList box-buyer-seler'>
              {trade.buyer ? keyring.encodeAddress(base64Decode(trade.buyer)) : ''}
            </td>
            <td className='overflow tradeList box-buyer-seler'>
              {keyring.encodeAddress(base64Decode(trade.seller))}
            </td>
          </tr>
        ))}
      </ListComponent>
    </div>
  );
}

export default React.memo(TradeHistory);
