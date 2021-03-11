// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

interface UseDecoderInterface {
  collectionName16Decoder: (name: number[]) => string;
  collectionName8Decoder: (name: number[]) => string;
}

export function useDecoder (): UseDecoderInterface {
  const collectionName16Decoder = useCallback((name: number[]) => {
    const collectionNameArr = name.map((item: number) => item);

    return String.fromCharCode(...collectionNameArr);
  }, []);

  const collectionName8Decoder = useCallback((name: number[]) => {
    const collectionNameArr = Array.prototype.slice.call(name);

    return String.fromCharCode(...collectionNameArr);
  }, []);

  return {
    collectionName16Decoder,
    collectionName8Decoder
  };
}
