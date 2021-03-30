// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import {useCallback, useEffect} from 'react';

import { useBalance, useKusamaApi, useNftContract } from '@polkadot/react-hooks';
import { BalanceInterface } from '@polkadot/react-hooks/useBalance';

interface UseBalancesInterface {
  balance: BalanceInterface | null;
  deposited: BN | undefined;
  kusamaBalance: BalanceInterface | undefined;
  updateBalances: () => void;
}

export const useBalances = (account?: string): UseBalancesInterface => {
  const { getKusamaBalance, kusamaBalance } = useKusamaApi(account || '');
  const { deposited, getUserDeposit } = useNftContract(account || '');
  const { balance, getAccountBalance } = useBalance(account);

  const updateBalances = useCallback(() => {
    getKusamaBalance();
    void getUserDeposit();
    getAccountBalance();
  }, [getAccountBalance, getKusamaBalance, getUserDeposit]);

  useEffect(() => {
    void getUserDeposit();
  }, [getUserDeposit, kusamaBalance]);

  return {
    balance,
    deposited,
    kusamaBalance,
    updateBalances
  };
};
