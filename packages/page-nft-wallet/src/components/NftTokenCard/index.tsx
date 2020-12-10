// Copyright 2020 UseTech authors & contributors
import React, { useCallback, useEffect, useState } from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Item from 'semantic-ui-react/dist/commonjs/views/Item';
import { NftCollectionInterface, useCollections } from '@polkadot/react-hooks';

import './NftTokenCard.scss';

interface Props {
  account: string;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  openTransferModal: (collection: NftCollectionInterface, tokenId: string, balance: number) => void;
  openDetailedInformationModal: (collection: NftCollectionInterface, tokenId: string) => void;
  shouldUpdateTokens: number | null;
  token: string;
  tokenUrl: (collection: NftCollectionInterface, tokenId: string) => string;
}

function NftTokenCard({ account, canTransferTokens, collection, openTransferModal, openDetailedInformationModal, shouldUpdateTokens, token, tokenUrl }: Props): React.ReactElement<Props> {
  const { getDetailedRefungibleTokenInfo } = useCollections();
  const [balance, setBalance] = useState<number>(0);

  const getTokenDetails = useCallback(async () => {
    try {
      const tokenDetails = (await getDetailedRefungibleTokenInfo(collection.id, token)) as any;
      const owner = tokenDetails.Owner.find((item: any) => item.owner.toString() === account);
      if (!owner) {
        return;
      }
      const balance = owner.fraction.toNumber() / Math.pow(10, collection.decimalPoints);
      setBalance(balance);
    } catch (e) {
      console.error('token balance calculation error', e);
    }
  }, []);

  useEffect(() => {
    if (shouldUpdateTokens && shouldUpdateTokens === collection.id) {
      void getTokenDetails();
    }
  }, [shouldUpdateTokens]);

  useEffect(() => {
    void getTokenDetails();
  }, []);

  if (!balance && collection.isReFungible) {
    return <></>;
  }

  return (
    <tr className='token-row' key={token}>
      <td className='token-image'>
        <a onClick={openDetailedInformationModal.bind(null, collection, token)}>
          <Item.Image size='mini' src={tokenUrl(collection, token)} />
        </a>
      </td>
      <td className='token-name'>
        {collection.prefix} #{token.toString()}
      </td>
      { collection.isReFungible && (
        <td className='token-balance'>
          Balance: {balance}
        </td>
      )}
      <td className='token-actions'>
        <Button disabled={!canTransferTokens} onClick={openTransferModal.bind(null, collection, token, balance)} primary>Transfer token</Button>
      </td>
    </tr>
  )
}

export default React.memo(NftTokenCard);
