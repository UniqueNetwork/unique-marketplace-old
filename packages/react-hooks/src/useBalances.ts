// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import BN from 'bn.js';
import { useEffect } from 'react';

import { useApi, useCall, useKusamaApi } from '@polkadot/react-hooks';

interface UseBalancesInterface {
  balancesAll: DeriveBalancesAll | undefined;
  deposited: BN | undefined;
  kusamaBalancesAll: DeriveBalancesAll | undefined;
}

export const useBalances = (account: string | undefined, deposited: BN | undefined, getUserDeposit: () => Promise<BN | null>): UseBalancesInterface => {
  const { api } = useApi();
  const { kusamaApi } = useKusamaApi(account || '');
  const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances?.all, [account]);
  const kusamaBalancesAll = useCall<DeriveBalancesAll>(kusamaApi?.derive.balances?.all, [account]);

  useEffect(() => {
    void getUserDeposit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balancesAll, kusamaBalancesAll]);

  return {
    balancesAll,
    deposited,
    kusamaBalancesAll
  };
};
