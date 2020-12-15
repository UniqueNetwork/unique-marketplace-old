// Copyright 2020 UseTech authors & contributors
import React, { useCallback, useEffect, useState } from 'react';
import Item from 'semantic-ui-react/dist/commonjs/views/Item';
import { NftCollectionInterface, useCollections } from '@polkadot/react-hooks';

import './styles.scss';

interface Props {
  account: string;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  openDetailedInformationModal: (collection: NftCollectionInterface, tokenId: string) => void;
  token: string;
}

function NftTokenCard({ account, canTransferTokens, collection, openDetailedInformationModal, token }: Props): React.ReactElement<Props> {
  const { getDetailedRefungibleTokenInfo, getTokenImageUrl } = useCollections();
  const [balance, setBalance] = useState<number>(0);

  const getTokenDetails = useCallback(async () => {
    try {
      const tokenDetails = (await getDetailedRefungibleTokenInfo(collection.id, token)) as any;
      const owner = tokenDetails.Owner.find((item: any) => item.owner.toString() === account);
      if (!owner) {
        return;
      }
      const balance = owner.fraction.toNumber() / Math.pow(10, collection.decimalPoints);
      console.log('balance', balance);
      setBalance(balance);
    } catch (e) {
      console.error('token balance calculation error', e);
    }
  }, []);

  useEffect(() => {
    void getTokenDetails();
  }, []);

  if (!balance && collection.isReFungible) {
    return <></>;
  }

  return (
    <div className='token-row' key={token}>
      <div className='token-image'>
        <a onClick={openDetailedInformationModal.bind(null, collection, token)}>
          <Item.Image size='mini' src={getTokenImageUrl(collection, token)} />
        </a>
      </div>
      <div className='token-name'>
        {collection.prefix} #{token.toString()}
      </div>
      { collection.isReFungible && (
        <div className='token-balance'>
          Balance: {balance}
        </div>
      )}
    </div>
  )
}

export default React.memo(NftTokenCard);
