// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo } from 'react';

import menuArrow from '@polkadot/apps/images/menu-arrow.svg';
import { useBalances } from '@polkadot/react-hooks';
import { formatKsmBalance, formatStrBalance } from '@polkadot/react-hooks/useKusamaApi';

function MobileBalancesHeader ({ account }: { account?: string }): React.ReactElement<{ account?: string }> {
  const { freeBalance, freeKusamaBalance } = useBalances(account);

  return (
    <div className='app-balances-mobile'>
      <div className='app-balances-mobile--items'>
        <div className='app-balances-mobile--items--item'>
          {formatStrBalance(15, freeBalance)}
          <span className='unit'>UNQ</span>
        </div>
        <div className='app-balances-mobile--items--item'>
          {formatKsmBalance(freeKusamaBalance)}
          <span className='unit'>KSM</span>
        </div>
      </div>
      <img
        alt='menu-arrow'
        src={menuArrow as string}
      />
    </div>
  );
}

export default memo(MobileBalancesHeader);
