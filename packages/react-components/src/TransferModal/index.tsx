// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollections';

import BN from 'bn.js';
import React, { useCallback, useEffect, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { Button, Input, TxButton } from '@polkadot/react-components';
import { useApi, useBalance } from '@polkadot/react-hooks';

interface Props {
  account?: string;
  balance: number;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  closeModal: () => void;
  tokenId: string;
  updateTokens: (collectionId: string) => void;
}

function TransferModal ({ account, balance, canTransferTokens, closeModal, collection, tokenId, updateTokens }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [recipient, setRecipient] = useState<string>();
  const [tokenPart, setTokenPart] = useState<number>(0);
  const [isAddressError, setIsAddressError] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const balanceInfo = useBalance(recipient);
  const decimalPoints = collection?.DecimalPoints instanceof BN ? collection?.DecimalPoints.toNumber() : 1;

  const setRecipientAddress = useCallback((value: string) => {
    // setRecipient
    if (!value) {
      setIsAddressError(true);
    }

    if (value.length !== '5D73wtH5pqN99auP4b6KQRQAbketaSj4StkBJxACPBUAUdiq'.length) {
      setIsAddressError(true);
    }

    setRecipient(value);
  }, [setIsAddressError, setRecipient]);

  const setTokenPartToTransfer = useCallback((value) => {
    const numberValue = parseFloat(value);

    if (!numberValue) {
      console.log('token part error');
    }

    if (numberValue > balance || numberValue > 1 || numberValue < (1 / Math.pow(10, decimalPoints))) {
      setIsError(true);
    } else {
      setIsError(false);
    }

    setTokenPart(parseFloat(value));
  }, [balance, decimalPoints]);

  useEffect(() => {
    const { balanceError } = balanceInfo;

    setIsAddressError(balanceError);
  }, [balanceInfo]);

  // @todo address validation
  return (
    <Modal
      className='unique-modal'
      onClose={closeModal}
      open
      size='tiny'
    >
      <Modal.Header>
        <h2>Transfer NFT Token</h2>
      </Modal.Header>
      <Modal.Content image>
        <Form className='transfer-form'>
          <Form.Field>
            <Input
              className='isSmall'
              isError={isAddressError}
              label='Please enter an address you want to transfer'
              onChange={setRecipientAddress}
              placeholder='Recipient address'
            />
          </Form.Field>
          { Object.prototype.hasOwnProperty.call(collection.Mode, 'reFungible') && (
            <Form.Field>
              <Input
                className='isSmall'
                isError={isError}
                label={`Please enter part of token you want to transfer, your token balance is: ${balance}`}
                min={1 / (decimalPoints * 10)}
                onChange={setTokenPartToTransfer}
                placeholder='Part of re-fungible address'
                type='number'
              />
            </Form.Field>
          )}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button
          icon='times'
          label='Cancel'
          onClick={closeModal}
        />
        {/* if tokenPart === 0 - it will transfer all parts of token */}
        <TxButton
          accountId={account}
          isDisabled={!canTransferTokens || !recipient || isError}
          label='Submit'
          onStart={closeModal}
          onSuccess={updateTokens.bind(null, collection.id)}
          params={[recipient, collection.id, tokenId, (tokenPart * Math.pow(10, decimalPoints))]}
          tx={api.tx.nft.transfer}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(TransferModal);
