// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import BN from 'bn.js';
import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { Button, Input, TxButton } from '@polkadot/react-components';
import { useApi, useBalance, useMarketplaceStages, useSchema } from '@polkadot/react-hooks';

import BuySteps from './BuySteps';
import SaleSteps from './SaleSteps';

interface Props {
  account: string;
}

function NftDetailsModal ({ account }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '';
  const collectionId = query.get('collectionId') || '';
  const [recipient, setRecipient] = useState<string | null>(null);
  const [tokenPart, setTokenPart] = useState<number>(0);
  const [showTransferForm, setShowTransferForm] = useState<boolean>(false);
  const [isAddressError, setIsAddressError] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const { balance } = useBalance(account);
  const { attributes, collectionInfo, reFungibleBalance, tokenDetails, tokenUrl } = useSchema(account, collectionId, tokenId);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<string>('');
  const { deposited, depositor, readyToAskPrice, saleFee, sendCurrentUserAction, setPrice, transferStep } = useMarketplaceStages(account, collectionInfo, tokenId);

  const uOwnIt = tokenDetails?.Owner?.toString() === account;
  const uSaleIt = depositor === account;
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

  const onSavePrice = useCallback(() => {
    setPrice(tokenPriceForSale);
  }, [setPrice, tokenPriceForSale]);

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
          { uOwnIt && (
            <p><strong>You own it!</strong> (address: {account})</p>
          )}
          { !!(!uOwnIt && tokenDetails) && (
            <p><strong>The owner is </strong>{tokenDetails?.Owner?.toString()}</p>
          )}
          { !uOwnIt && (
            <Button
              icon='shopping-cart'
              label='Buy it'
              onClick={sendCurrentUserAction.bind(null, 'BUY')}
            />
          )}
          { deposited && (
            <Button
              icon='history'
              label='Withdraw'
              onClick={sendCurrentUserAction.bind(null, 'REVERT_UNUSED_MONEY')}
            />
          )}
          { uOwnIt && (
            <Button
              icon='dollar-sign'
              label='Sale it'
              onClick={sendCurrentUserAction.bind(null, 'SALE')}
            />
          )}
          { uOwnIt && (
            <Button
              icon='paper-plane'
              label='Transfer'
              onClick={setShowTransferForm.bind(null, true)}
            />
          )}
          { uSaleIt && (
            <Button
              icon='window-close'
              label='Cancel sale'
              onClick={sendCurrentUserAction.bind(null, 'CANCEL')}
            />
          )}
        </div>
        { saleFee && !balance?.free.gte(saleFee) && (
          <span className='text-warning'>Your balance is too low to pay fees</span>
        )}
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
                onSuccess={sendCurrentUserAction.bind(null, 'UPDATE_TOKEN_STATE')}
                params={[recipient, collectionId, tokenId, (tokenPart * Math.pow(10, decimalPoints))]}
                tx={api.tx.nft.transfer}
              />
            </Form.Field>
          </Form>
        )}
        { readyToAskPrice && (
          <Form className='transfer-form'>
            <Form.Field>
              <Input
                className='input-search'
                help={<span>Set nft token price</span>}
                label={'Set price'}
                onChange={setTokenPriceForSale}
                placeholder=''
                type='number'
                value={tokenPriceForSale}
                withLabel
              />
            </Form.Field>
            <Form.Field>
              <Button
                icon='save'
                label='Set price'
                onClick={onSavePrice}
              />
            </Form.Field>
          </Form>
        )}
        {/* { transferStep !== 0 && (
          <SaleSteps step={transferStep} />
        )} */}
        <SaleSteps step={transferStep} />
        { transferStep !== 0 && (
          <BuySteps step={transferStep} />
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
