// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Confirm from 'semantic-ui-react/dist/commonjs/addons/Confirm';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';
import Item from 'semantic-ui-react/dist/commonjs/views/Item';

import envConfig from '@polkadot/apps-config/envConfig';
import { Expander, Tooltip } from '@polkadot/react-components';
import { useDecoder, useMetadata, useMyTokens } from '@polkadot/react-hooks';

import NftTokenCard from '../NftTokenCard';

interface Props {
  account?: string;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  removeCollection: (collection: string) => void;
  openTransferModal: (collection: NftCollectionInterface, tokenId: string, balance: number) => void;
  tokensSelling: string[];
}

const perPage = 5;

function NftCollectionCard ({ account, canTransferTokens, collection, openTransferModal, removeCollection, tokensSelling }: Props): React.ReactElement<Props> {
  const [opened, setOpened] = useState(true);
  const [currentPerPage, setCurrentPerPage] = useState(5);
  const [collectionImageUrl, setCollectionImageUrl] = useState<string>();
  const [confirmDeleteCollection, setConfirmDeleteCollection] = useState<boolean>(false);
  const { collectionName16Decoder } = useDecoder();
  const cleanup = useRef<boolean>(false);
  const { getTokenImageUrl } = useMetadata();
  const { allMyTokens, allTokensCount, ownTokensCount, tokensOnPage } = useMyTokens(account, collection, tokensSelling, currentPerPage);
  const nftWalletPanel = useRef<HTMLDivElement>(null);
  const { uniqueCollectionIds } = envConfig;

  const hasMore = tokensOnPage.length < allMyTokens.length;

  const toggleCollection = useCallback((isOpen: boolean) => {
    setOpened(isOpen);
  }, []);

  const defineCollectionImage = useCallback(async () => {
    const collectionImage = await getTokenImageUrl(collection, '1');

    if (cleanup.current) {
      return;
    }

    setCollectionImageUrl(collectionImage);
  }, [collection, getTokenImageUrl]);

  const toggleConfirmation = useCallback((status: boolean, e: React.MouseEvent<any>) => {
    e.stopPropagation();

    setConfirmDeleteCollection(status);
  }, []);

  const loadMore = useCallback((page: number) => {
    // handle load more on scroll action
    setCurrentPerPage(page * perPage);
  }, []);

  // set scroll parent to initialize scroll container in mobile or desktop
  const getScrollParent = useCallback(() => {
    if (nftWalletPanel.current && nftWalletPanel.current.offsetWidth > 1024) {
      return nftWalletPanel.current;
    }

    return null;
  }, [nftWalletPanel]);

  useEffect(() => {
    if (!collectionImageUrl && collection) {
      void defineCollectionImage();
    }
  }, [collection, collectionImageUrl, defineCollectionImage]);

  useEffect(() => {
    return () => {
      cleanup.current = true;
    };
  }, []);

  const useWindow = !getScrollParent();

  return (
    <Expander
      className='nft-collection-item'
      isOpen={opened}
      onClick={toggleCollection}
      summary={
        <div className='expander-content'>
          <div className='token-image'>
            { collectionImageUrl && (
              <Item.Image
                size='mini'
                src={collectionImageUrl}
              />
            )}
          </div>
          <div className='collection-info-row'>
            <div className='collection-info-attributes'>
              <div className='collection-name'>{collectionName16Decoder(collection.name)}
                { Object.prototype.hasOwnProperty.call(collection.mode, 'reFungible') &&
                <strong>, re-fungible. </strong>
                }
              </div>
              { collection.description && (
                <div className='collection-description'>{collectionName16Decoder(collection.description)}</div>
              )}
            </div>
          </div>
          <div className='tokens-count'>
            <span>Total: {allTokensCount} {!allTokensCount || allTokensCount > 1 ? 'items' : 'item'} (own: {ownTokensCount || 0}, selling: {tokensSelling.length})</span>
          </div>
          <div className='link-button'>
            { !uniqueCollectionIds?.includes(collection.id) && (
              <div className='link-button-with-tooltip'>
                {/* <img
                  alt='delete'
                  className='red'
                  data-for='Delete collection from wallet'
                  data-tip='Delete collection from wallet'
                  onClick={toggleConfirmation.bind(null, true)}
                  src={trash as string}
                /> */}
                <Tooltip
                  arrowColor={'transparent'}
                  backgroundColor={'var(--border-color)'}
                  place='bottom'
                  text={'Delete collection from wallet'}
                  textColor={'var(--sub-header-text-transform)'}
                  trigger={'Delete collection from wallet'}
                />
                <Confirm
                  content='Are you sure you want to delete the collection from the wallet?'
                  onCancel={toggleConfirmation.bind(null, false)}
                  onConfirm={removeCollection.bind(null, collection.id)}
                  open={confirmDeleteCollection}
                />
              </div>
            )}
          </div>
        </div>
      }
    >
      <div
        className='expander-inner'
        ref={nftWalletPanel}
      >
        <InfiniteScroll
          getScrollParent={getScrollParent}
          hasMore={hasMore}
          initialLoad={false}
          loadMore={loadMore}
          loader={<Loader
            active
            className='load-more'
            inline='centered'
            key={'collection-card'}
          />}
          pageStart={1}
          threshold={100}
          useWindow={useWindow}
        >
          <div className='token-table'>
            { account && tokensOnPage.map((token: string, index: number) => (
              <NftTokenCard
                account={account}
                canTransferTokens={canTransferTokens}
                collection={collection}
                key={`${token}-${index}`}
                openTransferModal={openTransferModal}
                token={token}
                tokensSelling={tokensSelling}
              />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </Expander>
  );
}

export default React.memo(NftCollectionCard);
