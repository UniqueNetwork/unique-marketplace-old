// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import BN from 'bn.js';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import envConfig from '@polkadot/apps-config/envConfig';
import { PlaceABetModal, WarningText } from '@polkadot/react-components';
import { useBalance, useDecoder, useMarketplaceStages, useSchema } from '@polkadot/react-hooks';
import { shortAddress, subToEth } from '@polkadot/react-hooks/utils';
import { OfferType } from '@polkadot/react-hooks/useCollections';

import BuySteps from './BuySteps';
import SaleSteps from './SaleSteps';
import logoKusama from '../../../../packages/apps/public/logos/kusama.svg';
import clock from '../../../../packages/apps/public/icons/clock.svg';
import { useTimeToFinishAuction } from '@polkadot/react-hooks/useTimeToFinishAuction';
import Table, { TColor, TSize } from '../Table2/TableContainer';
import Text from '../UIKitComponents/Text/Text';
import { useBidStatus } from '@polkadot/react-hooks/useBidStatus';
import { useSettings } from '@polkadot/react-api/useSettings';
import { getFormatedBidsTime } from '../util';

interface NftDetailsAuctionProps {
  account: string;
  offer: OfferType;
}

function NftDetailsAuction({ account, offer }: NftDetailsAuctionProps): React.ReactElement<NftDetailsAuctionProps> {

  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '';
  const collectionId = query.get('collectionId') || '';
  const [showBetForm, setShowBetForm] = useState<boolean>(false);
  const [ethAccount, setEthAccount] = useState<string>();
  const [isInWhiteList, setIsInWhiteList] = useState<boolean>(false);
  const [whiteListAmount, setWhiteListAmount] = useState<BN | null>(null);
  const [fee, setFee] = useState<BN>();
  const { balance, kusamaExistentialDeposit } = useBalance(account);
  const { hex2a } = useDecoder();
  const { attributes, collectionInfo, tokenUrl } = useSchema(account, collectionId, tokenId);
  const { cancelStep, checkWhiteList, formatKsmBalance, getKusamaTransferFee, kusamaAvailableBalance, sendCurrentUserAction, 
    tokenAsk, tokenInfo, transferStep } = useMarketplaceStages(account, ethAccount, collectionInfo, tokenId);
  const { contractAddress } = envConfig;
  const { auction: { bids, priceStep, stopAt }, price, seller } = offer;
  const timeLeft = useTimeToFinishAuction(stopAt);
  const { yourBidIsLeading, yourBidIsOutbid } = useBidStatus(bids, account || '');
  const { apiSettings } = useSettings();
  const escrowAddress = apiSettings?.blockchain?.escrowAddress;
  const commission = apiSettings?.auction?.commission;

  const bid = bids.length > 0 ? Number(price) + Number(priceStep) : price;

  const columnsArray = [
    {
      title: 'Bid',
      dataIndex: 'bid',
      key: 'bid',
      width: 150,
      headingTextSize: 'm' as TSize,
      color: 'blue-grey' as TColor,
      icon: 'arrows-down-up',
      render: (rowNumber: number) => (
        <Text size="m" color="additional-dark">
          {bids.length ? `${formatKsmBalance(new BN(bids[rowNumber].amount))} KSM` : ''}
        </Text>
      )
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 200,
      headingTextSize: 'm' as TSize,
      color: 'primary' as TColor,
      icon: 'calendar',
      render: (rowNumber: number) => (
        <Text size="m" color="blue-grey-600">
          {getFormatedBidsTime(bids[rowNumber].createdAt)}
        </Text>
      )
    },
    {
      title: 'Bidder',
      dataIndex: 'bidder',
      key: 'bidder',
      width: 150,
      render: (rowNumber: number) => (
        <Text size="m" color="primary-500">
          {bids.length ? shortAddress(bids[rowNumber].bidderAddress) : ''}
        </Text>
      )
    }
  ]

  const uSellIt = seller === account;
  // should I take into account Substrate and Ethereum?
  const uOwnIt = tokenInfo?.owner?.Substrate === account || tokenInfo?.owner?.Ethereum?.toLowerCase() === ethAccount || uSellIt;

  const tokenPrice = (tokenAsk?.flagActive === '1' && tokenAsk?.price && tokenAsk?.price.gtn(0)) ? tokenAsk.price : 0;
  const isOwnerContract = !uOwnIt && tokenInfo?.owner?.Ethereum?.toLowerCase() === contractAddress;

  const goBack = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    history.back();
  }, []);

  const onTransferSuccess = useCallback(() => {
    sendCurrentUserAction('UPDATE_TOKEN_STATE');
  }, [sendCurrentUserAction]);

  const whiteListFeeCheck = useCallback(async () => {
    if (escrowAddress && kusamaExistentialDeposit) {
      const transferMinDepositFee: BN | null = await getKusamaTransferFee(escrowAddress, kusamaExistentialDeposit);

      if (transferMinDepositFee) {
        setWhiteListAmount(transferMinDepositFee.add(kusamaExistentialDeposit));
      }
    }
  }, [escrowAddress, getKusamaTransferFee, kusamaExistentialDeposit]);

  // marketFee + kusamaFee
  const getFee = useCallback(async () => {
    if (bid && commission && escrowAddress) {
      const kusamaFee: BN | null = await getKusamaTransferFee(escrowAddress, new BN(bid));
      const marketCommission = Number(bid) / 100 * commission;
      const marketFee: BN | null = new BN(marketCommission);

      if (kusamaFee) {
        setFee(kusamaFee.add(marketFee));
      } else {
        setFee(marketFee);
      }
    }
  }, [bid, commission, escrowAddress, getKusamaTransferFee]);

  const onCancel = useCallback(() => {
    sendCurrentUserAction('CANCEL');
  }, [sendCurrentUserAction]);

  const toggleBetForm = useCallback(() => {
    setShowBetForm(!showBetForm);
  }, [showBetForm]);

  const closeBetModal = useCallback(() => {
    setShowBetForm(false);
  }, []);

  const checkIsInWhiteList = useCallback(async () => {
    if (ethAccount) {
      // check white list
      const result = await checkWhiteList(ethAccount);

      setIsInWhiteList(result);
    }
  }, [checkWhiteList, ethAccount]);

  useEffect(() => {
    void getFee();
  }, [getFee]);

  useEffect(() => {
    void checkIsInWhiteList();
  }, [checkIsInWhiteList]);

  useEffect(() => {
    if (account) {
      setEthAccount(subToEth(account).toLowerCase());
    }
  }, [account]);

  return (
    <div className='toke-details'>
      NFT Auction
      <div
        className='go-back'
      >
        <a
          href='/'
          onClick={goBack}
        >
          <svg
            fill='none'
            height='16'
            viewBox='0 0 16 16'
            width='16'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M13.5 8H2.5'
              stroke='var(--card-link-color)'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M7 3.5L2.5 8L7 12.5'
              stroke='var(--card-link-color)'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          back
        </a>
      </div>
      <div className='token-info'>
        <div className='token-info--row'>
          <div className='token-info--row--image'>
            {collectionInfo && (
              <Image
                className='token-image-big'
                src={tokenUrl}
              />
            )}
          </div>
          <div className='token-info--row--attributes'>
            <Header as='h3'>
              {collectionInfo && <span>{hex2a(collectionInfo.tokenPrefix)}</span>} #{tokenId}
            </Header>
            {attributes && Object.values(attributes).length > 0 && (
              <div className='accessories'>
                Attributes:
                {Object.keys(attributes).map((attrKey) => {
                  if (attrKey === 'ipfsJson') {
                    return null;
                  }

                  if (!Array.isArray(attributes[attrKey])) {
                    return <p key={attrKey}>{attrKey}: {attributes[attrKey]}</p>;
                  }

                  return (
                    <p key={attrKey}>{attrKey}: {(attributes[attrKey] as string[]).join(', ')}</p>
                  );
                })}
              </div>
            )}
            <div className='divider' />
            {(uOwnIt && !uSellIt) && (
              <Header as='h4'>You own it!</Header>
            )}
            {uSellIt && (
              <Header as='h4'>You`re selling it!</Header>
            )}
            {(!uOwnIt && !isOwnerContract && tokenInfo?.owner && tokenAsk?.flagActive !== '1') && (
              <Header as='h5'>The owner is {offer.seller}</Header>
            )}
            <div className='divider' />
            <div className='price-wrapper'>
              <img src={logoKusama as string} width={32} />
              <div className='price'>{fee && formatKsmBalance(new BN(bid).add(fee))}</div>
            </div>
            <div className='price-description'>{`bid ${formatKsmBalance(new BN(bid))} KSM + fee ${formatKsmBalance(fee)} KSM`}</div>
            <div className='buttons'>
              {(!account && !!tokenPrice) && (
                <div>
                  <Button
                    content='Buy it'
                    disabled
                    title='ass'
                  />
                  <p className='text-with-button'>Сonnect your wallet to make transactions</p>
                </div>
              )}
              <>
                <Button
                  content='Place a bid'
                  onClick={toggleBetForm}
                />
                {(uSellIt && !bids.length) && (
                  <Button
                    className='button-danger'
                    content={
                      <>
                        Delist
                        {cancelStep && (
                          <Loader
                            active
                            inline='centered'
                          />
                        )}
                      </>
                    }
                    onClick={onCancel}
                  />
                )}
              </>
              <div className='time-left'>
                <img src={clock as string} width={24} />
                {timeLeft}
              </div>
            </div>
            <div className='divider' />
            <div className='offers'>
              <div className='heading'>Offers</div>
              {<div className='leading-bid'>
                {yourBidIsLeading && <div className='bid you-lead'>Your bid is leading</div>}
                {yourBidIsOutbid && <div className='bid you-outbid'>Your offer is outbid</div>}
                <div className='current-bid'>{bids.length ? `Leading bid ${shortAddress(bids.reverse()[0].bidderAddress)}` : 'There are no bids'}</div>
              </div>}
              {!!bids.length && <Table data={[...bids.reverse()]} columns={columnsArray}></Table>}
            </div>

            {!!(uOwnIt && !uSellIt && !isInWhiteList && whiteListAmount) && (
              <>
                {kusamaAvailableBalance?.gte(whiteListAmount)
                  ? (
                    <WarningText
                      className='info'
                      text={`A fee of ~ ${formatKsmBalance(whiteListAmount)} KSM may be applied to the transaction. Your address will be added to the whitelist, allowing you to make transactions without network fees.`}
                    />
                  )
                  : (
                    <WarningText
                      className='warning'
                      text={'Your balance is too low to pay fees.'}
                    />
                  )}
              </>
            )}
            {(showBetForm && collectionInfo) && (
              <PlaceABetModal
                account={account}
                offer={offer}
                closeModal={closeBetModal}
                collection={collectionInfo}
                tokenId={tokenId}
                tokenOwner={tokenInfo?.owner}
                updateTokens={onTransferSuccess}
              />
            )}
            {!!(transferStep && transferStep <= 3) && (
              <SaleSteps step={transferStep} />
            )}
            {!!(transferStep && transferStep >= 4) && (
              <BuySteps step={transferStep - 3} />
            )}
            {(!collectionInfo || (account && (!kusamaAvailableBalance || !balance))) && (
              <Loader
                active
                className='load-info'
                inline='centered'
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(NftDetailsAuction);
