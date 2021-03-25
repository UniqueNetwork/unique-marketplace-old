// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './NftCollectionCard.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollections';

import React, { useCallback, useEffect, useState } from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';

import { Expander } from '@polkadot/react-components';
import { useCollections, useDecoder } from '@polkadot/react-hooks';
import { TypeRegistry } from '@polkadot/types';

import NftTokenCard from '../NftTokenCard';

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

  const openCollection = useCallback((isOpen) => {
    setOpened(isOpen);
  }, []);

  const updateTokens = useCallback(async () => {
    if (!account) {
      return;
    }

    const tokensOfCollection = (await getTokensOfCollection(collection.id, account)) as string[];

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

  return (
    <Expander
      className='nft-collection-item'
      isOpen={opened}
      onClick={openCollection}
      summary={
        <>
          <strong>{collectionName16Decoder(collection.Name)}</strong>
          { collection.Description && (
            <span> - {collectionName16Decoder(collection.Description)}</span>
          )}
          { Object.prototype.hasOwnProperty.call(collection.Mode, 'reFungible') &&
            <strong>, re-fungible</strong>
          }
        </>
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
      { collection.id !== '1' && (
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
