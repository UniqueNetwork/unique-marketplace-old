// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

import { useApi } from '@polkadot/react-hooks/useApi';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

// import { normalizeAccountId } from './utils';

export interface TokenDetailsInterface {
  owner?: { Ethereum?: string, Substrate?: string };
  constData?: string;
  variableData?: string;
}

export interface NonFungibleTokenDTO {
  owner?: { ethereum?: string, substrate?: string };
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
      const tokenDetailsDTO: NonFungibleTokenDTO = (await api.query.nonfungible.tokenData(collectionId, tokenId)).toJSON() as NonFungibleTokenDTO;

      return {
        constData: tokenDetailsDTO.constData,
        owner: {
          Ethereum: tokenDetailsDTO?.owner?.ethereum,
          Substrate: tokenDetailsDTO?.owner?.substrate ? encodeAddress(decodeAddress(tokenDetailsDTO.owner.substrate)) : undefined
        },
        variableData: tokenDetailsDTO.variableData
      };
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
    }

    return tokenDetailsData;
  }, [getDetailedTokenInfo]);

  return {
    getDetailedReFungibleTokenInfo,
    getDetailedTokenInfo,
    getTokenInfo
  };
}
