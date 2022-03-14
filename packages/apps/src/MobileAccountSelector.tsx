// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OpenPanelType } from '@polkadot/apps-routing/types';

import React, { memo, useCallback } from 'react';

import { Button, IdentityIcon } from '@polkadot/react-components';

import menuArrow from './images/menu-arrow.svg';
import { useHistory } from 'react-router';

interface MobileAccountSelectorProps {
  address?: string;
  openPanel: OpenPanelType;
  setOpenPanel: (openPanel: OpenPanelType) => void;
}

const MobileAccountSelector = (props: MobileAccountSelectorProps): React.ReactElement<MobileAccountSelectorProps> => {
  const { address, openPanel, setOpenPanel } = props;
  const routerHistory = useHistory();

  const onClick = useCallback(() => {
    if (openPanel !== 'accounts') {
      setOpenPanel('accounts');
    } else {
      setOpenPanel('tokens');
    }
  }, [openPanel, setOpenPanel]);

  const linkToAccountPage = useCallback(() => {
    routerHistory.push('/accounts');
  }, []);

  return (
    <div
      className='mobile-account-selector'
    >
      {address && (
        <div onClick={onClick}>
          <IdentityIcon
            canNotCopy
            className='icon'
            value={address}
          />

          <img
            alt='menu-arrow'
            className={openPanel === 'accounts' ? 'rotate-icon' : ''}
            src={menuArrow as string}
          />
        </div>)}
      {!address &&
        <Button
          className='button-outlined'
          onClick={linkToAccountPage}
        >
          Create or connect account
        </Button>}
    </div>
  );
};

export default memo(MobileAccountSelector);
