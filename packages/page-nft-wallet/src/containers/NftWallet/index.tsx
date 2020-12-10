// Copyright 2020 UseTech authors & contributors

// global app props and types

// external imports
import React, { useCallback, useEffect, useState, useRef } from 'react';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';
import { Table, LabelHelp } from '@polkadot/react-components';
import { NftCollectionInterface } from '@polkadot/react-hooks';

// local imports and components
import useBalance from '../../hooks/useBalance';
import TransferModal from '../../components/TransferModal/';
import TokenDetailsModal from '../../components/TokenDetailsModal/';
import NftCollectionCard from '../../components/NftCollectionCard';
import CollectionSearch from '../../components/CollectionSearch';
import AccountSelector from '../../components/AccountSelector';
import FormatBalance from '../../components/FormatBalance';
import './styles.scss';

interface NftWalletProps {
  className?: string;
}

function NftWallet ({ className }: NftWalletProps): React.ReactElement<NftWalletProps> {
  const collectionsStorage = JSON.parse(localStorage.getItem('tokenCollections') || '[]');
  const [openDetailedInformation, setOpenDetailedInformation] = useState<{ collection: NftCollectionInterface, tokenId: string } | null>(null);
  const [openTransfer, setOpenTransfer] = useState<{ collection: NftCollectionInterface, tokenId: string, balance: number } | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [shouldUpdateTokens, setShouldUpdateTokens] = useState<number | null>(null);
  const [collections, setCollections] = useState<Array<NftCollectionInterface>>(collectionsStorage);
  const [selectedCollection, setSelectedCollection] = useState<NftCollectionInterface | null>(null);
  const [canTransferTokens] = useState<boolean>(true);
  const { balance } = useBalance(account);
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
    setCollections(collections.filter(item => item.id !== collectionToRemove));
  }, [collections]);

  const openTransferModal = useCallback((collection, tokenId, balance) => {
    setOpenTransfer({ collection, tokenId, balance });
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

  const tokenUrl = useCallback((collection, tokenId: string): string => {
    if (collection.offchainSchema.indexOf('image{id}.pn') !== -1) {
      return collection.offchainSchema.replace('image{id}.pn', `image${tokenId}.png`)
    }
    if (collection.offchainSchema.indexOf('image{id}.jp') !== -1) {
      return collection.offchainSchema.replace('image{id}.jp', `image${tokenId}.jpg`)
    }
    if (collection.offchainSchema.indexOf('image/{id}.jp') !== -1) {
      return collection.offchainSchema.replace('{id}.jp', `${tokenId}.jpg`)
    }
    if (collection.offchainSchema.indexOf('image/{id}.pn') !== -1) {
      return collection.offchainSchema.replace('{id}.pn', `${tokenId}.png`)
    }
    if (collection.offchainSchema.indexOf('images/{id') !== -1) {
      return collection.offchainSchema.replace('{id', `${tokenId.toString()}`)
    }
    return '';
  },  []);

  const updateTokens = useCallback((collectionId) => {
    setShouldUpdateTokens(collectionId);
  }, []);

  useEffect(() => {
    if (currentAccount.current && account !== currentAccount.current) {
      // setCollections([]);
    }
    currentAccount.current = account;
  }, [account]);

  useEffect(() => {
    localStorage.setItem('tokenCollections', JSON.stringify(collections));
  }, [collections]);

  console.log('balance.free', balance);

  return (
    <div className="nft-wallet">
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
                openTransferModal={openTransferModal}
                openDetailedInformationModal={openDetailedInformationModal}
                removeCollection={removeCollection}
                setShouldUpdateTokens={setShouldUpdateTokens}
                shouldUpdateTokens={shouldUpdateTokens}
                tokenUrl={tokenUrl}
              />
            </td>
          </tr>
        ))}
      </Table>
      { openDetailedInformation && (
        <TokenDetailsModal
          collection={openDetailedInformation.collection}
          closeModal={closeDetailedInformationModal}
          tokenId={openDetailedInformation.tokenId}
          tokenUrl={tokenUrl}
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
