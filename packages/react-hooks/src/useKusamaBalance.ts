// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api/promise';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { useCall } from '@polkadot/react-hooks/useCall';

interface UseKusamaBalanceInterface {
  kusamaAvailableBalance: BN | undefined;
}

export const useKusamaBalance = (kusamaApi?: ApiPromise, account?: string): UseKusamaBalanceInterface => {
  const [kusamaAvailableBalance, setKusamaAvailableBalance] = useState<BN | undefined>();
  const kusamaBalancesAll = useCall<DeriveBalancesAll>(kusamaApi?.derive.balances?.all, [account]);

  const getKusamaBalance = useCallback(() => {
    setKusamaAvailableBalance(kusamaBalancesAll?.availableBalance);
  }, [kusamaBalancesAll?.availableBalance]);

  useEffect(() => {
    if (!account || !kusamaApi) {
      return;
    }

    void getKusamaBalance();
  }, [account, getKusamaBalance, kusamaApi]);

  return {
    kusamaAvailableBalance
  };
};
