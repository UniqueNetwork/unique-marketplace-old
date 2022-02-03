// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionStatus } from '@polkadot/react-components/Status/types';
import type { KeyringAddress } from '@polkadot/ui-keyring/types';

import React, { useCallback } from 'react';

import { HelpTooltip } from '@polkadot/react-components';
import { keyring } from '@polkadot/ui-keyring';

import { SortedAccount } from '../types';
import AccountTableItem from './AccountTableItem';

interface Props {
  accounts: SortedAccount[] | undefined;
}

function AccountTable ({ accounts }: Props): React.ReactElement<Props> | null {
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

  const forgetAccount = useCallback((address: string) => {
    const status: Partial<ActionStatus> = {
      account: address,
      action: 'forget'
    };

    try {
      keyring.forgetAccount(address);
      status.status = 'success';
      status.message = 'account forgotten';
    } catch (e) {
      console.log('forget account error', e);
      status.status = 'error';
      status.message = (e as Error).message;
    }
  }, []);

  return (
    <div className='accounts-table'>
      <div className='accounts-table--header'>
        <span className='with-tooltip'>
          Accounts
          {
            <HelpTooltip
              className={'help'}
              content={content()}
            />
          }
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
            forgetAccount={forgetAccount}
            key={account.address}
          />
        ))}
      </div>
    </div>
  );
}

export default React.memo(AccountTable);
