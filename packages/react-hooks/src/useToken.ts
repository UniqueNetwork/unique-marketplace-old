// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

import { useApi } from '@polkadot/react-hooks/useApi';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollections';

export interface TokenDetailsInterface {
  Owner?: any[];
  ConstData?: string;
  VariableData?: string;
}

export function useToken () {
  const { api } = useApi();
  // const createData = {nft: {const_data: [], variable_data: []}};
  // tx = api.tx.nft.createItem(collectionId, owner, createData);
  // setVariableMetaData(collection_id, item_id, data)

  const getDetailedTokenInfo = useCallback(async (collectionId: string, tokenId: string): Promise<TokenDetailsInterface> => {
    if (!api) {
      return {};
    }

    try {
      return (await api.query.nft.nftItemList(collectionId, tokenId)).toJSON() as unknown as TokenDetailsInterface;
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

  return {
    getDetailedReFungibleTokenInfo,
    getDetailedTokenInfo,
    getTokenInfo
  };
}
