// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import BN from 'bn.js';
import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { Button, Input, InputBalance, TxButton } from '@polkadot/react-components';
import { useApi, useBalance, useMarketplaceStages, useSchema } from '@polkadot/react-hooks';
import { TypeRegistry } from '@polkadot/types';
import { formatBalance } from '@polkadot/util';

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
  const { attributes, collectionInfo, reFungibleBalance, tokenUrl } = useSchema(account, collectionId, tokenId, localRegistry);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<string>('');
  const { cancelStep, deposited, readyToAskPrice, saleFee, sendCurrentUserAction, setPrice, setWithdrawAmount, tokenAsk, tokenInfo, transferStep, withdrawAmount } = useMarketplaceStages(account, collectionInfo, tokenId);

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

  const goBack = useCallback(() => {
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

  return (
    <div className='toke-details'>
      { collectionInfo && (
        <div className='token-image'>
          <img
            alt='token-image'
            src={tokenUrl}
          />
        </div>
      )}
      <a onClick={goBack} />
      <div className='token-info'>
        <Header as='h3'>{collectionId} #{tokenId}</Header>
        { attributes && Object.values(attributes).length > 0 && (
          <>
            <strong>Attributes:</strong>
            {Object.keys(attributes).map((attrKey) => (<p key={attrKey}>{attrKey}: {attributes[attrKey]}</p>))}
          </>
        )}
        { (uOwnIt && !uSellIt) && (
          <Header as='h4'>You own it! (address: {account})</Header>
        )}
        { uSellIt && (
          <Header as='h4'>You selling it! (price: {formatBalance(tokenAsk?.price)})</Header>
        )}
        { !!(!uOwnIt && tokenInfo) && (
          <Header as='h4'>The owner is {tokenInfo?.Owner?.toString()}</Header>
        )}
        { deposited && (
          <p>Your deposit is: <strong>{formatBalance(deposited)}</strong></p>
        )}
        { (!uOwnIt && !transferStep && tokenAsk) && (
          <>
            <p>Price <strong>{formatBalance(tokenAsk.price)}</strong> with commission (2%) <strong>{formatBalance(tokenAsk.price.muln(0.02))}</strong></p>
            <p>Total: <strong>{formatBalance(tokenAsk.price.add(tokenAsk.price.muln(0.02)))}</strong></p>
            <Button
              icon='shopping-cart'
              label='Buy it'
              onClick={sendCurrentUserAction.bind(null, 'BUY')}
            />
          </>
        )}
        { (deposited && deposited.gtn(0)) && (
          <Button
            icon='history'
            label='Withdraw'
            onClick={setReadyToWithdraw.bind(null, !readyToWithdraw)}
          />
        )}
        { (uOwnIt && !uSellIt) && (
          <Button
            icon='dollar-sign'
            label='Sale it'
            onClick={sendCurrentUserAction.bind(null, 'SELL')}
          />
        )}
        { (uOwnIt && !uSellIt) && (
          <Button
            icon='paper-plane'
            label='Transfer'
            onClick={setShowTransferForm.bind(null, !showTransferForm)}
          />
        )}
        { (uSellIt && !transferStep) && (
          <Button
            icon='window-close'
            label='Cancel sell'
            onClick={sendCurrentUserAction.bind(null, 'CANCEL')}
          />
        )}
      </div>
      { (saleFee && !balance?.free.gte(saleFee)) && (
        <span className='text-warning'>Your balance is too low to pay fees</span>
      )}
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
          { collectionInfo?.Mode.isReFungible && (
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
          className='modal-loader'
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
              icon='history'
              label={`Withdraw max ${formatBalance(deposited)}`}
              onClick={deposited ? setWithdrawAmount.bind(null, deposited) : () => null}
            />
            <Button
              icon='save'
              isDisabled={!deposited || (withdrawAmount && withdrawAmount.gt(deposited))}
              label='confirm withdraw'
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
              icon='save'
              label='Set price'
              onClick={onSavePrice}
            />
          </Form.Field>
        </Form>
      )}
    </div>
  );
}

export default React.memo(NftDetails);
