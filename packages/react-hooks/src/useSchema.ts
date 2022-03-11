// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';
import type { TokenDetailsInterface } from '@polkadot/react-hooks/useToken';

import { useCallback, useEffect, useMemo, useState } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';
import { useIsMountedRef, useMetadata, useToken } from '@polkadot/react-hooks';
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
  // reFungibleBalance: number;
  tokenDetails?: TokenDetailsInterface;
  tokenName: { name: string, value: string } | null;
  tokenUrl: string;
}

export type IpfsJsonType = { ipfs: string, type: 'image' };

export function useSchema (account: string | undefined, collectionId: string, tokenId: string | number): UseSchemaInterface {
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface>();
  // const [reFungibleBalance, setReFungibleBalance] = useState<number>(0);
  const [tokenUrl, setTokenUrl] = useState<string>('');
  const [attributes, setAttributes] = useState<AttributesDecoded>();
  const [tokenDetails, setTokenDetails] = useState<TokenDetailsInterface>();
  const { getTokenInfo } = useToken();
  const { getDetailedCollectionInfo } = useCollection();
  const mountedRef = useIsMountedRef();
  const { getTokenAttributes, getTokenImageUrl } = useMetadata();
  const { ipfsGateway } = envConfig;

  const tokenName = useMemo(() => {
    if (attributes) {
      const name = Object.keys(attributes).find((attributeKey: string) => attributeKey.toLowerCase().includes('name'));

      if (name) {
        return { name, value: attributes[name] as string };
      }
    }

    return null;
  }, [attributes]);

  const getCollectionInfo = useCallback(async () => {
    if (collectionId) {
      const info: NftCollectionInterface = await getDetailedCollectionInfo(collectionId) as unknown as NftCollectionInterface;

      if (info && Object.keys(info).length) {
        mountedRef.current && setCollectionInfo({
          ...info,
          id: collectionId
        });
      }
    }
  }, [collectionId, getDetailedCollectionInfo, mountedRef]);

  const getTokenDetails = useCallback(async () => {
    if (tokenId && collectionInfo) {
      const tokenDetailsData = await getTokenInfo(collectionInfo, tokenId.toString());

      mountedRef.current && setTokenDetails(tokenDetailsData);
    }
  }, [collectionInfo, getTokenInfo, mountedRef, tokenId]);

  const mergeTokenAttributes = useCallback(async () => {
    if (collectionInfo && tokenId) {
      const attrs = await getTokenAttributes(collectionInfo, tokenId.toString());

      mountedRef.current && setAttributes(attrs);
    }
  }, [collectionInfo, getTokenAttributes, mountedRef, tokenId]);

  const saveTokenImageUrl = useCallback(async (collectionInf: NftCollectionInterface, tokenId: string) => {
    let tokenImageUrl: string;
    let ipfsJson: IpfsJsonType;

    if (collectionInf.schemaVersion === 'Unique' && attributes?.ipfsJson && ipfsGateway) {
      try {
        ipfsJson = JSON.parse(attributes.ipfsJson as string) as IpfsJsonType;
        tokenImageUrl = `${ipfsGateway}/${ipfsJson?.ipfs}`;
      } catch (e) {
        console.log('ipfsJson parse error', e);
        tokenImageUrl = '';
      }
    } else {
      // use old logic
      tokenImageUrl = await getTokenImageUrl(collectionInf, tokenId);
    }

    mountedRef.current && setTokenUrl(tokenImageUrl);
  }, [attributes, getTokenImageUrl, ipfsGateway, mountedRef]);

  useEffect(() => {
    if (collectionInfo) {
      void getTokenDetails();
    }
  }, [collectionInfo, getTokenDetails]);

  useEffect(() => {
    if (collectionInfo) {
      void saveTokenImageUrl(collectionInfo, tokenId.toString());
    }
  }, [collectionInfo, saveTokenImageUrl, tokenId]);

  useEffect(() => {
    void getCollectionInfo();
  }, [getCollectionInfo]);

  useEffect(() => {
    if (collectionInfo && tokenDetails) {
      void mergeTokenAttributes();
    }
  }, [collectionInfo, mergeTokenAttributes, tokenDetails]);

  /* useEffect(() => {
    void getReFungibleDetails();
  }, [getReFungibleDetails]); */

  return {
    attributes,
    collectionInfo,
    getCollectionInfo,
    getTokenDetails,
    // reFungibleBalance,
    tokenDetails,
    tokenName,
    tokenUrl
  };
}
