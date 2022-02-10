// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';
import { useFetch } from '@polkadot/react-hooks/useFetch';

const { uniqueApi } = envConfig;

const apiUrl = process.env.NODE_ENV === 'development' ? '' : uniqueApi;

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
}

export const useSettings = () => {
  const { fetchData } = useFetch();
  const [apiSettings, setApiSettings] = useState<Settings>();

  const getSettings = useCallback(() => {
    const url = `${apiUrl}/api/settings`;

    fetchData<Settings>(url).subscribe((result: Settings) => {
      if (result?.blockchain) {
        if (!window.ENV) {
          window.ENV = {};
        }

        envConfig.escrowAddress = result.blockchain.escrowAddress;
        envConfig.commission = result.blockchain.kusama.marketCommission;
        envConfig.kusamaApiUrl = result.blockchain.kusama.wsEndpoint;
        envConfig.uniqueCollectionIds = result.blockchain.unique.collectionIds;
        envConfig.contractAddress = result.blockchain.unique.contractAddress;
        envConfig.uniqueSubstrateApi = result.blockchain.unique.wsEndpoint;

        setApiSettings(result);

        console.log('apiSettings', result);
      }
    });
  }, [fetchData]);

  useEffect(() => {
    getSettings();
  }, [getSettings]);

  return { apiSettings };
};
