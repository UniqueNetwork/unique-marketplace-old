// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import React, { memo, useCallback, useState } from 'react';
import Popup from 'semantic-ui-react/dist/commonjs/modules/Popup';

import { WithdrawModal } from '@polkadot/react-components';
import ArrowCircleUpRight from '@polkadot/react-components/ManageCollection/ArrowCircleUpRight.svg';
import ArrowCircleUpRightGreen from '@polkadot/react-components/ManageCollection/ArrowCircleUpRightGreen.svg';
import { useBalances, useNftContract } from '@polkadot/react-hooks';
import { formatKsmBalance, formatStrBalance } from '@polkadot/react-hooks/useKusamaApi';

function BalancesHeader ({ account }: { account?: string }): React.ReactElement<{ account?: string }> {
  const { contractInstance, deposited, getUserDeposit } = useNftContract(account || '');
  const { balancesAll, kusamaBalancesAll } = useBalances(account, deposited, getUserDeposit);
  const [showWithdrawModal, toggleWithdrawModal] = useState<boolean>(false);

  const closeModal = useCallback(() => {
    toggleWithdrawModal(false);
  }, []);

  const balanceUpdate = deposited && deposited.div(new BN(1000000)).gt(new BN(1)) ? ArrowCircleUpRight : ArrowCircleUpRightGreen;
  const openModal = useCallback(() => {
    deposited && deposited.div(new BN(1000000)).gt(new BN(1)) && toggleWithdrawModal(true);
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
        { +formatKsmBalance(deposited) > 0.000001 ? formatKsmBalance(deposited) : 0}  KSM
        <Popup
          content='Withdrawal from the market deposit to the your main Kusama account (available for the deposit sum greater than 0.000001 KSM)'
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
