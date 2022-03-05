// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React from 'react';
import { Route, Switch } from 'react-router';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { NftDetails } from '@polkadot/react-components';
// local imports and components
import { AppProps as Props } from '@polkadot/react-components/types';
import { useApi } from '@polkadot/react-hooks';

import NftMarket from './containers/NftMarket';

function PageNftMarketplace ({ account, basePath, openPanel, setOpenPanel }: Props): React.ReactElement<Props> {
  const { isApiConnected, isApiReady } = useApi();

  if (!isApiReady || !isApiConnected) {
    return (
      <div className='accounts-preloader'>
        <Loader
          active
        >
          Loading data from chain...
        </Loader>
      </div>
    );
  }

  return (
    <Switch>
      <Route path={`${basePath}/token-details`}>
        <NftDetails
          account={account || ''}
        />
      </Route>
      <Route path={basePath}>
        <NftMarket
          account={account}
          openPanel={openPanel}
          setOpenPanel={setOpenPanel}
        />
      </Route>
    </Switch>
  );
}

export default React.memo(PageNftMarketplace);
