// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React, { memo, ReactElement, useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useHistory } from 'react-router';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

// local imports and components
import NftTokenCard from '@polkadot/app-nft-market/components/NftTokenCard';
import { useCollections } from '@polkadot/react-hooks';
import { OfferType } from '@polkadot/react-hooks/useCollections';

interface BuyTokensProps {
  account?: string;
  setShouldUpdateTokens: (value?: string) => void;
  shouldUpdateTokens?: string;
}

const perPage = 20;

const TokensForSale = ({ account, setShouldUpdateTokens, shouldUpdateTokens }: BuyTokensProps): ReactElement => {
  const history = useHistory();
  const { getOffers, offers, offersCount } = useCollections();
  const [filteredOffers, setFilteredOffers] = useState<OfferType[]>([]);
  const hasMore = !!(offers && offersCount) && Object.keys(offers).length < offersCount;

  const openDetailedInformationModal = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/market/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const filterOffers = useCallback(() => {
    if (offers && account) {
      setFilteredOffers([...Object.values(offers).filter((item) => item.seller === account)]);
    }
  }, [account, offers]);

  const fetchData = useCallback((newPage: number) => {
    getOffers(newPage, perPage);
  }, [getOffers]);

  useEffect(() => {
    if (shouldUpdateTokens) {
      void getOffers(1, perPage);
      setShouldUpdateTokens(undefined);
    }
  }, [getOffers, shouldUpdateTokens, setShouldUpdateTokens]);

  useEffect(() => {
    filterOffers();
  }, [filterOffers]);

  useEffect(() => {
    setShouldUpdateTokens('all');
  }, [setShouldUpdateTokens]);

  return (
    <div className='nft-market'>
      <Grid>
        {(account && offers && Object.values(offers).length > 0) && (
          <Grid.Row>
            <Grid.Column width={16}>
              <div className='market-pallet'>
                <InfiniteScroll
                  hasMore={hasMore}
                  initialLoad={false}
                  loadMore={fetchData}
                  loader={<Loader
                    active
                    className='load-more'
                    inline='centered'
                    key={'tokens-for-sale'}
                  />}
                  pageStart={1}
                  threshold={200}
                  useWindow={true}
                >
                  <div className='market-pallet__item'>
                    {filteredOffers.map((token) => (
                      <NftTokenCard
                        account={account}
                        collectionId={token.collectionId.toString()}
                        key={`${token.collectionId}-${token.tokenId}`}
                        openDetailedInformationModal={openDetailedInformationModal}
                        token={token}
                      />
                    ))}
                  </div>
                </InfiniteScroll>
              </div>
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    </div>
  );
};

export default memo(TokensForSale);
