// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useContext } from 'react';

import { StatusContext } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks/useApi';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

export interface TokenDetailsInterface {
  Owner?: any[];
  ConstData?: string;
  VariableData?: string;
}

interface UseTokenInterface {
  createNft: (obj: { account: string, collectionId: string, constData: string, variableData: string, successCallback?: () => void, errorCallback?: () => void, owner: string }) => void;
  getDetailedReFungibleTokenInfo: (collectionId: string, tokenId: string) => Promise<TokenDetailsInterface>;
  getDetailedTokenInfo: (collectionId: string, tokenId: string) => Promise<TokenDetailsInterface>
  getTokenInfo: (collectionInfo: NftCollectionInterface, tokenId: string) => Promise<TokenDetailsInterface>;
  setVariableMetadata: (obj: { account: string, collectionId: string, variableData: string, successCallback?: () => void, errorCallback?: () => void, tokenId: string }) => void;
}

export function useToken (): UseTokenInterface {
  const { api } = useApi();
  const { queueExtrinsic } = useContext(StatusContext);

  // const createData = {nft: {const_data: [], variable_data: []}};
  // tx = api.tx.nft.createItem(collectionId, owner, createData);
  // setVariableMetaData(collection_id, item_id, data)

  const createNft = useCallback((
    { account, collectionId, constData, errorCallback, owner, successCallback, variableData }:
    { account: string, collectionId: string, constData: string, variableData: string, successCallback?: () => void, errorCallback?: () => void, owner: string }) => {
    const transaction = api.tx.nft.createItem(collectionId, owner, { nft: { const_data: constData, variable_data: variableData } });

    console.log('info createNft constData', constData, 'variableData', variableData);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { console.log('create nft fail'); errorCallback && errorCallback(); },
      txStartCb: () => { console.log('create nft start'); },
      txSuccessCb: () => { console.log('create nft success'); successCallback && successCallback(); },
      txUpdateCb: () => { console.log('create nft update'); }
    });
  }, [api, queueExtrinsic]);

  const setVariableMetadata = useCallback((
    { account, collectionId, errorCallback, successCallback, tokenId, variableData }:
    { account: string, collectionId: string, variableData: string, successCallback?: () => void, errorCallback?: () => void, tokenId: string }) => {
    const transaction = api.tx.nft.setVariableMetaData(collectionId, tokenId, variableData);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { console.log('set variable metadata fail'); errorCallback && errorCallback(); },
      txStartCb: () => { console.log('set variable metadata start'); },
      txSuccessCb: () => { console.log('set variable metadata success'); successCallback && successCallback(); },
      txUpdateCb: () => { console.log('set variable metadata update'); }
    });
  }, [api, queueExtrinsic]);

  const getDetailedTokenInfo = useCallback(async (collectionId: string, tokenId: string): Promise<TokenDetailsInterface> => {
    if (!api) {
      return {};
    }

    try {
      return (await api.query.nft.nftItemList(collectionId, tokenId)).toJSON() as unknown as TokenDetailsInterface;
    } catch (e) {
      console.log('getDetailedTokenInfo error', e);

      return {};
    }
  }, [api]);

  const getDetailedReFungibleTokenInfo = useCallback(async (collectionId: string, tokenId: string): Promise<TokenDetailsInterface> => {
    if (!api) {
      return {};
    }

    try {
      return (await api.query.nft.reFungibleItemList(collectionId, tokenId) as unknown as TokenDetailsInterface);
    } catch (e) {
      console.log('getDetailedReFungibleTokenInfo error', e);

      return {};
    }
  }, [api]);

  const getTokenInfo = useCallback(async (collectionInfo: NftCollectionInterface, tokenId: string): Promise<TokenDetailsInterface> => {
    let tokenDetailsData: TokenDetailsInterface = {};

    if (tokenId && collectionInfo) {
      if (Object.prototype.hasOwnProperty.call(collectionInfo.Mode, 'nft')) {
        tokenDetailsData = await getDetailedTokenInfo(collectionInfo.id, tokenId);
      } else if (Object.prototype.hasOwnProperty.call(collectionInfo.Mode, 'reFungible')) {
        tokenDetailsData = await getDetailedReFungibleTokenInfo(collectionInfo.id, tokenId);
      }
    }

    return tokenDetailsData;
  }, [getDetailedTokenInfo, getDetailedReFungibleTokenInfo]);

  return {
    createNft,
    getDetailedReFungibleTokenInfo,
    getDetailedTokenInfo,
    getTokenInfo,
    setVariableMetadata
  };
}
