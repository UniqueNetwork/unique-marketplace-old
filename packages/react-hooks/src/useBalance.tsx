// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountInfoWithProviders, AccountInfoWithRefCount } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';

import { useApi, useCall } from '@polkadot/react-hooks';

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
}

export function useBalance (accountId?: string): UseBalanceInterface {
  const { api } = useApi();
  const [balance, setBalance] = useState<BalanceInterface | null>(null);
  const [balanceError, setBalanceError] = useState<boolean>(false);
  const [existentialDeposit, setExistentialDeposit] = useState<BN | null>(null);
  const accountInfo = useCall<AccountInfoWithProviders | AccountInfoWithRefCount>(api.query.system.account, [accountId]);

  const getAccountBalance = useCallback(() => {
    if (accountInfo) {
      console.log('accountInfo', accountInfo);
      setBalance(accountInfo.data);

      setBalanceError(false);
      const existentialDeposit = api.consts.balances.existentialDeposit;

      setExistentialDeposit(existentialDeposit);
    }
  }, [accountInfo, api]);

  useEffect(() => {
    getAccountBalance();
  }, [getAccountBalance]);

  return { balance, balanceError, existentialDeposit };
}
