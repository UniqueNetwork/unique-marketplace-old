// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';

import { InputAddress } from '@polkadot/react-components';

interface Props {
  onChange: (accountId: string | undefined) => void;
}

function AccountSelector ({ onChange }: Props): React.ReactElement<Props> {
  const [accountId, setAccountId] = useState<string>();
  const [defaultValue, setDefaultValue] = useState<string>();

  const changeAccountListener = (e: CustomEvent<string>) => {
    const newAccount = e.detail;

    setDefaultValue(newAccount);
  }

  const changeEventListener = (e: Event) => changeAccountListener(e as CustomEvent<string>);

  useEffect(
    (): void => onChange(accountId),
    [accountId, onChange]
  );

  useEffect(() => {
    document.addEventListener('account changed', changeEventListener);

    return () => {
      document.removeEventListener('account changed', changeEventListener);
    }
  }, []);

  return (
    <section className='template--AccountSelector ui--row'>
      <InputAddress
        defaultValue={defaultValue}
        label='my default account'
        onChange={setAccountId}
        type='account'
      />
    </section>
  );
}

export default React.memo(AccountSelector);
