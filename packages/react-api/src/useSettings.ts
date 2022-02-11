// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';
import { useFetch } from '@polkadot/react-hooks/useFetch';

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
  }
}

export const useSettings = () => {
  const { fetchData } = useFetch();
  const [apiSettings, setApiSettings] = useState<Settings>();
  const { uniqueApi } = envConfig;
  const apiUrl = uniqueApi;

  const getSettings = useCallback(() => {
    const url = `${apiUrl}/api/settings`; // todo why proxy? wat?

    fetchData<Settings>(url).subscribe((result: Settings) => {
      if (result?.blockchain) {
        envConfig.escrowAddress = result.blockchain.escrowAddress;
        envConfig.commission = result.blockchain.kusama.marketCommission;
        envConfig.kusamaApiUrl = result.blockchain.kusama.wsEndpoint;
        envConfig.uniqueCollectionIds = result.blockchain.unique.collectionIds;
        envConfig.contractAddress = result.blockchain.unique.contractAddress;
        envConfig.uniqueSubstrateApi = result.blockchain.unique.wsEndpoint;
        setApiSettings(result);
      }
    });
  }, [apiUrl, fetchData]);

  useEffect(() => {
    getSettings();
  }, [getSettings]);

  return { apiSettings };
};
