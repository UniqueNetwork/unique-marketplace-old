// Copyright 2020-2021 UseTech authors & contributors

import BN from 'bn.js';

import { useCallback, useEffect, useState } from 'react';

import { useApi } from '@polkadot/react-hooks';

export interface BalanceInterface {
  free: BN;
  feeFrozen: BN;
  miscFrozen: BN;
  reserved: BN;
}

export default function useBalance (accountId: string | null) {
  const { api } = useApi();
  const [balance, setBalance] = useState<BalanceInterface | null>(null);
  const [balanceError, setBalanceError] = useState<boolean>(false);
  const [existentialDeposit, setExistentialDeposit] = useState<BN | null>(null);

  const getAccountBalance = useCallback(async () => {
    try {
      if (!accountId || !api) {
        return;
      }

      const accountBalance: { data: BalanceInterface } = await api.query.system.account(accountId);

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
    // eslint-disable-next-line no-void
    void getAccountBalance();
  }, [getAccountBalance]);

  return { balance, balanceError, existentialDeposit };
}
