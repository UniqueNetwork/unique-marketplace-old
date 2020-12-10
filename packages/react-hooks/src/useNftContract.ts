// Copyright 2020 UseTech authors & contributors
import { useCallback, useState } from 'react';
import { useApi } from '@polkadot/react-hooks';
import { formatBalance } from '@polkadot/util';

const value = 0;
const maxgas = 1000000000000;
// const decimals = 12; // kusamaDecimals

// https://docs.google.com/document/d/1WED9VP8Yj52Un4qmkGDpzjesQTzwwoDgYMk1Ty8yftQ/edit
export function useNftContract(account) {
  const { api } = useApi();
  const [contractInstance, setContractInstance] = useState();

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
      console.log("getUserDeposit Error: ", e);
    }
    return null;
  }, []);

  return {
    getUserDeposit
  };
}
