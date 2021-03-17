// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ErrorType } from '@polkadot/react-hooks/useFetch';

import BN from 'bn.js';
import { useCallback, useState } from 'react';

import { useApi, useFetch } from '@polkadot/react-hooks';
import { Constructor } from '@polkadot/types/types/codec';

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
  TokenPrefix: number[];
  MintMode?: boolean;
  Mode: {
    isNft: boolean;
    isFungible: boolean;
    isReFungible: boolean;
    isInvalid: boolean;
  };
  Name: number[];
  OffchainSchema: number[];
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
  VariableOnChainSchema: number[];
  ConstOnChainSchema: number[];
}

export interface TokenDetailsInterface {
  Owner?: any[];
  ConstData?: number[];
  VariableData?: number[];
}

export type OfferType = {
  collectionId: string;
  price: BN;
  seller: string;
  tokenId: string;
  metadata: any;
}

export type TradeType = {
  buyer: string;
  offer: OfferType;
  tradeDate: string;
}

/* const mockedOffers: OfferType[] = [
  {
    collectionId: '1',
    metadata: 'any',
    price: new BN(10),
    seller: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    tokenId: '1'
  },
  {
    collectionId: '2',
    metadata: 'any',
    price: new BN(10),
    seller: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    tokenId: '2'
  },
  {
    collectionId: '3',
    metadata: 'any',
    price: new BN(10),
    seller: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    tokenId: '3'
  },
  {
    collectionId: '4',
    metadata: 'any',
    price: new BN(10),
    seller: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    tokenId: '4'
  },
  {
    collectionId: '5',
    metadata: 'any',
    price: new BN(10),
    seller: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    tokenId: '5'
  }
]; */

export function useCollections () {
  const { api } = useApi();
  const { fetchData } = useFetch();
  const [error, setError] = useState<ErrorType>();
  const [offers, setOffers] = useState<OfferType[]>();
  const [trades, setTrades] = useState<TradeType[]>();

  const getTokensOfCollection = useCallback(async (collectionId: string, ownerId: string) => {
    if (!api || !collectionId || !ownerId) {
      return [];
    }

    try {
      return (await api.query.nft.addressTokens(collectionId, ownerId));
    } catch (e) {
      console.log('getTokensOfCollection error', e);
    }

    return [];
  }, [api]);

  const getDetailedCollectionInfo = useCallback(async (collectionId: string) => {
    if (!api) {
      return {};
    }

    try {
      return (await api.query.nft.collection(collectionId));
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
      return (await api.query.nft.nftItemList(collectionId, tokenId) as unknown as TokenDetailsInterface);
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
      return (await api.query.nft.reFungibleItemList(collectionId, tokenId) as unknown as TokenDetailsInterface);
    } catch (e) {
      console.log('getDetailedReFungibleTokenInfo error', e);

      return {};
    }
  }, [api]);

  /**
   * Return the list of token sale offers
   */
  const getOffers = useCallback(() => {
    fetchData<OfferType[]>('/offers/').subscribe((result: OfferType[] | ErrorType) => {
      if ('error' in result) {
        setError(result);
      } else {
        setOffers(result);
      }
    });
  }, [fetchData]);

  /**
   * Return the list of token trades
   */
  const getTrades = useCallback(() => {
    fetchData<TradeType[]>('/trades/').subscribe((result: TradeType[] | ErrorType) => {
      if ('error' in result) {
        setError(result);
      } else {
        setTrades(result);
      }
    });
  }, [fetchData]);

  const presetTokensCollections = useCallback(async () => {
    if (!api) {
      return [];
    }

    try {
      const collectionsCount = (await api.query.nft.collectionCount() as unknown as BN).toNumber();
      const collections: Array<NftCollectionInterface> = [];

      for (let i = 1; i <= collectionsCount; i++) {
        const collectionInf = await getDetailedCollectionInfo(i.toString()) as unknown as NftCollectionInterface;

        console.log('collectionInf', collectionInf);

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

  return {
    error,
    getDetailedCollectionInfo,
    getDetailedReFungibleTokenInfo,
    getDetailedTokenInfo,
    getOffers,
    getTokensOfCollection,
    getTrades,
    offers,
    presetTokensCollections,
    trades
  };
}
