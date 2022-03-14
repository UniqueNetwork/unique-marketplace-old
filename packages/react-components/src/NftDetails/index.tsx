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
import { TransferModal, WarningText } from '@polkadot/react-components';
import formatPrice from '@polkadot/react-components/util/formatPrice';
import { useBalance, useDecoder, useMarketplaceStages, useSchema } from '@polkadot/react-hooks';
import { subToEth } from '@polkadot/react-hooks/utils';

import BuySteps from './BuySteps';
import SaleSteps from './SaleSteps';
import SetPriceModal from './SetPriceModal';

interface NftDetailsProps {
  account: string;
}

function NftDetails ({ account }: NftDetailsProps): React.ReactElement<NftDetailsProps> {
  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '';
  const collectionId = query.get('collectionId') || '';
  const [showTransferForm, setShowTransferForm] = useState<boolean>(false);
  const [ethAccount, setEthAccount] = useState<string>();
  const [isInWhiteList, setIsInWhiteList] = useState<boolean>(false);
  const [lowKsmBalanceToBuy, setLowKsmBalanceToBuy] = useState<boolean>(false);
  const [kusamaFees, setKusamaFees] = useState<BN | null>(null);
  const [whiteListAmount, setWhiteListAmount] = useState<BN | null>(null);
  const { balance, kusamaExistentialDeposit } = useBalance(account);
  const { hex2a } = useDecoder();
  const { attributes, collectionInfo, tokenUrl } = useSchema(account, collectionId, tokenId);
  const [tokenPriceForSale, setTokenPriceForSale] = useState<string>('');
  const { cancelStep, checkWhiteList, deposited, formatKsmBalance, getKusamaTransferFee, getRevertedFee, kusamaAvailableBalance, readyToAskPrice, sendCurrentUserAction, setPrice, setReadyToAskPrice, tokenAsk, tokenInfo, transferStep } = useMarketplaceStages(account, ethAccount, collectionInfo, tokenId);
  const { contractAddress, escrowAddress, kusamaDecimals } = envConfig;

  const uSellIt = ethAccount && tokenAsk && tokenAsk?.ownerAddr.toLowerCase() === ethAccount && tokenAsk.flagActive === '1';
  const uOwnIt = account && (tokenInfo?.owner?.Substrate === account || tokenInfo?.owner?.Ethereum?.toLowerCase() === ethAccount || uSellIt);

  const tokenPrice = (tokenAsk?.flagActive === '1' && tokenAsk?.price && tokenAsk?.price.gtn(0)) ? tokenAsk.price : 0;
  const isOwnerContract = !uOwnIt && tokenInfo?.owner?.Ethereum?.toLowerCase() === contractAddress;
  const canShowOwner = ((account || (!account && !tokenPrice)) && (!uOwnIt && !isOwnerContract && tokenInfo?.owner && tokenAsk?.flagActive !== '1'));
  const canShowLoading = (!collectionInfo || (account && (!kusamaAvailableBalance || !balance)));
  const disableSellButton = !!(!isInWhiteList && whiteListAmount && !kusamaAvailableBalance?.gte(whiteListAmount));

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

  const whiteListFeeCheck = useCallback(async () => {
    if (escrowAddress && kusamaExistentialDeposit) {
      const transferMinDepositFee: BN | null = await getKusamaTransferFee(escrowAddress, kusamaExistentialDeposit);

      if (transferMinDepositFee) {
        setWhiteListAmount(transferMinDepositFee.add(kusamaExistentialDeposit));
      }
    }
  }, [escrowAddress, getKusamaTransferFee, kusamaExistentialDeposit]);

  const ksmFeesCheck = useCallback(async () => {
    if (tokenAsk?.price && escrowAddress) {
      const kusamaFees: BN | null = await getKusamaTransferFee(escrowAddress, tokenAsk.price);

      if (kusamaFees) {
        setKusamaFees(kusamaFees);
        const balanceNeeded = tokenAsk.price.add(kusamaFees);
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

  const onSell = useCallback(() => {
    sendCurrentUserAction('SELL');
  }, [sendCurrentUserAction]);

  const closeTransferModal = useCallback(() => {
    setShowTransferForm(false);
  }, []);

  const checkIsInWhiteList = useCallback(async () => {
    if (ethAccount) {
      // check white list
      const result = await checkWhiteList(ethAccount);

      setIsInWhiteList(result);
    }
  }, [checkWhiteList, ethAccount]);

  useEffect(() => {
    void whiteListFeeCheck();
  }, [whiteListFeeCheck]);

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
            { collectionInfo && (
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
            { attributes && Object.values(attributes).length > 0 && (
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
            { !!tokenPrice && (
              <>
                <Header as={'h2'}>
                  {formatPrice(formatKsmBalance(tokenPrice))} KSM
                </Header>
                <p>Price: {getMarketPrice(tokenPrice)} KSM, Fee: {formatKsmBalance(getRevertedFee(tokenPrice))} KSM</p>
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
            { (canShowOwner && tokenInfo?.owner) && (
              <Header as='h5'>The owner is {tokenInfo?.owner.Substrate || tokenInfo?.owner.Ethereum || ''}</Header>
            )}
            <div className='buttons'>
              { (uOwnIt && !uSellIt) && (
                <Button
                  content='Transfer'
                  onClick={toggleTransferForm}
                />
              )}
              {!!(!account && tokenPrice) && (
                <div>
                  <Button
                    content='Buy it'
                    disabled
                    title='ass'
                  />
                  <p className='text-with-button'>Connect your wallet to make transactions</p>
                </div>
              )}
              <>
                { (!uOwnIt && !transferStep && !!tokenPrice && kusamaFees) && (
                  <>
                    <WarningText
                      className='info'
                      text={`A small Kusama Network transaction fee up to ${formatKsmBalance(kusamaFees)} KSM will be
                      applied to the transaction`}
                    />
                    <Button
                      content={`Buy it - ${formatKsmBalance(tokenPrice.add(kusamaFees))} KSM`}
                      disabled={lowKsmBalanceToBuy}
                      onClick={onBuy}
                    />
                  </>
                )}

                { (uOwnIt && !uSellIt) && (
                  <Button
                    content='Sell'
                    disabled={disableSellButton}
                    onClick={onSell}
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
                    onClick={onCancel}
                  />
                )}
              </>
            </div>

            { !!(uOwnIt && !uSellIt && !isInWhiteList && whiteListAmount) && (
              <>
                { kusamaAvailableBalance?.gte(whiteListAmount)
                  ? (
                    <WarningText
                      className='info'
                      text={`A fee of ~ ${formatKsmBalance(whiteListAmount)} KSM may be applied to the first sale transaction. Your address will be added to the transaction sponsoring whitelist allowing you to make future feeless transactions.`}
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

            { (showTransferForm && collectionInfo) && (
              <TransferModal
                account={account}
                closeModal={closeTransferModal}
                collection={collectionInfo}
                tokenId={tokenId}
                tokenOwner={tokenInfo?.owner}
                updateTokens={onTransferSuccess}
              />
            )}
            { !!(transferStep && transferStep <= 3) && (
              <SaleSteps step={transferStep} />
            )}
            { !!(transferStep && transferStep >= 4) && (
              <BuySteps step={transferStep - 3} />
            )}
            { canShowLoading && (
              <Loader
                active
                className='load-info'
                inline='centered'
              />
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
