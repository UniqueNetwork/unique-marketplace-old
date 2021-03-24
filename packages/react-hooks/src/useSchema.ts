// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataType, NftCollectionInterface, TokenDetailsInterface } from '@polkadot/react-hooks/useCollections';

import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';

import { useCollections, useDecoder } from '@polkadot/react-hooks';
import { Struct, TypeRegistry } from '@polkadot/types';

// export type Attributes = TokenAttribute[];

type AttributesDecoded = {
  [key: string]: string | string[],
}

interface UseSchemaInterface {
  attributes?: AttributesDecoded;
  attributesConst?: string;
  attributesVar?: string;
  collectionInfo?: NftCollectionInterface;
  getCollectionInfo: () => void;
  getTokenDetails: () => void;
  reFungibleBalance: number;
  tokenDetails?: TokenDetailsInterface;
  tokenUrl: string;
}

export function useSchema (account: string, collectionId: string, tokenId: string | number, localRegistry?: TypeRegistry): UseSchemaInterface {
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface>();
  const [reFungibleBalance, setReFungibleBalance] = useState<number>(0);
  const [tokenUrl, setTokenUrl] = useState<string>('');
  const [attributesConst, setAttributesConst] = useState<string>();
  const [attributesVar, setAttributesVar] = useState<string>();
  const [attributes, setAttributes] = useState<AttributesDecoded>();
  const [tokenDetails, setTokenDetails] = useState<TokenDetailsInterface>();
  const { getDetailedCollectionInfo, getDetailedReFungibleTokenInfo, getDetailedTokenInfo } = useCollections();
  const { hex2a } = useDecoder();

  const tokenImageUrl = useCallback((urlString: string, tokenId: string): string => {
    if (urlString.indexOf('{id}') !== -1) {
      return urlString.replace('{id}', tokenId);
    }

    return '';
  }, []);

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

  const getReFungibleDetails = useCallback(() => {
    try {
      if (tokenDetails?.Owner) {
        if (Object.prototype.hasOwnProperty.call(collectionInfo?.Mode, 'reFungible')) {
          const owner = tokenDetails.Owner.find((item: { fraction: BN, owner: string }) => item.owner.toString() === account) as { fraction: BN, owner: string } | undefined;

          if (typeof collectionInfo?.DecimalPoints === 'number') {
            const balance = owner && owner.fraction.toNumber() / Math.pow(10, collectionInfo.DecimalPoints);

            setReFungibleBalance(balance || 0);
          }
        }
      }
    } catch (e) {
      console.error('token balance calculation error', e);
    }
  }, [account, collectionInfo, tokenDetails?.Owner]);

  const setUnique = useCallback(async (collectionInfo: NftCollectionInterface) => {
    try {
      const collectionMetadata = JSON.parse(hex2a(collectionInfo.OffchainSchema)) as MetadataType;

      if (collectionMetadata.metadata) {
        const dataUrl = tokenImageUrl(collectionMetadata.metadata, tokenId.toString());
        const urlResponse = await fetch(dataUrl);
        const jsonData = await urlResponse.json() as { image: string };

        setTokenUrl(jsonData.image);
      }
    } catch (e) {
      console.log('image metadata parse error', e);
    }
  }, [hex2a, tokenId, tokenImageUrl]);

  // how to parse Off Chain Schema
  const setOffChainSchema = useCallback(() => {
    if (collectionInfo) {
      if (collectionInfo.SchemaVersion.isImageUrl) {
        setTokenUrl(tokenImageUrl(hex2a(collectionInfo.OffchainSchema), tokenId.toString()));
      } else {
        void setUnique(collectionInfo);
      }
    }
  }, [collectionInfo, hex2a, setUnique, tokenId, tokenImageUrl]);

  const setOnChainSchema = useCallback(() => {
    if (collectionInfo) {
      setAttributesConst(hex2a(collectionInfo.ConstOnChainSchema));
      setAttributesVar(hex2a(collectionInfo.VariableOnChainSchema));
    }
  }, [collectionInfo, hex2a]);

  const getCollectionInfo = useCallback(async () => {
    if (collectionId) {
      const info: NftCollectionInterface = await getDetailedCollectionInfo(collectionId) as unknown as NftCollectionInterface;

      if (info && Object.keys(info).length) {
        setCollectionInfo({
          ...info,
          id: collectionId
        });
      }
    }
  }, [collectionId, getDetailedCollectionInfo]);

  const getTokenDetails = useCallback(async () => {
    if (collectionId && tokenId && collectionInfo) {
      let tokenDetailsData: TokenDetailsInterface = {};

      if (Object.prototype.hasOwnProperty.call(collectionInfo.Mode, 'nft')) {
        tokenDetailsData = await getDetailedTokenInfo(collectionId.toString(), tokenId.toString());
      } else if (Object.prototype.hasOwnProperty.call(collectionInfo.Mode, 'reFungible')) {
        tokenDetailsData = await getDetailedReFungibleTokenInfo(collectionId.toString(), tokenId.toString());
      }

      setTokenDetails(tokenDetailsData);
    }
  }, [collectionId, collectionInfo, getDetailedTokenInfo, getDetailedReFungibleTokenInfo, tokenId]);

  const mergeTokenAttributes = useCallback(() => {
    const tokenAttributes: any = {
      ...mergeData({ attr: attributesConst, data: tokenDetails?.ConstData }),
      ...mergeData({ attr: attributesVar, data: tokenDetails?.VariableData })
    };

    setAttributes(tokenAttributes);
  }, [attributesConst, attributesVar, mergeData, tokenDetails]);

  useEffect(() => {
    if (collectionInfo) {
      void setOnChainSchema();
      void setOffChainSchema();
      void getTokenDetails();
    }
  }, [collectionInfo, getTokenDetails, setOffChainSchema, setOnChainSchema]);

  useEffect(() => {
    void getCollectionInfo();
  }, [getCollectionInfo]);

  useEffect(() => {
    if (collectionInfo && tokenDetails && !attributes) {
      mergeTokenAttributes();
    }
  }, [attributes, collectionInfo, mergeTokenAttributes, tokenDetails]);

  useEffect(() => {
    void getReFungibleDetails();
  }, [getReFungibleDetails]);

  return {
    attributes,
    attributesConst,
    attributesVar,
    collectionInfo,
    getCollectionInfo,
    getTokenDetails,
    reFungibleBalance,
    tokenDetails,
    tokenUrl
  };
}
