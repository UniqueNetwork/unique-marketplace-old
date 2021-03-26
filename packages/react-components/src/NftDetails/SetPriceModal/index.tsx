// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { Input } from '@polkadot/react-components';

interface Props {
  closeModal: () => void;
  onSavePrice: () => void;
  setTokenPriceForSale: (price: string) => void;
  tokenPriceForSale: string;
}

function SetPriceModal (props: Props): React.ReactElement<Props> {
  const { closeModal, onSavePrice, setTokenPriceForSale, tokenPriceForSale } = props;

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
              className='isSmall'
              help={<span>Set nft token price</span>}
              label={'amount'}
              min={0.01}
              onChange={setTokenPriceForSale}
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
