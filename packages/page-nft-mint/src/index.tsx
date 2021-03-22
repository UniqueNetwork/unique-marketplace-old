// Copyright 2020 UseTech authors & contributors

// global app props and types
// eslint-disable-next-line header/header
import './styles.scss';

// external imports
import React from 'react';

import { AppProps as Props } from '@polkadot/react-components/types';

// local imports and components
import NftCreator from './containers/NftMint';

function App (): React.ReactElement<Props> {
  return (
    <NftCreator />
  );
}

export default React.memo(App);
