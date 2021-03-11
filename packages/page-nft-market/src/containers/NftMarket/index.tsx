// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { OfferType } from '@polkadot/react-hooks/useCollections';

// external imports
import React, { memo, ReactElement, useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import { AccountSelector, FormatBalance, Input, NftDetailsModal } from '@polkadot/react-components';
import { useBalance, useCollections } from '@polkadot/react-hooks';

// local imports and components
import NftTokenCard from '../../components/NftTokenCard';

const BuyTokens = (): ReactElement => {
  const history = useHistory();
  const [account, setAccount] = useState<string | null>(null);
  const [shouldUpdateTokens, setShouldUpdateTokens] = useState<string | undefined>('all');
  const { getOffers, offers } = useCollections();
  const [searchString, setSearchString] = useState<string>('');
  const [filteredOffers, setFilteredOffers] = useState<OfferType[]>([]);
  const { balance } = useBalance(account);

  const openDetailedInformationModal = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/market/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  useEffect(() => {
    setFilteredOffers(offers && offers.length ? offers.filter((item: OfferType) => item.collectionId.toLowerCase().includes(searchString.toLowerCase()) || item.tokenId.toLowerCase().includes(searchString.toLowerCase())) : []);
  }, [offers, searchString]);

  useEffect(() => {
    if (shouldUpdateTokens) {
      void getOffers();
      setShouldUpdateTokens(undefined);
    }
  }, [getOffers, shouldUpdateTokens]);

  return (
    <div className='nft-market'>
      <Header as='h2'>Nft Tokens</Header>
      <Grid className='account-selector'>
        <Grid.Row>
          <Grid.Column width={12}>
            <AccountSelector onChange={setAccount} />
          </Grid.Column>
          <Grid.Column width={4}>
            { balance && (
              <div className='balance-block'>
                <label>Your account balance is:</label>
                <FormatBalance
                  className='balance'
                  value={balance.free}
                />
              </div>
            )}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Input
              className='isSmall'
              help={<span>Find and select your token collection.</span>}
              isDisabled={!offers || !offers.length}
              label={'Find token by name or collection'}
              onChange={setSearchString}
              placeholder='Search...'
              value={searchString}
              withLabel
            />
          </Grid.Column>
        </Grid.Row>
        { (account && filteredOffers.length > 0) && (
          <Grid.Row>
            <Grid.Column width={16}>
              <div className='market-pallet'>
                <div className='nft-tokens'>
                  { filteredOffers.map((token) => (
                    <NftTokenCard
                      account={account}
                      collectionId={token.collectionId}
                      key={token.tokenId}
                      openDetailedInformationModal={openDetailedInformationModal}
                      token={token}
                    />
                  )) }
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
      { account && (
        <Switch>
          <Route
            key='TokenDetailsModal'
            path='*/token-details'
          >
            <NftDetailsModal
              account={account}
              setShouldUpdateTokens={setShouldUpdateTokens}
            />
          </Route>
        </Switch>
      )}
    </div>
  );
};

export default memo(BuyTokens);
