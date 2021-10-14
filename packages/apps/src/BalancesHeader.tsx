// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OpenPanelType } from '@polkadot/apps-routing/types';

import BN from 'bn.js';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import menuArrow from '@polkadot/apps/images/menu-arrow.svg';
import envConfig from '@polkadot/apps-config/envConfig';
import { PopupMenu } from '@polkadot/react-components';
import { useBalances } from '@polkadot/react-hooks';
import { formatKsmBalance, formatStrBalance } from '@polkadot/react-hooks/useKusamaApi';

const { commission, minPrice } = envConfig;

interface Props {
  account?: string,
  isMobileMenu: OpenPanelType;
  setOpenPanel: (isOpen: OpenPanelType) => void;
}

function BalancesHeader (props: Props): React.ReactElement<{ account?: string }> {
  const { account, isMobileMenu, setOpenPanel } = props;
  const { freeBalance, freeKusamaBalance } = useBalances(account);
  const [deposited, setDeposited] = useState< BN >();

  const getDeposited = useCallback(() => {
    setDeposited(new BN(Number(localStorage.getItem('deposit'))));
  }, []);

  useEffect(() => {
    getDeposited();
  }, [getDeposited, freeKusamaBalance]);

  const [isPopupActive, setIsPopupActive] = useState<boolean>(false);

  const headerRef = useRef<HTMLDivElement>(null);

  const getFee = useCallback((price: BN): BN => {
    return new BN(price).mul(new BN(commission)).div(new BN(100));
  }, []);

  const getAllKSMBalance = useCallback((): string => {
    return deposited ? (String(Number(formatKsmBalance(new BN(deposited).add(getFee(deposited)))) + Number(formatKsmBalance(freeKusamaBalance)))) : '';
  }, [deposited, freeKusamaBalance, getFee]);

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
      ref = {headerRef}
    >
      <div
        className='app-balances-items'
        onClick={onClick}
      >
        <div className='app-balances-items-item'>
          {formatStrBalance(15, freeBalance)}
          <span className='unit'>UNQ</span>
        </div>
        <div className='app-balances-items-item'>
          {deposited && +formatKsmBalance(deposited) > minPrice &&
          Number(formatKsmBalance(freeKusamaBalance)) &&
          Number(formatKsmBalance(new BN(deposited).add(getFee(deposited))))
            ? getAllKSMBalance()
            : formatKsmBalance(freeKusamaBalance)}
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
