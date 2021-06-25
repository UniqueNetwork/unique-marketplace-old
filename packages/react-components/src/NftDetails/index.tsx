// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import BN from 'bn.js';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import envConfig from '@polkadot/apps-config/envConfig';
import { Input, TransferModal } from '@polkadot/react-components';
import { useBalance, useDecoder, useMarketplaceStages, useSchema } from '@polkadot/react-hooks';

import BuySteps from './BuySteps';
import SaleSteps from './SaleSteps';
import SetPriceModal from './SetPriceModal';

const { kusamaDecimals, showMarketActions } = envConfig;

interface NftDetailsProps {
  account: string;
  setShouldUpdateTokens?: (collectionId: string) => void;
}

function NftDetails ({ account, setShouldUpdateTokens }: NftDetailsProps): React.ReactElement<NftDetailsProps> {
  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '';
  const collectionId = query.get('collectionId') || '';
  const [readyToWithdraw, setReadyToWithdraw] = useState<boolean>(false);
  const [showTransferForm, setShowTransferForm] = useState<boolean>(false);
  const { balance } = useBalance(account);
  const { hex2a } = useDecoder();
  const [isOwnerEscrow, setIsOwnerEscrow] = useState<boolean>(false);
  const { attributes, collectionInfo, reFungibleBalance, tokenUrl } = useSchema(account, collectionId, tokenId);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<string>('');
  const { buyFee, cancelStep, deposited, escrowAddress, formatKsmBalance, getFee, kusamaBalance, readyToAskPrice, sendCurrentUserAction, setPrice, setReadyToAskPrice, setWithdrawAmount, tokenAsk, tokenInfo, transferStep, withdrawAmount } = useMarketplaceStages(account, collectionInfo, tokenId);

  const uOwnIt = tokenInfo?.Owner?.toString() === account || (tokenAsk && tokenAsk.owner === account);
  const uSellIt = tokenAsk && tokenAsk.owner === account;
  const lowBalanceToBuy = !!(buyFee && !balance?.free.gte(buyFee));
  const lowKsmBalanceToBuy = tokenAsk?.price && kusamaBalance?.free.add(deposited || new BN(0)).lte(tokenAsk.price);
  // sponsoring is enabled
  // const lowBalanceToSell = !!(saleFee && !balance?.free.gte(saleFee));

  const goBack = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShouldUpdateTokens && setShouldUpdateTokens('all');
    history.back();
  }, [setShouldUpdateTokens]);

  const onSavePrice = useCallback(() => {
    if (tokenPriceForSale && ((parseFloat(tokenPriceForSale) < 0.01) || (parseFloat(tokenPriceForSale) > 100000))) {
      alert(`Sorry, price should be in the range between 0.01 and 100000 KSM. You have input: ${tokenPriceForSale}`);

      return;
    }

    setPrice((parseFloat(tokenPriceForSale) * Math.pow(10, kusamaDecimals)).toString());
  }, [setPrice, tokenPriceForSale]);

  const onTransferSuccess = useCallback(() => {
    setShowTransferForm(false);
    sendCurrentUserAction('UPDATE_TOKEN_STATE');
    setShouldUpdateTokens && setShouldUpdateTokens(collectionId);
  }, [collectionId, sendCurrentUserAction, setShouldUpdateTokens]);

  const onConfirmWithdraw = useCallback(() => {
    sendCurrentUserAction('REVERT_UNUSED_MONEY');
    setReadyToWithdraw(false);
  }, [sendCurrentUserAction]);

  const closeAskModal = useCallback(() => {
    setReadyToAskPrice(false);

    setTimeout(() => {
      sendCurrentUserAction('ASK_PRICE_FAIL');
    }, 1000);
  }, [setReadyToAskPrice, sendCurrentUserAction]);

  useEffect(() => {
    setTimeout(() => {
      setIsOwnerEscrow(!!(!uOwnIt && tokenInfo && tokenInfo.Owner && tokenInfo.Owner.toString() === escrowAddress && !tokenAsk?.owner));
    }, 3000);
  }, [escrowAddress, tokenAsk, tokenInfo, uOwnIt]);

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
      <Grid className='token-info'>
        { (!collectionInfo || (account && (!kusamaBalance || !balance))) && (
          <Loader
            active
            className='load-info'
            inline='centered'
          />
        )}
        <Grid.Row>
          <Grid.Column width={8}>
            { collectionInfo && (
              <Image
                className='token-image-big'
                src={tokenUrl}
              />
            )}
          </Grid.Column>
          <Grid.Column width={8}>
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
                  {formatKsmBalance(tokenAsk.price.add(getFee(tokenAsk.price)))} KSM
                </Header>
                <p>Fee: {formatKsmBalance(getFee(tokenAsk.price))} KSM, Price: {formatKsmBalance(tokenAsk.price)} KSM</p>
                { (!uOwnIt && !transferStep && tokenAsk) && lowBalanceToBuy && (
                  <div className='warning-block'>Your balance is too low to pay fees. <a href='https://t.me/unique2faucetbot'
                    rel='noreferrer nooperer'
                    target='_blank'>Get testUNQ here</a></div>
                )}
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
              { showMarketActions && (
                <>
                  { (!uOwnIt && !transferStep && tokenAsk) && (
                    <Button
                      content={`Buy it - ${formatKsmBalance(tokenAsk.price.add(getFee(tokenAsk.price)))} KSM`}
                      disabled={lowBalanceToBuy || lowKsmBalanceToBuy}
                      onClick={sendCurrentUserAction.bind(null, 'BUY')}
                    />
                  )}
                  { (parseFloat(formatKsmBalance(deposited)) > 0) && (
                    <Button
                      content='Withdraw ksm deposit'
                      onClick={setReadyToWithdraw.bind(null, !readyToWithdraw)}
                    />
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
            { readyToWithdraw && (
              <Form className='transfer-form'>
                <Form.Field>
                  <Input
                    autoFocus
                    className='isSmall'
                    defaultValue={(withdrawAmount || 0).toString()}
                    isError={!!(!deposited || (withdrawAmount && parseFloat(withdrawAmount) > parseFloat(formatKsmBalance(deposited))))}
                    label={'KSM'}
                    max={parseFloat(formatKsmBalance(deposited))}
                    onChange={setWithdrawAmount}
                    type='number'
                    value={withdrawAmount}
                  />
                </Form.Field>
                <Form.Field>
                  <div className='buttons'>
                    <Button
                      content={`Withdraw max ${formatKsmBalance(deposited)}`}
                      onClick={deposited ? setWithdrawAmount.bind(null, formatKsmBalance(deposited)) : () => null}
                    />
                    <Button
                      content='confirm withdraw'
                      disabled={!deposited || !parseFloat(withdrawAmount) || (parseFloat(withdrawAmount) > parseFloat(formatKsmBalance(deposited)))}
                      onClick={onConfirmWithdraw}
                    />
                  </div>
                </Form.Field>
              </Form>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
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
