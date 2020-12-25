export interface PunkForSaleInterface {
  id: string;
  isOwned: boolean;
  my: boolean;
  price: string;
}

export interface Punk {
  originalId : string;
  owner: string;
  sex: string;
  attributes: Array<string>,
  isOwned: boolean;
}

export interface NftTokenInterface {
  collectionId: string;
  data: any;
  price: string;
  sellerAddress: string;
  tokenId: string;
}

export interface MarketplaceStateMachineSchema {
  states: {
    idle: {};
    loadingTokenInfo: {};
    revertKsm: {};
    cancelSale: {};
    sale: {};
    registerDeposit: {};
    getDepositReady: {};
    askPrice: {};
    registerSale: {};
    buy: {};
    sentTokenToNewOwner: {};
  }
}

export type MarketplaceStateMachineEvent =
  | { type: 'UPDATE_TOKEN_STATE' }
  | { type: 'SALE' }
  | { type: 'NO_OFFER_PLACED' }
  | { type: 'CANCEL' }
  | { type: 'BUY' }
  | { type: 'REVERT_UNUSED_KSM' }
  | { type: 'WITHDRAW_SUCCESS' }
  | { type: 'WITHDRAW_ERROR' }
  | { type: 'CANCEL_SALE_SUCCESS' }
  | { type: 'CANCEL_SALE_FAIL' }
  | { type: 'TRANSFER_NFT_TO_CONTRACT_SUCCESS' }
  | { type: 'TRANSFER_NFT_TO_CONTRACT_FAIL' }
  | { type: 'REGISTER_DEPOSIT_SUCCESS' }
  | { type: 'NFT_DEPOSIT_READY' }
  | { type: 'NFT_DEPOSIT_FAIL' }
  | { type: 'ASK_PRICE_SUCCESS' }
  | { type: 'ASK_PRICE_FAIL' }
  | { type: 'REGISTER_SALE_SUCCESS' }
  | { type: 'REGISTER_SALE_FAIL' }
  | { type: 'DEPOSIT_SUCCESS' }
  | { type: 'DEPOSIT_FAIL' }
  | { type: 'SEND_TOKEN_SUCCESS' }
  | { type: 'SEND_TOKEN_FAIL' };

export interface MarketplaceStateMachineContext {
  elapsed: number;
}
