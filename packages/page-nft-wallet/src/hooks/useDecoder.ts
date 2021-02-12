// Copyright 2020 UseTech authors & contributors

import { useCallback } from 'react';

export default function useDecoder() {

  const collectionName16Decoder = useCallback((name) => {
    const collectionNameArr = name.map((item: any) => item.toNumber());
    collectionNameArr.splice(-1, 1);
    return String.fromCharCode(...collectionNameArr);
  }, []);

  const collectionName8Decoder = useCallback((name) => {
    const collectionNameArr = Array.prototype.slice.call(name);
    collectionNameArr.splice(-1, 1);
    return String.fromCharCode(...collectionNameArr);
  }, []);

  return {
    collectionName8Decoder,
    collectionName16Decoder
  }
}
