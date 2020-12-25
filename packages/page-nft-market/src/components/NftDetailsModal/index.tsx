// Copyright 2020 UseTech authors & contributors

import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { Button, Input} from '@polkadot/react-components';
import { NftCollectionInterface, useCollections } from '@polkadot/react-hooks';
import useMarketplaceStages from '../../hooks/useMarketplaceStages';

import BuySteps from '../BuySteps';
import SaleSteps from '../SaleSteps';

import './styles.scss';

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
  const {
    deposited,
    sendCurrentUserAction,
    setPrice,
    transferStep,
    tokenInfo,
    tokenContractInfo,
    readyToAskPrice
  } = useMarketplaceStages(account, collectionId, tokenId);
  // const [isOwner, setIsOwner] = useState<boolean>(false);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<string>('');

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

  const onSavePrice = useCallback(() => {
    setPrice(tokenPriceForSale);
  }, [setPrice, tokenPriceForSale]);

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
          {/*{ !!(!uOwnIt && tokenContractInfo) &&(
            <Button
              icon='shopping-cart'
              label='Buy it'
              onClick={onBuy}
            />
          )}*/}
          <Button
            icon='shopping-cart'
            label='Buy it'
            onClick={onBuy}
          />
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
        { transferStep !== 0 && (
          <SaleSteps step={transferStep} />
        )}
        { readyToAskPrice && (
          <Grid className='ask-price-form' verticalAlign='middle' centered>
            <Grid.Row>
              <Grid.Column width={4}>
                <Input
                  className='explorer--query input-search'
                  help={<span>Set nft token price</span>}
                  label={'Set price'}
                  onChange={setTokenPriceForSale}
                  placeholder=''
                  type='number'
                  value={tokenPriceForSale}
                  withLabel
                />
              </Grid.Column>
              <Grid.Column width={4}>
                <Button
                  icon='save'
                  label='Set price'
                  onClick={onSavePrice}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        )}
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
  )
}

export default React.memo(NftDetailsModal);
