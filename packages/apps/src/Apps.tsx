// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './apps.scss';

import type { BareProps as Props, ThemeDef } from '@polkadot/react-components/types';

import React, { Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';
import store from 'store';
import { ThemeContext } from 'styled-components';

import AccountSidebar from '@polkadot/app-accounts/Sidebar';
import { findMissingApis } from '@polkadot/apps/endpoint';
import NotFound from '@polkadot/apps/NotFound';
import Status from '@polkadot/apps/Status';
import { useTranslation } from '@polkadot/apps/translate';
import { getSystemChainColor } from '@polkadot/apps-config';
import createRoutes from '@polkadot/apps-routing';
import { Route } from '@polkadot/apps-routing/types';
import { AccountSelector, ErrorBoundary, StatusContext } from '@polkadot/react-components';
import GlobalStyle from '@polkadot/react-components/styles';
import { useApi } from '@polkadot/react-hooks';
import Signer from '@polkadot/react-signer';
import uiSettings from '@polkadot/ui-settings';

import ConnectingOverlay from './overlays/Connecting';
import BalancesHeader from './BalancesHeader';
import defaultNftTypes from './defaultNftTypes';
import WarmUp from './WarmUp';

export const PORTAL_ID = 'portals';

const NOT_FOUND: Route = {
  Component: NotFound,
  display: {
    needsApi: undefined
  },
  group: 'settings',
  icon: 'times',
  isIgnored: false,
  name: 'unknown',
  text: 'Unknown'
};

function Apps ({ className = '' }: Props): React.ReactElement<Props> {
  const location = useLocation();
  const { t } = useTranslation();
  const theme = useContext<ThemeDef>(ThemeContext);
  const { api, isApiConnected, isApiReady, systemChain, systemName } = useApi();
  const { queueAction } = useContext(StatusContext);
  const [account, setAccount] = useState<string>();

  const uiHighlight = useMemo(
    () => getSystemChainColor(systemChain, systemName),
    [systemChain, systemName]
  );

  const { Component, display: { needsApi }, name } = useMemo(
    (): Route => {
      const app = location.pathname.slice(1) || '';

      return createRoutes(t).find((route) => !!(route && app.startsWith(route.name))) || NOT_FOUND;
    },
    [location, t]
  );

  const missingApis = findMissingApis(api, needsApi);

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

  return (
    <>
      <GlobalStyle uiHighlight={uiHighlight} />
      <div className={`app-wrapper theme--${theme.theme} ${className}`}>
        <AccountSidebar>
          <Signer>
            {needsApi && (!isApiReady || !isApiConnected)
              ? (
                <div className='connecting'>
                  <Loader
                    active
                    inline='centered'
                  >
                    Initializing connection
                  </Loader>
                </div>
              )
              : (
                <>
                  <Suspense fallback='...'>
                    <ErrorBoundary trigger={name}>
                      {missingApis.length
                        ? (
                          <NotFound
                            basePath={`/${name}`}
                            location={location}
                            missingApis={missingApis}
                            onStatusChange={queueAction}
                          />
                        )
                        : (
                          <>
                            <header className='app-header'>
                              <div className='app-container app-container--header'>
                                <Menu tabular>
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
                                  <Menu.Item
                                    active={location.pathname === '/market'}
                                    as={NavLink}
                                    name='market'
                                    to='/market'
                                  />
                                  <Menu.Item
                                    active={location.pathname === '/all-tokens'}
                                    as={NavLink}
                                    name='gallery'
                                    to='/all-tokens'
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
                                  <Menu.Item
                                    active={location.pathname === '/accounts'}
                                    as={NavLink}
                                    name='accounts'
                                    to='/accounts'
                                  />
                                </Menu>
                                <div className='app-user'>
                                  { isApiReady && (
                                    <BalancesHeader account={account} />
                                  )}
                                  <div className='account-selector-block'>
                                    <AccountSelector onChange={setAccount} />
                                  </div>
                                </div>
                              </div>
                            </header>
                            <div className='attention-block'>
                              FOR TESTING AND DEMONSTRATION ONLY. DO NOT USE LARGE AMOUNTS OF KSM. TRADE AT YOUR OWN RISK.
                            </div>
                            <main className='app-main'>
                              <div className='app-container'>
                                <Component
                                  account={account}
                                  basePath={`/${name}`}
                                  location={location}
                                  onStatusChange={queueAction}
                                />
                                <ConnectingOverlay />
                                <div id={PORTAL_ID} />
                              </div>
                            </main>
                          </>
                        )
                      }
                    </ErrorBoundary>
                  </Suspense>
                  <Status />
                </>
              )
            }
          </Signer>
        </AccountSidebar>
      </div>
      <WarmUp />
    </>
  );
}

export default React.memo(Apps);
