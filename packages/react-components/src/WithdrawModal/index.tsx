// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import BN from 'bn.js';
import React, { useCallback, useContext, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { ContractPromise } from '@polkadot/api-contract';
import envConfig from '@polkadot/apps-config/envConfig';
import { Input, StatusContext } from '@polkadot/react-components';
import { formatKsmBalance } from '@polkadot/react-hooks/useKusamaApi';
import { findCallMethodByName } from '@polkadot/react-hooks/utils';

const { kusamaDecimals, maxGas, quoteId } = envConfig;

interface Props {
  account?: string;
  closeModal: () => void;
  contractInstance: ContractPromise | null;
  deposited: BN | undefined;
  updateDeposit: () => Promise<BN | null>;
}

function WithdrawModal ({ account, closeModal, contractInstance, deposited, updateDeposit }: Props): React.ReactElement<Props> {
  const { queueExtrinsic } = useContext(StatusContext);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  const revertMoney = useCallback(() => {
    const message = findCallMethodByName(contractInstance, 'withdraw');

    if (message && contractInstance) {
      const extrinsic = contractInstance.tx.withdraw({
        gasLimit: maxGas,
        value: 0
      }, quoteId, (parseFloat(withdrawAmount) * Math.pow(10, kusamaDecimals)));

      queueExtrinsic({
        accountId: account && account.toString(),
        extrinsic: extrinsic,
        isUnsigned: false,
        txFailedCb: () => { console.log('fail withdraw'); },
        txStartCb: () => { console.log('start withdraw'); },
        txSuccessCb: () => { void updateDeposit(); closeModal(); },
        txUpdateCb: () => { console.log('update withdraw'); }
      });
    }
  }, [account, closeModal, contractInstance, queueExtrinsic, updateDeposit, withdrawAmount]);

  const setValue = (val: string) => {
    val = val.slice(0, 8);

    if (+val > 100000 || +val < 0) return;
    if (val.length === 2 && val[0] === '0' && val[1] !== '.') val = '0';

    setWithdrawAmount(val);
  };

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
                  max={parseFloat(formatKsmBalance(deposited))}
                  onChange={setValue}
                  onKeyDown={(evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()}
                  placeholder='0'
                  type='number'
                  value={withdrawAmount}
                />
                <Button
                  content='Max'
                  onClick={deposited ? setWithdrawAmount.bind(null, formatKsmBalance(deposited)) : () => null}
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
          disabled={!deposited || !parseFloat(withdrawAmount) || (parseFloat(withdrawAmount) > parseFloat(formatKsmBalance(deposited)))}
          onClick={revertMoney}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(WithdrawModal);
