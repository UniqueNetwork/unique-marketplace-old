// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { TokenInterface } from '@polkadot/react-hooks/useCollections';

// external imports
import React, { memo, ReactElement, useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { Input } from '@polkadot/react-components';
import { useCollections } from '@polkadot/react-hooks';
import { AttributesDecoded } from '@polkadot/react-hooks/useSchema';
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

const AllNfts = ({ account, localRegistry, setShouldUpdateTokens, shouldUpdateTokens }: BuyTokensProps): ReactElement => {
  const history = useHistory();
  const { getCollectionWithTokenCount } = useCollections();
  const [searchString, setSearchString] = useState<string>('');
  const [allTokens, setAllTokens] = useState<TokenInterface[]>([]);
  const [tokensWithAttributes, setTokensWithAttributes] = useState<TokensWithAttributesInterface>({});
  // const [collectionSearchString, setCollectionSearchString] = useState<string>('');
  const [filteredTokens, setFilteredTokens] = useState<TokenInterface[]>([]);

  const openDetailedInformationModal = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/market/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
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

  useEffect(() => {
    if (allTokens) {
      if (searchString && searchString.length) {
        const filtered = allTokens.filter((item: TokenInterface) => {
          if (tokensWithAttributes[item.collectionId] && tokensWithAttributes[item.collectionId][item.id]) {
            const tokenItemAttrs = tokensWithAttributes[item.collectionId][item.id];

            return tokenItemAttrs.NameStr && (tokenItemAttrs.NameStr as string).toLowerCase().includes(searchString.toLowerCase());
          }

          return false;
        });

        setFilteredTokens(filtered);
      } else {
        setFilteredTokens(allTokens);
      }
    }
  }, [allTokens, tokensWithAttributes, searchString]);

  useEffect(() => {
    setShouldUpdateTokens('all');
  }, [setShouldUpdateTokens]);

  return (
    <div className='nft-market'>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <Input
              className='isSmall search'
              help={<span>Find and select token.</span>}
              isDisabled={!allTokens || !allTokens.length}
              label={'Find token by name or collection'}
              onChange={setSearchString}
              placeholder='Search...'
              value={searchString}
              withLabel
            />
          </Grid.Column>
        </Grid.Row>
        { (!account || !allTokens.length) && (
          <Loader
            active
            inline='centered'
          >
            Loading...
          </Loader>
        )}
        {(account && filteredTokens.length > 0) && (
          <Grid.Row>
            <Grid.Column width={16}>
              <div className='market-pallet'>
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
              </div>
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    </div>
  );
};

export default memo(AllNfts);
