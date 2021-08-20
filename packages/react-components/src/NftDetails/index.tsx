// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import BN from 'bn.js';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
// import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import envConfig from '@polkadot/apps-config/envConfig';
import { TransferModal } from '@polkadot/react-components';
import formatPrice from '@polkadot/react-components/util/formatPrice';
import { useBalance, useDecoder, useMarketplaceStages, useSchema } from '@polkadot/react-hooks';

import BuySteps from './BuySteps';
import SaleSteps from './SaleSteps';
import SetPriceModal from './SetPriceModal';

const { kusamaDecimals, showMarketActions } = envConfig;

interface NftDetailsProps {
  account: string;
}

function NftDetails ({ account }: NftDetailsProps): React.ReactElement<NftDetailsProps> {
  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '';
  const collectionId = query.get('collectionId') || '';
  const [showTransferForm, setShowTransferForm] = useState<boolean>(false);
  const [lowKsmBalanceToBuy, setLowKsmBalanceToBuy] = useState<boolean>(false);
  const [kusamaFees, setKusamaFees] = useState<BN | null>(null);
  const { balance } = useBalance(account);
  const { hex2a } = useDecoder();
  const { attributes, collectionInfo, reFungibleBalance, tokenUrl } = useSchema(account, collectionId, tokenId);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<string>('');
  const { cancelStep, deposited, escrowAddress, formatKsmBalance, getFee, getKusamaTransferFee, kusamaAvailableBalance, readyToAskPrice, sendCurrentUserAction, setPrice, setReadyToAskPrice, tokenAsk, tokenDepositor, tokenInfo, transferStep } = useMarketplaceStages(account, collectionInfo, tokenId);

  const uOwnIt = tokenInfo?.Owner?.toString() === account || (tokenAsk && tokenAsk.owner === account);
  const uSellIt = tokenAsk && tokenAsk.owner === account;
  const isOwnerEscrow = !!(!uOwnIt && tokenInfo && tokenInfo.Owner && tokenInfo.Owner.toString() === escrowAddress && tokenDepositor && (tokenAsk && tokenAsk.owner !== account));
  // const lowBalanceToBuy = !!(buyFee && !balance?.free.gte(buyFee));
  // sponsoring is enabled
  // const lowBalanceToSell = !!(saleFee && !balance?.free.gte(saleFee));

  const goBack = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    history.back();
  }, []);

  const onSavePrice = useCallback(() => {
    const parts = tokenPriceForSale.split('.');
    const priceLeft = new BN(parts[0]).mul(new BN(10).pow(new BN(12)));
    const priceRight = new BN(parseFloat(`0.${parts[1]}`) * Math.pow(10, kusamaDecimals));
    const price = priceLeft.add(priceRight);

    setPrice(price.toString());
  }, [setPrice, tokenPriceForSale]);

  const onTransferSuccess = useCallback(() => {
    setShowTransferForm(false);
    sendCurrentUserAction('UPDATE_TOKEN_STATE');
  }, [sendCurrentUserAction]);

  const closeAskModal = useCallback(() => {
    setReadyToAskPrice(false);

    setTimeout(() => {
      sendCurrentUserAction('ASK_PRICE_FAIL');
    }, 1000);
  }, [setReadyToAskPrice, sendCurrentUserAction]);

  const ksmFeesCheck = useCallback(async () => {
    // tokenPrice + marketFees + kusamaFees * 2
    if (tokenAsk?.price) {
      const kusamaFees: BN | null = await getKusamaTransferFee(escrowAddress, tokenAsk.price);

      if (kusamaFees) {
        setKusamaFees(kusamaFees);
        const balanceNeeded = tokenAsk.price.add(getFee(tokenAsk.price)).add(kusamaFees.muln(2));
        const isLow = !!kusamaAvailableBalance?.add(deposited || new BN(0)).lte(balanceNeeded);

        setLowKsmBalanceToBuy(isLow);
      }
    }
  }, [deposited, escrowAddress, kusamaAvailableBalance, getFee, getKusamaTransferFee, tokenAsk]);

  const getMarketPrice = useCallback((price: BN) => {
    return formatPrice(formatKsmBalance(new BN(price).add(getFee(price))));
  }, [formatKsmBalance, getFee]);

  useEffect(() => {
    void ksmFeesCheck();
  }, [ksmFeesCheck]);

  return (
    <div className='toke-details'>
      <a
        className='go-back'
        href='/'
        onClick={goBack}
      >
        <svg fill='none'
          height='16'
          viewBox='0 0 16 16'
          width='16'
          xmlns='http://www.w3.org/2000/svg'>
          <path d='M13.5 8H2.5'
            stroke='var(--card-link-color)'
            strokeLinecap='round'
            strokeLinejoin='round'/>
          <path d='M7 3.5L2.5 8L7 12.5'
            stroke='var(--card-link-color)'
            strokeLinecap='round'
            strokeLinejoin='round'/>
        </svg>
        back
      </a>
      <div className='token-info'>
        { (!collectionInfo || (account && (!kusamaAvailableBalance || !balance))) && (
          <Loader
            active
            className='load-info'
            inline='centered'
          />
        )}
        <div className='token-info--row'>
          <div className='token-info--row--image'>
            { collectionInfo && (
              <Image
                className='token-image-big'
                src={tokenUrl}
              />
            )}
          </div>
          <div className='token-info--row--attributes'>
            <Header as='h3'>
              {collectionInfo && <span>{hex2a(collectionInfo.TokenPrefix)}</span>} #{tokenId}
            </Header>
            { attributes && Object.values(attributes).length > 0 && (
              <div className='accessories'>
                Attributes:
                {Object.keys(attributes).map((attrKey) => {
                  if (!Array.isArray(attributes[attrKey])) {
                    return <p key={attrKey}>{attrKey}: {attributes[attrKey]}</p>;
                  }

                  return (
                    <p key={attrKey}>{attrKey}: {(attributes[attrKey] as string[]).join(', ')}</p>
                  );
                })}
              </div>
            )}
            { (tokenAsk && tokenAsk.price) && (
              <>
                <Header as={'h2'}>
                  {getMarketPrice(tokenAsk.price)} KSM
                </Header>
                <p>Fee: {formatKsmBalance(getFee(tokenAsk.price))} KSM, Price: {formatKsmBalance(tokenAsk.price)} KSM</p>
                {/* { (!uOwnIt && !transferStep && tokenAsk) && lowBalanceToBuy && (
                  <div className='warning-block'>Your balance is too low to pay fees. <a href='https://t.me/unique2faucetbot'
                    rel='noreferrer nooperer'
                    target='_blank'>Get testUNQ here</a></div>
                )} */}
                { (!uOwnIt && !transferStep && tokenAsk) && lowKsmBalanceToBuy && (
                  <div className='warning-block'>Your balance is too low to buy</div>
                )}
              </>
            )}
            <div className='divider' />
            { (uOwnIt && !uSellIt) && (
              <Header as='h4'>You own it!</Header>
            )}
            { uSellIt && (
              <Header as='h4'>You`re selling it!</Header>
            )}
            { isOwnerEscrow && (
              <Header as='h5'>The owner is Escrow</Header>
            )}

            { (!uOwnIt && tokenInfo && tokenInfo.Owner && tokenInfo.Owner.toString() !== escrowAddress && !tokenAsk?.owner) && (
              <Header as='h5'>The owner is {tokenInfo?.Owner?.toString()}</Header>
            )}

            { (!uOwnIt && tokenInfo && tokenInfo.Owner && tokenInfo.Owner.toString() === escrowAddress && tokenAsk?.owner) && (
              <Header as='h5'>The owner is {tokenAsk?.owner.toString()}</Header>
            )}
            <div className='buttons'>
              { (uOwnIt && !uSellIt) && (
                <Button
                  content='Transfer'
                  onClick={setShowTransferForm.bind(null, !showTransferForm)}
                />
              )}
              {(!account && tokenAsk) && (

                <div>
                  <Button
                    content='Buy it'
                    disabled
                    title='ass'
                  />
                  <p className='text-with-button'>Сonnect your wallet to make transactions</p>

                </div>
              )}
              {showMarketActions && (
                <>
                  { (!uOwnIt && !transferStep && tokenAsk && kusamaFees) && (
                    <>
                      <div className='warning-block'>A small Kusama Network transaction fee up to {formatKsmBalance(kusamaFees.muln(2))} KSM will be
                        applied to the transaction</div>
                      <Button
                        content={`Buy it - ${formatKsmBalance(tokenAsk.price.add(getFee(tokenAsk.price)).add(kusamaFees.muln(2)))} KSM`}
                        disabled={ lowKsmBalanceToBuy}
                        onClick={sendCurrentUserAction.bind(null, 'BUY')}
                      />
                    </>
                  )}

                  { (uOwnIt && !uSellIt) && (
                    <Button
                      content='Sell'
                      onClick={sendCurrentUserAction.bind(null, 'SELL')}
                    />
                  )}
                  { (uSellIt && !transferStep) && (
                    <Button
                      content={
                        <>
                          Delist
                          { cancelStep && (
                            <Loader
                              active
                              inline='centered'
                            />
                          )}
                        </>
                      }
                      onClick={sendCurrentUserAction.bind(null, 'CANCEL')}
                    />
                  )}
                </>
              )}
            </div>

            { (showTransferForm && collectionInfo) && (
              <TransferModal
                account={account}
                closeModal={setShowTransferForm.bind(null, false)}
                collection={collectionInfo}
                reFungibleBalance={reFungibleBalance}
                tokenId={tokenId}
                updateTokens={onTransferSuccess}
              />
            )}
            { !!(transferStep && transferStep <= 3) && (
              <SaleSteps step={transferStep} />
            )}
            { !!(transferStep && transferStep >= 4) && (
              <BuySteps step={transferStep - 3} />
            )}

          </div>
        </div>
      </div>
      { readyToAskPrice && (
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

export default React.memo(NftDetails);
