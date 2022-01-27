// [object Object]
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line header/header
import './style.scss';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import CreateModal from '@polkadot/app-accounts/modals/Create';
import ImportModal from '@polkadot/app-accounts/modals/Import';
import Qr from '@polkadot/app-accounts/modals/Qr';
import { ActionStatus } from '@polkadot/react-components/Status/types';
import { useToggle } from '@polkadot/react-hooks';

import ArrowIcon from './images/arrow.svg';

interface AccountButtonsGroupProps {
  onStatusChange: (status: ActionStatus) => void;
}

const AccountButtonsGroup: React.FC<AccountButtonsGroupProps> = ({ onStatusChange }) => {
  const [isCreateOpen, toggleCreate] = useToggle();
  const [isRestoreOpen, toggleRestore] = useToggle();
  const [isImportOpen, toggleImport] = useToggle();
  const [isQrOpen, toggleQr] = useToggle();

  const [active, setActive] = useState(false);

  const handleClick = useCallback(() => {
    setActive((prev) => !prev);
  }, [setActive]);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (buttonRef.current && !buttonRef.current.contains(event.target as HTMLButtonElement)) {
      setActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return <>
    {isCreateOpen && (
      <CreateModal
        onClose={toggleCreate}
        onStatusChange={onStatusChange}
      />
    )}
    {isRestoreOpen && (
      <CreateModal
        onClose={toggleRestore}
        onStatusChange={onStatusChange}
        restoreFromSeed={true}
      />
    )}
    {isImportOpen && (
      <ImportModal
        onClose={toggleImport}
        onStatusChange={onStatusChange}
      />
    )}
    {isQrOpen && (
      <Qr
        onClose={toggleQr}
        onStatusChange={onStatusChange}
      />
    )}
    <div className='btn-container'>
      <button
        className={'btn-outlined'}
        onClick={toggleCreate}
      >Create substrate account</button>
      <div className={active ? 'btn-select active' : 'btn-select'}>
        <div className='drop-list'>
          <span
            className='option'
            onClick={toggleRestore}
          >
            Seed phrase
          </span>
          <span
            className='option'
            onClick={toggleImport}
          >
            Backup JSON file
          </span>
          <span
            className='option'
            onClick={toggleQr}
          >
            QR-code
          </span>
        </div>
        <button
          className='btn'
          onClick={handleClick}
          ref={buttonRef}
        >
            Add account via
          <img
            alt='>'
            src= {ArrowIcon as string}
          />
        </button>
      </div>
    </div>
  </>;
};

export default React.memo(AccountButtonsGroup);
