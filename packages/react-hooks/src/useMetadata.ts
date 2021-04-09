// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef } from 'react';

import { MetadataType,
  NftCollectionInterface,
  TokenDetailsInterface,
  useCollections } from '@polkadot/react-hooks/useCollections';
import { useDecoder } from '@polkadot/react-hooks/useDecoder';
import { AttributesDecoded } from '@polkadot/react-hooks/useSchema';
import { TypeRegistry } from '@polkadot/types';

interface UseMetadataInterface {
  decodeStruct: ({ attr, data }: { attr?: any, data?: string }) => AttributesDecoded;
  encodeStruct: ({ attr, data }: { attr?: any, data?: string }) => string;
  getOnChainSchema: (collectionInfo: NftCollectionInterface) => { attributesConst: string, attributesVar: string };
  getTokenAttributes: (collectionInfo: NftCollectionInterface, tokenId: string) => Promise<AttributesDecoded>;
  getTokenImageUrl: (collectionInfo: NftCollectionInterface, tokenId: string) => Promise<string>;
  setUnique: (collectionInfo: NftCollectionInterface, tokenId: string) => Promise<string>;
  tokenImageUrl: (urlString: string, tokenId: string) => string;
}

/* const testSchema = `{
  "Gender": {
    "_enum": {
      "Male": null,
      "Female": null
    }
  },
  "Trait": {
    "_enum": {
      "Black Lipstick": null,
      "Red Lipstick": null,
      "Smile": null,
      "Teeth Smile": null,
      "Purple Lipstick": null,
      "Nose Ring": null,
      "Asian Eyes": null,
      "Sun Glasses": null,
      "Red Glasses": null,
      "Round Eyes": null,
      "Left Earring": null,
      "Right Earring": null,
      "Two Earrings": null,
      "Brown Beard": null,
      "Mustache-Beard": null,
      "Mustache": null,
      "Regular Beard": null,
      "Up Hair": null,
      "Down Hair": null,
      "Mahawk": null,
      "Red Mahawk": null,
      "Orange Hair": null,
      "Bubble Hair": null,
      "Emo Hair": null,
      "Thin Hair": null,
      "Bald": null,
      "Blonde Hair": null,
      "Caret Hair": null,
      "Pony Tails": null,
      "Cigar": null,
      "Pipe": null
    }
  },
  "root": {
    "Gender": "Gender",
    "Traits": "Vec<Trait>",
    "ImageHash": "Bytes"
  }
}`; */

export const useMetadata = (localRegistry?: TypeRegistry): UseMetadataInterface => {
  const { hex2a } = useDecoder();
  const cleanup = useRef<boolean>(false);
  const { getDetailedReFungibleTokenInfo, getDetailedTokenInfo } = useCollections();

  // TypeRegistry from ConstOnChainData, createType - from TypeRegistry

  const encodeStruct = useCallback(({ attr, data }: { attr?: any, data?: string }): string => {
    if (attr && data && localRegistry) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        localRegistry.register(JSON.parse(attr));

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore {"Gender":"Female","Traits":["Smile"], "ImageHash": "123123"}
        return localRegistry.createType('root', JSON.parse(data)).toHex();;
      } catch (e) {
        console.log('encodeStruct error', e);
      }
    }

    return '';
  }, [localRegistry]);

  const decodeStruct = useCallback(({ attr, data }: { attr?: any, data?: string }): AttributesDecoded => {
    if (attr && data && localRegistry) {
      try {
        localRegistry.register(JSON.parse(attr));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const attributesDecoded: { [key: string]: string } = localRegistry.createType('root', data).toJSON() as { [key: string]: string };

        for (const attr in attributesDecoded) {
          if (attr.toLocaleLowerCase().includes('str')) {
            attributesDecoded[attr] = hex2a(attributesDecoded[attr]);
          }
        }

        return attributesDecoded;
      } catch (e) {
        console.log('decodeStruct error', e);
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

  // uses for token image path
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
      console.log('collection ConstOnChainSchema', collectionInf.ConstOnChainSchema);
      console.log('collection VariableOnChainSchema', hex2a(collectionInf.VariableOnChainSchema));

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
      ...decodeStruct({ attr: onChainSchema.attributesConst, data: tokenDetails?.ConstData }),
      ...decodeStruct({ attr: onChainSchema.attributesVar, data: tokenDetails?.VariableData })
    };
  }, [getOnChainSchema, getTokenDetails, decodeStruct]);

  useEffect(() => {
    return () => {
      cleanup.current = true;
    };
  }, []);

  return {
    decodeStruct,
    encodeStruct,
    getOnChainSchema,
    getTokenAttributes,
    getTokenImageUrl,
    setUnique,
    tokenImageUrl
  };
};
