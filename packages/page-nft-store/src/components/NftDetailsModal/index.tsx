// Copyright 2020 UseTech authors & contributors

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import { Button } from '@polkadot/react-components';
import {NftCollectionInterface, useCollections} from '@polkadot/react-hooks';

import BuySteps from '../BuySteps';
import SaleSteps from '../SaleSteps';
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
  const collectionId = query.get('collectionId') || '';
  const { getTokenImageUrl, getDetailedCollectionInfo } = useCollections();
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface | null | undefined>();
  // if tokenContractInfo is not empty - token is on contract (ready to buy)
  const { deposited, sendCurrentUserAction, tokenInfo, tokenContractInfo, value } = useMarketplaceStages(account, collectionId, tokenId);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const uOwnIt = tokenInfo && tokenInfo.Owner.toString() === account;

  const closeModal = useCallback(() => {
    history.back();
  }, []);

  const loadCollectionInfo = useCallback(async () => {
    setCollectionInfo(await getDetailedCollectionInfo(collectionId));
  }, [collectionId, setCollectionInfo]);

  const onBuy = useCallback(() => {
    sendCurrentUserAction('BUY');
  }, []);

  const onSale = useCallback(() => {
    sendCurrentUserAction('SALE');
  }, []);

  const onCancel = useCallback(() => {
    sendCurrentUserAction('CANCEL');
  }, []);

  const onWithdraw = useCallback(() => {
    sendCurrentUserAction('REVERT_UNUSED_MONEY');
  }, []);

  const getBuyStep = useMemo((): number => {
    switch (value) {
      case 'buy':
        return 1;
      case 'sentTokenToNewOwner':
        return 2;
      default:
        return 0;
    }
  }, [value]);

  const getSaleStep = useMemo((): number => {
    switch (value) {
      case 'sale':
        return 1;
      case 'registerDeposit':
        return 2;
      case 'getDepositReady':
        return 3;
      case 'askPrice':
        return 4;
      case 'registerSale':
        return 5;
      default:
        return 0;
    }
  }, [value]);

  useEffect(() => {
    void loadCollectionInfo();
  }, [collectionId]);

  console.log('state value', value);

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
          { !!(!uOwnIt && tokenContractInfo) &&(
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
          { !!(deposited && deposited > 0) && (
            <Button
              icon='history'
              label='Withdraw'
              onClick={onWithdraw}
            />
          )}
        </div>
        { getSaleStep !== 0 && (
          <SaleSteps step={getSaleStep} />
        )}
        { getBuyStep !== 0 && (
          <BuySteps step={getBuyStep} />
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
  )
}

export default React.memo(NftDetailsModal);
