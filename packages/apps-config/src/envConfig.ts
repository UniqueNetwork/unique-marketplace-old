// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type EnvConfigType = {
  commission: number;
  contractAddress: string; // 5FgbNg55FCFT3j1KokxsHaEgp4wfnDMGazCLw3mqC359bY72
  decimals: number;
  environment: string;
  escrowAddress: string; // 5FdzbgdBGRM5FDALrnSPRybWhqKv4eiy6QUpWUdBt3v3omAU
  faviconPath: string;
  kusamaApiUrl: string;
  kusamaBackupApiUrl: string;
  kusamaDecimals: number; // 12
  maxGas: number; // 1000000000000
  midTedCollection: number;
  minPrice: number;
  quoteId: number; // 2
  uniqueCollectionIds: string[]; // ['23']
  uniqueApi: string;
  uniqueSubstrateApi: string;
  value: number; // 0
  vaultAddress: string; // 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
  version: string;
  whiteLabelUrl: string;
};

/* declare global {
  interface Window {
    ENV: {
      ENVIRONMENT: string;
      FAVICON_PATH: string;
      GRAPH_QL_ADMIN_SECRET: string;
      GRAPH_QL_API: string;
      KUSAMA_API: string;
      KUSAMA_BACKUP_API: string;
      KUSAMA_DECIMALS: number; // 12
      MAX_GAS: number; // 1000000000000
      MIN_PRICE: number;
      QUOTE_ID: number; // 2
      UNIQUE_COLLECTION_IDS: string; // ['23']
      UNIQUE_SUBSTRATE_API: string;
      VALUE: number; // 0
      VERSION: string;
      WHITE_LABEL_URL: string;
    }
  }
} */

const envConfig: EnvConfigType = {
  commission: +(process.env.COMMISSION as string),
  contractAddress: process.env.CONTRACT_ADDRESS as string,
  decimals: +(process.env.DECIMALS as string),
  environment: (process.env.ENVIRONMENT as string),
  escrowAddress: (process.env.ESCROW_ADDRESS as string),
  faviconPath: (process.env.FAVICON_PATH as string),
  kusamaApiUrl: (process.env.KUSAMA_API as string),
  kusamaBackupApiUrl: (process.env.KUSAMA_BACKUP_API as string),
  kusamaDecimals: +(process.env.KUSAMA_DECIMALS as string),
  maxGas: +(process.env.MAX_GAS as string),
  midTedCollection: +(process.env.MIN_TED_COLLECTION as string),
  minPrice: +(process.env.MIN_PRICE as string),
  quoteId: +(process.env.QUOTE_ID as string),
  uniqueApi: (process.env.UNIQUE_API as string),
  uniqueCollectionIds: (process.env.UNIQUE_COLLECTION_IDS as string).split(','),
  uniqueSubstrateApi: (process.env.UNIQUE_SUBSTRATE_API as string),
  value: +(process.env.VALUE as string),
  vaultAddress: (process.env.VAULT_ADDRESS as string),
  version: (process.env.VERSION as string),
  whiteLabelUrl: (process.env.WHITE_LABEL_URL as string)
};

export default envConfig;
