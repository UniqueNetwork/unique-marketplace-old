// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Machine } from 'xstate';

const marketplaceStateMachine = Machine({
  id: 'marketplace',
  initial: 'idle',
  states: {
    askPrice: {
      on: {
        ASK_PRICE_FAIL: 'waitForNftDeposit',
        ASK_PRICE_SUCCESS: 'registerSale'
      }
    },
    buy: {
      on: {
        SIGN_FAIL: 'loadingTokenInfo',
        SIGN_SUCCESS: 'waitForSignMoneyTransfer',
        WAIT_FOR_DEPOSIT: 'checkDepositReady'
      }
    },
    cancelSell: {
      on: {
        CANCEL_SELL_FAIL: 'loadingTokenInfo',
        CANCEL_SELL_SUCCESS: 'waitForTokenRevert'
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
        CANCEL: 'cancelSell',
        REVERT_UNUSED_MONEY: 'revertMoney',
        SELL: 'sell',
        UPDATE_TOKEN_STATE: 'loadingTokenInfo'
      }
    },
    loadingTokenInfo: {
      on: {
        WAIT_FOR_DEPOSIT: 'waitForNftDeposit',
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
        SIGN_FAIL: 'loadingTokenInfo',
        SIGN_SUCCESS: 'waitForSignTokenBuy'
      }
    },
    waitForNftDeposit: {
      on: {
        NFT_DEPOSIT_FAIL: 'waitForNftDeposit',
        NFT_DEPOSIT_OTHER: 'loadingTokenInfo',
        NFT_DEPOSIT_READY: 'askPrice'
      }
    },
    waitForSignMoneyTransfer: {
      on: {
        SEND_MONEY_FAIL: 'loadingTokenInfo',
        SEND_MONEY_SUCCESS: 'checkDepositReady'
      }
    },
    waitForSignTokenBuy: {
      on: {
        SEND_TOKEN_FAIL: 'loadingTokenInfo',
        SEND_TOKEN_SUCCESS: 'waitForTokenOwn'
      }
    },
    waitForSignTransfer: {
      on: {
        TRANSFER_FAIL: 'loadingTokenInfo',
        TRANSFER_SUCCESS: 'waitForNftDeposit'
      }
    },
    waitForTokenOwn: {
      on: {
        TOKEN_REVERT_FAIL: 'waitForTokenOwn',
        TOKEN_REVERT_SUCCESS: 'loadingTokenInfo'
      }
    },
    waitForTokenRevert: {
      on: {
        TOKEN_REVERT_FAIL: 'waitForTokenRevert',
        TOKEN_REVERT_SUCCESS: 'loadingTokenInfo'
      }
    }
  }
});

export default marketplaceStateMachine;
