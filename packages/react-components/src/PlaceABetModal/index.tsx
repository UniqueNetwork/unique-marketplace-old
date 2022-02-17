// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useState } from 'react';
import styled from 'styled-components';
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
import { Loader } from 'semantic-ui-react';
import { useSettings } from '@polkadot/react-api/useSettings';
import { keyring } from '@polkadot/ui-keyring';
const { uniqueApi } = envConfig;
const apiUrl = uniqueApi;

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
  const [isLoading, setIsLoading] = useState(false);
  const { apiSettings } = useSettings();

  const minBid = 123 // todo get from backend;
  const lastBid = 1 // todo get from backend;
  const minStep = 1 // todo get from backend;
  const startBid = lastBid ? lastBid + minStep : minBid;

  const [bid, setBid] = useState<string>(String(startBid));

  const kusamaTransferFee = 0.123; // todo getKusamaTransferFee(recipient, value) packages/react-components/src/NftDetails/index.tsx line 80

  const placeABid = async () => {
    if (!account) {
      return;
    }

    // todo validation form

    const recipient = {
      Substrate: apiSettings?.auction?.address 
    };

    const extrinsic = kusamaApi.tx.balances.transfer(
      encodeAddress(recipient.Substrate),
      fromStringToBnString(bid, kusamaDecimals)
    );

    const pair = keyring.getPair(account);
    const { meta: { source } } = pair;
    const injector = await web3FromSource(source);

    await extrinsic.signAsync(account, { signer: injector.signer });
    const tx = extrinsic.toJSON();

    const url = `${apiUrl}/auction/place_bid`;
    const data = {
      tokenId,
      tx,
      collectionId: collection.id
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
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <ModalStyled
      onClose={closeModal}
      open
      size='tiny'
    >
      <ModalHeader>
        <h2>Place a bid</h2>
        <img
          alt='Close modal'
          onClick={closeModal}
          src={closeIcon as string}
        />
      </ModalHeader>
      <ModalContent>
        <InputWrapper
          className='is-small'
          onChange={setBid}
          placeholder='Bid'
          type='number'
          value={bid}
        />
        <InputDescription className='input-description'>{`Минимальная ставка ${minBid} KSM (последняя ${lastBid} KSM + шаг ${minStep} KSM)`} </InputDescription>
        <WarningText>
          <span>
            A fee of ~ {kusamaTransferFee} KSM can be applied to the transaction
          </span>
        </WarningText>
      </ModalContent>
      <ModalActions>
        <ButtonWrapper>
          <Button
            disabled={false /* isLoading || parseInt(bid) < startBid */}
            onClick={placeABid}
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
      </ModalActions>
    </ModalStyled>
  );
}

const InputDescription = styled.div`
  color: #81858e;
  font-family: var(--font-inter);
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  margin: 8px 0 32px;
`;

const InputWrapper = styled(Input)`
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

const ModalStyled = styled(Modal)`
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

const ModalActions = styled(Modal.Actions)`
  &&&& {
    padding: 0 !important;
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

export default React.memo(PlaceABetModal);
