// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api/promise';

interface UseKusamaBalanceInterface {
  kusamaAvailableBalance: BN | undefined;
}

export const useKusamaBalance = (kusamaApi?: ApiPromise, encodedKusamaAccount?: string): UseKusamaBalanceInterface => {
  const [kusamaAvailableBalance, setKusamaAvailableBalance] = useState<BN | undefined>();
  const getKusamaBalance = useCallback(async () => {
    try {
      if (kusamaApi && encodedKusamaAccount) {
        const kusamaAccountBalance: { availableBalance: BN } = await kusamaApi?.derive.balances?.all(encodedKusamaAccount);

        setKusamaAvailableBalance(kusamaAccountBalance.availableBalance);
      }
    } catch (e) {
      console.log('kusama balance error', e);
    }
  }, [encodedKusamaAccount, kusamaApi]);

  useEffect(() => {
    if (!encodedKusamaAccount || !kusamaApi) {
      return;
    }

    void getKusamaBalance();
  }, [encodedKusamaAccount, getKusamaBalance, kusamaApi]);

  return {
    kusamaAvailableBalance
  };
};
