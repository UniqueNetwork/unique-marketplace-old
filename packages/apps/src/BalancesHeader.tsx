// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useCallback, useState } from 'react';
import Popup from 'semantic-ui-react/dist/commonjs/modules/Popup';

import { WithdrawModal } from '@polkadot/react-components';
import { useBalances, useNftContract } from '@polkadot/react-hooks';
import { formatKsmBalance, formatStrBalance } from '@polkadot/react-hooks/useKusamaApi';

import balanceUpdate from '../public/icons/balanceUpdate.svg';

function BalancesHeader ({ account }: { account?: string }): React.ReactElement<{ account?: string }> {
  const { contractInstance, deposited, getUserDeposit } = useNftContract(account || '');
  const { balancesAll, kusamaBalancesAll } = useBalances(account, deposited, getUserDeposit);
  const [showWithdrawModal, toggleWithdrawModal] = useState<boolean>(false);

  const closeModal = useCallback(() => {
    toggleWithdrawModal(false);
  }, []);

  const openModal = useCallback(() => {
    if (deposited && parseFloat(formatKsmBalance(deposited)) > 0) {
      toggleWithdrawModal(true);
    }
  }, [deposited]);

  return (
    <div className='app-balances'>
      <div className='app-balance--item'>
        <small>balance</small>
        {formatStrBalance(15, balancesAll?.freeBalance)} UNQ
      </div>
      <div className='app-balance--item'>
        <small>balance</small>
        {formatKsmBalance(kusamaBalancesAll?.freeBalance)} KSM
      </div>
      <div className='app-balance--item'>
        <small>deposit</small>
        {formatKsmBalance(deposited)} KSM
        <Popup
          content='Withdraw your ksm deposit'
          trigger={<img
            alt='balance-update'
            onClick={openModal}
            src={balanceUpdate as string}
          />}
        />
      </div>
      { showWithdrawModal && (
        <WithdrawModal
          account={account}
          closeModal={closeModal}
          contractInstance={contractInstance}
          deposited={deposited}
          updateDeposit={getUserDeposit}
        />
      )}
    </div>
  );
}

export default memo(BalancesHeader);
