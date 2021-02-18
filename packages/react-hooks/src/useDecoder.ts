// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { useCallback } from 'react';

interface UseDecoderInterface {
  collectionName16Decoder: (name: BN[]) => string;
  collectionName8Decoder: (name: string) => string;
}

export function useDecoder (): UseDecoderInterface {
  const collectionName16Decoder = useCallback((name: BN[]) => {
    const collectionNameArr = name.map((item: BN) => item.toNumber());

    collectionNameArr.splice(-1, 1);

    return String.fromCharCode(...collectionNameArr);
  }, []);

  const collectionName8Decoder = useCallback((name: string) => {
    const collectionNameArr = Array.prototype.slice.call(name);

    collectionNameArr.splice(-1, 1);

    return String.fromCharCode(...collectionNameArr);
  }, []);

  return {
    collectionName16Decoder,
    collectionName8Decoder
  };
}
