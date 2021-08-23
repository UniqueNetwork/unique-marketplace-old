// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OpenPanelType } from '@polkadot/apps-routing/types';

import React, { memo, useCallback } from 'react';

import IdentityIcon from '@polkadot/react-components/IdentityIcon';

import menuArrow from './images/menu-arrow.svg';

interface MobileAccountSelectorProps {
  address?: string;
  openPanel: OpenPanelType;
  setOpenPanel: (openPanel: OpenPanelType) => void;
}

const MobileAccountSelector = (props: MobileAccountSelectorProps): React.ReactElement<MobileAccountSelectorProps> => {
  const { address, openPanel, setOpenPanel } = props;

  const onClick = useCallback(() => {
    if (openPanel !== 'accounts') {
      setOpenPanel('accounts');
    } else {
      setOpenPanel('tokens');
    }
  }, [openPanel, setOpenPanel]);

  return (
    <div
      className='mobile-account-selector'
      onClick={onClick}
    >
      { address && (
        <IdentityIcon
          canNotCopy
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
