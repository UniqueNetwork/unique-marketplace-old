// Copyright 2017-2022 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import FileSaver from 'file-saver';
import React, { useCallback, useContext, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';

import { AddressRow, Button, Label, Modal, Password, StatusContext } from '@polkadot/react-components';
import { keyring } from '@polkadot/ui-keyring';

interface Props {
  onClose: () => void;
  address: string;
}

function Backup ({ address, onClose }: Props): React.ReactElement<Props> {
  const [isBusy, setIsBusy] = useState(false);
  const [{ isPassTouched, password }, setPassword] = useState({ isPassTouched: false, password: '' });
  const [backupFailed, setBackupFailed] = useState(false);
  const isPassValid = !backupFailed && keyring.isPassValid(password);
  const { queueAction } = useContext(StatusContext);

  const _onChangePass = useCallback(
    (password: string): void => {
      setBackupFailed(false);
      setPassword({ isPassTouched: true, password });
    },
    []
  );

  const _doBackup = useCallback(
    (): void => {
      setIsBusy(true);
      setTimeout((): void => {
        try {
          const addressKeyring = address && keyring.getPair(address);
          const json = addressKeyring && keyring.backupAccount(addressKeyring, password);
          const blob = new Blob([JSON.stringify(json)], { type: 'application/json; charset=utf-8' });

          FileSaver.saveAs(blob, `${address}.json`);
        } catch (error) {
          setBackupFailed(true);
          setIsBusy(false);

          queueAction({
            action: 'Backup',
            message: 'Unable to decode using the supplied passphrase',
            status: 'error'
          });

          console.error(error);

          return;
        }

        setIsBusy(false);
        onClose();
      }, 0);
    },
    [address, onClose, password, queueAction]
  );

  return (
    <Modal
      className='unique-modal'
      header={'Export account'}
      onClose={onClose}
    >
      <Modal.Content>
        <AddressRow
          isInline
          value={address}
        >
          <p>An encrypted backup file will be created once you have pressed the "Download" button. This can be used to re-import your account on any other machine.</p>
          <p>Save this backup file in a secure location. Additionally, the password associated with this account is needed together with this backup file in order to restore your account.</p>
          <Form className='backup-form'>
            <Form.Field>
              <Label label={'Please enter a password'} />
              <Password
                autoFocus
                className='isSmall'
                help='The account password as specified when creating the account. This is used to encrypt the backup file and subsequently decrypt it when restoring the account.'
                isError={isPassTouched && !isPassValid}
                label={'password'}
                onChange={_onChangePass}
                onEnter={_doBackup}
                tabIndex={0}
                value={password}
              />
            </Form.Field>
          </Form>
        </AddressRow>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <Button
          icon='download'
          isBusy={isBusy}
          isDisabled={!isPassValid}
          label='Download'
          onClick={_doBackup}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(Backup);
