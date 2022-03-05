// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OpenPanelType } from '@polkadot/apps-routing/types';

import React, { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

import ContractContext from '@polkadot/apps/ContractContext/ContractContext';
import menuArrow from '@polkadot/apps/images/menu-arrow.svg';
import { ChainBalance, PopupMenu } from '@polkadot/react-components';
import { useBalances } from '@polkadot/react-hooks';
import { formatKsmBalance } from '@polkadot/react-hooks/useKusamaApi';

interface Props {
  account?: string,
  isMobileMenu: OpenPanelType;
  setOpenPanel: (isOpen: OpenPanelType) => void;
}

function BalancesHeader (props: Props): React.ReactElement<{ account?: string }> {
  const { isMobileMenu, setOpenPanel } = props;
  const { account, getUserDeposit } = useContext(ContractContext);
  const { freeBalance, freeKusamaBalance } = useBalances(account);
  const [isPopupActive, setIsPopupActive] = useState<boolean>(false);

  const headerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (headerRef.current && !headerRef.current.contains(event.target as HTMLDivElement)) {
      setIsPopupActive(false);
    }
  };

  useEffect(() => {
    void getUserDeposit();
  }, [getUserDeposit]);

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
      ref = {headerRef}
    >
      <div
        className='app-balances-items'
        onClick={onClick}
      >
        <div className='app-balances-items-item'>
          <ChainBalance value={freeBalance} />
        </div>
        {freeKusamaBalance && (
          <div className='app-balances-items-item'>
            {formatKsmBalance(freeKusamaBalance)} <span className='unit'>KSM</span>
          </div>
        )}
      </div>
      <div className={isPopupActive ? 'rotate-icon-balance' : 'icon'}>
        <img
          alt='menu-arrow'
          src={menuArrow as string}
        />
      </div>
      <PopupMenu
        isPopupActive={isPopupActive}
      />
    </div>
  );
}

export default memo(BalancesHeader);
