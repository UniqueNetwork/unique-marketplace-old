// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollections';

import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useCollections } from '@polkadot/react-hooks/useCollections';

export interface ImageInterface {
  address: string;
  filename: string;
  image: string; // base64;
  name: string;
}

export interface UseMintApiInterface {
  imgLoading: boolean;
  serverIsReady: boolean;
  uploadImage: (image: ImageInterface) => void;
  uploadedSuccessfully: boolean;
}

export const collectionIdForMint = process.env.mintedCollection || '2';

/**
 * Get validators from server if health "connected":true
 * @return {Array<ValidatorInfo>} filtered validators from server
 */
function useMintApi (): UseMintApiInterface {
  const [imgLoading, setImgLoading] = useState<boolean>(false);
  const [serverIsReady, setServerIsReady] = useState<boolean>(false);
  const [uploadedSuccessfully, setUploadedSuccessfully] = useState<boolean>(false);
  const { getDetailedCollectionInfo } = useCollections();
  const history = useHistory();

  const addMintedTokenToWallet = useCallback(async () => {
    const collections: NftCollectionInterface[] = JSON.parse(localStorage.getItem('tokenCollections') || '[]') as NftCollectionInterface[];

    if (!collections.length || !collections.find((collection: NftCollectionInterface) => collection.id === collectionIdForMint)) {
      const collectionInf = await getDetailedCollectionInfo(collectionIdForMint) as unknown as NftCollectionInterface;

      collections.push({ ...collectionInf, id: collectionIdForMint });

      localStorage.setItem('tokenCollections', JSON.stringify(collections));
    }
  }, [getDetailedCollectionInfo]);

  const uploadImage = useCallback(async (file: ImageInterface) => {
    setImgLoading(true);

    console.log('upload', JSON.stringify(file));

    try {
      const response = await fetch('/mint', { // Your POST endpoint
        body: JSON.stringify(file),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      });
      const data: { id: string } = await response.json() as { id: string };

      console.log('token minted successfully', data);

      setUploadedSuccessfully(true);
      setImgLoading(false);
      await addMintedTokenToWallet();
      history.push('/wallet');
    } catch (e) {
      console.log('error uploading image', e);
      setImgLoading(false);
    }
  }, [addMintedTokenToWallet, history]);

  const healthCheck = useCallback(() => {
    void fetch('/health')
      .then((response) => {
        return response.json();
      })
      .then((data: { connected?: boolean }) => {
        if (data && data.connected) {
          setServerIsReady(true);
        } else {
          setServerIsReady(false);
        }
      });
  }, []);

  useEffect(() => {
    healthCheck();
  }, [healthCheck]);

  return { imgLoading, serverIsReady, uploadImage, uploadedSuccessfully };
}

export default useMintApi;
