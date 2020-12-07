// Copyright 2020 UseTech authors & contributors
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import { Expander } from '@polkadot/react-components';

import { useCollections, NftCollectionInterface } from '@polkadot/react-hooks';
import NftTokenCard from '../NftTokenCard';
import './NftCollectionCard.scss';

interface Props {
  account: string | null;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  removeCollection: (collection: number) => void;
  openTransferModal: (collection: NftCollectionInterface, tokenId: string, balance: number) => void;
  openDetailedInformationModal: (collection: NftCollectionInterface, tokenId: string) => void;
  setShouldUpdateTokens: (collectionId: number | null) => void;
  shouldUpdateTokens: number | null;
  tokenUrl: (collection: NftCollectionInterface, tokenId: string) => string;
}

function NftCollectionCard({ account, canTransferTokens, collection, removeCollection, openTransferModal, openDetailedInformationModal, setShouldUpdateTokens, shouldUpdateTokens, tokenUrl }: Props): React.ReactElement<Props> {
  const [opened, setOpened] = useState(false);
  const [tokensOfCollection, setTokensOfCollection] = useState<Array<string>>([]);
  const { getTokensOfCollection } = useCollections();
  const currentAccount = useRef<string | null | undefined>();

  const openCollection = useCallback((isOpen) => {
    setOpened(isOpen);
  }, [account, opened, setTokensOfCollection]);

  const updateTokens = useCallback(async () => {
    if (!account) {
      return;
    }
    const tokensOfCollection = (await getTokensOfCollection(collection.id, account)) as any;
    setTokensOfCollection(tokensOfCollection);
  }, [account, collection, setTokensOfCollection]);

  // clear search results if account changed
  useEffect(() => {
    if (currentAccount.current && currentAccount.current !== account) {
      setOpened(false);
      setTokensOfCollection([]);
    }
    currentAccount.current = account;
  }, [account, currentAccount, setOpened, setTokensOfCollection]);

  useEffect(() => {
    if (shouldUpdateTokens && shouldUpdateTokens === collection.id) {
      void updateTokens();
      setShouldUpdateTokens(null);
    }
  }, [shouldUpdateTokens]);

  useEffect(() => {
    if (opened) {
      void updateTokens();
    }
  }, [opened]);

  return (
    <Expander
      className='nft-collection-item'
      isOpen={opened}
      summary={
          <>
            <strong>{collection.name}</strong>
            {collection.prefix &&
            <span> ({collection.prefix})</span>
            }
            {collection.description &&
            <span> {collection.description}</span>
            }
            {collection.isReFungible &&
            <strong>, re-fungible</strong>
            }
          </>
        }
      onClick={openCollection}
    >
      <table className='table'>
        <tbody>
        { account && tokensOfCollection.map(token => (
            <NftTokenCard
              account={account}
              canTransferTokens={canTransferTokens}
              collection={collection}
              key={token}
              openTransferModal={openTransferModal}
              openDetailedInformationModal={openDetailedInformationModal}
              shouldUpdateTokens={shouldUpdateTokens}
              token={token}
              tokenUrl={tokenUrl}
            />
        ))}
        </tbody>
      </table>
      <Button onClick={removeCollection.bind(null, collection.id)} basic color='red'>
        Remove collection
      </Button>
    </Expander>
  )
}

export default React.memo(NftCollectionCard);

