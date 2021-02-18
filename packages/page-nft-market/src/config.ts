// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

const config = {
  adminAccountPhrase: 'paper gas baby grid above unusual dog roof option spirit step damage',
  adminAddress: '5EX7TXyGRD5z2gLVc2yRAFY6pym2HHhMVCb3Zj3ai3x6BUnd',
  aliceSeed: '//Alice',
  collectionDataSize: 20,
  collectionId: 4,
  contractAddress: '5HcHQXGHxMCgdf7w7oRZ3Gws2BtSsGqzzs316V7ZtCs5nWb2',
  marketContractAddress: '5H3Cu2eJS5ipiQRoFaMTvgdeAGdEbEZrdA58WCWXdLSD8mGn',
  maxgas: 1000000000000,
  punksToImport: 10000,
  value: 0,
  vaultAddress: '5Gs3Vmbsr2xaBLCKwTqvUfT511u14QB9jqks2WEsQyWvNvLC',
  wsEndpoint: process.env.wsEndpoint || 'ws://127.0.0.1:9944', //  'wss://unique.usetech.com',
  wsEndpointBrowser: 'ws://127.0.0.1:9944',
  // wsEndpoint : 'wss://wsnft.usetech.com',
  wsEndpointKusama: 'wss://kusama-rpc.polkadot.io'
};

export default config;
