// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import envConfig from '@polkadot/apps-config/envConfig';
import { web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import { Input } from '@polkadot/react-components';
import { useApi, useCall, useKusamaApi } from '@polkadot/react-hooks';
import { formatKsmBalance } from '@polkadot/react-hooks/useKusamaApi';
import { fromStringToBnString } from '@polkadot/react-hooks/utils';
import { encodeAddress } from '@polkadot/util-crypto/address/encode';

import closeIcon from './closeIconBlack.svg';

const { uniqueApi } = envConfig;
const apiUrl = process.env.NODE_ENV === 'development' ? '' : uniqueApi;

const { kusamaDecimals, uniqueCollectionIds } = envConfig;

interface Props {
  account?: string;
  collection: NftCollectionInterface;
  closeModal: () => void;
  tokenId: string;
  tokenOwner?: { Ethereum?: string, Substrate?: string };
  updateTokens: (collectionId: string) => void;
}

function PlaceABetModal({ account, closeModal, collection, tokenId, tokenOwner, updateTokens }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { kusamaApi, getKusamaTransferFee } = useKusamaApi(account || '');

  console.log('kusamaApi', kusamaApi);
  // const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances?.all, [account]);
  // const kusamaBalancesAll = useCall<DeriveBalancesAll>(kusamaApi?.derive.balances?.all, [account]);

  const minBid = 123 // todo get from backend;

  const lastBid = 456 // todo get from backend;

  const minStep = 1 // todo get from backend;

  const [bid, setBid] = useState<string>(String(lastBid ? lastBid + minStep : minBid));

  const kusamaTransferFee = 0.123; // todo getKusamaTransferFee(recipient, value)

  const placeABid = async () => {
    if (!account) {
      return;
    }

    const recipient = {
      Substrate: '5CJZRtf2V2ntkzzFzXjgRBSLbCnLvQUqvdnD5abLX3V7RTiA' // todo get address from auction seed
    };

    const extrinsic = kusamaApi.tx.balances.transfer(
      encodeAddress(recipient.Substrate),
      fromStringToBnString(bid, kusamaDecimals)
    );

    const accounts = await web3Accounts();
    const signer = accounts.find((a) => a.address === account);

    if (!signer) {
      return;
    }

    const injector = await web3FromSource(signer.meta.source);

    await extrinsic.signAsync(signer.address, { signer: injector.signer });
    const tx = extrinsic.toJSON();

    console.log('txHex', JSON.stringify({
      tokenId,
      tx,
      collectionId: collection.id
    }, null, ' '));

    // send data to backend
    const url = `${apiUrl}/auction/place_bid`;
    const data = {
      tokenId,
      tx,
      collectionId: collection.id
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
      alert(`Token is up for sale ${JSON.stringify(json)}`);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <Modal
      className='unique-modal'
      onClose={closeModal}
      open
      size='tiny'
    >
      <Modal.Header>
        <h2>Place a bid</h2>
        <img
          alt='Close modal'
          onClick={closeModal}
          src={closeIcon as string}
        />
      </Modal.Header>
      <Modal.Content>
        <Form className='transfer-form'>
          <Form.Field>
            <Input
              className='is-small'
              onChange={setBid}
              placeholder='Bid'
              value={bid}
            />
            <div className='input-description'>{`Минимальная ставка ${minBid} KSM (последняя ${lastBid} KSM + шаг ${minStep} KSM)`} </div>
            <div className='warning-block'>A fee of ~ {kusamaTransferFee} KSM can be applied to the transaction</div>
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content='Confirm'
          disabled={!bid}
          onClick={placeABid}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(PlaceABetModal);
