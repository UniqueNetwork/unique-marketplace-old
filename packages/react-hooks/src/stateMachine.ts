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
    idle: {
      on: {
        UPDATE_TOKEN_STATE: 'loadingTokenInfo'
      }
    },
    loadingTokenInfo: {
      on: {
        BUY: 'buy',
        CANCEL: 'cancelSale',
        NFT_DEPOSIT_READY: 'askPrice',
        NO_OFFER_PLACED: 'idle',
        REVERT_UNUSED_MONEY: 'revertMoney',
        SALE: 'sale'
      }
    },
    revertMoney: {
      on: {
        WITHDRAW_ERROR: 'loadingTokenInfo',
        WITHDRAW_SUCCESS: 'loadingTokenInfo'
      }
    },
    cancelSale: {
      on: {
        CANCEL_SALE_FAIL: 'loadingTokenInfo',
        CANCEL_SALE_SUCCESS: 'loadingTokenInfo'
      }
    },
    sale: {
      on: {
        TRANSFER_NFT_TO_CONTRACT_FAIL: 'loadingTokenInfo',
        TRANSFER_NFT_TO_CONTRACT_SUCCESS: 'waitForDeposit'
      }
    },
    waitForDeposit: {
      on: {
        NFT_DEPOSIT_FAIL: 'waitForDeposit',
        NFT_DEPOSIT_READY: 'askPrice'
      }
    },
    registerSale: {
      on: {
        REGISTER_SALE_FAIL: 'askPrice',
        REGISTER_SALE_SUCCESS: 'loadingTokenInfo'
      }
    },
    buy: {
      on: {
        SEND_MONEY_FAIL: 'loadingTokenInfo',
        SEND_MONEY_SUCCESS: 'checkDepositReady'
      }
    },
    checkDepositReady: {
      on: {
        DEPOSIT_FAIL: 'checkDepositReady',
        DEPOSIT_SUCCESS: 'sentTokenToNewOwner'
      }
    },
    sentTokenToNewOwner: {
      on: {
        SEND_TOKEN_FAIL: 'loadingTokenInfo',
        SEND_TOKEN_SUCCESS: 'loadingTokenInfo'
      }
    }
  }
});

export default marketplaceStateMachine;
