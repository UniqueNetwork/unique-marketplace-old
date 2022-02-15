// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useContext, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { Input, Label, StatusContext } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';

import closeIcon from './closeIconBlack.svg';
import { CrossAccountId, normalizeAccountId, subToEth } from '@polkadot/react-hooks/utils';

interface Props {
  account?: string;
  collection: NftCollectionInterface;
  closeModal: () => void;
  tokenId: string;
  tokenOwner?: { Ethereum?: string, Substrate?: string };
  updateTokens: (collectionId: string) => void;
}

function TransferModal ({ account, closeModal, collection, tokenId, tokenOwner, updateTokens }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [recipient, setRecipient] = useState<{ Ethereum?: string, Substrate?: string }>({});
  const { queueExtrinsic } = useContext(StatusContext);
  const [tokenPart] = useState<number>(1);
  const [isAddressError, setIsAddressError] = useState<boolean>(true);

  const transferToken = useCallback(() => {
    if (!account) {
      return;
    }

    let extrinsic = api.tx.unique.transfer(recipient, collection.id, tokenId, tokenPart);

    if (!tokenOwner?.Substrate || tokenOwner?.Substrate !== account) {
      const ethAccount = subToEth(account).toLowerCase();

      if (tokenOwner?.Ethereum === ethAccount) {
        extrinsic = api.tx.unique.transferFrom(normalizeAccountId({ Ethereum: ethAccount } as CrossAccountId), normalizeAccountId(recipient as CrossAccountId), collection.id, tokenId, 1);
      }
    }

    queueExtrinsic({
      accountId: account,
      extrinsic,
      isUnsigned: false,
      txStartCb: () => { closeModal(); },
      txSuccessCb: () => { updateTokens(collection.id); }
    });
  }, [account, api, closeModal, collection, recipient, tokenId, tokenPart, updateTokens, queueExtrinsic]);

  const setRecipientAddress = useCallback((value: string) => {
    try {
      keyring.decodeAddress(value);
      setIsAddressError(false);
      setRecipient({ Substrate: value });
    } catch (e) {
      setIsAddressError(true);
      setRecipient({});
    }
  }, [setIsAddressError, setRecipient]);

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
        </Form>
        {/* { balanceTooLow && (
          <div className='warning-block'>Your balance is too low to pay fees. <a href='https://t.me/unique2faucetbot'
            rel='noreferrer nooperer'
            target='_blank'>Get testUNQ here.</a></div>
        )} */}
      </Modal.Content>
      <Modal.Description className='modalDescription'>
        <div>
          <p> Be careful, the transaction cannot be reverted.</p>
          <p> Make sure to use the Substrate address created with polkadot.js or this marketplace.</p>
          <p> Do not use address of third party wallets, exchanges or hardware signers, like ledger nano.</p>
        </div>
      </Modal.Description>

      <Modal.Actions>
        <Button
          content='Transfer token'
          disabled={!recipient}
          onClick={transferToken}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(TransferModal);
