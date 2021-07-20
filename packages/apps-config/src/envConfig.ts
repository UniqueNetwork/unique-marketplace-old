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
}

const envConfig: EnvConfigType = {
  canAddCollections: JSON.parse(process.env.CAN_ADD_COLLECTIONS) || false,
  canCreateCollection: JSON.parse(process.env.CAN_CREATE_COLLECTION) || true,
  canCreateToken: JSON.parse(process.env.CAN_CREATE_TOKEN) || true,
  canEditCollection: JSON.parse(process.env.CAN_EDIT_COLLECTION) || true,
  canEditToken: JSON.parse(process.env.CAN_EDIT_TOKEN) || true,
  commission: +process.env.COMMISSION || 10,
  contractAddress: process.env.CONTRACT_ADDRESS || '5GPbxrVzvjRHUSQUS9BNUFe2Q4KVfsYZtG1CTRaqe51rNSAX',
  decimals: +process.env.DECIMALS|| 6,
  environment: process.env.ENVIRONMENT || 'development',
  escrowAddress: process.env.ESCROW_ADDRESS || '5DXRqSKrXeSmYin1kLqDR74aqnjxShVo9DDdgvnPP3tAtxV4',
  faviconPath: process.env.FAVICON_PATH || 'favicons/marketplace',
  kusamaDecimals: +process.env.KUSAMA_DECIMALS || 12,
  maxGas: +process.env.MAX_GAS || 1000000000000,
  midTedCollection: +process.env.MIN_TED_COLLECTION || 1,
  minPrice: +process.env.MIN_PRICE || 0.000001,
  quoteId: +process.env.QUOTE_ID || 2,
  showMarketActions: JSON.parse(process.env.SHOW_MARKET_ACTIONS) || true,
  uniqueCollectionIds: process.env.UNIQUE_COLLECTION_IDS.split(',') || ['18', '23', '25'],
  value: +process.env.VALUE || 0,
  vaultAddress: process.env.VAULT_ADDRESS || '5DXRqSKrXeSmYin1kLqDR74aqnjxShVo9DDdgvnPP3tAtxV4',
  version: process.env.VERSION || '1.0',
  walletMode: JSON.parse(process.env.WALLET_MODE) || false,
  wssUrl: process.env.WSS_URL || 'wss://testnet2.uniquenetwork.io'
};

export default envConfig;
