// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

(function (window) {
  function defaults (variable, defaults) {
    if (/^\$\{(.*)\}$/.test(variable)) {
      if (/^\$\{(.*)\}$/.test(defaults)) {
        return undefined;
      }

      return defaults;
    }

    switch (typeof defaults) {
      case 'boolean':
        if (variable === true.toString()) {
          return true;
        } else if (variable === false.toString()) {
          return false;
        } else {
          return !!variable;
        }

      case 'number':
        return Number(variable);
    }

    return variable || defaults;
  }

  window.ENV = window.ENV || {
    COMMISSION: defaults('${COMMISSION}', 10),
    CONTRACT_ADDRESS: defaults('${CONTRACT_ADDRESS}', '0xE44B4f684d648D049Edd85B9cae8725374443Bca'),
    DECIMALS: defaults('${DECIMALS}', 6),
    ESCROW_ADDRESS: defaults('${ESCROW_ADDRESS}', '5HiqhKESwEaPsZceRpCZ2Cgj3VLbQmjwuAmBhajdLuDhpdLY'),
    FAVICON_PATH: defaults('${FAVICON_PATH}', 'favicons/marketplace'),
    GRAPH_QL_ADMIN_SECRET: defaults('${GRAPH_QL_ADMIN_SECRET}', 'hepM3wfsATBoI-ix2uhsAodr1j99MThPF5LBZJI2YtHAax7W9BIP9F8IWuzcNUC4'),
    GRAPH_QL_API: defaults('${GRAPH_QL_API}', 'https://dev-api-explorer.unique.network/v1/graphql'),
    IMAGE_SERVER_URL: defaults('${IMAGE_SERVER_URL}', 'https://dev-offchain-api.unique.network'),
    IPFS_GATEWAY: defaults('${IPFS_GATEWAY}', 'https://dev-ipfs.unique.network/ipfs'),
    KUSAMA_API: defaults('${KUSAMA_API}', 'wss://ws-relay-opal.unique.network'),
    KUSAMA_BACKUP_API: defaults('${KUSAMA_BACKUP_API}', 'wss://polkadot.api.onfinality.io/public-ws'),
    KUSAMA_DECIMALS: defaults('${KUSAMA_DECIMALS}', 12),
    MATCHER_OWNER_ADDRESS: defaults('${MATCHER_OWNER_ADDRESS}', '0x396421AEE95879e8B50B9706d5FCfdeA6162eD1b'),
    MAX_GAS: defaults('${MAX_GAS}', 1000000000000),
    MIN_PRICE: defaults('${MIN_PRICE}', 0.000001),
    MIN_TED_COLLECTION: defaults('${MIN_TED_COLLECTION}', 1),
    QUOTE_ID: defaults('${QUOTE_ID}', 2),
    UNIQUE_API: defaults('${UNIQUE_API}', 'https://market-api-opal.unique.network'),
    UNIQUE_COLLECTION_IDS: defaults('${UNIQUE_COLLECTION_IDS}', [13, 22, 55, 124, 224, 238, 273, 288].join(',')),
    UNIQUE_SUBSTRATE_API: defaults('${UNIQUE_SUBSTRATE_API}', 'wss://opal.unique.network/'),
    UNIQUE_SUBSTRATE_API_RPC: defaults('${UNIQUE_SUBSTRATE_API_RPC}', 'https://rpc-opal.unique.network'),
    VALUE: defaults('${VALUE}', 1),
    WHITE_LABEL_URL: defaults('${WHITE_LABEL_URL}', 'https://whitelabel.unique.network')
  };

  // eslint-disable-next-line no-template-curly-in-string
  window.ENV.TAG = defaults('${TAG}', '');

  // eslint-disable-next-line no-template-curly-in-string
  window.ENV.PRODUCTION = defaults('${PRODUCTION}', false);
}(this));
