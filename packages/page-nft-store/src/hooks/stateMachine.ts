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
        SALE: 'sale',
        NO_OFFER_PLACED: 'idle',
        CANCEL: 'cancelSale',
        BUY: 'buy',
        REVERT_UNUSED_KSM: 'revertKsm'
      }
    },
    revertKsm: {
      on: {
        WITHDRAW_SUCCESS: 'loadingTokenInfo',
        WITHDRAW_ERROR: 'loadingTokenInfo'
      }
    },
    cancelSale: {
      on: {
        SUCCESS: 'loadingTokenInfo',
        FAIL: 'registerDeposit'
      }
    },
    sale: {
      on: {
        TRANSFER_NFT_TO_CONTRACT_SUCCESS: 'registerDeposit',
        TRANSFER_NFT_TO_CONTRACT_FAIL: 'loadingTokenInfo'
      }
    },
    registerDeposit: {
      on: {
        SUCCESS: 'getDepositReady',
      }
    },
    getDepositReady: {
      on: {
        NFT_DEPOSIT_READY: 'askPrice',
        NFT_DEPOSIT_FAIL: 'registerDeposit'
      }
    },
    askPrice: {
      on: {
        ASK_PRICE_SUCCESS: 'loadingTokenInfo',
        ASK_PRICE_FAIL: 'askPrice'
      }
    },
    buy: {
      on: {
        DEPOSIT_SUCCESS: 'sentTokenToNewOwner',
        DEPOSIT_FAIL: 'loadingTokenInfo'
      }
    },
    sentTokenToNewOwner: {
      on: {
        SEND_TOKEN_SUCCESS: 'loadingTokenInfo',
        SEND_TOKEN_FAIL: 'loadingTokenInfo'
      }
    }
  }
});

export default marketplaceStateMachine;
