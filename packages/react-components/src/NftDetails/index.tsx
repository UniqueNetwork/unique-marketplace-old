// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import BN from 'bn.js';
import React, {useCallback, useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
// import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import envConfig from '@polkadot/apps-config/envConfig';
import {TransferModal} from '@polkadot/react-components';
import formatPrice from '@polkadot/react-components/util/formatPrice';
import {useBalance, useDecoder, useMarketplaceStages, useSchema} from '@polkadot/react-hooks';

import BuySteps from './BuySteps';
import SaleSteps from './SaleSteps';
import SetPriceModal from './SetPriceModal';
import {onRamp} from '@polkadot/apps/util/ramp';
// import { Grid } from 'semantic-ui-react';

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

  const requireMoreKSM = (!uOwnIt && !transferStep && tokenAsk) && lowKsmBalanceToBuy;

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
                strokeLinejoin='round'
          />
          <path d='M7 3.5L2.5 8L7 12.5'
                stroke='var(--card-link-color)'
                strokeLinecap='round'
                strokeLinejoin='round'
          />
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
            <Header as='h3' className={'token-header'}>
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
                { requireMoreKSM && (
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
              {requireMoreKSM &&  <Button
                content='Add KSM to wallet'
                onClick={() => onRamp(account)}
              />}
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
                  { (!uOwnIt && !transferStep && tokenAsk && kusamaFees && !requireMoreKSM) && (
                    <>
                      <div className='warning-block'>A small Kusama Network transaction fee up to {formatKsmBalance(kusamaFees.muln(2))} KSM will be
                        applied to the transaction</div>
                      <Button
                        content={`Buy it - ${formatKsmBalance(tokenAsk.price.add(getFee(tokenAsk.price)).add(kusamaFees.muln(2)))} KSM`}
                        disabled={lowKsmBalanceToBuy}
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

                  <p className='terms-conditions'>
                    Please read our <a href='/assets/Artpool_Terms_and_Conditions.pdf' target='_blank'>Terms and Conditions</a> before purchasing NFTs, in making the purchase you are agreeing to them.
                  </p>
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

      {/* TODO: SET THIS DINAMIC FOR THE ARTISTS

      <div className='token-info-artist'>
        <Grid>
          <Grid.Row className='token-info-artist-row'>
            <Grid.Column width={16}>
              <p>These photographs are the very first NFTs released by the Norwegian artist Fredrik Tjaerandsen who is an artist with a fashion design background, making clothing an artform in its own right.</p>
              <p>These images depict dynamic, performative latex garments during a rehearsal for the 2020 Fashion in Motion show at the Victoria & Albert Museum in London.</p>
              <p>A silhouette, a sphere of color, inhabited, brings us to another level of consciousness: offering viewers the opportunity to immerse themselves in a color-filtered, protected world.</p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>

      <div className='token-info-artist'>
        <Grid>
          <Grid.Row className='token-info-artist-row'>
            <Grid.Column width={4}>
              <a target='blank' href='https://www.artcuratorgrid.com/users/fredrik-tjaerandsen/posts'>
                <div className='artist-profile'>
                  <div className='avatar'>
                    <img alt='Fredrik Tjaerandsen' src='https://drbfkoztg80ia.cloudfront.net/607ac251c65b900004df4162/1618658073104-md.jpg' />
                  </div>
                  <div>
                    <h3 className='artist-name'>Fredrik Tjaerandsen</h3>
                    <p className='artist-location'>London, UK</p>
                  </div>
                </div>
              </a>
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={11}>
              <div className='artist-biography'>
                <h3 className='bio-header'>Biography</h3>
                <div className='bio-text'>
                  <p>
                    Fredrik Tjærandsen is a Norwegian artist and designer based in London. His upbringing in rural Norway is a source of inspiration for his work, and his fascination with where identity originates is incredibly important to his work. Trained in visual art and fashion, his process is artistic, intuitive, and emotional: he is drawn to working with visuals that captivate his emotions or feelings in that moment.
                  </p>
                  <br />
                  <p>
                    Tjærandsen’s practice focuses on performance, motion and the body in relation to the space around it.
                  </p>
                  <br />
                  <p>
                    “My work explores connection and transitions of the mind. I’m fascinated with where identity originates. Previously in my work I explore wearable spheres which centred on examining early childhood memories. I wanted to explore the questions of how I become the person I am today. To do that, I played with the idea of transitional processes, which relate to the different way we perceive things. The spere itself serves a metaphor. When you’re inside it you feel as if you are in your own space, just like you are in your own mind, but when you are looking at it from the outside, your perspective is entirely different. I think of it as a visualisation of how we understand the world around us. How, if we transcend the border of our bubbles, we ultimately reach these moments of clarity in the here and now. “
                  </p>
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
      */}
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
