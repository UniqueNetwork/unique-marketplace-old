// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OpenPanelType } from '@polkadot/apps-routing/types';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import menuArrow from '@polkadot/apps/images/menu-arrow.svg';
import PopupMenu from '@polkadot/react-components/PopupMenu';
import { useBalances } from '@polkadot/react-hooks';
import { formatKsmBalance, formatStrBalance } from '@polkadot/react-hooks/useKusamaApi';

interface Props {
  account?: string,
  isMobileMenu: OpenPanelType;
  setOpenPanel: (isOpen: OpenPanelType) => void;
}

function BalancesHeader (props: Props): React.ReactElement<{ account?: string }> {
  const { account, isMobileMenu, setOpenPanel } = props;
  const { freeBalance, freeKusamaBalance } = useBalances(account);

  const [isPopupActive, setIsPopupActive] = useState<boolean>(false);

  const headerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (headerRef.current && !headerRef.current.contains(event.target as HTMLDivElement)) {
      setIsPopupActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const onClick = useCallback(() => {
    setIsPopupActive((prev) => !prev);

    if (isMobileMenu !== 'balances') {
      setOpenPanel('balances');
    } else {
      setOpenPanel('tokens');
    }
  }, [isMobileMenu, setOpenPanel]);

  return (
    <div
      className='app-balances'
      onClick={onClick}
      ref = {headerRef}
    >
      <div className='app-balances-items'>
        <div className='app-balances-items-item'>
          {formatStrBalance(15, freeBalance)}
          <span className='unit'>UNQ</span>
        </div>
        <div className='app-balances-items-item'>
          {formatKsmBalance(freeKusamaBalance)}
          <span className='unit'>KSM</span>
        </div>
      </div>
      <div className={isPopupActive ? 'rotate-icon-balance' : 'icon'}>
        <img
          alt='menu-arrow'
          src={menuArrow as string}
        />
      </div>
      <PopupMenu
        account={account}
        isPopupActive={isPopupActive}
      />
    </div>
  );
}

export default memo(BalancesHeader);
