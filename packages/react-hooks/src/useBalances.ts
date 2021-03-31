// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import BN from 'bn.js';
import { useCallback, useEffect } from 'react';

import { useApi, useCall, useKusamaApi, useNftContract } from '@polkadot/react-hooks';

interface UseBalancesInterface {
  balancesAll: DeriveBalancesAll | undefined;
  deposited: BN | undefined;
  kusamaBalancesAll: DeriveBalancesAll | undefined;
  updateBalances: () => void;
}

export const useBalances = (account?: string): UseBalancesInterface => {
  const { kusamaApi } = useKusamaApi(account || '');
  const { deposited, getUserDeposit } = useNftContract(account || '');
  const api = useApi();
  // const { balance, getAccountBalance } = useBalance(account);
  const balancesAll = useCall<DeriveBalancesAll>(api.api.derive.balances.all, [account]);
  const kusamaBalancesAll = useCall<DeriveBalancesAll>(kusamaApi?.derive.balances.all, [account]);

  console.log('kusamaBalancesAll', kusamaBalancesAll);

  const updateBalances = useCallback(() => {
    void getUserDeposit();
  }, [getUserDeposit]);

  useEffect(() => {
    void getUserDeposit();
  }, [getUserDeposit]);

  return {
    balancesAll,
    deposited,
    kusamaBalancesAll,
    updateBalances
  };
};
