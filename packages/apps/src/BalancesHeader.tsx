// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useCallback } from 'react';
import Popup from 'semantic-ui-react/dist/commonjs/modules/Popup';

import { useBalances } from '@polkadot/react-hooks';
import { formatKsmBalance, formatStrBalance } from '@polkadot/react-hooks/useKusamaApi';

import balanceUpdate from '../public/icons/balanceUpdate.svg';

function BalancesHeader ({ account }: { account?: string }): React.ReactElement<{ account?: string }> {
  const { balancesAll, deposited, kusamaBalancesAll } = useBalances(account);

  const withdrawDeposit = useCallback(() => {
    console.log('withdrawDeposit');
  }, []);

  return (
    <div className='app-balances'>
      <div className='app-balance--item'>
        <small>balance</small>
        {formatStrBalance(15, balancesAll?.freeBalance)} UNQ
      </div>
      <div className='app-balance--item'>
        <small>balance</small>
        {formatKsmBalance(kusamaBalancesAll?.freeBalance)} KSM
      </div>
      <div className='app-balance--item'>
        <small>deposit</small>
        {formatKsmBalance(deposited)} KSM
        <Popup
          content='Withdraw your ksm deposit'
          trigger={<img
            alt='balance-update'
            onClick={withdrawDeposit}
            src={balanceUpdate as string}
          />}
        />
      </div>
    </div>
  );
}

export default memo(BalancesHeader);
