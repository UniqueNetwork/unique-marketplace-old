// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollections';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';

import { Expander } from '@polkadot/react-components';
import { useCollections, useDecoder } from '@polkadot/react-hooks';
import { UNIQUE_COLLECTION_ID } from '@polkadot/react-hooks/utils';
import { TypeRegistry } from '@polkadot/types';

import NftTokenCard from '../NftTokenCard';
import {useHistory} from "react-router";

interface Props {
  account?: string;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  localRegistry?: TypeRegistry;
  removeCollection: (collection: string) => void;
  openTransferModal: (collection: NftCollectionInterface, tokenId: string, balance: number) => void;
  shouldUpdateTokens: string | undefined;
}

function NftCollectionCard ({ account, canTransferTokens, collection, localRegistry, openTransferModal, removeCollection, shouldUpdateTokens }: Props): React.ReactElement<Props> {
  const [opened, setOpened] = useState(true);
  const [tokensOfCollection, setTokensOfCollection] = useState<Array<string>>([]);
  const { getTokensOfCollection } = useCollections();
  const { collectionName16Decoder } = useDecoder();
  const cleanup = useRef<boolean>(false);
  const history = useHistory();

  const openCollection = useCallback((isOpen) => {
    setOpened(isOpen);
  }, []);

  const editCollection = useCallback((collectionId: string, e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    history.push(`/wallet/edit-token?collectionId=${collectionId}`);
  }, [history]);

  const updateTokens = useCallback(async () => {
    if (!account) {
      return;
    }

    const tokensOfCollection = (await getTokensOfCollection(collection.id, account)) as string[];

    if (cleanup.current) {
      return;
    }

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
          <div
            className='collection-info-row'>
            <div>{collectionName16Decoder(collection.Name)}
              { Object.prototype.hasOwnProperty.call(collection.Mode, 'reFungible') &&
              <strong>, re-fungible. </strong>
              }
            </div>
            { collection.Description && (
              <div title={collectionName16Decoder(collection.Description)}> - {collectionName16Decoder(collection.Description)}</div>
            )}
          </div>
          <a
            className='link-button'
            onClick={editCollection.bind(null, collection.id)}
          >
            Edit
          </a>
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
              localRegistry={localRegistry}
              openTransferModal={openTransferModal}
              shouldUpdateTokens={shouldUpdateTokens}
              token={token}
            />
          ))}
        </tbody>
      </table>
      { collection.id !== UNIQUE_COLLECTION_ID && (
        <Button
          basic
          color='red'
          onClick={removeCollection.bind(null, collection.id)}>
          Remove collection
        </Button>
      )}
    </Expander>
  );
}

export default React.memo(NftCollectionCard);
