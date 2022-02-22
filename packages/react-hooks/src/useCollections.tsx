// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';
import type { ErrorType } from '@polkadot/react-hooks/useFetch';
import type { TokenDetailsInterface } from '@polkadot/react-hooks/useToken';
import type { u32 } from '@polkadot/types';

import BN from 'bn.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import equal from 'deep-equal';
import { useCallback, useRef, useState } from 'react';

import { Filters } from '@polkadot/app-nft-market/containers/NftMarket';
import envConfig from '@polkadot/apps-config/envConfig';
import { useApi, useCollection, useFetch, useIsMountedRef } from '@polkadot/react-hooks';
import { subToEth } from '@polkadot/react-hooks/utils';

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
  const [offers, setOffers] = useState<OfferType[]>([]);
  const [offersLoading, setOffersLoading] = useState<boolean>(false);
  const [offersCount, setOffersCount] = useState<number>(0);
  const [trades, setTrades] = useState<TradeType[]>();
  const [tradesCount, setTradesCount] = useState<number>(0);
  const [tradesLoading, setTradesLoading] = useState<boolean>(false);
  const [myTrades, setMyTrades] = useState<TradeType[]>();
  const mountedRef = useIsMountedRef();
  const filtersRef = useRef<Filters>();
  const { getDetailedCollectionInfo } = useCollection();
  const { uniqueApi, uniqueCollectionIds } = envConfig;
  const apiUrl = process.env.NODE_ENV === 'development' ? '' : uniqueApi;

  const getTokensOfCollection = useCallback(async (collectionId: string, ownerId: string): Promise<string[]> => {
    if (!api || !collectionId || !ownerId) {
      return [];
    }

    try {
      const ethAccount = subToEth(ownerId).toLowerCase();
      const subTokens = (await api.rpc.unique.accountTokens(collectionId, { Substrate: ownerId })) as string[];
      const ehtTokens = (await api.rpc.unique.accountTokens(collectionId, { Ethereum: ethAccount })) as string[];

      return [...ehtTokens, ...subTokens];
    } catch (e) {
      console.log('getTokensOfCollection error', e);
    }

    return [];
  }, [api]);

  /**
   * Return the list of token sale offers
   */
  const getOffers = useCallback((page: number, pageSize: number, filters?: Filters) => {
    try {
      mountedRef.current && setOffersLoading(true);
      let url = `${apiUrl}/Offers?page=${page}&pageSize=${pageSize}`;

      if (filters && uniqueCollectionIds?.length) {
        Object.keys(filters).forEach((filterKey: string) => {
          const currentFilter: string | string[] | number = filters[filterKey];

          if (Array.isArray(currentFilter)) {
            if (filterKey === 'collectionIds') {
              if (!currentFilter?.length) {
                url = `${url}${uniqueCollectionIds.map((item: string) => `&collectionId=${item}`).join('')}`;
              } else {
                url = `${url}${currentFilter.map((item: string) => `&collectionId=${item}`).join('')}`;
              }
            } else if (filterKey === 'traitsCount' && currentFilter?.length) {
              url = `${url}${currentFilter.map((item: string) => `&traitsCount=${item}`).join('')}`;
            }
          } else {
            if (currentFilter) {
              url += `&${filterKey}=${currentFilter}`;
            }
          }
        });
      }

      fetchData<OffersResponseType>(url).subscribe((result: OffersResponseType | ErrorType) => {
        if (!mountedRef.current) {
          return;
        }

        setOffersLoading(false);

        if ('error' in result) {
          setError(result);
        } else {
          if (result) {
            setOffersCount(result.itemsCount);

            if (result.itemsCount === 0) {
              setOffers([]);
            } else if (result.items.length) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              if (!equal(filters, filtersRef.current) || page === 1) {
                setOffers(result.items);
              } else {
                setOffers((prevOffers) => [...prevOffers, ...result.items]);
              }
            }
          }
        }

        filtersRef.current = filters;
        setOffersLoading(false);
      }).unsubscribe();
    } catch (e) {
      console.log('getOffers error', e);
      setOffersLoading(false);
    }
  }, [apiUrl, fetchData, mountedRef, uniqueCollectionIds]);

  /**
   * Return the list of token trades
   */
  const getTrades = useCallback(({ account,
    collectionIds,
    page,
    pageSize,
    sort }: { account?: string, collectionIds?: string[], page: number, pageSize: number, sort?: string}) => {
    try {
      let url = `${apiUrl}/Trades`;

      if (account && account.length) {
        url = `${url}/${account}`;
      }

      url = `${url}?page=${page}&pageSize=${pageSize}`;

      if (collectionIds && collectionIds.length) {
        url = `${url}${collectionIds.map((item: string) => `&collectionId=${item}`).join('')}`;
      }

      if (sort) {
        url = `${url}&sort=${sort}`;
      }

      setTradesLoading(true);
      fetchData<TradesResponseType>(url).subscribe((result: TradesResponseType | ErrorType) => {
        if (!mountedRef.current) {
          return;
        }

        if ('error' in result) {
          setError(result);
        } else {
          if (!account || !account.length) {
            setTrades(result.items);
          } else {
            setMyTrades(result.items);
          }

          setTradesCount(result.itemsCount || 0);
        }

        setTradesLoading(false);
      });
    } catch (e) {
      console.log('getTrades error', e);
      setTradesLoading(false);
    }
  }, [apiUrl, fetchData, mountedRef]);

  const presetTokensCollections = useCallback(async (): Promise<NftCollectionInterface[]> => {
    if (!api) {
      return [];
    }

    try {
      const fullCount = (await api.rpc.unique.collectionStats()) as { created: u32, destroyed: u32 };
      const createdCollectionCount = fullCount.created.toNumber();
      const destroyedCollectionCount = fullCount.destroyed.toNumber();
      const collectionsCount = createdCollectionCount - destroyedCollectionCount;
      const collections: Array<NftCollectionInterface> = [];

      for (let i = 1; i <= collectionsCount; i++) {
        const collectionInf = await getDetailedCollectionInfo(i.toString()) as unknown as NftCollectionInterface;

        if (!mountedRef.current) {
          return [];
        }

        if (collectionInf && collectionInf.owner && collectionInf.owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM') {
          collections.push({ ...collectionInf, id: i.toString() });
        }
      }

      return collections;
    } catch (e) {
      console.log('preset tokens collections error', e);

      return [];
    }
  }, [api, getDetailedCollectionInfo, mountedRef]);

  const presetCollections = useCallback(async (): Promise<NftCollectionInterface[]> => {
    try {
      const collections: Array<NftCollectionInterface> = [];

      if (uniqueCollectionIds && uniqueCollectionIds.length) {
        for (let i = 0; i < uniqueCollectionIds.length; i++) {
          // use only collections that exists in the chain
          const mintCollectionInfo = await getDetailedCollectionInfo(uniqueCollectionIds[i]) as unknown as NftCollectionInterface;

          if (!mountedRef.current) {
            return [];
          }

          if (mintCollectionInfo && mintCollectionInfo.owner && mintCollectionInfo.owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM' && !collections.find((collection) => collection.id === uniqueCollectionIds[i])) {
            collections.push({ ...mintCollectionInfo, id: uniqueCollectionIds[i] });
          }
        }
      }

      return collections;
    } catch (e) {
      console.log('presetTokensCollections error', e);

      return [];
    }
  }, [getDetailedCollectionInfo, mountedRef, uniqueCollectionIds]);

  return {
    error,
    getDetailedCollectionInfo,
    getOffers,
    getTokensOfCollection,
    getTrades,
    myTrades,
    offers,
    offersCount,
    offersLoading,
    presetCollections,
    presetTokensCollections,
    trades,
    tradesCount,
    tradesLoading
  };
}
