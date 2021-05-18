// Copyright 2017-2021 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from 'react';

import { Password, PasswordStrength} from '@polkadot/react-components';
import { keyring } from '@polkadot/ui-keyring';

type Props = {
  onChange: (password: string, isPasswordValid: boolean) => void;
  onEnter: () => void;
}

export default function PasswordInput ({ onChange, onEnter }: Props): React.ReactElement {
  const [{ isPass1Valid, password1 }, setPassword1] = useState({ isPass1Valid: false, password1: '' });
  const [{ isPass2Valid, password2 }, setPassword2] = useState({ isPass2Valid: false, password2: '' });

  useEffect(
    () => onChange(password1, isPass1Valid && isPass2Valid),
    [password1, onChange, isPass1Valid, isPass2Valid]
  );

  const _onPassword1Change = useCallback(
    (password1: string) => {
      setPassword1({
        isPass1Valid: keyring.isPassValid(password1),
        password1
      });
      setPassword2({
        isPass2Valid: keyring.isPassValid(password2) && (password2 === password1),
        password2
      });
    },
    [password2]
  );

  const onPassword2Change = useCallback(
    (password2: string) => setPassword2({
      isPass2Valid: keyring.isPassValid(password2) && (password2 === password1),
      password2
    }),
    [password1]
  );

  return (
    <div className='password-input'>
      <Password
        className='isSmall'
        help={'This password is used to encrypt your private key. It must be strong and unique! You will need it to sign transactions with this account. You can recover this account using this password together with the backup file (generated in the next step).'}
        isError={!isPass1Valid}
        label={'password'}
        onChange={_onPassword1Change}
        onEnter={onEnter}
        placeholder={'password'}
        value={password1}
      />
      <Password
        className='isSmall'
        help={'Verify the password entered above.'}
        isError={!isPass2Valid}
        label={'password (repeat)'}
        onChange={onPassword2Change}
        onEnter={onEnter}
        placeholder={'password (repeat)'}
        value={password2}
      />
      <PasswordStrength value={password1} />
    </div>
  );
}
