// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { catchError, switchMap } from 'rxjs/operators';

export interface ImageInterface {
  address: string;
  image: string; // base64;
  name: string;
}

export interface UseMintApiInterface {
  imgLoading: boolean;
  serverIsReady: boolean;
  uploadImage: (image: ImageInterface) => void;
  uploadedSuccessfully: boolean;
}

/**
 * Get validators from server if health "connected":true
 * @return {Array<ValidatorInfo>} filtered validators from server
 */
function useMintApi (): UseMintApiInterface {
  const [imgLoading, setImgLoading] = useState<boolean>(false);
  const [serverIsReady, setServerIsReady] = useState<boolean>(false);
  const [uploadedSuccessfully, setUploadedSuccessfully] = useState<boolean>(false);
  const history = useHistory();

  const fetchData = useCallback((url: string) => {
    return fromFetch(url).pipe(
      switchMap((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return of({ error: true, message: `Error ${response.status}` });
        }
      }),
      catchError((err: { message: string }) => {
        setServerIsReady(false);

        return of({ error: true, message: err.message });
      })
    );
  }, []);

  const addMintedTokenToWallet = useCallback(() => {
    /* const collections: NftCollectionInterface[] = JSON.parse(localStorage.getItem('tokenCollections') || '[]') as NftCollectionInterface[];

    if (!collections.length || !collections.find((collection: NftCollectionInterface) => collection.id === 14)) {
      collections.push({
        ConstOnChainSchema: null,
        DecimalPoints: 0,
        Description: 'The NFT collection for artists to mint and display their work',
        Mode: {
          isFungible: false,
          isInvalid: false,
          isNft: true,
          isReFungible: false
        },
        Name: 'Unique Gallery',
        OffchainSchema: 'https://uniqueapps.usetech.com/api/images/{id}',
        SchemaVersion: 'ImageURL',
        TokenPrefix: 'GAL',
        VariableOnChainSchema: null,
        id: 14
      });
      localStorage.setItem('tokenCollections', JSON.stringify(collections));
    } */

    history.push('/wallet');
  }, [history]);

  const uploadImage = useCallback((file: ImageInterface) => {
    setImgLoading(true);

    try {
      /* const response = await fetch('/api/mint', { // Your POST endpoint
        body: JSON.stringify(file),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }); */

      setUploadedSuccessfully(true);
      setImgLoading(false);
      addMintedTokenToWallet();
    } catch (e) {
      console.log('error uploading image', e);
      setImgLoading(false);
    }
  }, [addMintedTokenToWallet]);

  useEffect(() => {
    const fetchHealth = fetchData('/api/health').subscribe((result: { connected?: boolean }) => {
      if (result && result.connected) {
        setServerIsReady(true);
      } else {
        setServerIsReady(false);
      }
    });

    return () => {
      fetchHealth.unsubscribe();
    };
  }, [fetchData, setServerIsReady]);

  return { imgLoading, serverIsReady, uploadImage, uploadedSuccessfully };
}

export default useMintApi;
