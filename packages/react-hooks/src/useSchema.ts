// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenAttribute, TokenDetailsInterface } from '@polkadot/react-hooks/useCollections';

import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';

import { MetadataType, NftCollectionInterface, useCollections, useDecoder } from '@polkadot/react-hooks';

export type Attributes = TokenAttribute[];

export function useSchema (account: string, collectionId: string | number, tokenId: string | number) {
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface>();
  const [reFungibleBalance, setReFungibleBalance] = useState<number>(0);
  const [tokenUrl, setTokenUrl] = useState<string>('');
  const [attributesConst, setAttributesConst] = useState<TokenAttribute>();
  const [attributesVar, setAttributesVar] = useState<TokenAttribute>();
  const [attributes, setAttributes] = useState<{ [key: string]: string }>();
  const [tokenDetails, setTokenDetails] = useState<TokenDetailsInterface>();
  const [tokenVarData, setTokenVarData] = useState<string>();
  const [tokenConstData, setTokenConstData] = useState<string>();
  const { getDetailedCollectionInfo, getDetailedReFungibleTokenInfo, getDetailedTokenInfo } = useCollections();
  const { collectionName8Decoder } = useDecoder();

  const tokenImageUrl = useCallback((tokenId: string, urlString: string): string => {
    if (urlString.indexOf('{id}') !== -1) {
      return urlString.replace('{id}', tokenId);
    }

    return '';
  }, []);

  const convertOnChainMetadata = useCallback((data: string): TokenAttribute => {
    try {
      if (data && data.length) {
        return JSON.parse(data) as TokenAttribute;
      }
    } catch (e) {
      console.log('schema json parse error', e);
    }

    return {};
  }, []);

  const getReFungibleDetails = useCallback(() => {
    try {
      if (tokenDetails?.Owner) {
        if (collectionInfo?.Mode.isReFungible) {
          const owner = tokenDetails.Owner.find((item: { fraction: BN, owner: string }) => item.owner.toString() === account) as { fraction: BN, owner: string } | undefined;

          if (typeof collectionInfo.DecimalPoints === 'number') {
            const balance = owner && owner.fraction.toNumber() / Math.pow(10, collectionInfo.DecimalPoints);

            setReFungibleBalance(balance || 0);
          }
        }
      }
    } catch (e) {
      console.error('token balance calculation error', e);
    }
  }, [account, collectionInfo?.DecimalPoints, collectionInfo?.Mode.isReFungible, tokenDetails?.Owner]);

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

  const mergeData = useCallback(({ attr, data }: { attr?: TokenAttribute, data?: string }) => {
    const tokenAttributes: {[key: string]: any} = {};

    if (attr && data && Object.keys(attr).length) {
      Object.keys(attr).forEach((attrKey) => {
        if (attr[attrKey].type === 'enum') {
          tokenAttributes[attrKey] = attr[attrKey].values[parseInt(data, 10)];
        } else if (attr[attrKey].type === 'number' || attr[attrKey].type === 'string') {
          tokenAttributes[attrKey] = data;
        }
      });
    }

    return tokenAttributes;
  }, []);

  const mergeTokenAttributes = useCallback(() => {
    const tokenAttributes = {
      ...mergeData({ attr: attributesConst, data: tokenConstData }),
      ...mergeData({ attr: attributesVar, data: tokenVarData })
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

  useEffect(() => {
    void getReFungibleDetails();
  }, [getReFungibleDetails]);

  return {
    attributes,
    attributesConst,
    attributesVar,
    collectionInfo,
    getCollectionInfo,
    reFungibleBalance,
    tokenConstData,
    tokenDetails,
    tokenUrl,
    tokenVarData
  };
}
