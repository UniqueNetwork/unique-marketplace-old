// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';
import envConfig from '@polkadot/apps-config/envConfig';

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import { Input } from '@polkadot/react-components';

import { useApi } from '@polkadot/react-hooks';

import closeIcon from './closeIconBlack.svg';
import { CrossAccountId, fromStringToBnString, normalizeAccountId, subToEth } from '@polkadot/react-hooks/utils';
import { web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import Select from '../UIKitComponents/SelectUIKit/Select';
import { Loader } from 'semantic-ui-react';
import { useSettings } from '@polkadot/react-api/useSettings';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

const { kusamaDecimals, uniqueCollectionIds } = envConfig;

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

  const [minStep, setMinStep] = useState<string>();
  const [startingPrice, setStartingPrice] = useState<string>();
  const [duration, setDuration] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);
  const { apiSettings } = useSettings();

  const { uniqueApi } = envConfig;
  const apiUrl = uniqueApi;
  const accountUniversal = encodeAddress(decodeAddress(account), 42);

  const kusamaTransferFee = 0.123; // todo getKusamaTransferFee(recipient, value)

  const onMinStepInputChange = useCallback(
    (value: string) => {
      setMinStep(value);
    },
    [setMinStep]
  );

  const onInputStartingPriceChange = useCallback(
    (value: string) => {
      setStartingPrice(value);
    },
    [setStartingPrice]
  );

  const onDurationSelectChange = useCallback(
    (value: string) => {
      setDuration(+value);
    },
    [setDuration]
  );

  const durationOptions = [
    {
      id: 3,
      title: '3 days'
    },
    {
      id: 7,
      title: '7 days'
    },
    {
      id: 14,
      title: '14 days'
    },
    {
      id: 21,
      title: '21 days'
    }
  ];

  const startAuction = async () => {

    if (!account) {
      return;
    }

    // todo form validation

    const recipient = {
      Substrate: apiSettings?.auction?.address
    };

    let extrinsic = api.tx.unique.transfer(recipient, collection.id, tokenId, tokenPart);

    if (!tokenOwner?.Substrate || tokenOwner?.Substrate !== account) {
      const ethAccount = subToEth(account).toLowerCase();

      if (tokenOwner?.Ethereum === ethAccount) {
        extrinsic = api.tx.unique.transferFrom(normalizeAccountId({ Ethereum: ethAccount } as CrossAccountId), normalizeAccountId(recipient as CrossAccountId), collection.id, tokenId, 1);
      }
    }

    const accounts = await web3Accounts();
    const signer = accounts.find((a) => a.address === accountUniversal);
    if (!signer) {
      return;
    }

    const injector = await web3FromSource(signer.meta.source);

    await extrinsic.signAsync(account, { signer: injector.signer });
    const tx = extrinsic.toJSON();
    const url = `${apiUrl}/auction/create_auction`;
    const data = {
      tx,
      days: duration,
      startPrice: String(fromStringToBnString(startingPrice!, kusamaDecimals)),
      priceStep: String(fromStringToBnString(minStep!, kusamaDecimals)),
    };

    try {
      setIsLoading(true);
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
      setIsLoading(false);
      closeModal();
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
        <h2>Start auction</h2>
        <img
          alt='Close modal'
          onClick={closeModal}
          src={closeIcon as string}
        />
      </ModalHeader>
      <ModalContent>
        <LabelText>
          Minimum step*
        </LabelText>
        <InputWrapper
          onChange={onMinStepInputChange}
          type='number'
          value={minStep}
        />
        <Row>
          <Col>
            <LabelText>
              Starting Price
            </LabelText>
            <InputWrapper
              onChange={onInputStartingPriceChange}
              type='number'
              value={startingPrice}
            />
          </Col>
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
            disabled={isLoading || !minStep || !duration}
            onClick={startAuction}
          >
            <>
              {isLoading ? (
                <Loader
                  active
                  inline='centered'
                />
              ) : 'Confirm'}
            </>
          </Button>
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

  span {
    color: #F9A400;
    font: 500 14px/22px var(--font-inter);
  }
`;

const LabelText = styled.div`
  margin-bottom: 5px;
  width: 100%;
  color: #040b1d;
  font: 600 16px/24px var(--font-inter);
`;

const InputWrapper = styled(Input)`
  margin-bottom: 32px;

  &&& .input {
    margin:0;
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input {
      font-family: var(--font-inter) !important;
      padding: 8px 16px !important;
      line-height: 24px;
      border-radius: 4px;
      border-color: #d2d3d6;
      box-sizing: border-box;
      height: 40px;
    }
  }
`;

const SelectWrapper = styled(Select)`
   && {
     margin-bottom: 32px;

     .menu {
       background-color: #fff;
     }
   }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  &&& button {
    font-family: var(--font-inter) !important;
    margin-right: 0;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Col = styled.div`
  width: 100%;
  margin-right: 24px;
`;

const SellModalStyled = styled(Modal)`
&&& {
  padding: 1.5rem !important;
  background-color: #fff;
  width: 640px;

  .unique-select .select-wrapper > svg {
    z-index: 20;
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

      img {
        cursor: pointer;
      }
    }
`;

const ModalContent = styled(Modal.Content)`
  &&&& {
    padding: 0;
    }
`;

export default React.memo(StartAuctionModal);



