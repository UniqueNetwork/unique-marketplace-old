// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BareProps as Props, ThemeDef } from '@polkadot/react-components/types';

import React, { useContext, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu';
import store from 'store';
import { ThemeContext } from 'styled-components';

import AccountSidebar from '@polkadot/app-accounts/Sidebar';
import { getSystemChainColor } from '@polkadot/apps-config';
import GlobalStyle from '@polkadot/react-components/styles';
import { useApi } from '@polkadot/react-hooks';
import Signer from '@polkadot/react-signer';
import uiSettings from '@polkadot/ui-settings';

import ConnectingOverlay from './overlays/Connecting';
import Content from './Content';
import defaultNftTypes from './defaultNftTypes';
import WarmUp from './WarmUp';
import './apps.scss';
import userIcon from '../public/icons/user.svg'

export const PORTAL_ID = 'portals';

function Apps({ className = '' }: Props): React.ReactElement<Props> {
  const { theme } = useContext<ThemeDef>(ThemeContext);
  const { api, systemChain, systemName } = useApi();

  const uiHighlight = useMemo(
    () => getSystemChainColor(systemChain, systemName),
    [systemChain, systemName]
  );

  // set default nft types and substrate prefix
  useEffect(() => {
    try {
      const types: Record<string, any> = JSON.parse(defaultNftTypes) as Record<string, any>;

      api.registerTypes(types);
      store.set('types', types);
      const settings = { ...uiSettings.get(), prefix: 42 };

      uiSettings.set(settings);
    } catch (error) {
      console.error(error);
    }
  }, [api]);

  useEffect(() => {
    console.log('process.env', process.env);
  }, []);

  console.log('location.pathname', location.pathname);

  return (
    <>
      <GlobalStyle uiHighlight={uiHighlight} />
      <div className={`app-wrapper theme--${theme} ${className}`}>
        <header className='app-header'>
          <div className='app-container'>
            <Menu tabular>
              <Menu.Item
                active={location.pathname === '/market'}
                as={NavLink}
                name='market'
                to='/market'
              />
              <Menu.Item
                active={location.pathname === '/mint'}
                as={NavLink}
                name='mint'
                to='/mint'
              />
              <Menu.Item
                active={location.pathname === '/my-tokens'}
                as={NavLink}
                name='myTokens'
                to='/wallet'
              />
              <Menu.Item
                active={location.pathname === '/trades'}
                as={NavLink}
                name='trades'
                to='/trades'
              />
            </Menu>
            <a href="/" className='app-user-icon'>
              <img src={userIcon} alt='userIcon' />
            </a>
          </div>
        </header>

        <AccountSidebar>
          <Signer>
            <Content />
          </Signer>
          <ConnectingOverlay />
          <div id={PORTAL_ID} />
        </AccountSidebar>
      </div>
      <WarmUp />
    </>
  );
}

export default React.memo(Apps);
