// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type EnvConfigType = {
  canAddCollections: boolean;
  canCreateCollection: boolean;
  canCreateToken: boolean;
  canEditCollection: boolean;
  canEditToken: boolean;
  commission: number;
  contractAddress: string; // 5FgbNg55FCFT3j1KokxsHaEgp4wfnDMGazCLw3mqC359bY72
  decimals: number;
  environment: string;
  escrowAddress: string; // 5FdzbgdBGRM5FDALrnSPRybWhqKv4eiy6QUpWUdBt3v3omAU
  faviconPath: string;
  kusamaDecimals: number; // 12
  maxGas: number; // 1000000000000
  midTedCollection: number;
  minPrice: number;
  quoteId: number; // 2
  showMarketActions: boolean; // buy, sell, cancel and withdraw buttons on the token details page
  uniqueCollectionIds: string[]; // ['23']
  uniqueApi: string;
  uniqueSubstrateApi: string;
  value: number; // 0
  vaultAddress: string; // 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
  version: string;
  walletMode: boolean; // if only wallet needed
  whiteLabelUrl: string;
};

const envConfig: EnvConfigType = {
  canAddCollections: JSON.parse(process.env.CAN_ADD_COLLECTIONS as string) as boolean,
  canCreateCollection: JSON.parse(process.env.CAN_CREATE_COLLECTION as string) as boolean,
  canCreateToken: JSON.parse(process.env.CAN_CREATE_TOKEN as string) as boolean,
  canEditCollection: JSON.parse(process.env.CAN_EDIT_COLLECTION as string) as boolean,
  canEditToken: JSON.parse(process.env.CAN_EDIT_TOKEN as string) as boolean,
  commission: +(process.env.COMMISSION as string),
  contractAddress: process.env.CONTRACT_ADDRESS as string,
  decimals: +(process.env.DECIMALS as string),
  environment: (process.env.ENVIRONMENT as string),
  escrowAddress: (process.env.ESCROW_ADDRESS as string),
  faviconPath: (process.env.FAVICON_PATH as string),
  kusamaDecimals: +(process.env.KUSAMA_DECIMALS as string),
  maxGas: +(process.env.MAX_GAS as string),
  midTedCollection: +(process.env.MIN_TED_COLLECTION as string),
  minPrice: +(process.env.MIN_PRICE as string),
  quoteId: +(process.env.QUOTE_ID as string),
  showMarketActions: JSON.parse(process.env.SHOW_MARKET_ACTIONS as string) as boolean,
  uniqueApi: (process.env.UNIQUE_API as string),
  uniqueCollectionIds: (process.env.UNIQUE_COLLECTION_IDS as string).split(','),
  uniqueSubstrateApi: (process.env.UNIQUE_SUBSTRATE_API as string),
  value: +(process.env.VALUE as string),
  vaultAddress: (process.env.VAULT_ADDRESS as string),
  version: (process.env.VERSION as string),
  walletMode: JSON.parse(process.env.WALLET_MODE as string) as boolean,
  whiteLabelUrl: (process.env.WHITE_LABEL_URL as string)
};

export default envConfig;
