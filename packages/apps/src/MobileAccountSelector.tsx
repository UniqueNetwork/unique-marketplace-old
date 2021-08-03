// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo } from 'react';

import IdentityIcon from '@polkadot/react-components/IdentityIcon';

import menuArrow from './images/menu-arrow.svg';

interface MobileAccountSelectorProps {
  address?: string;
}

const MobileAccountSelector = (props: MobileAccountSelectorProps): React.ReactElement<MobileAccountSelectorProps> => {
  const { address } = props;

  return (
    <div className='mobile-account-selector'>
      { address && (
        <IdentityIcon
          className='icon'
          value={address}
        />
      )}
      <img
        alt='menu-arrow'
        src={menuArrow as string}
      />
    </div>
  );
};

export default memo(MobileAccountSelector);
