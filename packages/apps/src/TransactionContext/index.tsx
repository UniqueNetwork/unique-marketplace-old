// Copyright 2017-2022 @polkadot/react-api authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from 'react';

import TransactionContext from './TransactionContext';
import TransactionModal, { TransactionType } from './TransactionModal';

interface Props {
  children: React.ReactNode;
}

/* const defaultTransactions: TransactionType[] = [
  {
    state: 'finished',
    step: 1,
    text: 'Setting image location'
  },
  {
    state: 'active',
    step: 2,
    text: 'Setting collection trait'
  },
  {
    state: 'not-active',
    step: 3,
    text: 'Setting something else'
  }
]; */

function Transactions ({ children }: Props): React.ReactElement<Props> | null {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);

  const value = useMemo(() => ({
    setTransactions,
    transactions
  }), [transactions, setTransactions]);

  return (
    <TransactionContext.Provider value={value}>
      {children}
      { transactions.length > 0 && (
        <TransactionModal
          transactions={transactions}
        />
      )}
    </TransactionContext.Provider>
  );
}

export default React.memo(Transactions);
