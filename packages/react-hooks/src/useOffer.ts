// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';
import { useApi } from '@polkadot/react-hooks/useApi';
import envConfig from '@polkadot/apps-config/envConfig';
import { OfferType } from './useCollections';

export function useOffer(collectionId: string, tokenId: string): {offer?: OfferType} {
  const { api, isApiConnected, isApiReady } = useApi();
  const { uniqueApi } = envConfig;
  const apiUrl = process.env.NODE_ENV === 'development' ? '' : uniqueApi;

  const isApi = api && isApiReady && isApiConnected;

  const [offer, setOffer] = useState();

  useEffect(() => {
    getOffer(collectionId, tokenId);
  }, [])

  const getOffer = useCallback(async (collectionId: string, tokenId: string) => {
    if (!isApi || !collectionId || !tokenId) {
      return [];
    }

    try {
      fetch(`${apiUrl}/Offer/${collectionId}/${tokenId}`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setOffer(data);
        });
    } catch (e) {
      console.log('getOffer error', e);
    }

    return 0;
  }, [api, isApi]);


  return {
    offer
  };
}
