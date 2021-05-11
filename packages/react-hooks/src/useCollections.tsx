// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';
import type { ErrorType } from '@polkadot/react-hooks/useFetch';
import type { TokenDetailsInterface } from '@polkadot/react-hooks/useToken';

import BN from 'bn.js';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useApi, useCollection, useFetch } from '@polkadot/react-hooks';
import { UNIQUE_COLLECTION_ID } from '@polkadot/react-hooks/utils';
import { base64Decode, encodeAddress } from '@polkadot/util-crypto';

export type MetadataType = {
  metadata?: string;
}

export interface TokenInterface extends TokenDetailsInterface {
  collectionId: string;
  id: string;
}

export type OfferType = {
  collectionId: number;
  price: BN;
  seller: string;
  tokenId: string;
  metadata: any;
}

export type OffersResponseType = {
  items: OfferType[];
  itemsCount: number;
  page: number;
  pageSize: number;
}

export type TradeType = {
  buyer?: string;
  collectionId: number;
  metadata: string
  price: string;
  quoteId: number;
  seller: string;
  tradeDate: string; // 2021-03-25T08:50:49.622992
  tokenId: number;
}

export type TradesResponseType = {
  items: TradeType[];
  itemsCount: number;
  page: number;
  pageSize: number;
}

export type CollectionWithTokensCount = { info: NftCollectionInterface, tokenCount: number };

export function useCollections () {
  const { api } = useApi();
  const { fetchData } = useFetch();
  const [error, setError] = useState<ErrorType>();
  const [offers, setOffers] = useState<{[key: string]: OfferType}>({});
  const [offersCount, setOffersCount] = useState<number>();
  const [loadingOffers, setLoadingOffers] = useState<boolean>();
  const [trades, setTrades] = useState<TradeType[]>();
  const [myTrades, setMyTrades] = useState<TradeType[]>();
  const cleanup = useRef<boolean>(false);
  const { getDetailedCollectionInfo } = useCollection();

  const getTokensOfCollection = useCallback(async (collectionId: string, ownerId: string) => {
    if (!api || !collectionId || !ownerId) {
      return [];
    }

    try {
      return await api.query.nft.addressTokens(collectionId, ownerId);
    } catch (e) {
      console.log('getTokensOfCollection error', e);
    }

    return [];
  }, [api]);

  /**
   * Return the list of token sale offers
   */
  const getOffers = useCallback((page: number, pageSize: number) => {
    try {
      setLoadingOffers(true);
      fetchData<OffersResponseType>(`/offers?page=${page}&pageSize=${pageSize}`).subscribe((result: OffersResponseType | ErrorType) => {
        if (cleanup.current) {
          return;
        }

        if ('error' in result) {
          setError(result);
        } else {
          if (result) {
            if (result.items.length) {
              setOffers((prevState: {[key: string]: OfferType}) => {
                const newState = { ...prevState };

                result.items.forEach((offer: OfferType) => {
                  if (!newState[`${offer.collectionId}-${offer.tokenId}`]) {
                    newState[`${offer.collectionId}-${offer.tokenId}`] = { ...offer, seller: encodeAddress(base64Decode(offer.seller)) };
                  }
                });

                return newState;
              });
            }

            if (result.itemsCount) {
              setOffersCount(result.itemsCount);
            }
          }
        }

        setLoadingOffers(false);
      });
    } catch (e) {
      console.log('getOffers error', e);
      setLoadingOffers(false);
    }
  }, [fetchData]);

  /**
   * Return the list of token trades
   */
  const getTrades = useCallback((account?: string) => {
    if (!account) {
      fetchData<TradesResponseType>('/trades/').subscribe((result: TradesResponseType | ErrorType) => {
        if (cleanup.current) {
          return;
        }

        if ('error' in result) {
          setError(result);
        } else {
          setTrades(result.items);
        }
      });
    } else {
      fetchData<TradesResponseType>(`/trades/${account}`).subscribe((result: TradesResponseType | ErrorType) => {
        if (cleanup.current) {
          return;
        }

        if ('error' in result) {
          setError(result);
        } else {
          setMyTrades(result.items);
        }
      });
    }
  }, [fetchData]);

  const presetTokensCollections = useCallback(async () => {
    if (!api) {
      return [];
    }

    try {
      const createdCollectionCount = (await api.query.nft.createdCollectionCount() as unknown as BN).toNumber();
      const destroyedCollectionCount = (await api.query.nft.destroyedCollectionCount() as unknown as BN).toNumber();
      const collectionsCount = createdCollectionCount - destroyedCollectionCount;
      const collections: Array<NftCollectionInterface> = [];

      for (let i = 1; i <= collectionsCount; i++) {
        const collectionInf = await getDetailedCollectionInfo(i.toString()) as unknown as NftCollectionInterface;

        if (cleanup.current) {
          return;
        }

        if (collectionInf && collectionInf.Owner && collectionInf.Owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM') {
          collections.push({ ...collectionInf, id: i.toString() });
        }
      }

      return collections;
    } catch (e) {
      console.log('preset tokens collections error', e);

      return [];
    }
  }, [api, getDetailedCollectionInfo]);

  const getCollectionWithTokenCount = useCallback(async (collectionId: string): Promise<CollectionWithTokensCount> => {
    const info = (await getDetailedCollectionInfo(collectionId)) as unknown as NftCollectionInterface;
    const tokenCount = ((await api.query.nft.itemListIndex(collectionId)) as unknown as BN).toNumber();

    return {
      info,
      tokenCount
    };
  }, [api.query.nft, getDetailedCollectionInfo]);

  /* const getAllCollectionsWithTokenCount = useCallback(async () => {
    const createdCollectionCount = (await api.query.nft.createdCollectionCount() as unknown as BN).toNumber();
    const destroyedCollectionCount = (await api.query.nft.destroyedCollectionCount() as unknown as BN).toNumber();
    const collectionsCount = createdCollectionCount - destroyedCollectionCount;
    const collectionWithTokensCount: { [key: string]: CollectionWithTokensCount } = {};

    for (let i = 1; i <= collectionsCount; i++) {
      collectionWithTokensCount[i] = await getCollectionWithTokenCount(i.toString());
    }

    return collectionWithTokensCount;
  }, [api.query.nft, getCollectionWithTokenCount]); */

  const presetMintTokenCollection = useCallback(async (): Promise<NftCollectionInterface[]> => {
    try {
      const collections: Array<NftCollectionInterface> = JSON.parse(localStorage.getItem('tokenCollections') || '[]') as NftCollectionInterface[];
      const mintCollectionInfo = await getDetailedCollectionInfo(UNIQUE_COLLECTION_ID) as unknown as NftCollectionInterface;

      if (cleanup.current) {
        return [];
      }

      if (mintCollectionInfo && mintCollectionInfo.Owner && mintCollectionInfo.Owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM' && !collections.find((collection) => collection.id === UNIQUE_COLLECTION_ID)) {
        collections.push({ ...mintCollectionInfo, id: UNIQUE_COLLECTION_ID });
      }

      localStorage.setItem('tokenCollections', JSON.stringify(collections));

      return collections;
    } catch (e) {
      console.log('presetTokensCollections error', e);

      return [];
    }
  }, [getDetailedCollectionInfo]);

  useEffect(() => {
    return () => {
      cleanup.current = true;
    };
  }, []);

  return {
    error,
    getCollectionWithTokenCount,
    getDetailedCollectionInfo,
    getOffers,
    getTokensOfCollection,
    getTrades,
    loadingOffers,
    myTrades,
    offers,
    offersCount,
    presetMintTokenCollection,
    presetTokensCollections,
    trades
  };
}
