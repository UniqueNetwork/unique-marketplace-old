// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import Confirm from 'semantic-ui-react/dist/commonjs/addons/Confirm';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Item from 'semantic-ui-react/dist/commonjs/views/Item';

import envConfig from '@polkadot/apps-config/envConfig';
import { Expander } from '@polkadot/react-components';
import pencil from '@polkadot/react-components/ManageCollection/pencil.svg';
import trash from '@polkadot/react-components/ManageCollection/trash.svg';
import Tooltip from '@polkadot/react-components/Tooltip';
import { useCollections, useDecoder, useMetadata } from '@polkadot/react-hooks';
import { useCollection } from '@polkadot/react-hooks/useCollection';

import NftTokenCard from '../NftTokenCard';

const { canCreateToken, canEditCollection, uniqueCollectionIds } = envConfig;

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
  const [confirmDeleteCollection, setConfirmDeleteCollection] = useState<boolean>(false);
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

  const editCollection = useCallback((collectionId: string) => {
    history.push(`/wallet/manage-collection?collectionId=${collectionId}`);
  }, [history]);

  const createToken = useCallback((collectionId: string) => {
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

  const toggleConfirmation = useCallback((status, e: React.MouseEvent<any>) => {
    e.stopPropagation();

    setConfirmDeleteCollection(status);
  }, []);

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

  return (
    <Expander
      className='nft-collection-item'
      isOpen={opened}
      onClick={openCollection}
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
              <div className='collection-name'>{collectionName16Decoder(collection.Name)}
                { Object.prototype.hasOwnProperty.call(collection.Mode, 'reFungible') &&
                <strong>, re-fungible. </strong>
                }
              </div>
              { collection.Description && (
                <div className='collection-description'>{collectionName16Decoder(collection.Description)}</div>
              )}
            </div>
            { canCreateToken && (
              <Button
                className='create-button'
                onClick={createToken.bind(null, collection.id)}
                primary
              >
                Create token
              </Button>
            )}
          </div>
          <div className='tokens-count'>
            <span>Total: {allTokensCount} {!allTokensCount || allTokensCount > 1 ? 'items' : 'item'} (own: {ownTokensCount})</span>
          </div>
          <div className='link-button'>
            { canEditCollection && (
              <div className='link-button-with-tooltip'>
                <img
                  alt='edit'
                  data-for='Edit collection'
                  data-tip='Edit collection'
                  onClick={editCollection.bind(null, collection.id)}
                  src={pencil as string}
                />
                <Tooltip
                  arrowColor={'transparent'}
                  backgroundColor={'var(--border-color)'}
                  place='bottom'
                  text={'Edit collection'}
                  textColor={'var(--sub-header-text-transform)'}
                  trigger={'Edit collection'}
                />
              </div>
            )}
            { !uniqueCollectionIds.includes(collection.id) && (
              <div className='link-button-with-tooltip'>
                <img
                  alt='delete'
                  className='red'
                  data-for='Delete collection from wallet'
                  data-tip='Delete collection from wallet'
                  onClick={toggleConfirmation.bind(null, true)}
                  src={trash as string}
                />
                <Tooltip
                  arrowColor={'transparent'}
                  backgroundColor={'var(--border-color)'}
                  place='bottom'
                  text={'Delete collection from wallet'}
                  textColor={'var(--sub-header-text-transform)'}
                  trigger={'Delete collection from wallet'}
                />
                <Confirm
                  content='Are you sure to delete collection from the wallet?'
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
      <div className='token-table'>
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
      </div>
    </Expander>
  );
}

export default React.memo(NftCollectionCard);
