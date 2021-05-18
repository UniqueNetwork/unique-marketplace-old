// Copyright 2017-2021 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AppProps as Props } from '@polkadot/react-components/types';

import React from 'react';

import { HelpOverlay } from '@polkadot/react-components';

import basicMd from './md/basic.md';
import Accounts from './Accounts';
import useCounter from './useCounter';

export { useCounter };

function AccountsApp ({ onStatusChange }: Props): React.ReactElement<Props> {
  return (
    <main className='accounts--App'>
      <HelpOverlay md={basicMd as string} />
      <Accounts
        onStatusChange={onStatusChange}
      />
    </main>
  );
}

export default React.memo(AccountsApp);
