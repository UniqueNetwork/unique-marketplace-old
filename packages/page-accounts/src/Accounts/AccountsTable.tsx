// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringAddress } from '@polkadot/ui-keyring/types';

import React, { useCallback } from 'react';

import { HelpTooltip } from '@polkadot/react-components';

import { SortedAccount } from '../types';
import AccountTableItem from './AccountTableItem';

interface Props {
  accounts: SortedAccount[] | undefined;
  setAccount?: (account?: string) => void;
}

function AccountTable ({ accounts, setAccount }: Props): React.ReactElement<Props> | null {
  const content = useCallback(() => {
    return (
      <span>
        Substrate account addresses (Kusama, Quartz Polkadot, Unique, etc.) may look different, but they can be converted between each other because they use the same public key. You can see all transformations of any address on&nbsp;
        <a
          href='https://polkadot.subscan.io/tools/ss58_transform'
          rel='noreferrer'
          target='_blank'
        >
          Subscan
        </a>
      </span>
    );
  }, []);

  return (
    <div className='accounts-table'>
      <div className='accounts-table--header'>
        <span className='with-tooltip'>
          Accounts
          {<HelpTooltip
            className={'help'}
            content={content()}
          />}
        </span>
        <span>
          Explorer
        </span>
        <span>
          Balances
        </span>
        <span>
          Actions
        </span>
      </div>
      <div className='accounts-table--body'>
        { accounts?.map(({ account }: { account: KeyringAddress }) => (
          <AccountTableItem
            account={account}
            key={account.address}
            setAccount={setAccount}
          />
        ))}
      </div>
    </div>
  );
}

export default React.memo(AccountTable);
