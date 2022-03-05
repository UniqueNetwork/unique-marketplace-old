// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringAddress } from '@polkadot/ui-keyring/types';

import React, { useCallback, useContext, useState } from 'react';
import { useHistory } from 'react-router';
import Confirm from 'semantic-ui-react/dist/commonjs/addons/Confirm';

import envConfig from '@polkadot/apps-config/envConfig';
import { AddressSmall, Button, CopyIcon, StatusContext } from '@polkadot/react-components';
import { keyring } from '@polkadot/ui-keyring';

import Backup from '../modals/Backup';
import blockExplorerIcon from './block-explorer.svg';

interface Props {
  account: KeyringAddress;
  forgetAccount: (account: string) => void;
}

function AccountTableItem ({ account, forgetAccount }: Props): React.ReactElement<Props> | null {
  const history = useHistory();
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState<boolean>(false);
  const [backupModalOpened, setBackupModalOpened] = useState<boolean>(false);
  const { queueAction } = useContext(StatusContext);
  const pair = keyring.getAddress(account.address, null);
  const isInjected = pair?.meta?.isInjected;
  const { uniqueBlockExplorer } = envConfig;

  const copyAddress = useCallback(
    (account: string) => () => {
      void navigator.clipboard.writeText(account);

      return queueAction({
        account,
        action: 'clipboard',
        message: 'address copied',
        status: 'queued'
      });
    },
    [queueAction]
  );

  const viewAllTokens = useCallback(() => {
    document.dispatchEvent(new CustomEvent('account changed', { detail: account.address }));

    history.push('/wallet');
  }, [account.address, history]);

  const _onExport = useCallback(() => {
    setBackupModalOpened(true);
  }, []);

  const _onForget = useCallback(() => {
    forgetAccount && forgetAccount(account.address);
    setConfirmDeleteAccount(false);
  }, [account.address, forgetAccount]);

  const closeConfirmation = useCallback(() => {
    setConfirmDeleteAccount(false);
  }, []);

  const openConfirmation = useCallback(() => {
    setConfirmDeleteAccount(true);
  }, []);

  const onCloseBackupModal = useCallback(() => {
    setBackupModalOpened(false);
  }, []);

  return (
    <div className='accounts-table-item'>
      <div className='item'>
        <AddressSmall value={account.address} />
        <div className='item--address'>
          <span>{account.address}</span>
          <a
            onClick={copyAddress(account.address)}
          >
            <CopyIcon />
          </a>
        </div>
      </div>
      <div className='explorer'>
        <img
          alt='explorer'
          className='explorer-icon'
          src={blockExplorerIcon as string}
        />
        <a
          href={uniqueBlockExplorer}
          target="_blank"
          rel="noopener noreferrer"
        >
          UNIQUE block explorer
        </a>
      </div>
      <a
        onClick={viewAllTokens}
      >
        View All Tokens
      </a>
      <div className={'actions btn-container'}>
        <Button
          className={'btn-outlined primary'}
          isDisabled={isInjected}
          label={'Export'}
          onClick={_onExport}
        />
        <Button
          className={'btn-outlined error'}
          isDisabled={isInjected}
          label={'Forget'}
          onClick={openConfirmation}
        />
        <Confirm
          content='Are you sure you want to delete the address from the wallet?'
          onCancel={closeConfirmation}
          onConfirm={_onForget}
          open={confirmDeleteAccount}
        />
      </div>
      { backupModalOpened && (
        <Backup
          address={account.address}
          onClose={onCloseBackupModal}
        />
      )}
    </div>
  );
}

export default React.memo(AccountTableItem);
