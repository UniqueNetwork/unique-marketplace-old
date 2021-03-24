// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import BN from 'bn.js';
import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { Input, InputBalance, TxButton } from '@polkadot/react-components';
import { useApi, useBalance, useDecoder, useMarketplaceStages, useSchema } from '@polkadot/react-hooks';
import { TypeRegistry } from '@polkadot/types';
import { formatBalance } from '@polkadot/util';

import arrowLeft from './arrowLeft.svg';
import BuySteps from './BuySteps';
import SaleSteps from './SaleSteps';

interface NftDetailsProps {
  account: string;
  localRegistry?: TypeRegistry;
  setShouldUpdateTokens?: (collectionId: string) => void;
}

function NftDetails ({ account, localRegistry, setShouldUpdateTokens }: NftDetailsProps): React.ReactElement<NftDetailsProps> {
  const { api } = useApi();
  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '';
  const collectionId = query.get('collectionId') || '';
  const [recipient, setRecipient] = useState<string | null>(null);
  const [tokenPart, setTokenPart] = useState<number>(0);
  const [readyToWithdraw, setReadyToWithdraw] = useState<boolean>(false);
  const [showTransferForm, setShowTransferForm] = useState<boolean>(false);
  const [isAddressError, setIsAddressError] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const { balance } = useBalance(account);
  const { collectionName16Decoder } = useDecoder();
  const { attributes, collectionInfo, reFungibleBalance, tokenUrl } = useSchema(account, collectionId, tokenId, localRegistry);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<string>('');
  const { cancelStep, deposited, formatKsmBalance, kusamaBalance, readyToAskPrice, saleFee, sendCurrentUserAction, setPrice, setWithdrawAmount, tokenAsk, tokenInfo, transferStep, withdrawAmount } = useMarketplaceStages(account, collectionInfo, tokenId);

  const uOwnIt = tokenInfo?.Owner?.toString() === account || (tokenAsk && tokenAsk.owner === account);
  const uSellIt = tokenAsk && tokenAsk.owner === account;
  const decimalPoints = collectionInfo?.DecimalPoints instanceof BN ? collectionInfo?.DecimalPoints.toNumber() : 1;

  const setTokenPartToTransfer = useCallback((value) => {
    const numberValue = parseFloat(value);

    if (!numberValue) {
      console.log('token part error');
    }

    if (numberValue > reFungibleBalance || numberValue > 1 || numberValue < (1 / Math.pow(10, decimalPoints))) {
      setIsError(true);
    } else {
      setIsError(false);
    }

    setTokenPart(parseFloat(value));
  }, [decimalPoints, reFungibleBalance]);

  const goBack = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    history.back();
  }, []);

  const setRecipientAddress = useCallback((value: string) => {
    // setRecipient
    if (!value) {
      setIsAddressError(true);
    }

    if (value.length !== '5D73wtH5pqN99auP4b6KQRQAbketaSj4StkBJxACPBUAUdiq'.length) {
      setIsAddressError(true);
    }

    setRecipient(value);
  }, [setIsAddressError, setRecipient]);

  const onSavePrice = useCallback(() => {
    /* if (tokenPriceForSale && ((tokenPriceForSale < 0.01) || (tokenPriceForSale > 10000)))`
      Sorry, price should be in the range between 0.01 and 10000 KSM. You have input: ${price}
    `; */
    setPrice(tokenPriceForSale);
  }, [setPrice, tokenPriceForSale]);

  const onTransferSuccess = useCallback(() => {
    sendCurrentUserAction('UPDATE_TOKEN_STATE');
    setShouldUpdateTokens && setShouldUpdateTokens(collectionId);
  }, [collectionId, sendCurrentUserAction, setShouldUpdateTokens]);

  const onConfirmWithdraw = useCallback(() => {
    sendCurrentUserAction('REVERT_UNUSED_MONEY');
    setReadyToWithdraw(false);
  }, [sendCurrentUserAction]);

  console.log('attributes', attributes, 'attributes name', attributes?.NameStr);

  return (
    <div className='toke-details'>
      <Header as='h1'>
        { attributes && attributes.NameStr && (
          <span>
            {attributes.NameStr} - {tokenId}
          </span>
        )}
        { (!attributes || !attributes.NameStr) && (
          <span>
            {tokenId}
          </span>
        )}
      </Header>
      <a
        className='go-back'
        href='/'
        onClick={goBack}
      >
        <Image
          className='go-back'
          src={arrowLeft}
        />
        back
      </a>
      <Grid className='token-info'>
        <Grid.Row>
          <Grid.Column width={8}>
            { collectionInfo && (
              <Image
                className='token-image'
                src={tokenUrl}
              />
            )}
          </Grid.Column>
          <Grid.Column width={8}>
            <Header as='h3'>{collectionInfo && <span>{collectionName16Decoder(collectionInfo.Name)}</span>} #{tokenId}</Header>
            { attributes && Object.values(attributes).length > 0 && (
              <div className='accessories'>
                <p>Accessories:</p>
                {Object.keys(attributes).map((attrKey) => (<span key={attrKey}>{attrKey}: {attributes[attrKey]}</span>))}
              </div>
            )}
            { (tokenAsk && tokenAsk.price) && (
              <>
                <Header as={'h2'}>
                  {formatBalance(tokenAsk.price.add(tokenAsk.price.muln(0.02)), { decimals: 12, withSi: false })} KSM
                </Header>
                <p>Fee: {formatKsmBalance(tokenAsk.price.muln(0.02))} KSM, Price: {formatBalance(tokenAsk.price, { decimals: 12, withSi: false })} KSM</p>
                <p>Your KSM Balance: {formatBalance(kusamaBalance?.free || new BN(0), { decimals: 12, withSi: false })} KSM</p>
                { deposited && (
                  <p>Your KSM Deposit: {formatBalance(deposited, { decimals: 12, withSi: false })} KSM</p>
                )}
                { (saleFee && !balance?.free.add(deposited || new BN(0)).gte(saleFee)) && (
                  <p className='text-warning'>Your balance is too low to pay fees</p>
                )}
              </>
            )}
            <div className='divider' />
            { (uOwnIt && !uSellIt) && (
              <Header as='h4'>You own it!</Header>
            )}
            { uSellIt && (
              <Header as='h4'>You selling it!</Header>
            )}
            { !!(!uOwnIt && tokenInfo) && (
              <Header as='h5'>The owner is {tokenInfo?.Owner?.toString()}</Header>
            )}

            <div className='buttons'>
              { (!uOwnIt && !transferStep && tokenAsk) && (
                <Button
                  content='Buy it'
                  onClick={sendCurrentUserAction.bind(null, 'BUY')}
                />
              )}
              { (deposited && deposited.gtn(0)) && (
                <Button
                  content='Withdraw'
                  onClick={setReadyToWithdraw.bind(null, !readyToWithdraw)}
                />
              )}
              { (uOwnIt && !uSellIt) && (
                <Button
                  content='Sale it'
                  onClick={sendCurrentUserAction.bind(null, 'SELL')}
                />
              )}
              { (uOwnIt && !uSellIt) && (
                <Button
                  content='Transfer'
                  onClick={setShowTransferForm.bind(null, !showTransferForm)}
                />
              )}
              { (uSellIt && !transferStep) && (
                <Button
                  content='Cancel sell'
                  onClick={sendCurrentUserAction.bind(null, 'CANCEL')}
                />
              )}
            </div>

            { showTransferForm && (
              <Form className='transfer-form'>
                <Form.Field>
                  <Input
                    className='isSmall'
                    isError={isAddressError}
                    label='Please enter an address you want to transfer'
                    onChange={setRecipientAddress}
                    placeholder='Recipient address'
                  />
                </Form.Field>
                { Object.prototype.hasOwnProperty.call(collectionInfo?.Mode, 'reFungible') && (
                  <Form.Field>
                    <Input
                      className='isSmall'
                      isError={isError}
                      label={`Please enter part of token you want to transfer, your token balance is: ${reFungibleBalance}`}
                      min={1 / (decimalPoints * 10)}
                      onChange={setTokenPartToTransfer}
                      placeholder='Part of re-fungible address'
                      type='number'
                    />
                  </Form.Field>
                )}
                <Form.Field>
                  <TxButton
                    accountId={account}
                    isDisabled={!recipient || isError}
                    label='Submit'
                    onStart={setShowTransferForm.bind(null, false)}
                    onSuccess={onTransferSuccess}
                    params={[recipient, collectionId, tokenId, (tokenPart * Math.pow(10, decimalPoints))]}
                    tx={api.tx.nft.transfer}
                  />
                </Form.Field>
              </Form>
            )}
            { cancelStep && (
              <Loader
                active
                className='token-loader'
                inline='centered'
              >
                Cancel sale...
              </Loader>
            )}
            { !!(transferStep && transferStep <= 3) && (
              <SaleSteps step={transferStep} />
            )}
            { !!(transferStep && transferStep >= 4) && (
              <BuySteps step={transferStep} />
            )}
            { readyToWithdraw && (
              <Form className='transfer-form'>
                <Form.Field>
                  <InputBalance
                    autoFocus
                    className='isSmall'
                    defaultValue={withdrawAmount}
                    help={'Type the amount you want to withdraw.'}
                    isError={!deposited || (withdrawAmount && withdrawAmount.gt(deposited))}
                    isZeroable
                    label={'amount'}
                    maxValue={deposited}
                    onChange={setWithdrawAmount}
                    value={withdrawAmount}
                  />
                </Form.Field>
                <Form.Field>
                  <Button
                    content={`Withdraw max ${formatBalance(deposited)}`}
                    onClick={deposited ? setWithdrawAmount.bind(null, deposited) : () => null}
                  />
                  <Button
                    content='confirm withdraw'
                    disabled={!deposited || (withdrawAmount && withdrawAmount.gt(deposited))}
                    onClick={onConfirmWithdraw}
                  />
                </Form.Field>
              </Form>
            )}
            { readyToAskPrice && (
              <Form className='transfer-form'>
                <Form.Field>
                  <InputBalance
                    autoFocus
                    className='isSmall'
                    help={<span>Set nft token price</span>}
                    label={'amount'}
                    onChange={setTokenPriceForSale}
                    value={tokenPriceForSale}
                  />
                </Form.Field>
                <Form.Field>
                  <Button
                    content='Set price'
                    onClick={onSavePrice}
                  />
                </Form.Field>
              </Form>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}

export default React.memo(NftDetails);
