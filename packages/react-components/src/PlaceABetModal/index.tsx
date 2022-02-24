// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';

import BN from 'bn.js';
import envConfig from '@polkadot/apps-config/envConfig';
import { web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import { Input } from '@polkadot/react-components';
import { useApi, useKusamaApi } from '@polkadot/react-hooks';
import { fromStringToBnString } from '@polkadot/react-hooks/utils';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import closeIcon from './closeIconBlack.svg';
import { Loader } from 'semantic-ui-react';
import { useSettings } from '@polkadot/react-api/useSettings';
import { OfferType } from '@polkadot/react-hooks/useCollections';
import { adaptiveFixed } from '../util';
const { uniqueApi } = envConfig;
const apiUrl = uniqueApi;

const { kusamaDecimals } = envConfig;

interface Props {
  offer: OfferType;
  collection: NftCollectionInterface;
  closeModal: () => void;
  tokenId: string;
  account?: string;
  tokenOwner?: { Ethereum?: string, Substrate?: string };
  updateTokens: (collectionId: string) => void;
}

function PlaceABetModal({ account, closeModal, collection, offer, tokenId, tokenOwner, updateTokens }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { kusamaApi, formatKsmBalance, getKusamaTransferFee } = useKusamaApi(account || '');
  const [isLoading, setIsLoading] = useState(false);
  const [fee, setFee] = useState<BN>();
  const { apiSettings } = useSettings();
  const escrowAddress = apiSettings?.blockchain?.escrowAddress;
  const { auction: { bids, priceStep, startPrice, status, stopAt }, price, seller } = offer;
  const accountUniversal = encodeAddress(decodeAddress(account), 42);

  const minBid = bids.length > 0 ? Number(price) + Number(priceStep) : price;

  const [bid, setBid] = useState<string>(formatKsmBalance(new BN(minBid)));
  const outsideCloseModal = ()=>{
    if(!isLoading){
      closeModal();
    }
  }

  const lastBidFromThisAccount = [...bids].reverse().find((bid)=>{return (encodeAddress(decodeAddress(bid.bidderAddress), 42) === accountUniversal)});
  const dispatchBid = formatKsmBalance(new BN(Number(bid)*1e12 - Number(lastBidFromThisAccount?.amount || 0)));

  // kusama transfer fee
  const getFee = useCallback(async () => {
    if (dispatchBid && escrowAddress) {
      const kusamaFee: BN | null = await getKusamaTransferFee(escrowAddress, new BN(dispatchBid));

      if (kusamaFee) {
        setFee(kusamaFee);
      }
    }
  }, [dispatchBid, escrowAddress, getKusamaTransferFee]);

  useEffect(() => {
    void getFee();
  }, [getFee]);

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
      fromStringToBnString(dispatchBid, kusamaDecimals)
    );
    const accounts = await web3Accounts();
    const signer = accounts.find((a) => a.address === accountUniversal);
    if (!signer) {
      return;
    }

    const injector = await web3FromSource(signer.meta.source);

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
      closeModal();
    }
  };

  return (
    <ModalStyled
      onClose={outsideCloseModal}
      open
      size='tiny'
    >
      <ModalHeader>
        <h2>Place a bid</h2>
        <img
          alt='Close modal'
          onClick={outsideCloseModal}
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
        <InputDescription className='input-description'>{`Minimum bet ${adaptiveFixed(Number(formatKsmBalance((new BN(minBid)))), 6)} KSM`} </InputDescription>
        {!!fee && bid && <WarningText>
          <span>
            A fee of ~ {formatKsmBalance(fee)} KSM can be applied to the transaction
          </span>
        </WarningText>}
      </ModalContent>
      <ModalActions>
        <ButtonWrapper>
          <Button
            disabled={isLoading || Number(bid)*1e12 < minBid}
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
