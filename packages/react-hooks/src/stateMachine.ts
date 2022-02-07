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
        SIGN_SUCCESS: 'checkDepositReady',
        SIGN_TRANSACTION_FAIL: 'loadingTokenInfo'
      }
    },
    buyToken: {
      on: {
        SIGN_FAIL: 'loadingTokenInfo',
        SIGN_SUCCESS: 'waitForTokenRevert'
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
        ALREADY_APPROVED: 'checkAsk',
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
        HAS_MINT_DEPOSIT: 'checkIsOnEth',
        NO_MIN_DEPOSIT: 'transferMinDeposit'
      }
    },
    checkIsOnEth: {
      on: {
        IS_ON_ETH_ADDRESS: 'approveToken',
        IS_ON_SUB_ADDRESS: 'transferToEth'
      }
    },
    transferMinDeposit: {
      on: {
        SIGN_SUCCESS: 'waitForWhiteListing',
        SIGN_TRANSACTION_FAIL: 'loadingTokenInfo',
        TRANSFER_SUCCESS: 'waitForWhiteListing'
      }
    },
    waitForWhiteListing: {
      on: {
        HAS_MINT_DEPOSIT: 'checkIsOnEth'
      }
    },
    transferToEth: {
      on: {
        SIGN_TRANSACTION_FAIL: 'loadingTokenInfo',
        TRANSFER_START: 'transferToEthStart'
      }
    },
    transferToEthStart: {
      on: {
        SIGN_SUCCESS: 'approveToken',
        SIGN_TRANSACTION_FAIL: 'loadingTokenInfo'
      }
    },
    transferToSub: {
      on: {
        SIGN_TRANSACTION_FAIL: 'loadingTokenInfo',
        TRANSFER_START: 'transferToSubStart'
      }
    },
    transferToSubStart: {
      on: {
        SIGN_SUCCESS: 'loadingTokenInfo',
        SIGN_TRANSACTION_FAIL: 'loadingTokenInfo'
      }
    },
    waitForTokenRevert: {
      on: {
        IS_ON_ETH_ADDRESS: 'transferToSub',
        IS_ON_SUB_ADDRESS: 'loadingTokenInfo'
      }
    }
  }
});

export default marketplaceStateMachine;
