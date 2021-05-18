// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import Item from 'semantic-ui-react/dist/commonjs/views/Item';

import { Expander } from '@polkadot/react-components';
import { useCollections, useDecoder, useMetadata } from '@polkadot/react-hooks';
import { useCollection } from '@polkadot/react-hooks/useCollection';
import { UNIQUE_COLLECTION_ID } from '@polkadot/react-hooks/utils';

import NftTokenCard from '../NftTokenCard';

interface Props {
  account?: string;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  removeCollection: (collection: string) => void;
  openTransferModal: (collection: NftCollectionInterface, tokenId: string, balance: number) => void;
  shouldUpdateTokens: string | undefined;
}

function NftCollectionCard ({ account, canTransferTokens, collection, openTransferModal, removeCollection, shouldUpdateTokens }: Props): React.ReactElement<Props> {
  const [opened, setOpened] = useState(true);
  const [collectionImageUrl, setCollectionImageUrl] = useState<string>();
  const [ownTokensCount, setOwnTokensCount] = useState<number>();
  const [allTokensCount, setAllTokensCount] = useState<number>();
  const [tokensOfCollection, setTokensOfCollection] = useState<Array<string>>([]);
  const { getTokensOfCollection } = useCollections();
  const { getCollectionTokensCount } = useCollection();
  const { collectionName16Decoder } = useDecoder();
  const cleanup = useRef<boolean>(false);
  const history = useHistory();
  const { getTokenImageUrl } = useMetadata();

  const openCollection = useCallback((isOpen) => {
    setOpened(isOpen);
  }, []);

  const defineCollectionImage = useCallback(async () => {
    const collectionImage = await getTokenImageUrl(collection, '1');

    if (cleanup.current) {
      return;
    }

    setCollectionImageUrl(collectionImage);
  }, [collection, getTokenImageUrl]);

  const editCollection = useCallback((collectionId: string, e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    history.push(`/wallet/manage-collection?collectionId=${collectionId}`);
  }, [history]);

  const createToken = useCallback((collectionId: string, e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    history.push(`/wallet/manage-token?collectionId=${collectionId}`);
  }, [history]);

  const getTokensCount = useCallback(async () => {
    if (!collection) {
      return;
    }

    const tokensCount: number = await getCollectionTokensCount(collection.id) as number;

    if (cleanup.current) {
      return;
    }

    setAllTokensCount(parseFloat(tokensCount.toString()));
  }, [collection, getCollectionTokensCount]);

  const updateTokens = useCallback(async () => {
    if (!account) {
      return;
    }

    const tokensOfCollection = (await getTokensOfCollection(collection.id, account)) as string[];

    if (cleanup.current) {
      return;
    }

    setOwnTokensCount(tokensOfCollection.length);
    setTokensOfCollection(tokensOfCollection);
  }, [account, collection, getTokensOfCollection]);

  useEffect(() => {
    if (shouldUpdateTokens && shouldUpdateTokens === collection.id) {
      void updateTokens();
    }
  }, [collection.id, shouldUpdateTokens, updateTokens]);

  useEffect(() => {
    if (opened) {
      void updateTokens();
    }
  }, [account, opened, updateTokens]);

  useEffect(() => {
    if (!collectionImageUrl && collection) {
      void defineCollectionImage();
    }
  }, [collection, collectionImageUrl, defineCollectionImage]);

  useEffect(() => {
    if (collection && allTokensCount === undefined) {
      void getTokensCount();
    }
  }, [allTokensCount, collection, getTokensCount]);

  useEffect(() => {
    return () => {
      cleanup.current = true;
    };
  }, []);

  const canEditCollection = true;
  const canCreateToken = false;

  return (
    <Expander
      className='nft-collection-item'
      isOpen={opened}
      onClick={openCollection}
      summary={
        <div className='expander-content'>
          <div
            className='collection-info-row'>
            <div className='token-image'>
              { collectionImageUrl && (
                <Item.Image
                  size='mini'
                  src={collectionImageUrl}
                />
              )}
            </div>
            <div>{collectionName16Decoder(collection.Name)}
              { Object.prototype.hasOwnProperty.call(collection.Mode, 'reFungible') &&
              <strong>, re-fungible. </strong>
              }
            </div>
            { collection.Description && (
              <div title={collectionName16Decoder(collection.Description)}> - {collectionName16Decoder(collection.Description)}</div>
            )}
          </div>
          <div className='tokens-count'>
            <span>Total: {allTokensCount} {!allTokensCount || allTokensCount > 1 ? 'items' : 'item'}</span>
            <span>, Own: {ownTokensCount} {!ownTokensCount || ownTokensCount > 1 ? 'items' : 'item'}</span>
          </div>
          <div className='link-button'>
            { canEditCollection && (
              <a
                onClick={editCollection.bind(null, collection.id)}
              >
                Edit
              </a>
            )}
            { canCreateToken && (
              <a
                onClick={createToken.bind(null, collection.id)}
              >
                Create token
              </a>
            )}
            { collection.id !== UNIQUE_COLLECTION_ID && (
              <a
                className='red'
                onClick={removeCollection.bind(null, collection.id)}
              >
                Remove
              </a>
            )}
          </div>
        </div>
      }
    >
      <table className='table'>
        <tbody>
          { account && tokensOfCollection.map((token) => (
            <NftTokenCard
              account={account}
              canTransferTokens={canTransferTokens}
              collection={collection}
              key={token}
              openTransferModal={openTransferModal}
              shouldUpdateTokens={shouldUpdateTokens}
              token={token}
            />
          ))}
        </tbody>
      </table>
    </Expander>
  );
}

export default React.memo(NftCollectionCard);
