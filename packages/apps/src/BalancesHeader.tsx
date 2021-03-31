// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo } from 'react';

import { useBalances } from '@polkadot/react-hooks';
import { formatKsmBalance, formatStrBalance } from '@polkadot/react-hooks/useKusamaApi';

import balanceUpdate from '../public/icons/balanceUpdate.svg';

function BalancesHeader ({ account }: { account?: string }): React.ReactElement<{ account?: string }> {
  const { balancesAll, deposited, kusamaBalancesAll, updateBalances } = useBalances(account);

  return (
    <div className='app-balances'>
      <div className='app-balance--item'>
        <small>balance</small>
        {formatStrBalance(15, balancesAll?.freeBalance)} UNQ
      </div>
      <div className='app-balance--item'>
        <small>deposit</small>
        {formatKsmBalance(deposited)} KSM
      </div>
      <div className='app-balance--item'>
        <small>balance</small>
        {formatKsmBalance(kusamaBalancesAll?.freeBalance)} KSM
      </div>
      <img
        alt='balance-update'
        onClick={updateBalances}
        src={balanceUpdate as string}
      />
    </div>
  );
}

export default memo(BalancesHeader);
