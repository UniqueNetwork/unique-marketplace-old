// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OpenPanelType } from '@polkadot/apps-routing/types';

import React, { memo, useCallback, useState } from 'react';

import menuArrow from '@polkadot/apps/images/menu-arrow.svg';
import ManageBalances from '@polkadot/apps/ManageBalances';
import { useBalances } from '@polkadot/react-hooks';
import { formatKsmBalance, formatStrBalance } from '@polkadot/react-hooks/useKusamaApi';

interface Props {
  account?: string,
  isMobileMenu: OpenPanelType;
  setOpenPanel: (isOpen: OpenPanelType) => void;
  isPopupMode: boolean
}

function BalancesHeader (props: Props): React.ReactElement<{ account?: string }> {
  const { account, isMobileMenu, isPopupMode, setOpenPanel } = props;
  const { freeBalance, freeKusamaBalance } = useBalances(account);

  const [isPopupActive, setIsPopupActive] = useState<boolean>(false);

  const onClick = useCallback(() => {
    if (!isPopupMode) {
      if (isMobileMenu !== 'balances') {
        setOpenPanel('balances');
      } else {
        setOpenPanel('tokens');
      }
    } else {
      setIsPopupActive((prev) => !prev);
    }
  }, [isMobileMenu, isPopupMode, setOpenPanel]);

  return (
    <div
      className='app-balances'
    >
      <div className='app-balances-items 323'
        onClick={onClick}>
        <div className='app-balances-items-item'>
          {formatStrBalance(15, freeBalance)}
          <span className='unit'>UNQ</span>
        </div>
        <div className='app-balances-items-item'>
          {formatKsmBalance(freeKusamaBalance)}
          <span className='unit'>KSM</span>
        </div>
      </div>
      <div className={isPopupActive ? 'rotate-icon' : 'icon'}>
        <img
          alt='menu-arrow'
          onClick={onClick}
          src={menuArrow as string}
        />
      </div>

      { isPopupMode &&
        <ManageBalances
          account={account}
          isPopupActive={isPopupActive}
          isPopupMode={isPopupMode}
        />
      }
    </div>
  );
}

export default memo(BalancesHeader);
