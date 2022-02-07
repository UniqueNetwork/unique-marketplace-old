// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { Input, Label, StatusContext } from '@polkadot/react-components';
import { useApi, useCall, useKusamaApi } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';

import closeIcon from './closeIconBlack.svg';
import { CrossAccountId, fromStringToBnString, normalizeAccountId, subToEth } from '@polkadot/react-hooks/utils';
import { web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import { formatKsmBalance } from '@polkadot/react-hooks/useKusamaApi';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { encodeAddress } from '@polkadot/util-crypto/address/encode';
import envConfig from '@polkadot/apps-config/envConfig';
const { kusamaDecimals, uniqueCollectionIds } = envConfig;

interface Props {
  account?: string;
  collection: NftCollectionInterface;
  closeModal: () => void;
  tokenId: string;
  tokenOwner?: { Ethereum?: string, Substrate?: string };
  updateTokens: (collectionId: string) => void;
}

function PlaceABetModal ({ account, closeModal, collection, tokenId, tokenOwner, updateTokens }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { kusamaApi } = useKusamaApi(account || '');
  // const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances?.all, [account]);
  // const kusamaBalancesAll = useCall<DeriveBalancesAll>(kusamaApi?.derive.balances?.all, [account]);
  const [bid, setBid] = useState<string>(String(1));

  const placeABid = async () => {

    if (!account) {
      return;
    }

    const recipient = {
      Substrate: '5CJZRtf2V2ntkzzFzXjgRBSLbCnLvQUqvdnD5abLX3V7RTiA', // todo get address from auction seed
    };

    let extrinsic = kusamaApi.tx.balances.transfer(
      encodeAddress(recipient.Substrate),
      fromStringToBnString(bid, kusamaDecimals),
    );

    const accounts = await web3Accounts();
    const signer = accounts.find(a => a.address === account);
    if (!signer) {
      return;
    }
    const injector = await web3FromSource(signer.meta.source);

    await extrinsic.signAsync(signer.address, { signer: injector.signer });
    const tx = extrinsic.toJSON();
    console.log('txHex', JSON.stringify({
      tokenId,
      tx,
      collectionId: collection.id,
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
        <h2>Place A Bet Modal</h2>
        <img
          alt='Close modal'
          onClick={closeModal}
          src={closeIcon as string}
        />
      </Modal.Header>
      <Modal.Content>
        <Form className='transfer-form'>
          <Form.Field>
            <Label label={'Bid'} />
            <Input
              className='isSmall'
              onChange={setBid}
              placeholder='Bid'
              value={bid}
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
          content='Place a Bid'
          onClick={placeABid}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(PlaceABetModal);

