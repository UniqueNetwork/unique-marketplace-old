// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OpenPanelType } from '@polkadot/apps-routing/types';

import React, { memo, useCallback } from 'react';
import { useHistory } from 'react-router';

import { AccountName, IdentityIcon } from '@polkadot/react-components';
import { useAccounts } from '@polkadot/react-hooks';

import infoBlue from './images/infoBlue.svg';

interface Props {
  account?: string;
  setAccount: (account?: string) => void;
  setIsMobileMenu: (menu: OpenPanelType) => void;
}

const ManageAccounts = (props: Props): React.ReactElement<Props> => {
  const { setAccount, setIsMobileMenu } = props;
  const history = useHistory();
  const { allAccounts } = useAccounts();

  const onSelectAccount = useCallback((address: string) => {
    setAccount(address);
    setIsMobileMenu('tokens');
  }, [setAccount, setIsMobileMenu]);

  const onAccounts = useCallback(() => {
    history.push('/accounts');
    setIsMobileMenu('tokens');
  }, [history, setIsMobileMenu]);

  return (
    <div className='manage-accounts'>
      <a
        className='manage-accounts--link'
        onClick={onAccounts}
      >
        Manage accounts
      </a>
      <header>Choose the account</header>
      <div className='accounts-list'>
        { allAccounts?.map((address: string) => (
          <div
            className='account-item'
            key={address}
          >
            <IdentityIcon
              className='icon'
              value={address}
            />
            <div
              className='account-item--name'
              onClick={onSelectAccount.bind(null, address)}
            >
              <div className='name'>
                <AccountName value={address} />
              </div>
              <div className='address'>
                {address}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='accounts-footer'>
        <div className='info-panel'>
          <img
            alt='info'
            src={infoBlue as string}
          />
          Click on image to copy the address
        </div>
      </div>
    </div>
  );
};

export default memo(ManageAccounts);
