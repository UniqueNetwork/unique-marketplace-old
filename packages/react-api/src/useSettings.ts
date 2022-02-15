// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';
import { useFetch } from '@polkadot/react-hooks/useFetch';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client/build/esm/socket';

export type Settings = {
  blockchain?: {
    escrowAddress: string;
    kusama: {
      marketCommission: number;
      wsEndpoint: string;
    },
    unique: {
      collectionIds: string[];
      contractAddress: string;
      wsEndpoint: string;
    }
  },
  error?: boolean;
  message?: string;
  auction?: {
    commission: number;
    address: string;
    socket: Socket;
  }
}

export const useSettings = () => {
  const { fetchData } = useFetch();
  const [apiSettings, setApiSettings] = useState<Settings>();
  const { uniqueApi } = envConfig;
  const apiUrl = uniqueApi;

  const getSettings = useCallback(() => {
    const url = `/api/settings`; // todo why proxy? wat?

    fetchData<Settings>(url).subscribe((result: Settings) => {
      if (result?.blockchain) {
        envConfig.escrowAddress = result.blockchain.escrowAddress;
        envConfig.commission = result.blockchain.kusama.marketCommission;
        envConfig.kusamaApiUrl = result.blockchain.kusama.wsEndpoint;
        envConfig.uniqueCollectionIds = result.blockchain.unique.collectionIds;
        envConfig.contractAddress = result.blockchain.unique.contractAddress;
        envConfig.uniqueSubstrateApi = result.blockchain.unique.wsEndpoint;

        if (result.auction) {
          const script = document.createElement('script');
          script.src = "https://cdn.socket.io/4.4.1/socket.io.min.js"
          script.onload = function() {
            const socket = io(apiUrl, {
              path: '/socket.io'
            });
            result.auction!.socket = socket;
            setApiSettings(result); // todo tochno?
          }
          document.head.appendChild(script);
        } else {
          setApiSettings(result);
        }
      }
    });
  }, [apiUrl, fetchData]);

  useEffect(() => {
    getSettings();
  }, [getSettings]);

  return { apiSettings };
};
