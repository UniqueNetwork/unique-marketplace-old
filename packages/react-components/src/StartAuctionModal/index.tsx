// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { Input, Label, StatusContext } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';

import closeIcon from './closeIconBlack.svg';
import { CrossAccountId, normalizeAccountId, subToEth } from '@polkadot/react-hooks/utils';
import { web3Accounts, web3FromSource } from '@polkadot/extension-dapp';

interface Props {
  account?: string;
  collection: NftCollectionInterface;
  closeModal: () => void;
  tokenId: string;
  tokenOwner?: { Ethereum?: string, Substrate?: string };
  updateTokens: (collectionId: string) => void;
}

function StartAuctionModal ({ account, closeModal, collection, tokenId, tokenOwner, updateTokens }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [daysCount, setDaysCount] = useState<number>(7);
  const [minPrice, setMinPrice] = useState<number>(100);
  const [minStep, setMinStep] = useState<number>(10);
  const [tokenPart] = useState<number>(1);
  const startAuction = async () => {

    if (!account) {
      return;
    }

    const recipient = {
      Substrate: '5CJZRtf2V2ntkzzFzXjgRBSLbCnLvQUqvdnD5abLX3V7RTiA', // todo get address from auction seed
    };

    let extrinsic = api.tx.unique.transfer(recipient, collection.id, tokenId, tokenPart);

    if (!tokenOwner?.Substrate || tokenOwner?.Substrate !== account) {
      const ethAccount = subToEth(account).toLowerCase();

      if (tokenOwner?.Ethereum === ethAccount) {
        extrinsic = api.tx.unique.transferFrom(normalizeAccountId({ Ethereum: ethAccount } as CrossAccountId), normalizeAccountId(recipient as CrossAccountId), collection.id, tokenId, 1);
      }
    }

    const accounts = await web3Accounts();
    const signer = accounts.find(a => a.address === account);
    if (!signer) {
      return;
    }
    const injector = await web3FromSource(signer.meta.source);

    await extrinsic.signAsync(signer.address, { signer: injector.signer });
    const tx = extrinsic.toJSON();
    console.log('txHex', JSON.stringify({
      tx,
      days: daysCount,
      startPrice: minPrice,
      priceStep: minStep,
    }, null, ' '));
    // todo send this body to backend
  };

  return (
    <Modal
      className='unique-modal'
      onClose={closeModal}
      open
      size='tiny'
    >
      <Modal.Header>
        <h2>Start Auction</h2>
        <img
          alt='Close modal'
          onClick={closeModal}
          src={closeIcon as string}
        />
      </Modal.Header>
      <Modal.Content>
        <Form className='transfer-form'>
          <Form.Field>
            <Label label={'Days'} />
            <Input
              className='isSmall'
              onChange={setDaysCount}
              placeholder='Days'
              value={daysCount}
            />
          </Form.Field>
        </Form>
        <Form className='transfer-form'>
          <Form.Field>
            <Label label={'Min Price'} />
            <Input
              className='isSmall'
              onChange={setMinPrice}
              placeholder='Days'
              value={minPrice}
            />
          </Form.Field>
        </Form>
        <Form className='transfer-form'>
          <Form.Field>
            <Label label={'Min Step'} />
            <Input
              className='isSmall'
              onChange={setMinStep}
              placeholder='Days'
              value={minStep}
            />
          </Form.Field>
        </Form>
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
          content='Start Auction'
          onClick={startAuction}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(StartAuctionModal);
function web3Enable(arg0: string) {
    throw new Error('Function not implemented.');
}

