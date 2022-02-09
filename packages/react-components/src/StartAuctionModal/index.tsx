// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';
import envConfig from '@polkadot/apps-config/envConfig';

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import { useApi } from '@polkadot/react-hooks';

import closeIcon from './closeIconBlack.svg';
import { CrossAccountId, normalizeAccountId, subToEth } from '@polkadot/react-hooks/utils';
import { web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import Select from '../UIKitComponents/SelectUIKit/Select';
import Input from '../UIKitComponents/InputUIKit/Input';


interface Props {
  account?: string;
  collection: NftCollectionInterface;
  closeModal: () => void;
  tokenId: string;
  tokenOwner?: { Ethereum?: string, Substrate?: string };
  updateTokens: (collectionId: string) => void;
}

function StartAuctionModal({ account, closeModal, collection, tokenId, tokenOwner, updateTokens }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [tokenPart] = useState<number>(1);

  const [minStep, setMinStep] = useState<number>();
  const [startingPrice, setStartingPrice] = useState<number>();
  const [duration, setDuration] = useState<string>();

  const { uniqueApi } = envConfig;
  const apiUrl = process.env.NODE_ENV === 'development' ? '' : uniqueApi;

  const kusamaTransferFee = 0.123; // todo getKusamaTransferFee(recipient, value)

  const onMinStepInputChange = useCallback(
    (value: number) => {
      console.log('Number(value)', Number(value));
      if (typeof Number(value) === 'number') {
        setMinStep(value);
      }
    },
    [setMinStep]
  );

  const onInputStartingPriceChange = useCallback(
    (value: number) => {
      setStartingPrice(value);
    },
    [setStartingPrice]
  );

  const onDurationSelectChange = useCallback(
    (value: string) => {
      setDuration(value);
    },
    [setDuration]
  );

  const durationOptions = [
    {
      id: '3 days',
      title: '3 days'
    },
    {
      id: '7 days',
      title: '7 days'
    },
    {
      id: '14 days',
      title: '14 days'
    },
    {
      id: '21 days',
      title: '21 days'
    }
  ];

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
      days: parseInt(duration as string),
      startPrice: startingPrice,
      priceStep: minStep,
    }, null, ' '));
    // send data to backend
    const url = `${apiUrl}/auction/create_auction`;
    const data = {
      tx,
      days: parseInt(duration as string),
      startPrice: startingPrice,
      priceStep: minStep,
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
      alert(`Token put up for auction ${JSON.stringify(json)}`);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <SellModalStyled
      onClose={closeModal}
      open
      size='tiny'
    >
      <ModalHeader>
        <h2>Sell on auction</h2>
        <img
          alt='Close modal'
          onClick={closeModal}
          src={closeIcon as string}
        />
      </ModalHeader>
      <ModalContent>
        <InputWrapper
          label='Minimum step*'
          onChange={onMinStepInputChange}
          type='number'
          value={minStep}
        />
        <Row>
          <InputWrapper
            label='Starting Price'
            onChange={onInputStartingPriceChange}
            type='number'
            value={startingPrice}
          />
          <SelectWrapper
            label='Duration*'
            onChange={onDurationSelectChange}
            options={durationOptions}
            value={duration}
          />
        </Row>
        <WarningText>
          <span>
            A fee of ~ {kusamaTransferFee} KSM can be applied to the transaction
          </span>
        </WarningText>
        <ButtonWrapper>
          <Button
            content='Confirm'
            disabled={!minStep || !duration}
            onClick={startAuction}
          />
        </ButtonWrapper>
      </ModalContent>
    </SellModalStyled>
  );
}

const WarningText = styled.div`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin-bottom: 24px;
  border-radius: 4px;
  background-color: #FFF4E0;
  width: 100%;

  span{
    color: #F9A400;
    font: 500 14px/22px var(--font-inter);
  }
`;

const InputWrapper = styled(Input)`
  margin-bottom: 32px;

  &&& input{
    border:none;
  }
`;

const SelectWrapper = styled(Select)`
   && {
     margin-bottom: 32px;

     .menu{
       background-color: #fff;
     }
   }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  &&& button{
    font-family: var(--font-inter) !important;
    margin-right: 0;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .unique-input{
    margin-right: 24px;
  }
`;

const SellModalStyled = styled(Modal)`
&&& {

  padding: 1.5rem !important;
  background-color: #fff;
  width: 640px;

  .unique-input-text {
    width: 100%;
  }

  .unique-select .select-wrapper > svg {
    z-index: 20;
  }

  .unique-tabs-contents {
    padding-top: 32px;
    padding-bottom: 0;
  }

  .unique-tabs-labels {
    margin-top: 16px;
  }
}
  
`;

const ModalHeader = styled(Modal.Header)`
  &&&& { 
    padding: 0;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

      h2 {
      margin-bottom:0
      }
    }
`;

const ModalContent = styled(Modal.Content)`
  &&&& { 
    padding: 0;
    }
`;

export default React.memo(StartAuctionModal);
function web3Enable(arg0: string) {
  throw new Error('Function not implemented.');
}

