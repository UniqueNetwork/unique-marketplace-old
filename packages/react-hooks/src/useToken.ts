// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useContext } from 'react';

import { StatusContext } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks/useApi';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import { normalizeAccountId } from './utils';

export interface TokenDetailsInterface {
  owner?: { Ethereum?: string, Substrate?: string };
  constData?: string;
  variableData?: string;
}

interface UseTokenInterface {
  getDetailedReFungibleTokenInfo: (collectionId: string, tokenId: string) => Promise<TokenDetailsInterface>;
  getDetailedTokenInfo: (collectionId: string, tokenId: string) => Promise<TokenDetailsInterface>
  getTokenInfo: (collectionInfo: NftCollectionInterface, tokenId: string) => Promise<TokenDetailsInterface>;
}

export function useToken (): UseTokenInterface {
  const { api } = useApi();

  const getDetailedTokenInfo = useCallback(async (collectionId: string, tokenId: string): Promise<TokenDetailsInterface> => {
    if (!api) {
      return {};
    }

    try {
      let tokenDetailsData: TokenDetailsInterface = {};

      const variableData = (await api.rpc.unique.variableMetadata(collectionId, tokenId)).toJSON() as string;
      const constData: string = (await api.rpc.unique.constMetadata(collectionId, tokenId)).toJSON() as string;
      const crossAccount = normalizeAccountId((await api.rpc.unique.tokenOwner(collectionId, tokenId)).toJSON() as string) as { Substrate: string };

      tokenDetailsData = {
        constData,
        owner: crossAccount,
        variableData
      };

      return tokenDetailsData;
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
      return (await api.query.unique.nftItemList(collectionId, tokenId) as unknown as TokenDetailsInterface);
    } catch (e) {
      console.log('getDetailedReFungibleTokenInfo error', e);

      return {};
    }
  }, [api]);

  const getTokenInfo = useCallback(async (collectionInfo: NftCollectionInterface, tokenId: string): Promise<TokenDetailsInterface> => {
    let tokenDetailsData: TokenDetailsInterface = {};

    if (tokenId && collectionInfo) {
      tokenDetailsData = await getDetailedTokenInfo(collectionInfo.id, tokenId);

      console.log('tokenDetailsData', tokenDetailsData);
    }

    return tokenDetailsData;
  }, [getDetailedTokenInfo]);

  return {
    getDetailedReFungibleTokenInfo,
    getDetailedTokenInfo,
    getTokenInfo
  };
}
