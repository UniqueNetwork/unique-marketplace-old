// Copyright 2020 UseTech authors & contributors
import { useCallback, useState } from 'react';
// import { useApi } from '@polkadot/react-hooks';
import { formatBalance } from '@polkadot/util';
import keyring from '@polkadot/ui-keyring';

const value = 0;
const maxgas = 1000000000000;
// const decimals = 12; // kusamaDecimals

export interface NftTokenInterface {
  collectionId: string;
  data: any;
  price: string;
  sellerAddress: string;
  tokenId: string;
}

// https://docs.google.com/document/d/1WED9VP8Yj52Un4qmkGDpzjesQTzwwoDgYMk1Ty8yftQ/edit
export function useNftContract(account: string) {
  // const { api } = useApi();
  // const [contractInstance, setContractInstance] = useState();
  const [contractInstance] = useState<any | undefined>();
  const [abi] = useState<any | undefined>();

  // get offers
  // if connection ID not specified, returns 30 last token sale offers
  const getUserDeposit = useCallback(async (): Promise<string | null> => {
    try {
      const result = await contractInstance.call('rpc', 'get_balance', value, maxgas, 2).send(account);
      if (result.output) {
        let balance = result.output;
        return formatBalance(balance);
      }
    } catch (e) {
      console.log('getUserDeposit Error: ', e);
    }
    return null;
  }, []);

  const getDepositor = useCallback(async (token: NftTokenInterface, readerAddress: string) => {
    try {
      // const keyring = new keyring({ type: 'sr25519' });
      const result = await contractInstance.call('rpc', 'get_nft_deposit', value, maxgas, token.collectionId, token.tokenId).send(readerAddress);
      if (result.output) {
        const address = keyring.encodeAddress(result.output.toString());
        console.log("Deposit address: ", address);
        return address;
      }
      return null;
    } catch (e) {
      console.log('getDepositor Error: ', e);
    }
    return null;
  }, [contractInstance, keyring]);

  return {
    abi,
    getDepositor,
    getUserDeposit
  };
}
