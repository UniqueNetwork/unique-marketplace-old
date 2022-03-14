// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { BidType } from './useCollections';

export function useBidStatus(bids: BidType[], account?: string): {indexOfYourBid: number, yourBidIsLeading: boolean, yourBidIsOutbid: boolean} {

  const accountUniversal = account ? encodeAddress(decodeAddress(account), 42) : '';
  

  const indexOfYourBid = bids.findIndex((bid) => { 
    return encodeAddress(decodeAddress(bid.bidderAddress), 42) === accountUniversal });
  const yourBidIsLeading = indexOfYourBid === 0;
  const yourBidIsOutbid = indexOfYourBid > 0;

  return {
    indexOfYourBid, yourBidIsLeading, yourBidIsOutbid
  };
}
