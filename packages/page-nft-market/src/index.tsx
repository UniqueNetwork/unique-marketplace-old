// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React from 'react';
import { Route, Switch } from 'react-router';

import { NftDetails } from '@polkadot/react-components';
// local imports and components
import { AppProps as Props } from '@polkadot/react-components/types';

import NftMarket from './containers/NftMarket';

function PageNftMarketplace ({ account, basePath, openPanel, setOpenPanel }: Props): React.ReactElement<Props> {

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
