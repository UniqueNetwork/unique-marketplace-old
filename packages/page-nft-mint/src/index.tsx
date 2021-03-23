// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React from 'react';

import { AppProps as Props } from '@polkadot/react-components/types';

import NftCreator from './containers/NftMint';

function App ({ account }: Props): React.ReactElement<Props> {
  return (
    <NftCreator account={account} />
  );
}

export default React.memo(App);
