// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import BN from 'bn.js';
import { useEffect, useState } from 'react';

import { useCall, useKusamaApi } from '@polkadot/react-hooks';

export const useKusamaAvailableBalance = (account: string | undefined): BN | undefined => {
  const { kusamaApi } = useKusamaApi(account || '');
  const kusamaBalancesAll = useCall<DeriveBalancesAll>(kusamaApi?.derive.balances?.all, [account]);
  const [freeKusamaBalance, setFreeKusamaBalance] = useState<BN>();

  useEffect(() => {
    if (kusamaBalancesAll) {
      setFreeKusamaBalance(kusamaBalancesAll.availableBalance);
    }
  }, [kusamaBalancesAll]);

  return freeKusamaBalance;
};
