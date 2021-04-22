// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';

import { InputAddress } from '@polkadot/react-components';

interface Props {
  onChange: (accountId: string | undefined) => void;
}

function AccountSelector ({ onChange }: Props): React.ReactElement<Props> {
  const [accountId, setAccountId] = useState<string>();

  useEffect(
    (): void => onChange(accountId),
    [accountId, onChange]
  );

  return (
    <section className='template--AccountSelector ui--row'>
      <InputAddress
        label='my default account'
        onChange={setAccountId}
        type='account'
      />
    </section>
  );
}

export default React.memo(AccountSelector);
