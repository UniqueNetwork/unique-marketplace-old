// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { MetadataType, NftCollectionInterface, useCollections } from '@polkadot/react-hooks';
import { TokenDetailsInterface } from '@polkadot/react-hooks/useCollections';

import useDecoder from './useDecoder';

/*
    {
        [
            {"Trait 1":
                {
                    "type": "enum",
                    "size": 1,
                    "values": ["Black Lipstick","Red Lipstick","Smile","Teeth Smile","Purple Lipstick","Nose Ring","Asian Eyes","Sun Glasses","Red Glasses","Round Eyes","Left Earring","Right Earring","Two Earrings","Brown Beard","Mustache-Beard","Mustache","Regular Beard","Up Hair","Down Hair","Mahawk","Red Mahawk","Orange Hair","Bubble Hair","Emo Hair","Thin Hair","Bald","Blonde Hair","Caret Hair","Pony Tails","Cigar","Pipe"]
                }
            }
        ]
    }
*/

export type TokenAttribute = {
  [key: string]: {
    type: number | string | 'enum';
    size: number;
    values: string[];
  }
}

export type Attributes = TokenAttribute[];

export default function useSchema (collectionId: string | number, tokenId: string | number) {
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface>();
  const [tokenUrl, setTokenUrl] = useState<string>('');
  const [attributesConst, setAttributesConst] = useState<{ [key: string]: string }>();
  const [attributesVar, setAttributesVar] = useState<{ [key: string]: string }>();
  const [attributes, setAttributes] = useState<{ [key: string]: string }>();
  const [tokenDetails, setTokenDetails] = useState<TokenDetailsInterface>();
  const [tokenVarData, setTokenVarData] = useState<string>();
  const [tokenConstData, setTokenConstData] = useState<string>();
  const { getDetailedCollectionInfo, getDetailedTokenInfo, getDetailedReFungibleTokenInfo } = useCollections();
  const { collectionName8Decoder } = useDecoder();

  const tokenImageUrl = useCallback((tokenId: string, urlString: string): string => {
    if (urlString.indexOf('{id}') !== -1) {
      return urlString.replace('{id}', tokenId);
    }

    return '';
  }, []);

  const convertOnChainMetadata = useCallback((data: string) => {
    try {
      if (data && data.length) {
        return JSON.parse(data) as { [key: string]: string };
      }
    } catch (e) {
      console.log('schema json parse error', e);
    }

    return {};
  }, []);

  const setUnique = useCallback(async (collectionInfo: NftCollectionInterface) => {
    const dataUrl = tokenImageUrl((collectionInfo.OffchainSchema as MetadataType).metadata, tokenId.toString());
    const urlResponse = await fetch(dataUrl);
    const jsonData = await urlResponse.json() as { image: string };

    setTokenUrl(jsonData.image);
  }, [tokenId, tokenImageUrl]);

  const setSchema = useCallback(() => {
    if (collectionInfo) {
      switch (collectionInfo.SchemaVersion) {
        case 'ImageURL':
          setTokenUrl(tokenImageUrl(collectionInfo.OffchainSchema as string, tokenId.toString()));
          break;
        case 'Unique':
          void setUnique(collectionInfo);
          break;
        default:
          break;
      }

      setAttributesConst(convertOnChainMetadata(collectionInfo.ConstOnChainSchema));
      setAttributesVar(convertOnChainMetadata(collectionInfo.VariableOnChainSchema));
    }
  }, [collectionInfo, convertOnChainMetadata, setUnique, tokenId, tokenImageUrl]);

  const getCollectionInfo = useCallback(async () => {
    if (collectionId) {
      const info: NftCollectionInterface = await getDetailedCollectionInfo(collectionId) as unknown as NftCollectionInterface;

      setCollectionInfo({
        ...info,
        ConstOnChainSchema: collectionName8Decoder(info.ConstOnChainSchema),
        VariableOnChainSchema: collectionName8Decoder(info.VariableOnChainSchema)
      });
    }
  }, [collectionId, collectionName8Decoder, getDetailedCollectionInfo]);

  const getTokenDetails = useCallback(async () => {
    if (collectionId && tokenId && collectionInfo) {
      let tokenDetailsData: TokenDetailsInterface = {};

      if (collectionInfo.Mode.isNft) {
        tokenDetailsData = await getDetailedTokenInfo(collectionId.toString(), tokenId.toString());
      } else if (collectionInfo.Mode.isReFungible) {
        tokenDetailsData = await getDetailedReFungibleTokenInfo(collectionId.toString(), tokenId.toString());
      }

      setTokenDetails(tokenDetailsData);

      if (tokenDetailsData.ConstData) {
        setTokenConstData(collectionName8Decoder(tokenDetailsData.ConstData));
      }

      if (tokenDetailsData.VariableData) {
        setTokenVarData(collectionName8Decoder(tokenDetailsData.VariableData));
      }
    }
  }, [collectionId, collectionInfo, collectionName8Decoder, getDetailedTokenInfo, getDetailedReFungibleTokenInfo, tokenId]);

  const mergeData = useCallback((attrs: {[key: string]: { type: string, values: { [key: string]: string } }}, data: string) => {
    const tokenAttributes: {[key: string]: any} = {};

    if (attrs && data && Object.keys(attrs).length) {
      Object.keys(attrs).forEach((attrKey) => {
        if (attrs[attrKey].type === 'enum') {
          tokenAttributes[attrKey] = attrs[attrKey].values[data];
        } else if (attrs[attrKey].type === 'number' || attrs[attrKey].type === 'string') {
          tokenAttributes[attrKey] = data;
        }
      });
    }

    return tokenAttributes;
  }, []);

  const mergeTokenAttributes = useCallback(() => {
    const tokenAttributes = {
      ...mergeData(attributesConst, tokenConstData),
      ...mergeData(attributesVar, tokenVarData)
    };

    setAttributes(tokenAttributes);
  }, [attributesConst, attributesVar, mergeData, tokenConstData, tokenVarData]);

  useEffect(() => {
    if (collectionInfo) {
      void setSchema();
      void getTokenDetails();
    }
  }, [collectionInfo, getTokenDetails, setSchema]);

  useEffect(() => {
    void getCollectionInfo();
  }, [getCollectionInfo]);

  useEffect(() => {
    mergeTokenAttributes();
  }, [mergeTokenAttributes]);

  return {
    attributes,
    attributesConst,
    attributesVar,
    collectionInfo,
    tokenConstData,
    tokenDetails,
    tokenUrl,
    tokenVarData
  };
}
