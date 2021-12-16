// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createMachine } from 'xstate';

interface Context {
  retries: number;
}

const marketplaceStateMachine = createMachine<Context>({
  id: 'marketplace',
  initial: 'idle',
  states: {
    addAsk: {
      on: {
        SIGN_TRANSACTION_FAIL: 'checkAsk',
        SIGN_TRANSACTION_SUCCESS: 'loadingTokenInfo'
      }
    },
    approveToken: {
      on: {
        ALREADY_APPROVED: 'checkAsk',
        SIGN_TRANSACTION_FAIL: 'loadingTokenInfo',
        SIGN_TRANSACTION_SUCCESS: 'checkAsk'
      }
    },
    buy: {
      on: {
        DEPOSIT_ENOUGH: 'checkDepositReady',
        DEPOSIT_NOT_ENOUGH: 'sendKsmToContract'
      }
    },
    buyToken: {
      on: {
        SIGN_FAIL: 'loadingTokenInfo',
        SIGN_SUCCESS: 'loadingTokenInfo'
      }
    },
    cancelSell: {
      on: {
        CANCEL_SELL_FAIL: 'loadingTokenInfo',
        CANCEL_SELL_SUCCESS: 'waitForTokenRevert'
      }
    },
    checkAsk: {
      on: {
        ASK_NOT_REGISTERED: 'openAskModal',
        ASK_REGISTERED: 'loadingTokenInfo'
      }
    },
    checkDepositReady: {
      on: {
        DEPOSIT_FAIL: 'checkDepositReady',
        DEPOSIT_SUCCESS: 'buyToken'
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
        WAIT_FOR_USER_ACTION: 'idle'
      }
    },
    openAskModal: {
      on: {
        ASK_FILLED: 'addAsk',
        ASK_NOT_FILLED: 'checkAsk'
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
        IS_ON_ETH_ADDRESS: 'approveToken',
        IS_ON_SUB_ADDRESS: 'transferToEth'
      }
    },
    sendKsmToContract: {
      on: {
        SIGN_FAIL: 'loadingTokenInfo',
        SIGN_SUCCESS: 'checkDepositReady'
      }
    },
    transferToEth: {
      on: {
        SIGN_SUCCESS: 'approveToken',
        SIGN_TRANSACTION_FAIL: 'loadingTokenInfo'
      }
    },
    transferToSub: {
      on: {
        SIGN_SUCCESS: 'loadingTokenInfo',
        SIGN_TRANSACTION_FAIL: 'loadingTokenInfo'
      }
    },
    waitForTokenRevert: {
      on: {
        IS_ON_ETH_ADDR: 'transferToSub',
        IS_ON_SUB_ADDR: 'loadingTokenInfo'
      }
    }
  }
});

export default marketplaceStateMachine;
