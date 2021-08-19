// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';

import { ApiPromise } from '@polkadot/api/promise';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { useCall } from '@polkadot/react-hooks/useCall';

interface UseKusamaBalanceInterface {
  kusamaAvailableBalance: BN | undefined;
}

export const useKusamaBalance = (kusamaApi?: ApiPromise, account?: string): UseKusamaBalanceInterface => {
  const kusamaBalancesAll = useCall<DeriveBalancesAll>(kusamaApi?.derive.balances?.all, [account]);

  return {
    kusamaAvailableBalance: kusamaBalancesAll?.availableBalance
  };
};
