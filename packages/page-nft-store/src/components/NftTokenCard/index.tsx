// Copyright 2020 UseTech authors & contributors
import React, { useCallback, useEffect, useState } from 'react';
import Card from 'semantic-ui-react/dist/commonjs/views/Card';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
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
    <Card onClick={openDetailedInformationModal.bind(null, collection, token)} className='token-card' key={token}>
      <Image src={getTokenImageUrl(collection, token)} wrapped ui={false} />
      <Card.Content>
        <Card.Header>{collection.prefix} #{token.toString()}</Card.Header>
        <Card.Meta>
          <span className='date'>Some token info</span>
        </Card.Meta>
        <Card.Description>
          Some token description
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        { collection.isReFungible && (
          <a> className='token-balance'>
            Balance: {balance}
          </a>
        )}
      </Card.Content>
    </Card>
  )
}

export default React.memo(NftTokenCard);
