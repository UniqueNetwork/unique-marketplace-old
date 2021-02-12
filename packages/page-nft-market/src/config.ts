
const config = {
  wsEndpoint : process.env.wsEndpoint || 'ws://127.0.0.1:9944', //  'wss://unique.usetech.com',
  wsEndpointBrowser : 'ws://127.0.0.1:9944',
  //wsEndpoint : 'wss://wsnft.usetech.com',
  collectionId : 4,
  collectionDataSize: 20,
  aliceSeed : '//Alice',
  adminAddress : '5EX7TXyGRD5z2gLVc2yRAFY6pym2HHhMVCb3Zj3ai3x6BUnd',
  adminAccountPhrase : 'paper gas baby grid above unusual dog roof option spirit step damage',
  wsEndpointKusama: 'wss://kusama-rpc.polkadot.io',
  punksToImport: 10000,
  contractAddress: '5HcHQXGHxMCgdf7w7oRZ3Gws2BtSsGqzzs316V7ZtCs5nWb2',
  marketContractAddress: '5H3Cu2eJS5ipiQRoFaMTvgdeAGdEbEZrdA58WCWXdLSD8mGn',
  vaultAddress: '5Gs3Vmbsr2xaBLCKwTqvUfT511u14QB9jqks2WEsQyWvNvLC',
  value: 0,
  maxgas: 1000000000000,
};

export default config;
