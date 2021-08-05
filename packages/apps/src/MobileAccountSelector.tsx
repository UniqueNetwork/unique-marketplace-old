// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, {memo, useCallback} from 'react';

import IdentityIcon from '@polkadot/react-components/IdentityIcon';

import menuArrow from './images/menu-arrow.svg';

interface MobileAccountSelectorProps {
  address?: string;
  isMobileMenu: string;
  setIsMobileMenu: (isOpen: string) => void;
}

const MobileAccountSelector = (props: MobileAccountSelectorProps): React.ReactElement<MobileAccountSelectorProps> => {
  const { address, isMobileMenu, setIsMobileMenu } = props;

  const onClick = useCallback(() => {
    if (isMobileMenu !== 'accounts') {
      setIsMobileMenu('accounts');
    } else {
      setIsMobileMenu('none');
    }
  }, [isMobileMenu, setIsMobileMenu]);

  return (
    <div
      className='mobile-account-selector'
      onClick={onClick}
    >
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
