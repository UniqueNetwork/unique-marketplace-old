// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';

const ManageAccounts = () => {
  return (
    <div className='manage-accounts'>
      <NavLink
        exact={true}
        strict={true}
        to={'/accounts'}
      >
        Manage accounts
      </NavLink>
    </div>
  );
};

export default memo(ManageAccounts);
