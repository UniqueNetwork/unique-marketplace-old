// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface Props {
  account?: string;
  theme: { theme: string, logo?: string; };
}

const MobileMenuHeader = (props: Props): React.ReactElement<Props> => {
  const { theme } = props;
  const location = useLocation();

  return (
    <div className='menu-mobile'>
      <div className='menu-mobile--logo'>
        <img
          alt={`logo ${theme.theme}`}
          src={theme.logo}
        />
      </div>
      <NavLink
        className={'menu-mobile--link'}
        exact={true}
        strict={true}
        to={'/market'}
      >
        Market
      </NavLink>
      <NavLink
        className={`menu-mobile--link ${location.pathname === '/wallet' ? 'active' : ''}`}
        exact={true}
        strict={true}
        to={'/wallet'}
      >
        My tokens
      </NavLink>
      <NavLink
        className={`menu-mobile--link ${location.pathname === '/trades' ? 'active' : ''}`}
        exact={true}
        strict={true}
        to={'/trades'}
      >
        Trades
      </NavLink>
      <NavLink
        className={`menu-mobile--link ${location.pathname === '/accounts' ? 'active' : ''}`}
        exact={true}
        strict={true}
        to={'/accounts'}
      >
        Accounts
      </NavLink>
      <NavLink
        className={`menu-mobile--link ${location.pathname === '/faq' ? 'active' : ''}`}
        exact={true}
        strict={true}
        to={'/faq'}
      >
        FAQ
      </NavLink>
    </div>
  );
};

export default memo(MobileMenuHeader);
