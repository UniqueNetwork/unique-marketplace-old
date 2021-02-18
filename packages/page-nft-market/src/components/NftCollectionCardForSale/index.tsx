// Copyright 2020 UseTech authors & contributors
import { PunkForSaleInterface } from '../../types';
import { imgPath, url } from '../../constants';

import React, { useCallback, useState, useEffect } from 'react';
import { NftCollectionInterface, useCollections } from '@polkadot/react-hooks';
import { Expander } from '@polkadot/react-components';

import useMarketplace from '../../hooks/useMarketplace';
// import NftTokenCard from '../NftTokenCard';
import './styles.scss';

interface Props {
  account: string | null;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  openTransferModal: (collection: NftCollectionInterface, tokenId: string, balance: number) => void;
  openDetailedInformationModal: (collection: NftCollectionInterface, tokenId: string) => void;
  shouldUpdateTokens: number | null;
}

function NftCollectionCardForSale ({ account, canTransferTokens, collection, openTransferModal, openDetailedInformationModal, shouldUpdateTokens }: Props): React.ReactElement<Props> {
  const [opened, setOpened] = useState(true);
  // @ts-ignore
  const [tokensOfCollection, setTokensOfCollection] = useState<Array<string>>([]);
  const { getTokensOfCollection } = useCollections();
  const { punksForSale } = useMarketplace();

  const openCollection = useCallback((isOpen) => {
    setOpened(isOpen);
  }, [account, opened, setTokensOfCollection]);

  const updateTokens = useCallback(async () => {
    if (!account) {
      return;
    }
    const tokens = (await getTokensOfCollection(collection.id, account)) as any;
    setTokensOfCollection(tokens);
  }, [account, collection, setTokensOfCollection]);

  useEffect(() => {
    void updateTokens();
  }, [account]);

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
      { collection.id === 4 && (
        <div className='punks-for-sale'>
          { (punksForSale && punksForSale.length > 0) && punksForSale.map((punkForSale: PunkForSaleInterface) => {

            let backgroundColor = 'd6adad';

            if (punkForSale.isOwned) {
              backgroundColor = 'adc9d6';
            } if (punkForSale.price) {
              backgroundColor = 'b8a7ce';
            }

            return (
              <div className='punk' key={punkForSale.id}>
                <div className='punk-card'>
                  <a
                    href={`/#/store/token-details?collection=${collection.name}&id=${punkForSale.id}`}
                    title='Punk #${id}'
                  >
                    <img
                      alt='Punk ${punkForSale.id}'
                      className='pixelated'
                      src={`${url}${imgPath}/images/punks/image${punkForSale.id}.png`}
                      style={{ backgroundColor }}
                    />
                  </a>
                </div>
                <div className='punk-id'>#{punkForSale.id}</div>
                <div className='punk-status'>
                  { (punkForSale.price && punkForSale.my) && <span>I'm selling: {punkForSale.price} KSM</span> }
                  { (punkForSale.price && !punkForSale.my) && <span>For sale: {punkForSale.price} KSM</span> }
                  { !punkForSale.price && <span>Idle</span> }
                </div>
              </div>
            )
          })}
        </div>
      )}
      { collection.id === 14 && (
        <table className='table'>
          <tbody>
          {/* { account && tokensOfCollection.map(token => (
            <NftTokenCard
              account={account}
              canTransferTokens={canTransferTokens}
              collection={collection}
              key={token}
              openTransferModal={openTransferModal}
              openDetailedInformationModal={openDetailedInformationModal}
              shouldUpdateTokens={shouldUpdateTokens}
              token={token}
            />
          )) }*/}
          </tbody>
        </table>
      )}
    </Expander>
  )
}

export default React.memo(NftCollectionCardForSale);

