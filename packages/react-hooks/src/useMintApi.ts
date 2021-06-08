// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import envConfig from '@polkadot/apps-config/envConfig';
import { useCollections } from '@polkadot/react-hooks/useCollections';

const { uniqueCollectionIds } = envConfig;

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
  uploadingError: string | undefined;
}

/**
 * Get validators from server if health "connected":true
 * @return {Array<ValidatorInfo>} filtered validators from server
 */
export function useMintApi (): UseMintApiInterface {
  const [imgLoading, setImgLoading] = useState<boolean>(false);
  const [serverIsReady, setServerIsReady] = useState<boolean>(false);
  const [uploadingError, setUploadingError] = useState<string>();
  const { getDetailedCollectionInfo } = useCollections();
  const history = useHistory();

  const addMintedTokenToWallet = useCallback(async () => {
    const collections: NftCollectionInterface[] = JSON.parse(localStorage.getItem('tokenCollections') || '[]') as NftCollectionInterface[];

    for (let i = 0; i < uniqueCollectionIds.length; i++) {
      if (!collections.length || !collections.find((collection: NftCollectionInterface) => collection.id === uniqueCollectionIds[i])) {
        const collectionInf = await getDetailedCollectionInfo(uniqueCollectionIds[i]) as unknown as NftCollectionInterface;

        collections.push({ ...collectionInf, id: uniqueCollectionIds[i] });

        localStorage.setItem('tokenCollections', JSON.stringify(collections));
      }
    }
  }, [getDetailedCollectionInfo]);

  const uploadImage = useCallback(async (file: ImageInterface) => {
    setImgLoading(true);

    try {
      const response = await fetch('/mint', { // Your POST endpoint
        body: JSON.stringify(file),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      });

      if (response.ok) {
        console.log('token minted successfully', response);
        setImgLoading(false);
        await addMintedTokenToWallet();
        history.push('/wallet');
      } else {
        setUploadingError(response.statusText);
        setImgLoading(false);
      }
    } catch (e) {
      console.log('error uploading image', e);
      setImgLoading(false);
      setUploadingError('error while uploading image');
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

  return { imgLoading, serverIsReady, uploadImage, uploadingError };
}
