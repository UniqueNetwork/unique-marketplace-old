// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React, { memo, ReactElement, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';

// local imports and components
import NftTokenCard from '@polkadot/app-nft-market/components/NftTokenCard';
import { useCollections } from '@polkadot/react-hooks';
import { TypeRegistry } from '@polkadot/types';

interface BuyTokensProps {
  account?: string;
  localRegistry?: TypeRegistry;
  setShouldUpdateTokens: (value?: string) => void;
  shouldUpdateTokens?: string;
}

const TokensForSale = ({ account, localRegistry, setShouldUpdateTokens, shouldUpdateTokens }: BuyTokensProps): ReactElement => {
  const history = useHistory();
  const { getOffers, offers, presetMintTokenCollection } = useCollections();

  const openDetailedInformationModal = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/market/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  useEffect(() => {
    if (shouldUpdateTokens) {
      void getOffers();
      setShouldUpdateTokens(undefined);
    }
  }, [getOffers, shouldUpdateTokens, setShouldUpdateTokens]);

  useEffect(() => {
    void presetMintTokenCollection();
  }, [presetMintTokenCollection]);

  return (
    <div className='nft-market'>
      <Grid>
        {(account && offers && offers.length > 0) && (
          <Grid.Row>
            <Grid.Column width={16}>
              <div className='market-pallet'>
                <div className='market-pallet__item'>
                  {offers.map((token) => (
                    <NftTokenCard
                      account={account}
                      collectionId={token.collectionId.toString()}
                      key={token.tokenId}
                      localRegistry={localRegistry}
                      openDetailedInformationModal={openDetailedInformationModal}
                      token={token}
                    />
                  ))}
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    </div>
  );
};

export default memo(TokensForSale);
