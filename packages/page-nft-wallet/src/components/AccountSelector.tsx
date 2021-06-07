// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// only here, needs to be available for the rest of the codebase
/* eslint-disable react/jsx-max-props-per-line */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { InputAddress } from '@polkadot/react-components';

interface Props {
  className?: string;
  onChange: (accountId: string | undefined) => void;
}

function AccountSelector ({ className, onChange }: Props): React.ReactElement<Props> {
  const [accountId, setAccountId] = useState<string | undefined>();

  useEffect(
    (): void => onChange(accountId),
    [accountId, onChange]
  );

  return (
    <section className={`template--AccountSelector ui--row ${className || ''}`}>
      <InputAddress
        label='my default account'
        onChange={setAccountId}
        type='account'
      />
    </section>
  );
}

export default React.memo(styled(AccountSelector)`
  align-items: flex-end;

  .summary {
    text-align: center;
  }
`);
