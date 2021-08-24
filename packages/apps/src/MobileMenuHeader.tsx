// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OpenPanelType } from '@polkadot/apps-routing/types';

import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu';

interface Props {
  isMobileMenu: OpenPanelType;
  setIsMobileMenu: (isOpen: OpenPanelType) => void;
  theme: { theme: string; logo?: string };
}

const MobileMenuHeader = (props: Props): React.ReactElement<Props> => {
  const { isMobileMenu, setIsMobileMenu, theme } = props;

  console.log('isMobileMenu', isMobileMenu);

  return (
    <div className='menu-mobile-header'>
      { isMobileMenu === 'tokens' && (
        <div
          className='menu-icon'
          onClick={setIsMobileMenu.bind(null, 'menu')}
        >
          <svg fill='none'
            height='32'
            viewBox='0 0 32 32'
            width='32'
            xmlns='http://www.w3.org/2000/svg'>
            <path d='M5 16H27'
              stroke='#040B1D'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'/>
            <path d='M5 8H27'
              stroke='#040B1D'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'/>
            <path d='M5 24H27'
              stroke='#040B1D'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'/>
          </svg>
        </div>
      )}
      { isMobileMenu !== 'tokens' && (
        <div
          className='menu-icon active'
          onClick={setIsMobileMenu.bind(null, 'tokens')}
        >
          <svg fill='none'
            height='32'
            viewBox='0 0 32 32'
            width='32'
            xmlns='http://www.w3.org/2000/svg'>
            <path clipRule='evenodd'
              d='M4 16C4 15.4477 4.44772 15 5 15H27C27.5523 15 28 15.4477 28 16C28 16.5523 27.5523 17 27 17H5C4.44772 17 4 16.5523 4 16Z'
              fill='#040B1D'
              fillRule='evenodd'/>
            <path clipRule='evenodd'
              d='M14.7071 6.29289C15.0976 6.68342 15.0976 7.31658 14.7071 7.70711L6.41421 16L14.7071 24.2929C15.0976 24.6834 15.0976 25.3166 14.7071 25.7071C14.3166 26.0976 13.6834 26.0976 13.2929 25.7071L4.29289 16.7071C3.90237 16.3166 3.90237 15.6834 4.29289 15.2929L13.2929 6.29289C13.6834 5.90237 14.3166 5.90237 14.7071 6.29289Z'
              fill='#040B1D'
              fillRule='evenodd'/>
          </svg>
        </div>
      )}
      { theme.logo && (
        <Menu.Item
          active={location.pathname === '/'}
          as={NavLink}
          className='app-logo'
          icon={
            <img
              alt={`logo ${theme.theme}`}
              src={theme.logo}
            />
          }
          to='/'
        />
      )}
    </div>
  );
};

export default memo(MobileMenuHeader);
