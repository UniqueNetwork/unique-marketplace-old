// Copyright 2020 UseTech authors & contributors

import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import { Button } from '@polkadot/react-components';
import {NftCollectionInterface, useCollections} from '@polkadot/react-hooks';

import TradeContainer from '../TradeContainer';
import './styles.scss';
import useMarketplaceStages from "../../hooks/useMarketplaceStages";

interface Props {
  account: string;
}

function NftDetailsModal({ account }: Props): React.ReactElement<Props> {
  // const [accessories, setAccessories] = useState<Array<string>>([]);
  const [accessories] = useState<Array<string>>([]);
  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '0';
  const collectionId = query.get('collection') || '';
  const balance = query.get('balance');
  const { getTokenImageUrl, getDetailedCollectionInfo } = useCollections();
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface | null | undefined>();
  const { tokenInfo, tokenContractInfo } = useMarketplaceStages(account, collectionId, tokenId);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const uOwnIt = tokenInfo && tokenInfo.Owner.toString() === account;
  console.log('tokenInfo', tokenInfo, 'owner');

  console.log('balance', balance, 'tokenId', tokenId, 'collectionName', collectionId);

  const closeModal = useCallback(() => {
    history.back();
  }, []);
  console.log('Modal!!!');

  const loadCollectionInfo = useCallback(async () => {
    setCollectionInfo(await getDetailedCollectionInfo(collectionId));
  }, [collectionId, setCollectionInfo]);

  const onBuy = useCallback(() => {

  }, []);

  const onSale = useCallback(() => {

  }, []);

  const onCancel = useCallback(() => {

  }, []);

  useEffect(() => {
    void loadCollectionInfo();
  }, [collectionId]);

  return (
    <Modal className="nft-details" size='large' open onClose={closeModal}>
      <Modal.Header>NFT Token Details</Modal.Header>
      <Modal.Content>
        { collectionInfo && (
          <div className='token-image'>
            <img src={getTokenImageUrl(collectionInfo, tokenId)} />
          </div>
        )}
        <div className='token-info'>
          <Header as='h3'>{collectionId} #{tokenId}</Header>
          <Header as='h4'>Accessories</Header>
          { accessories.map((accessory) => (
            <div className='accessory'>Red Glasses</div>
          ))}
          <Header as='h4'>Ownership</Header>
          { uOwnIt && (
            <p><strong>You own it!</strong> (address: {account})</p>
          )}
          { !!(!uOwnIt && tokenInfo) && (
            <p><strong>The owner is </strong>{tokenInfo.Owner.toString()}</p>
          )}
          { !uOwnIt && (
            <Button
              icon='shopping-cart'
              label='Buy it'
              onClick={onBuy}
            />
          )}
          { uOwnIt && (
            <Button
              icon='dollar-sign'
              label='Sale it'
              onClick={onSale}
            />
          )}
          { (tokenContractInfo && tokenContractInfo.owner === account) && (
            <Button
              icon='window-close'
              label='Cancel sale'
              onClick={onCancel}
            />
          )}
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
