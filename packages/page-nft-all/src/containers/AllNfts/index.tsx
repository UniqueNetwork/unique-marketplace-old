// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { CollectionWithTokensCount, TokenInterface } from '@polkadot/react-hooks/useCollections';
import type { TokenDetailsInterface } from '@polkadot/react-hooks/useToken';

import React, { memo, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useHistory } from 'react-router';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import envConfig from '@polkadot/apps-config/envConfig';
import { useCollections, useToken } from '@polkadot/react-hooks';
import { AttributesDecoded } from '@polkadot/react-hooks/useSchema';

import SmallTokenCard from '../../components/SmallTokenCard';

const { uniqueCollectionIds } = envConfig;

interface BuyTokensProps {
  account?: string;
  setShouldUpdateTokens: (value?: string) => void;
  shouldUpdateTokens?: string;
}

interface TokensWithAttributesInterface {
  [collectionId: string]: {[tokenId: string]: AttributesDecoded}
}

const perPage = 20;

const AllNfts = ({ account, setShouldUpdateTokens }: BuyTokensProps): ReactElement => {
  const history = useHistory();
  const { getCollectionWithTokenCount } = useCollections();
  const { getTokenInfo } = useToken();
  const [searchString] = useState<string>('');
  const [collectionWithTokensCount, setCollectionWithTokensCount] = useState<CollectionWithTokensCount[]>([]);
  const [tokensLoading, setTokensLoading] = useState<boolean>(false);
  const [allTokens, setAllTokens] = useState<{ [key: string]: TokenInterface}>({});
  const [tokensWithAttributes, setTokensWithAttributes] = useState<TokensWithAttributesInterface>({});
  // const [collectionSearchString, setCollectionSearchString] = useState<string>('');
  const [filteredTokens, setFilteredTokens] = useState<TokenInterface[]>([]);
  const allTokensCount = collectionWithTokensCount.reduce((accumulator: number, currentValue: CollectionWithTokensCount) => accumulator + currentValue.tokenCount, 0) || 0;
  const hasMore = collectionWithTokensCount && Object.values(allTokens).length < allTokensCount;
  const cleanup = useRef<boolean>(false);

  const openDetailedInformationModal = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/all-tokens/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const onSetTokenAttributes = useCallback((collectionId: string, tokenId: string, attributes: AttributesDecoded) => {
    if (cleanup.current) {
      return;
    }

    setTokensWithAttributes((prevTokens: TokensWithAttributesInterface) => {
      const newTokens = { ...prevTokens };

      if (newTokens[collectionId]) {
        newTokens[collectionId][tokenId] = attributes;
      } else {
        newTokens[collectionId] = { [tokenId]: attributes };
      }

      return newTokens;
    });
  }, []);

  const fillTokensTable = useCallback(async (indexFrom: number, indexTo: number) => {
    const allTokensTable = { ...allTokens };

    for (let i = 0; i < collectionWithTokensCount.length; i++) {
      if (collectionWithTokensCount && collectionWithTokensCount[i].tokenCount > 0) {
        setTokensLoading(true);

        for (let i = indexFrom; i <= indexTo; i++) {
          const tokenInfo: TokenDetailsInterface = await getTokenInfo(collectionWithTokensCount[i].info, i.toString());

          if (cleanup.current) {
            return;
          }

          if (tokenInfo && Object.values(tokenInfo).length) {
            allTokensTable[`${collectionWithTokensCount[i].info.id}-${i}`] = {
              ...tokenInfo,
              collectionId: collectionWithTokensCount[i].info.id,
              id: i.toString()
            };
          }
        }
      }
    }

    setTokensLoading(false);
    setAllTokens(allTokensTable);
  }, [allTokens, collectionWithTokensCount, getTokenInfo]);

  const presetTokensTable = useCallback(async () => {
    const allCollectionsWithTokensCount: CollectionWithTokensCount[] = [];

    for (let i = 0; i < uniqueCollectionIds.length; i++) {
      const collectionInfoWithTokensCount: CollectionWithTokensCount = await getCollectionWithTokenCount(uniqueCollectionIds[i]);

      console.log('collectionInfoWithTokensCount', collectionInfoWithTokensCount);

      allCollectionsWithTokensCount.push(collectionInfoWithTokensCount);
    }

    if (cleanup.current) {
      return;
    }

    setCollectionWithTokensCount(allCollectionsWithTokensCount);
  }, [getCollectionWithTokenCount]);

  const fetchData = useCallback((newPage: number) => {
    void fillTokensTable((newPage - 1) * perPage, newPage * perPage);
  }, [fillTokensTable]);

  useEffect(() => {
    if (allTokens) {
      if (searchString && searchString.length) {
        const filtered = Object.values(allTokens).filter((item: TokenInterface) => {
          if (tokensWithAttributes[item.collectionId] && tokensWithAttributes[item.collectionId][item.id]) {
            const tokenItemAttrs = tokensWithAttributes[item.collectionId][item.id];

            return tokenItemAttrs.NameStr && (tokenItemAttrs.NameStr as string).toLowerCase().includes(searchString.toLowerCase());
          }

          return false;
        });

        setFilteredTokens(filtered);
      } else {
        setFilteredTokens(Object.values(allTokens));
      }
    }
  }, [allTokens, tokensWithAttributes, searchString]);

  useEffect(() => {
    setShouldUpdateTokens('all');
  }, [setShouldUpdateTokens]);

  useEffect(() => {
    void presetTokensTable();
  }, [presetTokensTable]);

  useEffect(() => {
    if (collectionWithTokensCount) {
      void fillTokensTable(1, perPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionWithTokensCount]);

  useEffect(() => {
    return () => {
      cleanup.current = true;
    };
  }, []);

  console.log('allTokensCount', allTokensCount);

  return (
    <div className='all-tokens'>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
          </Grid.Column>
        </Grid.Row>
        {/* <Grid.Row>
          <Grid.Column width={16}>
            <Input
              className='isSmall search'
              help={<span>Find and select token.</span>}
              isDisabled={!Object.values(allTokens).length}
              label={'Find token by name or collection'}
              onChange={setSearchString}
              placeholder='Search...'
              value={searchString}
              withLabel
            />
          </Grid.Column>
        </Grid.Row> */}
        { (!account || tokensLoading) && (
          <Loader
            active
            inline='centered'
          />
        )}
        { allTokensCount === 0 && (
          <Header as='h4'>No tokens found</Header>
        )}
        {(account && filteredTokens.length > 0) && (
          <Grid.Row>
            <Grid.Column width={16}>
              <div className='market-pallet'>
                <InfiniteScroll
                  hasMore={hasMore}
                  initialLoad={false}
                  loadMore={fetchData}
                  loader={searchString && searchString.length
                    ? <></>
                    : <Loader
                      active
                      className='load-more'
                      inline='centered'
                      key={'all-tokens'}
                    />}
                  pageStart={1}
                  threshold={200}
                  useWindow={true}
                >
                  <div className='market-pallet__item'>
                    {filteredTokens.map((token) => (
                      <SmallTokenCard
                        account={account}
                        collectionId={token.collectionId.toString()}
                        key={`${token.collectionId}-${token.id}`}
                        onSetTokenAttributes={onSetTokenAttributes}
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

export default memo(AllNfts);
