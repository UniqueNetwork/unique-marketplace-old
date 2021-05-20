// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';
import type { TokenDetailsInterface } from '@polkadot/react-hooks/useToken';

import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useMetadata, useToken } from '@polkadot/react-hooks';
import { useCollection } from '@polkadot/react-hooks/useCollection';

export type AttributesDecoded = {
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
  tokenName: { name: string, value: string } | null;
  tokenUrl: string;
}

export function useSchema (account: string, collectionId: string, tokenId: string | number): UseSchemaInterface {
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface>();
  const [reFungibleBalance, setReFungibleBalance] = useState<number>(0);
  const [tokenUrl, setTokenUrl] = useState<string>('');
  const [attributesConst, setAttributesConst] = useState<string>();
  const [attributesVar, setAttributesVar] = useState<string>();
  const [attributes, setAttributes] = useState<AttributesDecoded>();
  const [tokenDetails, setTokenDetails] = useState<TokenDetailsInterface>();
  const { getTokenInfo } = useToken();
  const { getDetailedCollectionInfo } = useCollection();
  const cleanup = useRef<boolean>(false);
  const { decodeStruct, getOnChainSchema, getTokenImageUrl } = useMetadata();

  const tokenName = useMemo(() => {
    if (attributes) {
      const name = Object.keys(attributes).find((attributeKey: string) => attributeKey.toLowerCase().includes('name'));

      if (name) {
        return { name, value: attributes[name] as string };
      }
    }

    return null;
  }, [attributes]);

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

  const setOnChainSchema = useCallback(() => {
    if (collectionInfo) {
      const onChainSchema = getOnChainSchema(collectionInfo);

      setAttributesConst(onChainSchema.attributesConst);
      setAttributesVar(onChainSchema.attributesVar);
    }
  }, [collectionInfo, getOnChainSchema]);

  const getCollectionInfo = useCallback(async () => {
    if (collectionId) {
      const info: NftCollectionInterface = await getDetailedCollectionInfo(collectionId) as unknown as NftCollectionInterface;

      if (cleanup.current) {
        return;
      }

      if (info && Object.keys(info).length) {
        setCollectionInfo({
          ...info,
          id: collectionId
        });
      }
    }
  }, [collectionId, getDetailedCollectionInfo]);

  const getTokenDetails = useCallback(async () => {
    if (tokenId && collectionInfo) {
      const tokenDetailsData = await getTokenInfo(collectionInfo, tokenId.toString());

      setTokenDetails(tokenDetailsData);
    }
  }, [collectionInfo, getTokenInfo, tokenId]);

  const mergeTokenAttributes = useCallback(() => {
    const tokenAttributes: any = {
      ...decodeStruct({ attr: attributesConst, data: tokenDetails?.ConstData }),
      ...decodeStruct({ attr: attributesVar, data: tokenDetails?.VariableData })
    };

    setAttributes(tokenAttributes);
  }, [attributesConst, attributesVar, decodeStruct, tokenDetails]);

  const saveTokenImageUrl = useCallback(async (collectionInf: NftCollectionInterface, tokenId: string) => {
    const tokenImageUrl = await getTokenImageUrl(collectionInf, tokenId);

    setTokenUrl(tokenImageUrl);
  }, [getTokenImageUrl]);

  useEffect(() => {
    if (collectionInfo) {
      void setOnChainSchema();
      void saveTokenImageUrl(collectionInfo, tokenId.toString());
      void getTokenDetails();
    }
  }, [collectionInfo, getTokenDetails, setOnChainSchema, saveTokenImageUrl, tokenId]);

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

  useEffect(() => {
    return () => {
      cleanup.current = true;
    };
  }, []);

  return {
    attributes,
    attributesConst,
    attributesVar,
    collectionInfo,
    getCollectionInfo,
    getTokenDetails,
    reFungibleBalance,
    tokenDetails,
    tokenName,
    tokenUrl
  };
}
