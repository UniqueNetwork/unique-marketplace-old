// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataType, NftCollectionInterface, TokenAttribute, TokenDetailsInterface } from '@polkadot/react-hooks/useCollections';

import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Metadata } from '@polkadot/metadata';
import metaStatic from '@polkadot/metadata/static';
import { useCollections, useDecoder } from '@polkadot/react-hooks';
import { TypeRegistry } from '@polkadot/types';

export type Attributes = TokenAttribute[];

type RootSchemaType = {
  'Gender': {
    '_enum': {
      [key: string]: null
    }
  },
  'Trait': {
    '_enum': {
      [key: string]: null
    }
  },
  'Root': {
    'Gender': 'Gender',
    'Traits': 'Vec<Trait>'
  }
};

type AttributesDecoded = {
  [key: string]: string | string[],
}

/* const defaultData: RootSchemaType = {
  Gender: {
    _enum: {
      Female: null,
      Male: null
    }
  },
  Root: {
    Gender: 'Gender',
    Traits: 'Vec<Trait>'
  },
  Trait: {
    _enum: {
      'Black Lipstick': null,
      'Red Lipstick': null,
      Smile: null,
      'Teeth Smile': null,
      // eslint-disable-next-line sort-keys
      'Purple Lipstick': null,
      // eslint-disable-next-line sort-keys
      'Nose Ring': null,
      // eslint-disable-next-line sort-keys
      'Asian Eyes': null,
      'Sun Glasses': null,
      // eslint-disable-next-line sort-keys
      'Red Glasses': null,
      'Round Eyes': null,
      // eslint-disable-next-line sort-keys
      'Left Earring': null,
      'Right Earring': null,
      'Two Earrings': null,
      // eslint-disable-next-line sort-keys
      'Brown Beard': null,
      'Mustache-Beard': null,
      // eslint-disable-next-line sort-keys
      Mustache: null,
      'Regular Beard': null,
      'Up Hair': null,
      // eslint-disable-next-line sort-keys
      'Down Hair': null,
      Mahawk: null,
      'Red Mahawk': null,
      // eslint-disable-next-line sort-keys
      'Orange Hair': null,
      // eslint-disable-next-line sort-keys
      'Bubble Hair': null,
      'Emo Hair': null,
      'Thin Hair': null,
      // eslint-disable-next-line sort-keys
      Bald: null,
      'Blonde Hair': null,
      'Caret Hair': null,
      'Pony Tails': null,
      // eslint-disable-next-line sort-keys
      Cigar: null,
      Pipe: null
    }
  }
}; */

export function useSchema (account: string, collectionId: string, tokenId: string | number) {
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface>();
  const [reFungibleBalance, setReFungibleBalance] = useState<number>(0);
  const [tokenUrl, setTokenUrl] = useState<string>('');
  const [attributesConst, setAttributesConst] = useState<TypeRegistry>();
  const [attributesVar, setAttributesVar] = useState<TypeRegistry>();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [attributes, setAttributes] = useState<any>();
  const [tokenDetails, setTokenDetails] = useState<TokenDetailsInterface>();
  const [tokenVarData, setTokenVarData] = useState<number[]>();
  const [tokenConstData, setTokenConstData] = useState<number[]>();
  const { getDetailedCollectionInfo, getDetailedReFungibleTokenInfo, getDetailedTokenInfo } = useCollections();
  const { collectionName8Decoder } = useDecoder();

  const tokenImageUrl = useCallback((urlString: string, tokenId: string): string => {
    if (urlString.indexOf('{id}') !== -1) {
      return urlString.replace('{id}', tokenId);
    }

    return '';
  }, []);

  const registryMeta = useMemo(() => {
    const registry = new TypeRegistry();
    const metadata = new Metadata(registry, metaStatic);

    return metadata;
  }, []);

  const convertOnChainMetadata = useCallback((data: string): TypeRegistry => {
    const registry = new TypeRegistry();

    try {
      registry.setMetadata(registryMeta);

      const tokenSchema: RootSchemaType = JSON.parse(data) as RootSchemaType;

      registry.register(tokenSchema);
    } catch (e) {
      console.log('schema json parse error', e);
    }

    return registry;
  }, [registryMeta]);

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
    try {
      const collectionMetadata = JSON.parse(collectionName8Decoder(collectionInfo.OffchainSchema)) as MetadataType;
      const dataUrl = tokenImageUrl(collectionMetadata.metadata, tokenId.toString());
      const urlResponse = await fetch(dataUrl);
      const jsonData = await urlResponse.json() as { image: string };

      setTokenUrl(jsonData.image);
    } catch (e) {
      console.error('metadata parse error', e);
    }
  }, [collectionName8Decoder, tokenId, tokenImageUrl]);

  // how to parse Off Chain Schema
  const setOffChainSchema = useCallback(() => {
    if (collectionInfo) {
      if (collectionInfo.SchemaVersion.isImageUrl) {
        setTokenUrl(tokenImageUrl(collectionName8Decoder(collectionInfo.OffchainSchema), tokenId.toString()));
      } else {
        void setUnique(collectionInfo);
      }
    }
  }, [collectionInfo, collectionName8Decoder, setUnique, tokenId, tokenImageUrl]);

  const setOnChainSchema = useCallback(() => {
    if (collectionInfo) {
      setAttributesConst(convertOnChainMetadata(collectionName8Decoder(collectionInfo.ConstOnChainSchema)));
      setAttributesVar(convertOnChainMetadata(collectionName8Decoder(collectionInfo.VariableOnChainSchema)));
    }
  }, [collectionInfo, collectionName8Decoder, convertOnChainMetadata]);

  const getCollectionInfo = useCallback(async () => {
    if (collectionId) {
      const info: NftCollectionInterface = await getDetailedCollectionInfo(collectionId) as unknown as NftCollectionInterface;

      setCollectionInfo({
        ...info,
        ConstOnChainSchema: info.ConstOnChainSchema,
        VariableOnChainSchema: info.VariableOnChainSchema,
        id: collectionId
      });
    }
  }, [collectionId, getDetailedCollectionInfo]);

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
        setTokenConstData(tokenDetailsData.ConstData);
      }

      if (tokenDetailsData.VariableData) {
        setTokenVarData(tokenDetailsData.VariableData);
      }
    }
  }, [collectionId, collectionInfo, getDetailedTokenInfo, getDetailedReFungibleTokenInfo, tokenId]);

  const mergeData = useCallback(({ attr, data }: { attr?: TypeRegistry, data?: number[] }): AttributesDecoded => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const decoder = attr.createType('Root', data);

      return decoder.toJSON() as AttributesDecoded; // {Gender: "Female", Traits: ["Smile"]}
    } catch (e) {
      console.log('mergeData error', e);
    }

    return {};
  }, []);

  const mergeTokenAttributes = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const tokenAttributes: any = {
      ...mergeData({ attr: attributesConst, data: tokenConstData }),
      ...mergeData({ attr: attributesVar, data: tokenVarData })
    };

    setAttributes(tokenAttributes);
  }, [attributesConst, attributesVar, mergeData, tokenConstData, tokenVarData]);

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
    mergeTokenAttributes();
  }, [mergeTokenAttributes]);

  useEffect(() => {
    void getReFungibleDetails();
  }, [getReFungibleDetails]);

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    attributes,
    attributesConst,
    attributesVar,
    collectionInfo,
    getCollectionInfo,
    getTokenDetails,
    reFungibleBalance,
    tokenConstData,
    tokenDetails,
    tokenUrl,
    tokenVarData
  };
}
