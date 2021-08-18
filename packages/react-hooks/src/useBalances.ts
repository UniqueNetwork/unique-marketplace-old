// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import BN from 'bn.js';
import { useEffect, useState } from 'react';

import { useApi, useCall, useKusamaApi } from '@polkadot/react-hooks';

interface UseBalancesInterface {
  freeBalance: BN | undefined;
  freeKusamaBalance: BN | undefined;
}

export const useBalances = (account: string | undefined, getUserDeposit?: () => Promise<BN | null>): UseBalancesInterface => {
  const { api } = useApi();
  const { kusamaApi } = useKusamaApi(account || '');
  const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances?.all, [account]);
  const kusamaBalancesAll = useCall<DeriveBalancesAll>(kusamaApi?.derive.balances?.all, [account]);
  const [freeBalance, setFreeBalance] = useState<BN>();
  const [freeKusamaBalance, setFreeKusamaBalance] = useState<BN>();

  useEffect(() => {
    // available balance used as free (transferable)
    if (balancesAll) {
      setFreeBalance(balancesAll.availableBalance);
    }
  }, [balancesAll]);

  useEffect(() => {
    // available balance used as free (transferable)
    if (kusamaBalancesAll) {
      setFreeKusamaBalance(kusamaBalancesAll.availableBalance);
    }
  }, [kusamaBalancesAll]);

  useEffect(() => {
    getUserDeposit && getUserDeposit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeBalance, freeKusamaBalance]);

  return {
    freeBalance,
    freeKusamaBalance
  };
};
