// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Machine } from 'xstate';

const marketplaceStateMachine = Machine({
  id: 'marketplace',
  initial: 'idle',
  states: {
    askPrice: {
      on: {
        ASK_PRICE_FAIL: 'askPrice',
        ASK_PRICE_SUCCESS: 'registerSale'
      }
    },
    buy: {
      on: {
        SEND_MONEY_FAIL: 'loadingTokenInfo',
        SEND_MONEY_SUCCESS: 'checkDepositReady'
      }
    },
    cancelSale: {
      on: {
        CANCEL_SALE_FAIL: 'loadingTokenInfo',
        CANCEL_SALE_SUCCESS: 'loadingTokenInfo'
      }
    },
    checkDepositReady: {
      on: {
        DEPOSIT_FAIL: 'checkDepositReady',
        DEPOSIT_SUCCESS: 'sentTokenToNewOwner'
      }
    },
    idle: {
      on: {
        BUY: 'buy',
        CANCEL: 'cancelSale',
        REVERT_UNUSED_MONEY: 'revertMoney',
        SELL: 'sell',
        UPDATE_TOKEN_STATE: 'loadingTokenInfo'
      }
    },
    loadingTokenInfo: {
      on: {
        WAIT_FOR_DEPOSIT: 'waitForDeposit',
        WAIT_FOR_USER_ACTION: 'idle'
      }
    },
    registerSale: {
      on: {
        REGISTER_SALE_FAIL: 'askPrice',
        REGISTER_SALE_SUCCESS: 'loadingTokenInfo'
      }
    },
    revertMoney: {
      on: {
        WITHDRAW_FAIL: 'loadingTokenInfo',
        WITHDRAW_SUCCESS: 'loadingTokenInfo'
      }
    },
    sell: {
      on: {
        TRANSACTION_READY: 'waitForSignTransfer',
        TRANSFER_FAIL: 'loadingTokenInfo'
      }
    },
    sentTokenToNewOwner: {
      on: {
        SEND_TOKEN_FAIL: 'loadingTokenInfo',
        SEND_TOKEN_SUCCESS: 'loadingTokenInfo'
      }
    },
    waitForDeposit: {
      on: {
        NFT_DEPOSIT_FAIL: 'waitForDeposit',
        NFT_DEPOSIT_OTHER: 'loadingTokenInfo',
        NFT_DEPOSIT_READY: 'askPrice'
      }
    },
    waitForSignTransfer: {
      on: {
        TRANSFER_FAIL: 'loadingTokenInfo',
        TRANSFER_SUCCESS: 'waitForDeposit'
      }
    }
  }
});

export default marketplaceStateMachine;
