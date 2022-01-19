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
  kusamaExistentialDeposit: BN | null;
}

export function useBalance (accountId?: string): UseBalanceInterface {
  const { api, kusamaApi } = useApi();
  const [balance, setBalance] = useState<BalanceInterface | null>(null);
  const [balanceError, setBalanceError] = useState<boolean>(false);
  const accountInfo = useCall<AccountInfoWithProviders | AccountInfoWithRefCount>(api.query.system.account, [accountId]);
  const existentialDeposit = api?.consts.balances.existentialDeposit;
  const kusamaExistentialDeposit = kusamaApi?.consts.balances?.existentialDeposit;

  const getAccountBalance = useCallback(() => {
    if (accountInfo) {
      setBalance(accountInfo.data);

      setBalanceError(false);
    }
  }, [accountInfo]);

  useEffect(() => {
    getAccountBalance();
  }, [getAccountBalance]);

  return { balance, balanceError, existentialDeposit, kusamaExistentialDeposit };
}
