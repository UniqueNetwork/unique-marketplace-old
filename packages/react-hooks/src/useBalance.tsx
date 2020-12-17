// Copyright 2017-2020 @polkadot/react-hooks authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState, useCallback } from 'react';
import { useApi } from '@polkadot/react-hooks';

export function useBalance (accountId: string | null) {
  const { api } = useApi();
  const [balance, setBalance] = useState<any | null>(null);
  const [balanceError, setBalanceError] = useState<boolean>(false);
  const [existentialDeposit, setExistentialDeposit] = useState<any | null>(null);
  const getAccountBalance = useCallback( async () => {
    try {
      if (!accountId || !api) {
        return;
      }
      const accountBalance: any = await api.query.system.account(accountId);
      setBalance(accountBalance.data);
      setBalanceError(false);
      const existentialDeposit = api.consts.balances.existentialDeposit;
      setExistentialDeposit(existentialDeposit);
      // add transfer fees
      // const transferFees = await api.tx.nft.transfer('0', '0', accountId).paymentInfo(accountId);
      // console.log('transferFees', transferFees);
    } catch (e) {
      console.log('getAccountBalance error', e);
      setBalanceError(true);
    }
  }, [accountId, api]);

  useEffect(() => {
    void getAccountBalance();
  }, [accountId, api]);

  return { balance, existentialDeposit, balanceError };
}
