// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import BN from 'bn.js';
import React, { useCallback, useContext, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import ContractContext from '@polkadot/apps/ContractContext/ContractContext';
import envConfig from '@polkadot/apps-config/envConfig';
import { Input } from '@polkadot/react-components';
import { useNftContract } from '@polkadot/react-hooks';
import { formatKsmBalance } from '@polkadot/react-hooks/useKusamaApi';

const { kusamaDecimals } = envConfig;

interface Props {
  account?: string;
  closeModal: () => void;
}

function WithdrawModal ({ closeModal }: Props): React.ReactElement<Props> {
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const { account, deposited, ethAccount, getUserDeposit } = useContext(ContractContext);
  const { withdrawKSM } = useNftContract(account, ethAccount);

  const revertMoney = useCallback(() => {
    const amountToWithdraw = parseFloat(withdrawAmount) * Math.pow(10, kusamaDecimals);

    closeModal();
    withdrawKSM(amountToWithdraw.toFixed(0), () => closeModal(), () => void getUserDeposit());
  }, [closeModal, withdrawAmount, getUserDeposit, withdrawKSM]);

  const setValue = useCallback((val: string) => {
    val = val.slice(0, 8);

    if (+val > 100000 || +val < 0) return;
    if (val.length === 2 && val[0] === '0' && val[1] !== '.') val = '0';

    setWithdrawAmount(val);
  }, []);

  const setMax = useCallback(() => {
    if (deposited) {
      setWithdrawAmount(formatKsmBalance(new BN(deposited)));
    }
  }, [deposited]);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    ['e', 'E', '+', '-'].includes(event.key) && event.preventDefault();
  }, []);

  return (
    <Modal
      className='unique-modal withdraw modal-position'
      onClose={closeModal}
      open
      size='tiny'
    >
      <Modal.Header>
        <h2>Withdrawal from the market deposit to the your main Kusama account</h2>
      </Modal.Header>
      <Modal.Content image>
        <Form className='transfer-form'>
          <Form.Field>
            <div className='deposit-flex'>
              <div className='deposit-input'>
                <Input
                  autoFocus
                  className='isSmall balance-number'
                  defaultValue={(withdrawAmount || 0).toString()}
                  isError={!!(!deposited || (withdrawAmount && parseFloat(withdrawAmount) > parseFloat(formatKsmBalance(deposited))))}
                  label={'amount'}
                  max={deposited && parseFloat(formatKsmBalance(new BN(deposited)))}
                  onChange={setValue}
                  onKeyDown={onKeyDown}
                  placeholder='0'
                  type='number'
                  value={withdrawAmount}
                />
                <Button
                  content='Max'
                  onClick={setMax}
                />
              </div>

              <Input
                className='isSmall ksm-text'
                isReadOnly
                label={'ksm'}
                type='text'
                value='KSM'
              />
            </div>
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content='Confirm'
          disabled={!deposited || !parseFloat(withdrawAmount) || (parseFloat(withdrawAmount) > parseFloat(formatKsmBalance(new BN(deposited))))}
          onClick={revertMoney}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(WithdrawModal);
