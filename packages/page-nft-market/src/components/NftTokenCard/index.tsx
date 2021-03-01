// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { OfferType } from '@polkadot/react-hooks/useCollections';

import React from 'react';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Card from 'semantic-ui-react/dist/commonjs/views/Card';
import { useSchema } from '@polkadot/react-hooks';

interface Props {
  account: string;
  collectionId: string;
  openDetailedInformationModal: (collectionId: string, tokenId: string) => void;
  token: OfferType;
}

const NftTokenCard = ({ account, collectionId, openDetailedInformationModal, token }: Props): React.ReactElement<Props> => {
  const { attributes, tokenUrl } = useSchema(account, collectionId, token.tokenId);

  return (
    <Card
      className='token-card'
      key={token.tokenId}
      onClick={openDetailedInformationModal.bind(null, collectionId, token.tokenId)}
    >
      { token && (
        <Image
          src={tokenUrl}
          ui={false}
          wrapped
        />
      )}
      { token && (
        <Card.Content>
          <Card.Header>{collectionId} #{token.tokenId}</Card.Header>
          <Card.Meta>
            { attributes && Object.values(attributes).length > 0 && (
              <p className='token-balance'>
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                Attributes: {Object.keys(attributes).map((attrKey) => (<span key={attrKey}>{attrKey}: {attributes[attrKey]}</span>))}
              </p>
            )}
          </Card.Meta>
          <Card.Description>
            Seller: {token.seller}
          </Card.Description>
        </Card.Content>
      )}
    </Card>
  );
};

export default React.memo(NftTokenCard);
