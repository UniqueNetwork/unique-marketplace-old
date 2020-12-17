// Copyright 2020 UseTech authors & contributors
import { useCallback } from 'react';
import { useApi } from '@polkadot/react-hooks';

export interface NftCollectionBigInterface {
  id: number;
  DecimalPoints: any;
  Description: any;
  ConstOnChainSchema: any;
  MintMode: boolean;
  Mode: {
    isReFungible: boolean;
  }
  Name: any;
  OffchainSchema: any;
  Sponsor: any;
  TokenPrefix: any;
  UnconfirmedSponsor: any;
  VariableOnChainSchema: any;
}

export interface NftCollectionInterface {
  // access
  id: string;
  decimalPoints: number;
  // constOnChainSchema
  description: string;
  isReFungible: boolean;
  // mintMode
  // mode
  name: string;
  offchainSchema: string;
  // owner
  prefix: string;
  // sponsor
  // tokenPrefix
  // unconfirmedSponsor
  // variableOnChainSchema
}

export type TokenOffer = {
  address: string;
  collectionId: string;
  metadata: any;
  price: number;
  tokenId: string;
}

export type TokenTrade = {
  buyerAddress: string;
  collectionId: string;
  dateTime: string;
  metadata: any;
  price: number;
  sellerAddress: string;
  tokenId: string;
}

export type TokenInfo = {
  Collection: number;
  Owner: string;
  Data: any;
}

// https://docs.google.com/document/d/1WED9VP8Yj52Un4qmkGDpzjesQTzwwoDgYMk1Ty8yftQ/edit
export function useCollections() {
  const { api } = useApi();

  const collectionName16Decoder = useCallback((str) => {
    const collectionNameArr = str.map((item: any) => item.toNumber());
    collectionNameArr.splice(-1, 1);
    return String.fromCharCode(...collectionNameArr);
  }, []);

  const collectionName8Decoder = useCallback((name) => {
    const collectionNameArr = Array.prototype.slice.call(name);
    collectionNameArr.splice(-1, 1);
    return String.fromCharCode(...collectionNameArr);
  }, []);

  // get offers
  // if connection ID not specified, returns 30 last token sale offers
  const getTokensForSale = useCallback((collectionId?: string): Array<TokenOffer> => {
    return [];
  }, []);

  // if connection ID not specified, returns 30 last trades
  const getTrades = useCallback((): Array<TokenTrade> => {
    return [];
  }, []);

  const getTokensOfCollection = useCallback(async (collectionId: string, ownerId: string) => {
    if (!api) {
      return;
    }
    // @ts-ignore
    return (await api.query.nft.addressTokens(collectionId, ownerId));
  }, [api]);

  const getDetailedCollectionInfo = useCallback(async (collectionId): Promise<NftCollectionInterface | null> => {
    if (!api) {
      return null;
    }

    const collectionInfo = await api.query.nft.collection(collectionId);
    console.log('collectionInfo', collectionInfo);

    if (collectionInfo) {
      return {
        id: collectionId,
        decimalPoints: collectionInfo.DecimalPoints.toNumber(),
        description: collectionName16Decoder(collectionInfo.Description),
        name: collectionName16Decoder(collectionInfo.Name),
        offchainSchema: collectionName8Decoder(collectionInfo.OffchainSchema),
        prefix: collectionName8Decoder(collectionInfo.TokenPrefix),
        isReFungible: collectionInfo.Mode.isReFungible,
      } as NftCollectionInterface;
    } else {
      return null;
    }
  }, []);

  const getDetailedTokenInfo = useCallback( async(collectionId: string, tokenId: string): Promise<TokenInfo | null> => {
    if (!api) {
      return null;
    }
    // @ts-ignore
    return (await api.query.nft.nftItemList(collectionId, tokenId));
  }, [api]);

  const getDetailedRefungibleTokenInfo = useCallback(async (collectionId: number, tokenId: string) => {
    if (!api) {
      return;
    }
    // @ts-ignore
    return (await api.query.nft.reFungibleItemList(collectionId, tokenId));
  }, [api]);

  const presetTokensCollections = useCallback(async (): Promise<Array<NftCollectionInterface>> => {
    if (!api) {
      return [];
    }
    try {
      // @ts-ignore
      const collectionsCount = (await api.query.nft.collectionCount()).toNumber();
      const collections: Array<NftCollectionInterface> = [];
      for (let i = 1; i <= collectionsCount; i++) {
        const collectionInf = await getDetailedCollectionInfo(i) as any;
        if (collectionInf) {
          collections.push({...collectionInf, id: i});
        }
      }
      return collections;
    } catch (e) {
      console.log('preset tokens collections error', e);
      return [];
    }
  }, [api]);

  const getTokenImageUrl = useCallback((collection, tokenId) => {
    /* @todo
    То есть чтобы получить картинку по схеме Unique, делаем 3 шага:
    1. Запрашиваем offchainSchema, в которой находим поле "metadata": "https://ipfs-gateway.usetech.com/ipns/QmaMtDqE9nhMX9RQLTpaCboqg7bqkb6Gi67iCKMe8NDpCE/metadata/token{id}"
    2. Подставляем вместо {id} ID токена, запрашиваем получившийся URL.
    3. Получаем JSON с полем image. Получаем картинку по URL из image
     */
    if (collection.offchainSchema.includes('{id}')) {
      return collection.offchainSchema.replace('{id}', `${tokenId}`);
    } else if (collection.offchainSchema.includes('{id')) {
      return collection.offchainSchema.replace('{id', `${tokenId}`);
    }
  }, []);

  return {
    collectionName8Decoder,
    collectionName16Decoder,
    getTokensForSale,
    getTokensOfCollection,
    getTrades,
    getTokenImageUrl,
    getDetailedTokenInfo,
    getDetailedCollectionInfo,
    getDetailedRefungibleTokenInfo,
    presetTokensCollections
  };
}
