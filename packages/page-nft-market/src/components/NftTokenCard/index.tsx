// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { OfferType } from '@polkadot/react-hooks/useCollections';

import React, { useEffect } from 'react';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Card from 'semantic-ui-react/dist/commonjs/views/Card';

import { useSchema } from '@polkadot/react-hooks';
import { formatKsmBalance } from '@polkadot/react-hooks/useKusamaApi';
import { AttributesDecoded } from '@polkadot/react-hooks/useSchema';
import { TypeRegistry } from '@polkadot/types';

import Arrow from '../../../../apps/public/icons/arrowRight.svg';

interface Props {
  account: string;
  collectionId: string;
  localRegistry?: TypeRegistry;
  onSetTokenAttributes?: (collectionId: string, tokenId: string, attributes: AttributesDecoded) => void;
  openDetailedInformationModal: (collectionId: string, tokenId: string) => void;
  token: OfferType;
}

const NftTokenCard = ({ account, collectionId, localRegistry, onSetTokenAttributes, openDetailedInformationModal, token }: Props): React.ReactElement<Props> => {
  const { attributes, tokenUrl } = useSchema(account, collectionId, token.tokenId, localRegistry);

  useEffect(() => {
    if (attributes && onSetTokenAttributes) {
      onSetTokenAttributes(collectionId, token.tokenId, attributes);
    }
  }, [attributes, collectionId, onSetTokenAttributes, token]);

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
          <Card.Description>
            { attributes && attributes.NameStr && (
              <div className='card-name'>
                <div className='card-name__title'>Name</div>
                <div className='card-name__field'>{attributes.NameStr}</div>
              </div>
            )}
            <div className='card-price'>
              <div className='card-price__title'>Price</div>
              <div className='card-price__field'>{formatKsmBalance(token.price)} KSM</div>
            </div>
          </Card.Description>
          <Card.Meta>
            <span className='link'>View
              <Image
                src={Arrow}
              />
            </span>
          </Card.Meta>
        </Card.Content>
      )}
    </Card>
  );
};

export default React.memo(NftTokenCard);
