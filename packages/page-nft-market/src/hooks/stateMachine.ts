import { Machine } from 'xstate';

const marketplaceStateMachine = Machine({
  id: 'marketplace',
  initial: 'idle',
  states: {
    idle: {
      on: {
        UPDATE_TOKEN_STATE: 'loadingTokenInfo'
      }
    },
    loadingTokenInfo: {
      on: {
        BUY: 'buy',
        CANCEL: 'cancelSale',
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
        TRANSFER_NFT_TO_CONTRACT_SUCCESS: 'registerDeposit'
      }
    },
    registerDeposit: {
      on: {
        REGISTER_DEPOSIT_SUCCESS: 'getDepositReady'
      }
    },
    getDepositReady: {
      on: {
        NFT_DEPOSIT_FAIL: 'registerDeposit',
        NFT_DEPOSIT_READY: 'askPrice'
      }
    },
    askPrice: {
      on: {
        ASK_PRICE_FAIL: 'askPrice',
        ASK_PRICE_SUCCESS: 'registerSale'
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
