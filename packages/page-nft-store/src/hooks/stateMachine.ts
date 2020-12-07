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
        CANCEL: 'cancelSale',
        BUY: 'buy'
      }
    },
    cancelSale: {
      on: {
        CANCEL: 'cancelTransaction',
      }
    },
    cancelTransaction: {
      on: {
        SUCCESS: 'revertNftToUser',
        FAIL: 'failure'
      }
    },
    revertNftToUser: {
      on: {
        SUCCESS: 'success',
        FAIL: 'failure'
      }
    },
    sale: {
      on: {
        START_SALE: 'transferNftToEscrow'
      }
    },
    transferNftToEscrow: {
      on: {
        SUCCESS: 'setNftPrice',
        FAIL: 'failure'
      }
    },
    setNftPrice: {
      on: {
        SUCCESS: 'askTransaction',
        FAIL: 'failure'
      }
    },
    askTransaction: {
      on: {
        SUCCESS: 'registerSale',
        FAIL: 'failure'
      }
    },
    registerSale: {
      on: {
        SUCCESS: 'success',
        FAIL: 'failure'
      }
    },
    registerNftInEscrow: {
      on: {
        SUCCESS: 'registerNftInEscrow',
        FAIL: 'failure'
      }
    },
    buy: {
      on: {
        LOCK: 'locking'
      }
    },
    locking: {
      on: {
        SUCCESS: 'calculateCommission',
        FAIL: 'failure'
      }
    },
    calculateCommission: {
      on: {
        SUCCESS: 'showCommission',
        FAIL: 'failure'
      }
    },
    showCommission: {
      on: {
        SUCCESS: 'checkUserEscrowBalance',
        FAIL: 'failure'
      }
    },
    checkUserEscrowBalance: {
      on: {
        SUCCESS: 'transferMoneyToEscrow',
        FAIL: 'failure'
      }
    },
    transferMoneyToEscrow: {
      on: {
        SUCCESS: 'registerMoneyTransfer',
        FAIL: 'failure'
      }
    },
    registerMoneyTransfer: {
      on: {
        SUCCESS: 'buyNft',
        FAIL: 'failure'
      }
    },
    buyNft: {
      on: {
        SUCCESS: 'success',
        FAIL: 'failure'
      }
    },
    failure: {
      on: {
        RETRY: {
          target: 'loadingTokenInfo',
        }
      }
    },
    success: {
      type: 'final'
    }
  }
});

export default marketplaceStateMachine;
