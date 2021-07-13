// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { useCallback } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import envConfig from '@polkadot/apps-config/envConfig';
import { Input } from '@polkadot/react-components';

const { minPrice } = envConfig;

interface Props {
  closeModal: () => void;
  onSavePrice: () => void;
  setTokenPriceForSale: (price: string) => void;
  tokenPriceForSale: string;
}

function SetPriceModal (props: Props): React.ReactElement<Props> {
  const { closeModal, onSavePrice, setTokenPriceForSale, tokenPriceForSale } = props;

  const onSetPrice = useCallback((price: string) => {
    const floatPrice = parseFloat(price);

    price = price.slice(0, 8);

    if (+price > 100000 || +price < 0) return;
    if (price.length === 2 && price[0] === '0' && price[1] !== '.') price = '0';

    if (minPrice && floatPrice < minPrice && floatPrice > 0) {
      return;
    }

    if (price.replace(',', '.').split('.')[1]?.length > 6) {
      return;
    }

    setTokenPriceForSale(price);
  }, [setTokenPriceForSale]);

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
              onChange={onSetPrice}
              onKeyDown={(evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()}
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
          disabled={+tokenPriceForSale <= 0}
          onClick={onSavePrice}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(SetPriceModal);
