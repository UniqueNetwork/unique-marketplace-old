// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { Contract } from 'web3-eth-contract';

import BN from 'bn.js';
import React, { useCallback, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import envConfig from '@polkadot/apps-config/envConfig';
import { Input } from '@polkadot/react-components';
import { formatKsmBalance } from '@polkadot/react-hooks/useKusamaApi';
import { getFee } from '@polkadot/react-hooks/utils';

const { kusamaDecimals } = envConfig;

interface Props {
  account?: string;
  closeModal: () => void;
  contractInstance: Contract | null;
  deposited: BN | undefined;
  updateDeposit: () => Promise<BN | null>;
  withdrawKSM: (amount: string, failCallBack: () => void, successCallBack: () => void) => void;
}

function WithdrawModal ({ closeModal, deposited, updateDeposit, withdrawKSM }: Props): React.ReactElement<Props> {
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  const revertMoney = useCallback(() => {
    const amountToWithdraw = parseFloat(withdrawAmount) * Math.pow(10, kusamaDecimals);

    withdrawKSM(amountToWithdraw.toFixed(0), () => closeModal(), () => { void updateDeposit(); closeModal(); });
  }, [closeModal, withdrawAmount, updateDeposit, withdrawKSM]);

  const setValue = useCallback((val: string) => {
    val = val.slice(0, 8);

    if (+val > 100000 || +val < 0) return;
    if (val.length === 2 && val[0] === '0' && val[1] !== '.') val = '0';

    setWithdrawAmount(val);
  }, []);

  const setMax = useCallback(() => {
    if (deposited) {
      const depositedFee = getFee(deposited);

      setWithdrawAmount(formatKsmBalance(new BN(deposited).add(depositedFee)));
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
                  max={deposited && parseFloat(formatKsmBalance(new BN(deposited).add(getFee(deposited))))}
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
