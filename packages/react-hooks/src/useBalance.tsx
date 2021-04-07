// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';

import { useApi } from '@polkadot/react-hooks';

export interface BalanceInterface {
  free: BN;
  feeFrozen: BN;
  miscFrozen: BN;
  reserved: BN;
}

export interface UseBalanceInterface {
  balance: BalanceInterface | null;
  balanceError: boolean;
  existentialDeposit: BN | null;
  getAccountBalance: () => void;
}

export function useBalance (accountId?: string): UseBalanceInterface {
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
    } catch (e) {
      console.log('getAccountBalance error', e);
      setBalanceError(true);
    }
  }, [accountId, api]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void getAccountBalance();
  }, [getAccountBalance]);

  return { balance, balanceError, existentialDeposit, getAccountBalance };
}
