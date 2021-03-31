// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { CollectionWithTokensCount, TokenDetailsInterface, TokenInterface } from '@polkadot/react-hooks/useCollections';

// external imports
import React, { memo, ReactElement, useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useHistory } from 'react-router';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

// import { Input } from '@polkadot/react-components';
import { useCollections } from '@polkadot/react-hooks';
import { AttributesDecoded } from '@polkadot/react-hooks/useSchema';
import { UNIQUE_COLLECTION_ID } from '@polkadot/react-hooks/utils';
import { TypeRegistry } from '@polkadot/types';

// local imports and components
import SmallTokenCard from '../../components/SmallTokenCard';

interface BuyTokensProps {
  account?: string;
  localRegistry?: TypeRegistry;
  setShouldUpdateTokens: (value?: string) => void;
  shouldUpdateTokens?: string;
}

interface TokensWithAttributesInterface {
  [collectionId: string]: {[tokenId: string]: AttributesDecoded}
}

const perPage = 20;

const AllNfts = ({ account, localRegistry, setShouldUpdateTokens }: BuyTokensProps): ReactElement => {
  const history = useHistory();
  const { getCollectionWithTokenCount, getTokenInfo } = useCollections();
  const [searchString] = useState<string>('');
  const [collectionWithTokensCount, setCollectionWithTokensCount] = useState<CollectionWithTokensCount>();
  const [allTokens, setAllTokens] = useState<{ [key: string]: TokenInterface}>({});
  const [tokensWithAttributes, setTokensWithAttributes] = useState<TokensWithAttributesInterface>({});
  // const [collectionSearchString, setCollectionSearchString] = useState<string>('');
  const [filteredTokens, setFilteredTokens] = useState<TokenInterface[]>([]);
  const hasMore = collectionWithTokensCount && Object.values(allTokens).length < collectionWithTokensCount?.tokenCount;

  const openDetailedInformationModal = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/all-tokens/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const onSetTokenAttributes = useCallback((collectionId: string, tokenId: string, attributes: AttributesDecoded) => {
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
    if (collectionWithTokensCount) {
      const allTokensTable = { ...allTokens };

      for (let i = indexFrom; i <= indexTo; i++) {
        const tokenInfo: TokenDetailsInterface = await getTokenInfo(collectionWithTokensCount.info, i.toString());

        allTokensTable[`${collectionWithTokensCount.info.id}-${i}`] = { ...tokenInfo, collectionId: collectionWithTokensCount.info.id, id: i.toString() };
      }

      setAllTokens(allTokensTable);
    }
  }, [allTokens, collectionWithTokensCount, getTokenInfo]);

  const presetTokensTable = useCallback(async () => {
    const collectionInfoWithTokensCount: CollectionWithTokensCount = await getCollectionWithTokenCount(UNIQUE_COLLECTION_ID);

    setCollectionWithTokensCount(collectionInfoWithTokensCount);
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
        { (!account || !Object.values(allTokens).length) && (
          <Loader
            active
            inline='centered'
          />
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
                      inline='centered'
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
                        key={token.id}
                        localRegistry={localRegistry}
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
