// Copyright 2017-2021 @polkadot/react-hooks, useTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState, useCallback } from 'react';
import { useCollections, NftCollectionInterface, MetadataType } from '@polkadot/react-hooks';
import useDecoder from './useDecoder';
import { TokenDetailsInterface } from '@polkadot/react-hooks/useCollections';

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
  const [attributesConst, setAttributesConst] = useState<any>();
  const [attributesVar, setAttributesVar] = useState<any>();
  const [attributes, setAttributes] = useState<any>();
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
        return JSON.parse(data);
      } else {
        return {};
      }
    } catch (e) {
      console.log('schema json parse error', e);
    }
  }, []);

  const setSchema = useCallback(async () => {

    if (collectionInfo) {
      switch (collectionInfo.SchemaVersion) {
        case 'ImageURL':
          setTokenUrl(tokenImageUrl(collectionInfo.OffchainSchema as string, tokenId.toString()));
          break;
        case 'Unique':
          const dataUrl = tokenImageUrl((collectionInfo.OffchainSchema as MetadataType).metadata, tokenId.toString());
          const urlResponse = await fetch(dataUrl);
          const jsonData = await urlResponse.json() as { image: string };
          setTokenUrl(jsonData.image);
          break;
        default:
          break;
      }

      setAttributesConst(convertOnChainMetadata(collectionInfo.ConstOnChainSchema));
      setAttributesVar(convertOnChainMetadata(collectionInfo.VariableOnChainSchema));
    }
  }, [collectionInfo]);

  const getCollectionInfo = useCallback(async () => {
    if (collectionId) {
      const info: NftCollectionInterface = await getDetailedCollectionInfo(collectionId) as unknown as NftCollectionInterface;

      setCollectionInfo({
        ...info,
        ConstOnChainSchema: collectionName8Decoder(info.ConstOnChainSchema),
        VariableOnChainSchema: collectionName8Decoder(info.VariableOnChainSchema),
      });
    }
  }, []);

  const getTokenDetails = useCallback(async () => {
    if (collectionId && tokenId && collectionInfo) {
      let tokenDetailsData: TokenDetailsInterface = {};
      if (collectionInfo.Mode.isNft) {
        tokenDetailsData = (await getDetailedTokenInfo(collectionId.toString(), tokenId.toString())) as TokenDetailsInterface;
      } else if (collectionInfo.Mode.isReFungible) {
        tokenDetailsData = (await getDetailedReFungibleTokenInfo(collectionId.toString(), tokenId.toString())) as TokenDetailsInterface;
      }
      setTokenDetails(tokenDetailsData);
      if (tokenDetailsData.ConstData) {
        setTokenConstData(collectionName8Decoder(tokenDetailsData.ConstData));
      }
      if (tokenDetailsData.VariableData) {
        setTokenVarData(collectionName8Decoder(tokenDetailsData.VariableData));
      }
    }
  }, [collectionId, collectionInfo, getDetailedTokenInfo, getDetailedReFungibleTokenInfo, tokenId]);

  const mergeData = useCallback((attrs, data) => {
    const tokenAttributes: {[key: string]: any} = {};
    if (attrs && data && Object.keys(attrs).length) {
      Object.keys(attrs).forEach((attrKey) => {
        if (attrs[attrKey].type === 'enum') {
          tokenAttributes[attrKey] = attrs[attrKey].values[data];
        } else if (attrs[attrKey].type === 'number' || attrs[attrKey].type === 'string') {
          tokenAttributes[attrKey] = data;
        }
      })
    }
    return tokenAttributes;
  }, []);

  const mergeTokenAttributes = useCallback(() => {
    const tokenAttributes = {
      ...mergeData(attributesConst, tokenConstData),
      ...mergeData(attributesVar, tokenVarData)
    };
    setAttributes(tokenAttributes);
  }, [attributesConst, attributesVar, tokenConstData, tokenVarData]);

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
    tokenUrl,
    tokenConstData,
    tokenDetails,
    tokenVarData
  };
}
