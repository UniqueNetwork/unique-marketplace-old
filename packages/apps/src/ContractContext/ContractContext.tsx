// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import React from 'react';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

export interface ContractProps {
  account?: string;
  deposited?: BN;
  ethAccount?: string;
  evmCollectionInstance: Contract | null,
  matcherContractInstance: Contract | null,
  getUserDeposit: () => Promise<BN | null>;
  setEvmCollectionInstance: (evmCollectionInstance: Contract) => void;
  setMatcherContractInstance: (matcherContractInstance: Contract) => void;
  web3Instance?: Web3;
}

const ContractContext: React.Context<ContractProps> = React.createContext({} as unknown as ContractProps);
const ContractConsumer: React.Consumer<ContractProps> = ContractContext.Consumer;
const ContractProvider: React.Provider<ContractProps> = ContractContext.Provider;

export default ContractContext;

export {
  ContractConsumer,
  ContractProvider
};
