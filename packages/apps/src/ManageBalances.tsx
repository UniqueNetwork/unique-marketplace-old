// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Popup from 'semantic-ui-react/dist/commonjs/modules/Popup';

import { OpenPanelType } from '@polkadot/apps-routing/types';
import { WithdrawModal } from '@polkadot/react-components';
import { useBalances, useNftContract } from '@polkadot/react-hooks';
import { formatKsmBalance, formatStrBalance } from '@polkadot/react-hooks/useKusamaApi';

import question from './images/question.svg';

interface Props {
  account?: string;
  setOpenPanel: (isOpen: OpenPanelType) => void;
}

const ManageBalances = (props: Props) => {
  const { account, setOpenPanel } = props;
  const { contractInstance, deposited, getUserDeposit } = useNftContract(account || '');
  const { freeBalance, freeKusamaBalance } = useBalances(account, getUserDeposit);
  const [showWithdrawModal, toggleWithdrawModal] = useState<boolean>(false);

  const closeModal = useCallback(() => {
    toggleWithdrawModal(false);
  }, []);

  // deposited && deposited.div(new BN(1000000)).gt(new BN(1))
  const openModal = useCallback(() => {
    toggleWithdrawModal(true);
  }, []);

  const withdrawPopup = useMemo(() => {
    return (
      <div className='withdraw-popup'>
        <Button
          className='withdraw-button'
          onClick={openModal}
        >
          Withdraw deposit
        </Button>
        or <NavLink
          exact={true}
          strict={true}
          to={'/faq'}
        >learn more
        </NavLink> in FAQ
      </div>
    );
  }, [openModal]);

  return (
    <div className='manage-balances mobile'>
      <div className='main-balance'>
        {formatStrBalance(15, freeBalance)}
        <span className='unit'>UNQ</span>
      </div>
      <div className='other-balance'>
        <div className='balance-line'>
          {formatKsmBalance(freeKusamaBalance)}
          <span className='unit'>KSM</span>
        </div>
        <div className='balance-line'>
          { +formatKsmBalance(deposited) > 0.000001 ? formatKsmBalance(deposited) : 0}
          <span className='unit'>KSM deposit</span>
          { !!(deposited && deposited.div(new BN(1000000)).gt(new BN(1))) && (
            <Popup
              className='mobile withdraw-popup'
              content={withdrawPopup}
              on='click'
              position='bottom left'
              trigger={<img
                alt='withdraw'
                src={question as string}
              />}
            />
          )}
        </div>
        <div className='footer-balance'
          onClick={setOpenPanel.bind(null, 'tokens')}>

          <Menu.Item
            active={location.pathname === '/wallet'}
            as={NavLink}
            className=''
            name='View all tokens'
            to='/wallet'
          />

        </div>
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
};

export default memo(ManageBalances);
