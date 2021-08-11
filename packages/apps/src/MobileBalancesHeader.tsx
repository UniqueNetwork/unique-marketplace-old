// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OpenPanelType } from '@polkadot/apps-routing/types';

import React, { memo, useCallback } from 'react';

import menuArrow from '@polkadot/apps/images/menu-arrow.svg';
import { useBalances } from '@polkadot/react-hooks';
import { formatKsmBalance, formatStrBalance } from '@polkadot/react-hooks/useKusamaApi';

interface Props {
  account?: string,
  isMobileMenu: OpenPanelType;
  setIsMobileMenu: (isOpen: OpenPanelType) => void;
}

function MobileBalancesHeader (props: Props): React.ReactElement<{ account?: string }> {
  const { account, isMobileMenu, setIsMobileMenu } = props;
  const { freeBalance, freeKusamaBalance } = useBalances(account);

  const onClick = useCallback(() => {
    if (isMobileMenu !== 'balances') {
      setIsMobileMenu('balances');
    } else {
      setIsMobileMenu('tokens');
    }
  }, [isMobileMenu, setIsMobileMenu]);

  return (
    <div
      className='app-balances-mobile'
      onClick={onClick}
    >
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
