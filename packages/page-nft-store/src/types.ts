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
