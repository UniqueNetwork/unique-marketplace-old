// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type EnvConfigType = {
  canAddCollections: boolean;
  canCreateCollection: boolean;
  canCreateToken: boolean;
  canEditCollection: boolean;
  canEditToken: boolean;
  contractAddress: string; // 5FgbNg55FCFT3j1KokxsHaEgp4wfnDMGazCLw3mqC359bY72
  escrowAddress: string; // 5FdzbgdBGRM5FDALrnSPRybWhqKv4eiy6QUpWUdBt3v3omAU
  faviconPath: string;
  kusamaDecimals: number; // 12
  maxGas: number; // 1000000000000
  quoteId: number; // 2
  showMarketActions: boolean; // buy, sell, cancel and withdraw buttons on the token details page
  uniqueCollectionIds: string[]; // ['23']
  value: number; // 0
  walletMode: boolean; // if only wallet needed
}

declare global {
  interface Window {
    processEnv: EnvConfigType
  }
}

const envConfig: EnvConfigType = {
  canAddCollections: window.processEnv.canAddCollections || false,
  canCreateCollection: window.processEnv.canCreateCollection || false,
  canCreateToken: window.processEnv.canCreateToken || false,
  canEditCollection: window.processEnv.canEditCollection || false,
  canEditToken: window.processEnv.canEditToken || false,
  contractAddress: window.processEnv.contractAddress || '5FgbNg55FCFT3j1KokxsHaEgp4wfnDMGazCLw3mqC359bY72',
  escrowAddress: window.processEnv.escrowAddress || '5FdzbgdBGRM5FDALrnSPRybWhqKv4eiy6QUpWUdBt3v3omAU',
  faviconPath: window.processEnv.faviconPath || 'favicon.ico',
  kusamaDecimals: window.processEnv.kusamaDecimals || 12,
  maxGas: window.processEnv.maxGas || 1000000000000,
  quoteId: window.processEnv.quoteId || 2,
  showMarketActions: window.processEnv.showMarketActions || false,
  uniqueCollectionIds: window.processEnv.uniqueCollectionIds || ['2'],
  value: window.processEnv.value || 0,
  walletMode: window.processEnv.walletMode || false
};

export default envConfig;
