// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';

import envConfig from '@polkadot/apps-config/envConfig';
import { LabelHelp, Table, TransferModal } from '@polkadot/react-components';
import { useCollections } from '@polkadot/react-hooks';

import CollectionSearch from '../../components/CollectionSearch';
import NftCollectionCard from '../../components/NftCollectionCard';

interface NftWalletProps {
  account?: string;
  addCollection: (collection: NftCollectionInterface) => void;
  collections: NftCollectionInterface[];
  removeCollectionFromList: (collectionToRemove: string) => void;
  setCollections: (collections: NftCollectionInterface[]) => void;
  setShouldUpdateTokens: (value: string) => void;
  shouldUpdateTokens?: string;
}

const { canAddCollections } = envConfig;

function NftWallet ({ account, addCollection, collections, removeCollectionFromList, setCollections, setShouldUpdateTokens, shouldUpdateTokens }: NftWalletProps): React.ReactElement {
  const [openTransfer, setOpenTransfer] = useState<{ collection: NftCollectionInterface, tokenId: string, balance: number } | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<NftCollectionInterface>();
  const [canTransferTokens] = useState<boolean>(true);
  const currentAccount = useRef<string | null | undefined>();
  const { presetMintTokenCollection } = useCollections();
  const cleanup = useRef<boolean>(false);

  const addMintCollectionToList = useCallback(async () => {
    const firstCollections: NftCollectionInterface[] = await presetMintTokenCollection();

    if (cleanup.current) {
      return;
    }

    setCollections([...firstCollections]);
  }, [setCollections, presetMintTokenCollection]);

  const removeCollection = useCallback((collectionToRemove: string) => {
    if (selectedCollection && selectedCollection.id === collectionToRemove) {
      setSelectedCollection(undefined);
    }

    removeCollectionFromList(collectionToRemove);
  }, [collections, removeCollectionFromList, setCollections, selectedCollection]);

  const openTransferModal = useCallback((collection: NftCollectionInterface, tokenId: string, balance: number) => {
    setOpenTransfer({ balance, collection, tokenId });
  }, []);

  const updateTokens = useCallback((collectionId) => {
    setShouldUpdateTokens(collectionId);
  }, [setShouldUpdateTokens]);

  useEffect(() => {
    currentAccount.current = account;
    setShouldUpdateTokens('all');
  }, [account, setShouldUpdateTokens]);

  useEffect(() => {
    void addMintCollectionToList();
  }, [addMintCollectionToList]);

  useEffect(() => {
    return () => {
      cleanup.current = true;
    };
  }, []);

  return (
    <div className='nft-wallet'>
      { canAddCollections && (
        <>
          <CollectionSearch
            account={account}
            addCollection={addCollection}
            collections={collections}
          />
          <br />
        </>
      )}
      <Header as='h3'>
        My collections
        <LabelHelp
          className='small-help'
          help={'NFTs owned by me'}
        />
      </Header>
      <Table
        empty={'No collections added'}
        header={[]}
      >
        { collections.map((collection) => (
          <tr key={collection.id}>
            <td className='overflow'>
              <NftCollectionCard
                account={account}
                canTransferTokens={canTransferTokens}
                collection={collection}
                openTransferModal={openTransferModal}
                removeCollection={removeCollection}
                shouldUpdateTokens={shouldUpdateTokens}
              />
            </td>
          </tr>
        ))}
      </Table>
      { openTransfer && openTransfer.tokenId && openTransfer.collection && (
        <TransferModal
          account={account}
          balance={openTransfer.balance}
          closeModal={setOpenTransfer.bind(null, null)}
          collection={openTransfer.collection}
          tokenId={openTransfer.tokenId}
          updateTokens={updateTokens}
        />
      )}
    </div>
  );
}

export default React.memo(NftWallet);
