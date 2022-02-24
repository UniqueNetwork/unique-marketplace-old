// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useLocation } from 'react-router-dom';
import { NftDetails } from '@polkadot/react-components';
import { useOffer } from '@polkadot/react-hooks/useOffer';
import NftDetailsAuction from '../NftDetailsAuction';

interface NftDetailsProps {
  account: string;
}

function NftCard({ account }: NftDetailsProps): React.ReactElement<NftDetailsProps> {

  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '';
  const collectionId = query.get('collectionId') || '';

  const { getOffer, offer } = useOffer(collectionId, tokenId);

  return (
    <div>
      {!offer?.auction && <NftDetails
        account={account || ''}
      />}
      {offer?.auction && <NftDetailsAuction
        account={account || ''}
        getOffer={getOffer}
        offer={offer}
      />}
    </div>
  );
}

export default React.memo(NftCard);
