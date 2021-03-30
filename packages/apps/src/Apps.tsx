// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './apps.scss';

import type { BareProps as Props, ThemeDef } from '@polkadot/react-components/types';

import React, { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu';
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
import { web3Enable } from '@polkadot/extension-dapp';
import { AccountSelector, ErrorBoundary, Spinner, StatusContext } from '@polkadot/react-components';
import GlobalStyle from '@polkadot/react-components/styles';
import { useApi } from '@polkadot/react-hooks';
import Signer from '@polkadot/react-signer';
import uiSettings from '@polkadot/ui-settings';

import ConnectingOverlay from './overlays/Connecting';
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
  const { theme } = useContext<ThemeDef>(ThemeContext);
  const { api, isApiConnected, isApiReady, systemChain, systemName } = useApi();
  const { queueAction } = useContext(StatusContext);
  const [account, setAccount] = useState<string>();
  const [web3Enabled, setWeb3Enabled] = useState<boolean>(false);

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

  const detectWeb3 = useCallback(async () => {
    const web3EnableLis = await web3Enable('unique-app');

    setWeb3Enabled(!!web3EnableLis.length);
  }, []);

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

    void detectWeb3();
  }, [detectWeb3]);

  return (
    <>
      <GlobalStyle uiHighlight={uiHighlight} />
      <div className={`app-wrapper theme--${theme} ${className}`}>
        <AccountSidebar>
          <Signer>
            {needsApi && (!isApiReady || !isApiConnected)
              ? (
                <div className='connecting'>
                  <Spinner label={t<string>('Initializing connection')} />
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
                                <div className='app-user'>
                                  <AccountSelector onChange={setAccount} />
                                </div>
                              </div>
                            </header>
                            <div className='attention-block'>
                              FOR TESTING AND DEMONSTRATION ONLY. DO NOT USE LARGE AMOUNTS OF KSM. TRADE AT YOUR OWN RISK.
                            </div>
                            <main className='app-main'>
                              <div className='app-container'>
                                {!web3Enabled &&
                                <div className='error-block'>
                                  Please install and/or enable <a
                                    href='https://polkadot.js.org/extension/'
                                    rel='noopener noreferrer'
                                    target='_blank'
                                  >polkadot.js extension</a> and create or import at an address in it.
                                </div>
                                }
                                { web3Enabled && (
                                  <Component
                                    account={account}
                                    basePath={`/${name}`}
                                    location={location}
                                    onStatusChange={queueAction}
                                  />
                                )}
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
