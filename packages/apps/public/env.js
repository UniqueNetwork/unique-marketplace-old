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
    CONTRACT_ADDRESS: defaults('${CONTRACT_ADDRESS}', '0x6656d857a8FA7F447E51f8dF83234dAcd1C74527'),
    DECIMALS: defaults('${DECIMALS}', 6),
    ESCROW_ADDRESS: defaults('${ESCROW_ADDRESS}', '5DHbtZXFG9ZcvLqRECkYfzC3jSJktq1YB2KQrxQHdNV53pM7'),
    FAVICON_PATH: defaults('${FAVICON_PATH}', 'favicons/marketplace'),
    IPFS_GATEWAY: defaults('${IPFS_GATEWAY}', 'https://dev-ipfs.unique.network/ipfs'),
    KUSAMA_API: defaults('${KUSAMA_API}', 'wss://ws-relay-opal.unique.network'),
    KUSAMA_BACKUP_API: defaults('${KUSAMA_BACKUP_API}', 'wss://polkadot.api.onfinality.io/public-ws'),
    KUSAMA_DECIMALS: defaults('${KUSAMA_DECIMALS}', 12),
    MATCHER_OWNER_ADDRESS: defaults('${MATCHER_OWNER_ADDRESS}', '0xCFB8D32364F173051C2CC43eB165701e9E6737DF'),
    MAX_GAS: defaults('${MAX_GAS}', 1000000000000),
    MIN_PRICE: defaults('${MIN_PRICE}', 0.000001),
    MIN_TED_COLLECTION: defaults('${MIN_TED_COLLECTION}', 1),
    QUOTE_ID: defaults('${QUOTE_ID}', 2),
    UNIQUE_API: defaults('${UNIQUE_API}', 'https://dev-api.unique.network'),
    UNIQUE_COLLECTION_IDS: defaults('${UNIQUE_COLLECTION_IDS}', [23, 25, 155, 112, 113].join(',')),
    UNIQUE_SUBSTRATE_API: defaults('${UNIQUE_SUBSTRATE_API}', 'wss://ws-opal.unique.network'),
    UNIQUE_SUBSTRATE_API_RPC: defaults('${UNIQUE_SUBSTRATE_API_RPC}', 'https://rpc-opal.unique.network'),
    VALUE: defaults('${VALUE}', 1),
    WHITE_LABEL_URL: defaults('${WHITE_LABEL_URL}', 'https://whitelabel.unique.network')
  };

  // eslint-disable-next-line no-template-curly-in-string
  window.ENV.TAG = defaults('${TAG}', '');

  // eslint-disable-next-line no-template-curly-in-string
  window.ENV.PRODUCTION = defaults('${PRODUCTION}', false);
}(this));
