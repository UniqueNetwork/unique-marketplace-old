// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { ActionStatus } from '@polkadot/react-components/Status/types';
import type { SortedAccount } from '../types';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import { SearchFilter, StatusContext } from '@polkadot/react-components';
import AccountButtonsGroup from '@polkadot/react-components/AccountButtonGroup';
import { useAccounts } from '@polkadot/react-hooks';

import { sortAccounts } from '../util';
import AccountsTable from './AccountsTable';

interface Sorted {
  sortedAccounts: SortedAccount[];
  sortedAddresses: string[];
}

interface Props {
  className?: string;
  onStatusChange: (status: ActionStatus) => void;
  setAccount?: (account?: string) => void;
}

function Overview ({ className = 'page-accounts', onStatusChange, setAccount }: Props): React.ReactElement<Props> {
  const { allAccounts } = useAccounts();
  const { queueAction } = useContext(StatusContext);
  const [filterOn, setFilter] = useState<string>('');
  const [{ sortedAccounts }, setSorted] = useState<Sorted>({ sortedAccounts: [], sortedAddresses: [] });
  const [sortedAccountsWithAccountName, setSortedAccountsWithAccountName] = useState<SortedAccount[] | undefined>();

  const clearSearch = useCallback(() => {
    setFilter('');
  }, []);

  useEffect((): void => {
    const sortedAccounts = sortAccounts(allAccounts, []);
    const sortedAddresses = sortedAccounts.map((a) => a.account.address);

    setSorted({ sortedAccounts, sortedAddresses });
    setSortedAccountsWithAccountName(sortedAccounts);
  }, [allAccounts]);

  useEffect(() => {
    setSortedAccountsWithAccountName(sortedAccounts?.filter((item) => item.account.meta.name?.toLowerCase().includes(filterOn.toLowerCase())));
  }, [filterOn, sortedAccounts]);

  return (
    <div className='page-accounts'>
      <Header
        as='h1'
        className='mobile-header'
      >Manage accounts</Header>
      <div className='page-accounts--card'>
        <div className='page-accounts--card--header'>
          <AccountButtonsGroup onStatusChange={queueAction} />
          <div className='accounts-filter'>
            <SearchFilter
              clearSearch={clearSearch}
              searchString={filterOn}
              setSearchString={setFilter}
            />
          </div>
        </div>
        <AccountsTable
          accounts={sortedAccountsWithAccountName}
          setAccount={setAccount}
        />
      </div>
    </div>
  );
}

export default React.memo(Overview);
