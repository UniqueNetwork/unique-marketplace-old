import { Machine } from 'xstate';

const marketplaceStateMachine = Machine({
  id: 'marketplace',
  initial: 'idle',
  states: {
    idle: {
      on: {
        OPEN_TOKEN_WINDOW: 'loadingTokenInfo'
      }
    },
    loadingTokenInfo: {
      on: {
        SALE: 'sale',
        NO_OFFER_PLACED: 'idle',
        CANCEL: 'cancelSale',
        BUY: 'buy',
      }
    },
    cancelSale: {
      on: {
        SUCCESS: 'loadingTokenInfo',
        FAIL: 'registerDeposit'
      }
    },
    takeChargeDeposit: {
      on: {
        REVERT: 'revertNftToUser',
        LIVE: 'loadingTokenInfo'
      }
    },
    revertNftToUser: {
      on: {
        SUCCESS: 'loadingTokenInfo',
        FAIL: 'takeChargeDeposit'
      }
    },
    sale: {
      on: {
        SUCCESS: 'registerDeposit',
        FAIL: 'loadingTokenInfo'
      }
    },
    registerDeposit: {
      on: {
        SUCCESS: 'getDepositReady',
      }
    },
    getDepositReady: {
      on: {
        SUCCESS: 'askPrice',
        FAIL: 'registerDeposit'
      }
    },
    askPrice: {
      on: {
        SALE_SUCCESS: 'loadingTokenInfo',
        SALE_CANCEL: 'cancelSale'
      }
    },
    buy: {
      on: {
        DEPOSIT_SUCCESS: 'sentKsm',
        DEPOSIT_FAIL: 'loadingTokenInfo'
      }
    },
    sentKsm: {
      on: {
        BUY_SUCCESS: 'loadingTokenInfo',
        BUY_FAIL: 'loadingTokenInfo'
      }
    }
  }
});

export default marketplaceStateMachine;
