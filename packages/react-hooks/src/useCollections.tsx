// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ErrorType } from '@polkadot/react-hooks/useFetch';

import BN from 'bn.js';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useApi, useFetch } from '@polkadot/react-hooks';
import { UNIQUE_COLLECTION_ID } from '@polkadot/react-hooks/utils';
import { Constructor } from '@polkadot/types/types/codec';
import { base64Decode, encodeAddress } from '@polkadot/util-crypto';

export type MetadataType = {
  metadata?: string;
}

export type TokenAttribute = Record<string, Constructor | string | Record<string, string> | {
  _enum: string[] | Record<string, string | null>;
} | {
  _set: Record<string, number>;
}>;

export interface NftCollectionInterface {
  Access?: 'Normal'
  id: string;
  DecimalPoints: BN | number;
  Description: number[];
  TokenPrefix: string;
  MintMode?: boolean;
  Mode: {
    nft: null;
    fungible: null;
    reFungible: null;
    invalid: null;
  };
  Name: number[];
  OffchainSchema: string;
  Owner?: string;
  SchemaVersion: {
    isImageUrl: boolean;
    isUnique: boolean;
  };
  Sponsor?: string; // account
  SponsorConfirmed?: boolean;
  Limits?: {
    AccountTokenOwnershipLimit: string;
    SponsoredMintSize: string;
    TokenLimit: string;
    SponsorTimeout: string;
  },
  VariableOnChainSchema: string;
  ConstOnChainSchema: string;
}

export interface TokenDetailsInterface {
  Owner?: any[];
  ConstData?: string;
  VariableData?: string;
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
  const [offers, setOffers] = useState<OfferType[]>();
  const [loadingOffers, setLoadingOffers] = useState<boolean>();
  const [trades, setTrades] = useState<TradeType[]>();
  const [myTrades, setMyTrades] = useState<TradeType[]>();
  const cleanup = useRef<boolean>(false);

  const getTokensOfCollection = useCallback(async (collectionId: string, ownerId: string) => {
    if (!api || !collectionId || !ownerId) {
      return [];
    }

    try {
      const tokensOfCollection = await api.query.nft.addressTokens(collectionId, ownerId);

      if (cleanup.current) {
        return '';
      }

      return tokensOfCollection;
    } catch (e) {
      console.log('getTokensOfCollection error', e);
    }

    return [];
  }, [api]);

  const getDetailedCollectionInfo = useCallback(async (collectionId: string) => {
    if (!api) {
      return null;
    }

    try {
      const collectionInfo = (await api.query.nft.collectionById(collectionId)).toJSON() as unknown as NftCollectionInterface;

      if (cleanup.current) {
        return '';
      }

      return {
        ...collectionInfo,
        id: collectionId
      };
    } catch (e) {
      console.log('getDetailedCollectionInfo error', e);
    }

    return {};
  }, [api]);

  const getDetailedTokenInfo = useCallback(async (collectionId: string, tokenId: string): Promise<TokenDetailsInterface> => {
    if (!api) {
      return {};
    }

    try {
      const tokenInfo = await api.query.nft.nftItemList(collectionId, tokenId);

      if (cleanup.current) {
        return {};
      }

      return tokenInfo.toJSON() as unknown as TokenDetailsInterface;
    } catch (e) {
      console.log('getDetailedTokenInfo error', e);

      return {};
    }
  }, [api]);

  const getDetailedReFungibleTokenInfo = useCallback(async (collectionId: string, tokenId: string): Promise<TokenDetailsInterface> => {
    if (!api) {
      return {};
    }

    try {
      const detailedReFungibleTokenInfo = (await api.query.nft.reFungibleItemList(collectionId, tokenId) as unknown as TokenDetailsInterface);

      if (cleanup.current) {
        return {};
      }

      return detailedReFungibleTokenInfo;
    } catch (e) {
      console.log('getDetailedReFungibleTokenInfo error', e);

      return {};
    }
  }, [api]);

  /**
   * Return the list of token sale offers
   */
  const getOffers = useCallback(() => {
    try {
      setLoadingOffers(true);
      fetchData<OffersResponseType>('/offers/').subscribe((result: OffersResponseType | ErrorType) => {
        if (cleanup.current) {
          return;
        }

        if ('error' in result) {
          setError(result);
        } else {
          if (result && result.items.length) {
            setOffers(result.items.map((offer: OfferType) => ({ ...offer, seller: encodeAddress(base64Decode(offer.seller)) })));
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

  const getTokenInfo = useCallback(async (collectionInfo: NftCollectionInterface, tokenId: string): Promise<TokenDetailsInterface> => {
    let tokenDetailsData: TokenDetailsInterface = {};

    if (tokenId && collectionInfo) {
      if (Object.prototype.hasOwnProperty.call(collectionInfo.Mode, 'nft')) {
        tokenDetailsData = await getDetailedTokenInfo(collectionInfo.id, tokenId);
      } else if (Object.prototype.hasOwnProperty.call(collectionInfo.Mode, 'reFungible')) {
        tokenDetailsData = await getDetailedReFungibleTokenInfo(collectionInfo.id, tokenId);
      }
    }

    return tokenDetailsData;
  }, [getDetailedTokenInfo, getDetailedReFungibleTokenInfo]);

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
      const collections: Array<NftCollectionInterface> = [];
      const mintCollectionInfo = await getDetailedCollectionInfo(UNIQUE_COLLECTION_ID) as unknown as NftCollectionInterface;

      if (cleanup.current) {
        return [];
      }

      if (mintCollectionInfo && mintCollectionInfo.Owner && mintCollectionInfo.Owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM') {
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
    getDetailedReFungibleTokenInfo,
    getDetailedTokenInfo,
    getOffers,
    getTokenInfo,
    getTokensOfCollection,
    getTrades,
    loadingOffers,
    myTrades,
    offers,
    presetMintTokenCollection,
    presetTokensCollections,
    trades
  };
}
