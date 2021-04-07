// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef } from 'react';

import { MetadataType,
  NftCollectionInterface,
  TokenDetailsInterface,
  useCollections } from '@polkadot/react-hooks/useCollections';
import { useDecoder } from '@polkadot/react-hooks/useDecoder';
import { AttributesDecoded } from '@polkadot/react-hooks/useSchema';
import { Struct, TypeRegistry } from '@polkadot/types';

interface UseMetadataInterface {
  getOnChainSchema: (collectionInfo: NftCollectionInterface) => { attributesConst: string, attributesVar: string };
  getTokenAttributes: (collectionInfo: NftCollectionInterface, tokenId: string) => Promise<AttributesDecoded>;
  getTokenImageUrl: (collectionInfo: NftCollectionInterface, tokenId: string) => Promise<string>;
  mergeData: ({ attr, data }: { attr?: any, data?: string }) => AttributesDecoded;
  setUnique: (collectionInfo: NftCollectionInterface, tokenId: string) => Promise<string>;
  tokenImageUrl: (urlString: string, tokenId: string) => string;
}

export const useMetadata = (localRegistry?: TypeRegistry): UseMetadataInterface => {
  const { hex2a } = useDecoder();
  const cleanup = useRef<boolean>(false);
  const { getDetailedReFungibleTokenInfo, getDetailedTokenInfo } = useCollections();

  const mergeData = useCallback(({ attr, data }: { attr?: any, data?: string }): AttributesDecoded => {
    if (attr && data && localRegistry) {
      try {
        const s = new Struct(localRegistry, (JSON.parse(attr) as { root: any }).root, data);
        const attributesDecoded = JSON.parse(s.toString()) as AttributesDecoded;

        for (const attr in attributesDecoded) {
          if (attr.toLocaleLowerCase().includes('str')) {
            attributesDecoded[attr] = hex2a(attributesDecoded[attr] as string);
          }
        }

        return attributesDecoded;
      } catch (e) {
        console.log('mergeData error', e);
      }
    }

    return {};
  }, [hex2a, localRegistry]);

  const tokenImageUrl = useCallback((urlString: string, tokenId: string): string => {
    if (urlString.indexOf('{id}') !== -1) {
      return urlString.replace('{id}', tokenId);
    }

    return '';
  }, []);

  const setUnique = useCallback(async (collectionInfo: NftCollectionInterface, tokenId: string): Promise<string> => {
    try {
      const collectionMetadata = JSON.parse(hex2a(collectionInfo.OffchainSchema)) as MetadataType;

      if (collectionMetadata.metadata) {
        const dataUrl = tokenImageUrl(collectionMetadata.metadata, tokenId);
        const urlResponse = await fetch(dataUrl);
        const jsonData = await urlResponse.json() as { image: string };

        if (cleanup.current) {
          return '';
        }

        return jsonData.image;
      }
    } catch (e) {
      console.log('image metadata parse error', e);
    }

    return '';
  }, [hex2a, tokenImageUrl]);

  const getTokenImageUrl = useCallback(async (collectionInfo: NftCollectionInterface, tokenId: string): Promise<string> => {
    if (collectionInfo) {
      if (collectionInfo.SchemaVersion.isImageUrl) {
        return tokenImageUrl(hex2a(collectionInfo.OffchainSchema), tokenId);
      } else {
        return await setUnique(collectionInfo, tokenId);
      }
    }

    return '';
  }, [hex2a, setUnique, tokenImageUrl]);

  const getOnChainSchema = useCallback((collectionInf: NftCollectionInterface): { attributesConst: string, attributesVar: string } => {
    if (collectionInf) {
      return {
        attributesConst: hex2a(collectionInf.ConstOnChainSchema),
        attributesVar: hex2a(collectionInf.VariableOnChainSchema)
      };
    }

    return {
      attributesConst: '',
      attributesVar: ''
    };
  }, [hex2a]);

  const getTokenDetails = useCallback(async (collectionInfo: NftCollectionInterface, tokenId: string) => {
    let tokenDetailsData: TokenDetailsInterface = {};

    if (tokenId && collectionInfo) {
      if (Object.prototype.hasOwnProperty.call(collectionInfo.Mode, 'nft')) {
        tokenDetailsData = await getDetailedTokenInfo(collectionInfo.id, tokenId.toString());
      } else if (Object.prototype.hasOwnProperty.call(collectionInfo.Mode, 'reFungible')) {
        tokenDetailsData = await getDetailedReFungibleTokenInfo(collectionInfo.id, tokenId.toString());
      }

      if (cleanup.current) {
        return tokenDetailsData;
      }
    }

    return tokenDetailsData;
  }, [getDetailedTokenInfo, getDetailedReFungibleTokenInfo]);

  const getTokenAttributes = useCallback(async (collectionInfo: NftCollectionInterface, tokenId: string): Promise<AttributesDecoded> => {
    const onChainSchema = getOnChainSchema(collectionInfo);
    const tokenDetails = await getTokenDetails(collectionInfo, tokenId);

    return {
      ...mergeData({ attr: onChainSchema.attributesConst, data: tokenDetails?.ConstData }),
      ...mergeData({ attr: onChainSchema.attributesVar, data: tokenDetails?.VariableData })
    };
  }, [getOnChainSchema, getTokenDetails, mergeData]);

  useEffect(() => {
    return () => {
      cleanup.current = true;
    };
  }, []);

  return {
    getOnChainSchema,
    getTokenAttributes,
    getTokenImageUrl,
    mergeData,
    setUnique,
    tokenImageUrl
  };
};
