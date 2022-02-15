// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BidType } from './useCollections';

export function useBidStatus(bids: BidType[], account: string): {indexOfYourBid: number, yourBidIsLeading: boolean, yourBidIsOutbid: boolean} {
  
  const indexOfYourBid = bids.reverse().findIndex((bid) => { return bid.bidderAddress === account });
  const yourBidIsLeading = indexOfYourBid === 0;
  const yourBidIsOutbid = indexOfYourBid > 0;

  return {
    indexOfYourBid, yourBidIsLeading, yourBidIsOutbid
  };
}
