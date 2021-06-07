// Copyright 2017-2021 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from 'react';

export function useAccountId (initialValue?: string, onChangeAccountId?: (_: string | undefined) => void): [string | undefined, (_: string | undefined) => void] {
  const [accountId, setAccountId] = useState<string | undefined>(initialValue);

  const _setAccountId = useCallback(
    (accountId: string | undefined): void => {
      setAccountId(accountId);

      onChangeAccountId && onChangeAccountId(accountId);
    },
    [onChangeAccountId]
  );

  return [accountId, _setAccountId];
}
