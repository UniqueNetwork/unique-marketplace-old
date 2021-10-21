// Copyright 2017-2021 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { AppProps as Props } from '@polkadot/react-components/types';

import React from 'react';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { useApi } from '@polkadot/react-hooks';

import Accounts from './Accounts';
import useCounter from './useCounter';

export { useCounter };

function AccountsApp ({ onStatusChange }: Props): React.ReactElement<Props> {
  const { isApiConnected, isApiReady } = useApi();

  return (
    <main className='accounts--App'>
      { isApiConnected && isApiReady && (
        <Accounts
          onStatusChange={onStatusChange}
        />
      )}
      { (!isApiReady || !isApiConnected) && (
        <div className='accounts-preloader'>
          <Loader
            active
          >
            Loading accounts
          </Loader>
        </div>
      )}
    </main>
  );
}

export default React.memo(AccountsApp);
