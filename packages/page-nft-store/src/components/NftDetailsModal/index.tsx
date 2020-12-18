// Copyright 2020 UseTech authors & contributors
import { imgPath, url } from '../../constants';

import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import { Button } from '@polkadot/react-components';

import TradeContainer from '../TradeContainer';
import './styles.scss';
import useMarketplaceStages from "../../hooks/useMarketplaceStages";

interface Props {
  account: string;
  collectionId: string;
}

function NftDetailsModal({ account, collectionId }: Props): React.ReactElement<Props> {
  // const [accessories, setAccessories] = useState<Array<string>>([]);
  const [accessories] = useState<Array<string>>([]);
  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('id') || '0';
  const collectionName = query.get('collection');
  const balance = query.get('balance');
  const { tokenInfo } = useMarketplaceStages(account, collectionId, tokenId);
  console.log('tokenInfo', tokenInfo);

  console.log('balance', balance, 'tokenId', tokenId, 'collectionName', collectionName);

  const closeModal = useCallback(() => {
    history.back();
  }, []);
  console.log('Modal!!!');

  const loadTokenInfo = useCallback(() => {

  }, []);

  useEffect(() => {
    loadTokenInfo();
  }, [tokenId]);

  return (
    <Modal className="nft-details" size='large' open onClose={closeModal}>
      <Modal.Header>NFT Token Details</Modal.Header>
      <Modal.Content>
        <div className='token-image'>
          <img src={`${url}${imgPath}/images/punks/image${tokenId}.png`} />
        </div>
        <div className='token-info'>
          <Header as='h3'>{collectionName} #{tokenId}</Header>
          <p><strong>Mail punk</strong></p>
          <Header as='h4'>Accessories</Header>
          { accessories.map((accessory) => (
            <div className='accessory'>Red Glasses</div>
          ))}
          <Header as='h4'>Ownership</Header>
          <p><strong>You own it!</strong> (address: {account})</p>
          <Header as='h4'>Selling this NFT</Header>
        </div>
        <TradeContainer />
      </Modal.Content>
      <Modal.Actions>
        <Button
          icon='check'
          label='Ok'
          onClick={closeModal}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(NftDetailsModal);
