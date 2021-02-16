// Copyright 2020 UseTech authors & contributors

import './styles.scss';

import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { Button, Input } from '@polkadot/react-components';
import { NftCollectionInterface, useCollections } from '@polkadot/react-hooks';

import useMarketplaceStages from '../../hooks/useMarketplaceStages';
import BuySteps from '../BuySteps';
import SaleSteps from '../SaleSteps';

interface Props {
  account: string;
}

function NftDetailsModal ({ account }: Props): React.ReactElement<Props> {
  // const [accessories, setAccessories] = useState<Array<string>>([]);
  const [accessories] = useState<Array<string>>([]);
  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '0';
  const collectionId = query.get('collectionId') || '';
  const { getDetailedCollectionInfo, getTokenImageUrl } = useCollections();
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface | null | undefined>();
  // if tokenContractInfo is not empty - token is on contract (ready to buy)
  const { deposited,
    readyToAskPrice,
    sendCurrentUserAction,
    setPrice,
    tokenContractInfo,
    tokenInfo,
    transferStep } = useMarketplaceStages(account, collectionId, tokenId);
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

  /* on-chain schema
  {
    [
        {"Trait 1":
            {
                "type": "enum",
                "size": 1,
                "values": ["Black Lipstick","Red Lipstick","Smile","Teeth Smile","Purple Lipstick","Nose Ring","Asian Eyes","Sun Glasses","Red Glasses","Round Eyes","Left Earring","Right Earring","Two Earrings","Brown Beard","Mustache-Beard","Mustache","Regular Beard","Up Hair","Down Hair","Mahawk","Red Mahawk","Orange Hair","Bubble Hair","Emo Hair","Thin Hair","Bald","Blonde Hair","Caret Hair","Pony Tails","Cigar","Pipe"]
            }
        }
    ]
  }
  */
  // off-chain schema
  // "metadata": "https://ipfs-gateway.usetech.com/ipns/QmaMtDqE9nhMX9RQLTpaCboqg7bqkb6Gi67iCKMe8NDpCE/metadata/token{id}"

  return (
    <Modal className='nft-details'
      onClose={closeModal}
      open
      size='large'>
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
          { uOwnIt && (
            <p><strong>You own it!</strong> (address: {account})</p>
          )}
          { !!(!uOwnIt && tokenInfo) && (
            <p><strong>The owner is </strong>{tokenInfo.Owner.toString()}</p>
          )}
          {/* { !!(!uOwnIt && tokenContractInfo) &&(
            <Button
              icon='shopping-cart'
              label='Buy it'
              onClick={onBuy}
            />
          )} */}
          {/* { uOwnIt && (
            <Button
              icon='dollar-sign'
              label='Sale it'
              onClick={onSale}
            />
          )} */}
          {/* { (tokenContractInfo && tokenContractInfo.owner === account) && (
            <Button
              icon='window-close'
              label='Cancel sale'
              onClick={onCancel}
            />
          )} */}
          {/* { !!(deposited && deposited > 0) && (
            <Button
              icon='history'
              label='Withdraw'
              onClick={onWithdraw}
            />
          )} */}
          <Button
            icon='shopping-cart'
            label='Buy it'
            onClick={onBuy}
          />
          <Button
            icon='history'
            label='Withdraw'
            onClick={onWithdraw}
          />
          <Button
            icon='dollar-sign'
            label='Sale it'
            onClick={onSale}
          />
          <Button
            icon='window-close'
            label='Cancel sale'
            onClick={onCancel}
          />
        </div>
        { transferStep !== 0 && (
          <SaleSteps step={transferStep} />
        )}
        { readyToAskPrice && (
          <Grid centered
            className='ask-price-form'
            verticalAlign='middle'>
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
  );
}

export default React.memo(NftDetailsModal);
