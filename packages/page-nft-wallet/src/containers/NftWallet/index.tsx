// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollections';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';

import { LabelHelp, NftDetailsModal, Table } from '@polkadot/react-components';
import { useRegistry } from '@polkadot/react-hooks';

import CollectionSearch from '../../components/CollectionSearch';
import NftCollectionCard from '../../components/NftCollectionCard';
import TransferModal from '../../components/TransferModal/';

function NftWallet ({ account }: { account?: string }): React.ReactElement {
  const collectionsStorage: NftCollectionInterface[] = JSON.parse(localStorage.getItem('tokenCollections') || '[]') as NftCollectionInterface[];
  const [openTransfer, setOpenTransfer] = useState<{ collection: NftCollectionInterface, tokenId: string, balance: number } | null>(null);
  const [shouldUpdateTokens, setShouldUpdateTokens] = useState<string>();
  const [collections, setCollections] = useState<NftCollectionInterface[]>(collectionsStorage);
  const [selectedCollection, setSelectedCollection] = useState<NftCollectionInterface>();
  const [canTransferTokens] = useState<boolean>(true);
  const currentAccount = useRef<string | null | undefined>();
  const localRegistry = useRegistry();

  const addCollection = useCallback((collection: NftCollectionInterface) => {
    setCollections((prevCollections: NftCollectionInterface[]) => [...prevCollections, collection]);
  }, []);

  const removeCollection = useCallback((collectionToRemove) => {
    if (selectedCollection && selectedCollection.id === collectionToRemove) {
      setSelectedCollection(undefined);
    }

    setCollections(collections.filter((item: NftCollectionInterface) => item.id !== collectionToRemove));
  }, [collections, selectedCollection]);

  const openTransferModal = useCallback((collection: NftCollectionInterface, tokenId: string, balance: number) => {
    setOpenTransfer({ balance, collection, tokenId });
  }, []);

  const updateTokens = useCallback((collectionId) => {
    setShouldUpdateTokens(collectionId);
  }, []);

  useEffect(() => {
    currentAccount.current = account;
    setShouldUpdateTokens('all');
  }, [account]);

  useEffect(() => {
    localStorage.setItem('tokenCollections', JSON.stringify(collections));
  }, [collections]);

  return (
    <div className='nft-wallet'>
      <Header as='h1'>Usetech NFT wallet</Header>
      <CollectionSearch
        account={account}
        addCollection={addCollection}
        collections={collections}
      />
      <br />
      <Header as='h2'>
        My collections
        <LabelHelp
          className='small-help'
          help={'Your tokens are here'}
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
                localRegistry={localRegistry}
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
          canTransferTokens={canTransferTokens}
          closeModal={setOpenTransfer.bind(null, null)}
          collection={openTransfer.collection}
          tokenId={openTransfer.tokenId}
          updateTokens={updateTokens}
        />
      )}
      { account && (
        <Switch>
          <Route
            key='TokenDetailsModal'
            path='*/token-details'
          >
            <NftDetailsModal
              account={account}
              localRegistry={localRegistry}
              setShouldUpdateTokens={setShouldUpdateTokens}
            />
          </Route>
        </Switch>
      )}
    </div>
  );
}

export default React.memo(NftWallet);
