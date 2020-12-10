// Copyright 2020 @polkadot/app-nft authors & contributors
import { ImageInterface } from '../types';

import { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, catchError } from 'rxjs/operators';

interface UseMintApiInterface {
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
      catchError((err) => {
        setServerIsReady(false);

        return of({ error: true, message: err.message });
      })
    );
  }, []);

  const addMintedTokenToWallet = useCallback(() => {
    const collections: Array<any> = JSON.parse(localStorage.getItem('tokenCollections') || '[]');
    if (!collections.length || !collections.find(collection => collection.id === 14)) {
      collections.push({
        decimalPoints: 0,
        description: "The NFT collection for artists to mint and display their work",
        id: 14,
        isReFungible: false,
        name: "Unique Gallery",
        offchainSchema: "https://uniqueapps.usetech.com/api/images/{id",
        prefix: "GAL",
      });
      localStorage.setItem('tokenCollections', JSON.stringify(collections));
    }
    history.push('/wallet');
  }, []);

  const uploadImage = useCallback(async (file: ImageInterface) => {
    setImgLoading(true);
    try {
      const response = await fetch('/api/mint', { // Your POST endpoint
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(file)
      });
      console.log('token added', response);
      setUploadedSuccessfully(true);
      addMintedTokenToWallet();
      setImgLoading(false);
    } catch (e) {
      console.log('error uploading image', e);
      setImgLoading(false)
    }
  }, []);

  useEffect(() => {
    fetchData('/api/health').subscribe((result) => {
      if (result && result.connected) {
        setServerIsReady(true);
      } else {
        setServerIsReady(false);
      }
    });
  }, [fetchData, setServerIsReady]);

  return { imgLoading, serverIsReady, uploadImage, uploadedSuccessfully };
}

export default useMintApi;
