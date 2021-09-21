// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { useCallback } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';

const { commission } = envConfig;

export const useGetFee = (): (price: BN) => BN => {
  const getFee = useCallback((price: BN): BN => {
    return new BN(price).mul(new BN(commission)).div(new BN(100));
  }, []);

  return getFee;
};
