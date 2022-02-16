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
import { TransferModal, StartAuctionModal, PlaceABetModal, WarningText } from '@polkadot/react-components';
import formatPrice from '@polkadot/react-components/util/formatPrice';
import { useBalance, useDecoder, useMarketplaceStages, useSchema } from '@polkadot/react-hooks';
import { shortAddress, subToEth } from '@polkadot/react-hooks/utils';
import { OfferType } from '@polkadot/react-hooks/useCollections';

import BuySteps from './BuySteps';
import SaleSteps from './SaleSteps';
import SetPriceModal from './SetPriceModal';
import logoKusama from '../../../../packages/apps/public/logos/kusama.svg';
import clock from '../../../../packages/apps/public/icons/clock.svg';
import { useTimeToFinish } from '@polkadot/react-hooks/useTimeToFinish';
import Table, { TColor, TSize } from '../Table2/TableContainer';
import Text from '../UIKitComponents/Text/Text';
import { useBidStatus } from '@polkadot/react-hooks/useBidStatus';

interface NftDetailsAuctionProps {
  account: string;
  offer: OfferType;
}

let dataArray = [
  {
    time: '15-09-2021, 13:50:29'
  }
];

function NftDetailsAuction({ account, offer }: NftDetailsAuctionProps): React.ReactElement<NftDetailsAuctionProps> {

  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '';
  const collectionId = query.get('collectionId') || '';
  const [showTransferForm, setShowTransferForm] = useState<boolean>(false);
  const [showAuctionForm, setShowAuctionForm] = useState<boolean>(false);
  const [showBetForm, setShowBetForm] = useState<boolean>(false);
  const [ethAccount, setEthAccount] = useState<string>();
  const [isInWhiteList, setIsInWhiteList] = useState<boolean>(false);
  const [lowKsmBalanceToBuy, setLowKsmBalanceToBuy] = useState<boolean>(false);
  const [kusamaFees, setKusamaFees] = useState<BN | null>(null);
  const { balance, kusamaExistentialDeposit } = useBalance(account);
  const { hex2a } = useDecoder();
  const { attributes, collectionInfo, tokenUrl } = useSchema(account, collectionId, tokenId);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<string>('');
  const { cancelStep, checkWhiteList, deposited, formatKsmBalance, getKusamaTransferFee,
    getRevertedFee, kusamaAvailableBalance, readyToAskPrice, sendCurrentUserAction, setPrice,
    setReadyToAskPrice, tokenAsk, tokenInfo, transferStep } = useMarketplaceStages(account, ethAccount, collectionInfo, tokenId);
  const { contractAddress, escrowAddress, kusamaDecimals } = envConfig;
  const { auction, price, seller } = offer;
  const { bids, priceStep, startPrice, status, stopAt } = auction;
  const timeLeft = useTimeToFinish(stopAt);
  const { yourBidIsLeading, yourBidIsOutbid } = useBidStatus(bids, account || '');

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
          {dataArray[0].time}
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
  const fee = 123; //todo get fee

  // should I take into account Substrate and Ethereum?
  const uOwnIt = tokenInfo?.owner?.Substrate === account || tokenInfo?.owner?.Ethereum?.toLowerCase() === ethAccount || uSellIt;

  const tokenPrice = (tokenAsk?.flagActive === '1' && tokenAsk?.price && tokenAsk?.price.gtn(0)) ? tokenAsk.price : 0;
  const isOwnerContract = !uOwnIt && tokenInfo?.owner?.Ethereum?.toLowerCase() === contractAddress;

  const goBack = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    history.back();
  }, []);

  const onSavePrice = useCallback(() => {
    const parts = tokenPriceForSale.split('.');
    const priceLeft = new BN(parts[0]).mul(new BN(10).pow(new BN(12)));
    const priceRight = new BN(parseFloat(`0.${parts[1]}`) * Math.pow(10, kusamaDecimals));
    const price = priceLeft.add(priceRight);

    setPrice(price);
  }, [kusamaDecimals, setPrice, tokenPriceForSale]);

  const onTransferSuccess = useCallback(() => {
    setShowTransferForm(false);
    sendCurrentUserAction('UPDATE_TOKEN_STATE');
  }, [sendCurrentUserAction]);

  const closeAskModal = useCallback(() => {
    setReadyToAskPrice(false);
    sendCurrentUserAction('ASK_NOT_FILLED');
  }, [setReadyToAskPrice, sendCurrentUserAction]);

  const ksmFeesCheck = useCallback(async () => {
    // tokenPrice + marketFees + kusamaFees * 2
    if (tokenAsk?.price && escrowAddress) {
      const kusamaFees: BN | null = await getKusamaTransferFee(escrowAddress, tokenAsk.price);

      if (kusamaFees) {
        setKusamaFees(kusamaFees);
        const balanceNeeded = tokenAsk.price.add(kusamaFees.muln(2));
        const isLow = !!kusamaAvailableBalance?.add(deposited || new BN(0)).lte(balanceNeeded);

        setLowKsmBalanceToBuy(isLow);
      }
    }
  }, [tokenAsk, escrowAddress, getKusamaTransferFee, kusamaAvailableBalance, deposited]);

  const getMarketPrice = useCallback((price: BN) => {
    return formatPrice(formatKsmBalance(price.sub(getRevertedFee(price))));
  }, [formatKsmBalance, getRevertedFee]);

  const onCancel = useCallback(() => {
    sendCurrentUserAction('CANCEL');
  }, [sendCurrentUserAction]);

  const onBuy = useCallback(() => {
    sendCurrentUserAction('BUY');
  }, [sendCurrentUserAction]);

  const toggleTransferForm = useCallback(() => {
    setShowTransferForm(!showTransferForm);
  }, [showTransferForm]);

  const toggleAuctionForm = useCallback(() => {
    setShowAuctionForm(!showAuctionForm);
  }, [showAuctionForm]);

  const toggleBetForm = useCallback(() => {
    setShowBetForm(!showBetForm);
  }, [showBetForm]);

  const onSell = useCallback(() => {
    sendCurrentUserAction('SELL');
  }, [sendCurrentUserAction]);

  const closeTransferModal = useCallback(() => {
    setShowTransferForm(false);
  }, []);

  const closeAuctionModal = useCallback(() => {
    setShowAuctionForm(false);
  }, []);

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
    void ksmFeesCheck();
  }, [ksmFeesCheck]);

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
            {!!tokenPrice && (
              <>
                <Header as={'h2'}>
                  {formatPrice(formatKsmBalance(tokenPrice))} KSM
                </Header>
                {/* @todo - substrate commission from price - fixed? */}
                <p>Price: {getMarketPrice(tokenPrice)} KSM, Fee: {formatKsmBalance(getRevertedFee(tokenPrice))} KSM</p>
                {/* { (!uOwnIt && !transferStep && tokenAsk) && lowBalanceToBuy && (
                  <div className='warning-block'>Your balance is too low to pay fees. <a href='https://t.me/unique2faucetbot'
                    rel='noreferrer nooperer'
                    target='_blank'>Get testUNQ here</a></div>
                )} */}
                {(!uOwnIt && !transferStep && tokenAsk) && lowKsmBalanceToBuy && (
                  <div className='warning-block'>Your balance is too low to buy</div>
                )}
              </>
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
              <div className='price'>{formatKsmBalance(bids[0] ? new BN((price + priceStep + fee)) : new BN(startPrice + fee))}</div>
            </div>
            <div className='price-description'>{`price (or last bid) ${formatKsmBalance(new BN(price)) || formatKsmBalance(new BN(startPrice))} KSM + шаг + fee ${fee} KSM`}</div>
            <div className='buttons'>
              {(uOwnIt && !uSellIt) && (
                <>
                  <Button
                    content='Transfer'
                    onClick={toggleTransferForm}
                  />
                  <Button
                    content='Sell on Auction'
                    onClick={toggleAuctionForm}
                  />
                </>
              )}
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
                {(!uOwnIt && !transferStep && !!tokenPrice && kusamaFees) && (
                  <>
                    <WarningText
                      className='info'
                      text={`A small Kusama Network transaction fee up to ${formatKsmBalance(kusamaFees.muln(2))} KSM will be
                      applied to the transaction`}
                    />
                    <Button
                      content={`Buy it - ${formatKsmBalance(tokenPrice.add(kusamaFees.muln(2)))} KSM`}
                      disabled={lowKsmBalanceToBuy}
                      onClick={onBuy}
                    />
                  </>
                )}
                {
                  (!uOwnIt) && (
                    <Button
                      content='Place a bid'
                      onClick={toggleBetForm}
                    />
                  )
                }

                {(uSellIt && !transferStep) && (
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

            {!!(uOwnIt && !uSellIt && !isInWhiteList && kusamaExistentialDeposit) && (
              <>
                {kusamaAvailableBalance?.gte(kusamaExistentialDeposit.muln(2))
                  ? (
                    <WarningText
                      className='info'
                      text={`A fee of ~ ${formatKsmBalance(kusamaExistentialDeposit)} KSM may be applied to the transaction. Your address will be added to the whitelist, allowing you to make transactions without network fees.`}
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

            {(showTransferForm && collectionInfo) && (
              <TransferModal
                account={account}
                closeModal={closeTransferModal}
                collection={collectionInfo}
                tokenId={tokenId}
                tokenOwner={tokenInfo?.owner}
                updateTokens={onTransferSuccess}
              />
            )}
            {(showAuctionForm && collectionInfo) && (
              <StartAuctionModal
                account={account}
                closeModal={closeAuctionModal}
                collection={collectionInfo}
                tokenId={tokenId}
                tokenOwner={tokenInfo?.owner}
                updateTokens={onTransferSuccess}
              />
            )}
            {(showBetForm && collectionInfo) && (
              <PlaceABetModal
                account={account}
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
      {readyToAskPrice && (
        <SetPriceModal
          closeModal={closeAskModal}
          onSavePrice={onSavePrice}
          setTokenPriceForSale={setTokenPriceForSale}
          tokenPriceForSale={tokenPriceForSale}
        />
      )}
    </div>
  );
}

export default React.memo(NftDetailsAuction);
