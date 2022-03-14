// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@unique-nft/types/augment-api-rpc';

import BN from 'bn.js';
import { useCallback } from 'react';

import { ProtobufAttributeType } from '@polkadot/react-components/util/protobufUtils';
import { useApi } from '@polkadot/react-hooks/useApi';
import { useDecoder } from '@polkadot/react-hooks/useDecoder';

export type SchemaVersionTypes = 'ImageURL' | 'Unique';

export interface NftCollectionInterface {
  access?: 'Normal' | 'WhiteList'
  id: string;
  decimalPoints: BN | number;
  description: number[];
  tokenPrefix: string;
  mintMode?: boolean;
  mode: {
    nft: null;
    fungible: null;
    reFungible: null;
    invalid: null;
  };
  name: number[];
  offchainSchema: string;
  owner?: string;
  schemaVersion: SchemaVersionTypes;
  sponsorship: {
    confirmed?: string;
    disabled?: string | null;
    unconfirmed?: string | null;
  };
  limits?: {
    accountTokenOwnershipLimit: string;
    sponsoredDataSize: string;
    sponsoredDataRateLimit: string;
    sponsoredMintSize: string;
    tokenLimit: string;
    sponsorTimeout: string;
    ownerCanTransfer: boolean;
    ownerCanDestroy: boolean;
  },
  variableOnChainSchema: string;
  constOnChainSchema: string;
}

export function useCollection () {
  const { api, isApiConnected, isApiReady } = useApi();
  const { hex2a } = useDecoder();

  const isApi = api && isApiReady && isApiConnected;

  const getCollectionTokensCount = useCallback(async (collectionId: string) => {
    if (!isApi || !collectionId) {
      return [];
    }

    try {
      return (await api.rpc.unique.lastTokenId(collectionId)).toJSON() as number;
    } catch (e) {
      console.log('getTokensOfCollection error', e);
    }

    return 0;
  }, [api, isApi]);

  const getCreatedCollectionCount = useCallback(async () => {
    try {
      return (await api.rpc.unique.collectionStats()).created.toNumber();
    } catch (e) {
      console.log('getCreatedCollectionCount error', e);
    }

    return 0;
  }, [api]);

  const getCollectionAdminList = useCallback(async (collectionId: string) => {
    if (!api || !collectionId) {
      return [];
    }

    try {
      return (await api.rpc.unique.adminlist(collectionId)).toHuman() as string[];
    } catch (e) {
      console.log('getCollectionAdminList error', e);
    }

    return [];
  }, [api]);

  const getDetailedCollectionInfo = useCallback(async (collectionId: string) => {
    if (!api) {
      return null;
    }

    try {
      const collectionInfo = (await api.rpc.unique.collectionById(collectionId)).toJSON() as unknown as NftCollectionInterface | null;

      return {
        ...collectionInfo,
        id: collectionId
      };
    } catch (e) {
      console.log('getDetailedCollectionInfo error', e);
    }

    return {};
  }, [api]);

  const getCollectionOnChainSchema = useCallback((collectionInfo: NftCollectionInterface): { constSchema: ProtobufAttributeType | undefined, variableSchema: { collectionCover: string } | undefined } => {
    const result: {
      constSchema: ProtobufAttributeType | undefined,
      variableSchema: { collectionCover: string } | undefined
    } = {
      constSchema: undefined,
      variableSchema: undefined
    };

    try {
      const constSchema = hex2a(collectionInfo.constOnChainSchema);
      const varSchema = hex2a(collectionInfo.variableOnChainSchema);

      if (constSchema && constSchema.length) {
        result.constSchema = JSON.parse(constSchema) as ProtobufAttributeType;
      }

      if (varSchema && varSchema.length) {
        result.variableSchema = JSON.parse(varSchema) as { collectionCover: string } | undefined;
      }

      return result;
    } catch (e) {
      console.log('getCollectionOnChainSchema error');
    }

    return result;
  }, [hex2a]);

  const getTokensOfCollection = useCallback(async (collectionId: string, ownerId: string) => {
    if (!isApi || !collectionId || !ownerId) {
      return [];
    }

    try {
      return await api.query.unique.accountTokens(collectionId, { Substrate: ownerId });
    } catch (e) {
      console.log('getTokensOfCollection error', e);
    }

    return [];
  }, [api, isApi]);

  return {
    getCollectionAdminList,
    getCollectionOnChainSchema,
    getCollectionTokensCount,
    getCreatedCollectionCount,
    getDetailedCollectionInfo,
    getTokensOfCollection
  };
}
