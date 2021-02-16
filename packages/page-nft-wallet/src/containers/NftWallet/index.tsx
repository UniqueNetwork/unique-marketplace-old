// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';

import { LabelHelp, Table } from '@polkadot/react-components';
import { BalanceInterface, NftCollectionInterface, useBalance } from '@polkadot/react-hooks';

import AccountSelector from '../../components/AccountSelector';
import CollectionSearch from '../../components/CollectionSearch';
import FormatBalance from '../../components/FormatBalance';
import NftCollectionCard from '../../components/NftCollectionCard';
import TokenDetailsModal from '../../components/TokenDetailsModal/';
// local imports and components
import TransferModal from '../../components/TransferModal/';

interface NftWalletProps {
  className?: string;
}

function NftWallet ({ className }: NftWalletProps): React.ReactElement<NftWalletProps> {
  const collectionsStorage: NftCollectionInterface[] = JSON.parse(localStorage.getItem('tokenCollections') || '[]') as NftCollectionInterface[];
  const [openDetailedInformation, setOpenDetailedInformation] = useState<{ collection: NftCollectionInterface, tokenId: string } | null>(null);
  const [openTransfer, setOpenTransfer] = useState<{ collection: NftCollectionInterface, tokenId: string, balance: number } | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [shouldUpdateTokens, setShouldUpdateTokens] = useState<number | null>(null);
  const [collections, setCollections] = useState<NftCollectionInterface[]>(collectionsStorage);
  const [selectedCollection, setSelectedCollection] = useState<NftCollectionInterface | null>(null);
  const [canTransferTokens] = useState<boolean>(true);
  const { balance }: { balance: BalanceInterface | null } = useBalance(account);
  const currentAccount = useRef<string | null | undefined>();

  const addCollection = useCallback((collection: NftCollectionInterface) => {
    setCollections([
      ...collections,
      collection
    ]);
  }, [collections]);

  const removeCollection = useCallback((collectionToRemove) => {
    if (selectedCollection && selectedCollection.id === collectionToRemove) {
      setSelectedCollection(null);
    }

    setCollections(collections.filter((item: NftCollectionInterface) => item.id !== collectionToRemove));
  }, [collections, selectedCollection]);

  const openTransferModal = useCallback((collection, tokenId, balance) => {
    setOpenTransfer({ balance, collection, tokenId });
  }, []);

  const closeTransferModal = useCallback(() => {
    setOpenTransfer(null);
  }, []);

  const openDetailedInformationModal = useCallback((collection: NftCollectionInterface, tokenId: string) => {
    setOpenDetailedInformation({ collection, tokenId });
  }, []);

  const closeDetailedInformationModal = useCallback(() => {
    setOpenDetailedInformation(null);
  }, []);

  const updateTokens = useCallback((collectionId) => {
    setShouldUpdateTokens(collectionId);
  }, []);

  useEffect(() => {
    currentAccount.current = account;
  }, [account]);

  useEffect(() => {
    localStorage.setItem('tokenCollections', JSON.stringify(collections));
  }, [collections]);

  return (
    <div className='nft-wallet'>
      <Header as='h1'>Usetech NFT wallet</Header>
      <Header as='h2'>Account</Header>
      <Grid className='account-selector'>
        <Grid.Row>
          <Grid.Column width={12}>
            <AccountSelector onChange={setAccount} />
          </Grid.Column>
          <Grid.Column width={4}>
            { balance && (
              <div className='balance-block'>
                <label>Your account balance is:</label>
                <FormatBalance value={balance.free} className='balance' />
              </div>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
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
                openDetailedInformationModal={openDetailedInformationModal}
                openTransferModal={openTransferModal}
                removeCollection={removeCollection}
                setShouldUpdateTokens={setShouldUpdateTokens}
                shouldUpdateTokens={shouldUpdateTokens}
              />
            </td>
          </tr>
        ))}
      </Table>
      { openDetailedInformation && (
        <TokenDetailsModal
          closeModal={closeDetailedInformationModal}
          collection={openDetailedInformation.collection}
          tokenId={openDetailedInformation.tokenId}
        />
      )}
      { openTransfer && openTransfer.tokenId && openTransfer.collection && (
        <TransferModal
          account={account}
          balance={openTransfer.balance}
          canTransferTokens={canTransferTokens}
          closeModal={closeTransferModal}
          collection={openTransfer.collection}
          tokenId={openTransfer.tokenId}
          updateTokens={updateTokens}
        />
      )}
    </div>
  );
}

export default React.memo(NftWallet);
