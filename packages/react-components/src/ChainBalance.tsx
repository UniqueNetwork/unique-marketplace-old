// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import React, { memo } from 'react';

import { useApi } from '@polkadot/react-hooks';
import { formatStrBalance } from '@polkadot/react-hooks/utils';

const ChainBalance = ({ value }: { value: BN | undefined | null }) => {
  const { api } = useApi();
  const chainName = api?.registry.chainTokens[0];

  return (
    <>
      {formatStrBalance(value)} <span className='unit'>{chainName}</span>
    </>
  );
};

export default memo(ChainBalance);
