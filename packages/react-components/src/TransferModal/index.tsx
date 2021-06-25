// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import BN from 'bn.js';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { Input, Label, StatusContext } from '@polkadot/react-components';
import { useApi, useBalance } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';

import closeIcon from './closeIconBlack.svg';

interface Props {
  account?: string;
  collection: NftCollectionInterface;
  closeModal: () => void;
  reFungibleBalance: number;
  tokenId: string;
  updateTokens: (collectionId: string) => void;
}

function TransferModal ({ account, closeModal, collection, reFungibleBalance, tokenId, updateTokens }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [recipient, setRecipient] = useState<string>();
  const { balance } = useBalance(account);
  const { queueExtrinsic } = useContext(StatusContext);
  const [tokenPart, setTokenPart] = useState<number>(0);
  const [balanceTooLow, setBalanceTooLow] = useState<boolean>(false);
  const [isAddressError, setIsAddressError] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const decimalPoints = collection?.DecimalPoints instanceof BN ? collection?.DecimalPoints.toNumber() : 1;

  const transferToken = useCallback(() => {
    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: api.tx.nft.transfer(recipient, collection.id, tokenId, (tokenPart * Math.pow(10, decimalPoints))),
      isUnsigned: false,
      txStartCb: () => { closeModal(); },
      txSuccessCb: () => { updateTokens(collection.id); }
    });
  }, [account, api, closeModal, collection, decimalPoints, recipient, tokenId, tokenPart, updateTokens, queueExtrinsic]);

  const setRecipientAddress = useCallback((value: string) => {
    try {
      keyring.decodeAddress(value);
      setIsAddressError(false);
      setRecipient(value);
    } catch (e) {
      setIsAddressError(true);
    }
  }, [setIsAddressError, setRecipient]);

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
  }, [reFungibleBalance, decimalPoints]);

  const checkBalanceEnough = useCallback(async () => {
    if (account && recipient) {
      const transferFee = await api.tx.nft.transfer(recipient, collection.id, tokenId, (tokenPart * Math.pow(10, decimalPoints))).paymentInfo(account) as { partialFee: BN };

      console.log('transferFee', transferFee, 'balance', balance?.free, 'existentialDeposit', api.consts.balances.existentialDeposit);

      if (transferFee && (!balance?.free || balance?.free.sub(transferFee.partialFee).lt(api.consts.balances.existentialDeposit))) {
        setBalanceTooLow(true);
      } else {
        setBalanceTooLow(false);
      }
    }
  }, [account, api, balance, collection, decimalPoints, recipient, tokenId, tokenPart]);

  useEffect(() => {
    void checkBalanceEnough();
  }, [checkBalanceEnough]);

  console.log('balanceTooLow', balanceTooLow);

  return (
    <Modal
      className='unique-modal'
      onClose={closeModal}
      open
      size='tiny'
    >
      <Modal.Header>
        <h2>Transfer NFT Token</h2>
        <img
          alt='Close modal'
          onClick={closeModal}
          src={closeIcon as string}
        />
      </Modal.Header>
      <Modal.Content>
        <Form className='transfer-form'>
          <Form.Field>
            <Label label={'Please enter an address you want to transfer'} />
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
              <Label label={`Please enter part of token you want to transfer, your token balance is: ${reFungibleBalance}`} />
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
        </Form>
        { balanceTooLow && (
          <div className='warning-block'>Your balance is too low to pay fees. <a href='https://t.me/unique2faucetbot'
            rel='noreferrer nooperer'
            target='_blank'>Get testUNQ here.</a></div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button
          content='Transfer token'
          disabled={balanceTooLow || !recipient}
          onClick={transferToken}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(TransferModal);
