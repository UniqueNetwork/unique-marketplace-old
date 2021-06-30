// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { useCallback } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import envConfig from '@polkadot/apps-config/envConfig';
import { Input } from '@polkadot/react-components';

const { decimals, minPrice } = envConfig;

interface Props {
  closeModal: () => void;
  onSavePrice: () => void;
  setTokenPriceForSale: (price: string) => void;
  tokenPriceForSale: string;
}

function SetPriceModal (props: Props): React.ReactElement<Props> {
  const { closeModal, onSavePrice, setTokenPriceForSale, tokenPriceForSale } = props;

  const digitsLenFromIndexExceeded = useCallback((index: number, price: string): boolean => {
    return price.substr(index + 1, price.length).length > decimals;
  }, []);

  const onSetPrice = useCallback((price: string) => {
    if (minPrice && parseFloat(price) < minPrice && parseFloat(price) > 0) {
      return;
    }

    const commaIndex = price.indexOf(',');
    const dotIndex = price.indexOf('.');
    let exceeded = false;

    if (commaIndex !== -1) {
      exceeded = digitsLenFromIndexExceeded(commaIndex, price);
    } else if (dotIndex !== -1) {
      exceeded = digitsLenFromIndexExceeded(dotIndex, price);
    }

    if (exceeded) {
      return;
    }

    setTokenPriceForSale(price);
  }, [digitsLenFromIndexExceeded, setTokenPriceForSale]);

  return (
    <Modal
      className='unique-modal set-price'
      onClose={closeModal}
      open
      size='tiny'
    >
      <Modal.Header>
        <h2>Set your token price</h2>
      </Modal.Header>
      <Modal.Content image>
        <Form className='transfer-form'>
          <Form.Field>
            <Input
              autoFocus
              label={'in KSM'}
              min={0.01}
              onChange={onSetPrice}
              type='number'
              value={tokenPriceForSale}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content='Cancel'
          onClick={closeModal}
          secondary
        />
        <Button
          content='Submit'
          onClick={onSavePrice}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(SetPriceModal);
