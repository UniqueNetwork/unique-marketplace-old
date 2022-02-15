// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './apps.scss';

import type { OpenPanelType, Route } from '@polkadot/apps-routing/types';
import type { BareProps as Props, ThemeDef } from '@polkadot/react-components/types';

import React, { Suspense, useContext, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';
import { ThemeContext } from 'styled-components';

import NotFound from '@polkadot/apps/NotFound';
import Status from '@polkadot/apps/Status';
import { useTranslation } from '@polkadot/apps/translate';
import { getSystemChainColor } from '@polkadot/apps-config';
import createRoutes from '@polkadot/apps-routing';
import { AccountSelector, ErrorBoundary, StatusContext, WarningText } from '@polkadot/react-components';
import PageNotFound from '@polkadot/react-components/PageNotFound';
import GlobalStyle from '@polkadot/react-components/styles';
import { useApi } from '@polkadot/react-hooks';
import Signer from '@polkadot/react-signer';

import BalancesHeader from './BalancesHeader';
import Contracts from './ContractContext';
import Footer from './Footer';
import ManageAccounts from './ManageAccounts';
import ManageBalances from './ManageBalances';
import MobileAccountSelector from './MobileAccountSelector';
import MobileMenu from './MobileMenu';
import MobileMenuHeader from './MobileMenuHeader';
import ScrollToTop from './ScrollToTop';

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
  const { isApiConnected, isApiReady, systemChain, systemName } = useApi();
  const { queueAction } = useContext(StatusContext);
  const [account, setAccount] = useState<string>();
  const [openPanel, setOpenPanel] = useState<OpenPanelType>('tokens');
  const [isPageFound, setIsPageFound] = useState<boolean>(true);

  const uiHighlight = useMemo(
    () => getSystemChainColor(systemChain, systemName),
    [systemChain, systemName]
  );

  const { Component, name } = useMemo(
    (): Route => {
      const app = location.pathname.slice(1) || '';

      return createRoutes(t).find((route) => !!(route && app.startsWith(route.name))) || NOT_FOUND;
    },
    [location, t]
  );

  const isLocationAccounts = location.pathname.slice(1) === 'accounts';
  const noAccounts = !account && !isLocationAccounts;

  return (
    <>
      <GlobalStyle uiHighlight={uiHighlight} />
      <ScrollToTop />
      <div className={`app-wrapper theme--${theme.theme} ${className}`}>
        <Signer>
          <ErrorBoundary
            isPageFound={isPageFound}
            setIsPageFound={setIsPageFound}
            trigger={name}
          >
            <Contracts account={account}>
              <>
                <header className='app-header'>
                  <div className='app-container app-container--header'>
                    <MobileMenuHeader
                      isMobileMenu={openPanel}
                      setIsMobileMenu={setOpenPanel}
                      theme={theme}
                    />
                    <Menu
                      className='header-menu'
                      tabular
                    >
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
                        active={location.pathname === '/wallet'}
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
                      <Menu.Item
                        active={location.pathname === '/faq'}
                        as={NavLink}
                        name='FAQ'
                        to='/faq'
                      />
                    </Menu>
                    <div className='app-user'>
                      { (!isApiReady || !isApiConnected) && (
                        <div>
                          <Loader
                            active
                            className='centered'
                            inline='centered'
                          />
                        </div>
                      )}
                      { (isApiReady && isApiConnected) && (
                        <>
                          <BalancesHeader
                            account={account}
                            isMobileMenu={openPanel}
                            setOpenPanel={setOpenPanel}
                          />
                          <div className='account-selector-block'>
                            <AccountSelector onChange={setAccount} />
                            <MobileAccountSelector
                              address={account}
                              openPanel={openPanel}
                              setOpenPanel={setOpenPanel}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </header>
                { openPanel === 'menu' && (
                  <MobileMenu
                    account={account}
                    setOpenPanel={setOpenPanel}
                    theme={theme}
                  />
                )}
                { openPanel === 'accounts' && (
                  <ManageAccounts
                    account={account}
                    setAccount={setAccount}
                    setIsMobileMenu={setOpenPanel}
                  />
                )}
                { openPanel === 'balances' && (
                  <ManageBalances
                    setOpenPanel={setOpenPanel}
                  />
                )}
                { (openPanel !== 'accounts') && (
                  <Suspense fallback=''>
                    <main className={`app-main ${openPanel || ''} ${noAccounts ? 'no-accounts' : ''} ${!isPageFound ? 'page-no-found' : ''}`}>
                      <div className={`app-container ${openPanel === 'balances' ? 'is-balance-active' : ''}`}>
                        { noAccounts && (
                          <>
                            <WarningText
                              className='warning no-margin'
                              text={(
                                <>
                                  Some features are currently hidden and will only become available once you connect your wallet. You can create new or add your existing substrate account on the <Link to='accounts'><span>account page</span></Link>
                                </>
                              )}
                            />
                            <br />
                          </>
                        )}
                        {
                          isPageFound
                            ? (
                              <>
                                <Component
                                  account={account}
                                  basePath={`/${name}`}
                                  location={location}
                                  onStatusChange={queueAction}
                                  openPanel={openPanel}
                                  setOpenPanel={setOpenPanel}
                                />
                                <div id={PORTAL_ID} />
                              </>
                            )
                            : <PageNotFound />
                        }
                      </div>
                    </main>
                  </Suspense>
                )}
              </>
            </Contracts>
          </ErrorBoundary>
          <Footer />
          <Status />
        </Signer>
      </div>
    </>
  );
}

export default React.memo(Apps);
