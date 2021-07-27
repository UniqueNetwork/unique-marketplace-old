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
  value: number; // 0
  vaultAddress: string; // 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
  version: string;
  walletMode: boolean; // if only wallet needed
  wssUrl: string;
  whiteLabelUrl: string;
  devProxyUrl: string;
};

const envConfig: EnvConfigType = {
  canAddCollections: JSON.parse(process.env.CAN_ADD_COLLECTIONS),
  canCreateCollection: JSON.parse(process.env.CAN_CREATE_COLLECTION),
  canCreateToken: JSON.parse(process.env.CAN_CREATE_TOKEN),
  canEditCollection: JSON.parse(process.env.CAN_EDIT_COLLECTION),
  canEditToken: JSON.parse(process.env.CAN_EDIT_TOKEN),
  commission: +process.env.COMMISSION,
  contractAddress: process.env.CONTRACT_ADDRESS,
  decimals: +process.env.DECIMALS,
  environment: process.env.ENVIRONMENT,
  escrowAddress: process.env.ESCROW_ADDRESS,
  faviconPath: process.env.FAVICON_PATH,
  kusamaDecimals: +process.env.KUSAMA_DECIMALS,
  maxGas: +process.env.MAX_GAS,
  midTedCollection: +process.env.MIN_TED_COLLECTION,
  minPrice: +process.env.MIN_PRICE,
  quoteId: +process.env.QUOTE_ID,
  showMarketActions: JSON.parse(process.env.SHOW_MARKET_ACTIONS),
  uniqueCollectionIds: process.env.UNIQUE_COLLECTION_IDS.split(','),
  value: +process.env.VALUE,
  vaultAddress: process.env.VAULT_ADDRESS,
  version: process.env.VERSION,
  walletMode: JSON.parse(process.env.WALLET_MODE),
  wssUrl: process.env.WEBSOCKET_SECURE_URL,
  whiteLabelUrl: process.env.WHITE_LABEL_URL,
  devProxyUrl: process.env.DEVELOPMENT_PROXY_URL
};

export default envConfig;
