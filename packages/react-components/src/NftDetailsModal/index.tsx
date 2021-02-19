// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import BN from 'bn.js';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { Button, Input, TxButton } from '@polkadot/react-components';
import { useApi, useSchema } from '@polkadot/react-hooks';

interface Props {
  account: string;
}

function NftDetailsModal ({ account }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '0';
  const collectionId = query.get('collectionId') || '';
  const [recipient, setRecipient] = useState<string | null>(null);
  const [tokenPart, setTokenPart] = useState<number>(0);
  const [isAddressError, setIsAddressError] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const { attributes, collectionInfo, getCollectionInfo, reFungibleBalance, tokenUrl } = useSchema(account, collectionId, tokenId);
  const decimalPoints = collectionInfo?.DecimalPoints instanceof BN ? collectionInfo?.DecimalPoints.toNumber() : 1;
  const setTokenPartToTransfer = useCallback((value) => {
    const numberValue = parseFloat(value);

    if (!numberValue) {
      console.log('token part error');
    }

    if (numberValue > reFungibleBalance || numberValue > 1 || numberValue < (1 / Math.pow(10, decimalPoints))) {
      setIsError(true);
    } else {
      setIsError(false);
    }

    setTokenPart(parseFloat(value));
  }, [decimalPoints, reFungibleBalance]);

  const closeModal = useCallback(() => {
    history.back();
  }, []);

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

  const loadCollectionInfo = useCallback(() => {
    void getCollectionInfo();
  }, [getCollectionInfo]);

  useEffect(() => {
    void loadCollectionInfo();
  }, [loadCollectionInfo]);

  const showTransferForm = true;

  return (
    <Modal
      className='unique-modal'
      onClose={closeModal}
      open
      size='large'>
      <Modal.Header>NFT Token Details</Modal.Header>
      <Modal.Content>
        { collectionInfo && (
          <div className='token-image'>
            <img src={tokenUrl} />
          </div>
        )}
        <div className='token-info'>
          <Header as='h3'>{collectionId} #{tokenId}</Header>
          <Header as='h4'>Accessories</Header>
          { attributes && Object.values(attributes).length > 0 && (
            <span>Attributes: {Object.keys(attributes).map((attrKey) => (<span key={attrKey}>{attrKey}: {attributes[attrKey]}</span>))}</span>
          )}
        </div>
        { showTransferForm && (
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
            { collectionInfo?.Mode.isReFungible && (
              <Form.Field>
                <Input
                  className='isSmall'
                  isError={isError}
                  label={`Please enter part of token you want to transfer, your token balance is: ${reFungibleBalance}`}
                  min={1 / (decimalPoints * 10)}
                  onChange={setTokenPartToTransfer}
                  placeholder='Part of re-fungible address'
                  type='number'
                />
              </Form.Field>
            )}
            <Form.Field>
              <TxButton
                accountId={account}
                isDisabled={!recipient || isError}
                label='Submit'
                onStart={closeModal}
                onSuccess={loadCollectionInfo}
                params={[recipient, collectionId, tokenId, (tokenPart * Math.pow(10, decimalPoints))]}
                tx={api.tx.nft.transfer}
              />
            </Form.Field>
          </Form>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button
          icon='check'
          label='Ok'
          onClick={closeModal}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(NftDetailsModal);
