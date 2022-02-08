import React from 'react';

export interface TransactionProps {
  transactions: any[],
  setTransactions: (transactions: any[]) => void;
}

const TransactionContext: React.Context<TransactionProps> = React.createContext({} as unknown as TransactionProps);
const TransactionConsumer: React.Consumer<TransactionProps> = TransactionContext.Consumer;
const TransactionProvider: React.Provider<TransactionProps> = TransactionContext.Provider;

export default TransactionContext;

export {
  TransactionConsumer,
  TransactionProvider
};
