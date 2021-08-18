// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';

import { NftCollectionInterface, useCollection } from '@polkadot/react-hooks/useCollection';
import { HoldType, useCollections } from '@polkadot/react-hooks/useCollections';

interface UseMyTokensInterface {
  allMyTokens: string[];
  allTokensCount: number;
  ownTokensCount: number;
  tokensOnPage: string[];
}

export const useMyTokens = (
  account: string | undefined,
  collection: NftCollectionInterface,
  onHold: HoldType[],
  tokensSelling: string[],
  perPage: number
): UseMyTokensInterface => {
  const [allTokensCount, setAllTokensCount] = useState<number>(0);
  const [ownTokensCount, setOwnTokensCount] = useState<number>(0);
  const [allMyTokens, setAllMyTokens] = useState<string[]>([]);
  const [tokensOnPage, setTokensOnPage] = useState<string[]>([]);
  const [holdingTokens, setHoldingTokens] = useState<string[]>([]);
  const { getTokensOfCollection } = useCollections();
  const { getCollectionTokensCount } = useCollection();
  const cleanup = useRef<boolean>(false);

  const getTokensCount = useCallback(async () => {
    if (!collection) {
      return;
    }

    const tokensCount: number = await getCollectionTokensCount(collection.id) as number;

    if (cleanup.current) {
      return;
    }

    setAllTokensCount(tokensCount);
  }, [collection, getCollectionTokensCount]);

  const updateTokens = useCallback(async () => {
    if (!account) {
      return;
    }
    // get own tokens for given collection

    const tokens = (await getTokensOfCollection(collection.id, account))as string[];
    const allTokens = [...tokens, ...tokensSelling, ...holdingTokens];

    setOwnTokensCount(tokens.length);
    setAllMyTokens(allTokens);
    setTokensOnPage(allTokens.slice(0, perPage));
  }, [account, collection.id, getTokensOfCollection, holdingTokens, perPage, tokensSelling]);

  useEffect(() => {
    if (collection && allTokensCount === 0) {
      void getTokensCount();
    }
  }, [allTokensCount, collection, getTokensCount]);

  useEffect(() => {
    setTokensOnPage(allMyTokens.slice(0, perPage));
  }, [allMyTokens, perPage]);

  useEffect(() => {
    setHoldingTokens(onHold.map((item) => item.tokenId));
  }, [onHold]);

  useEffect(() => {
    void updateTokens();
  }, [updateTokens]);

  return {
    allMyTokens,
    allTokensCount: ownTokensCount + tokensSelling.length + holdingTokens.length,
    ownTokensCount,
    tokensOnPage
  };
};
