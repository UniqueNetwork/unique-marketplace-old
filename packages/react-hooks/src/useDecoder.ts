// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

interface UseDecoderInterface {
  collectionName16Decoder: (name: number[]) => string;
  collectionName8Decoder: (name: number[]) => string;
  hex2a: (hex: string) => string;
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

  const hex2a = useCallback((hexx: string) => {
    const hex: string = hexx.substring(2);
    let str = '';

    for (let i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }

    return str;
  }, []);

  return {
    collectionName16Decoder,
    collectionName8Decoder,
    hex2a
  };
}
