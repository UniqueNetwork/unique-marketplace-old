// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';

import AccountName from '@polkadot/react-components/AccountName';
import IdentityIcon from '@polkadot/react-components/IdentityIcon';
import { useAccounts } from '@polkadot/react-hooks';

import infoBlue from './images/infoBlue.svg';

const ManageAccounts = () => {
  const { allAccounts } = useAccounts();

  return (
    <div className='manage-accounts'>
      <NavLink
        exact={true}
        strict={true}
        to={'/accounts'}
      >
        Manage accounts
      </NavLink>
      <header>Choose the account</header>
      <div className='accounts-list'>
        { allAccounts?.map((address: string) => (
          <div
            className={'ui--KeyPair'}
            key={address}
          >
            <IdentityIcon
              className='icon'
              value={address}
            />
            <div className='name'>
              <AccountName value={address} />
            </div>
            <div className='address'>
              {address}
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
