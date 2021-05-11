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

interface Props {
  account: string;
  collectionId: string;
  onSetTokenAttributes?: (collectionId: string, tokenId: string, attributes: AttributesDecoded) => void;
  openDetailedInformationModal: (collectionId: string, tokenId: string) => void;
  token: OfferType;
}

const NftTokenCard = ({ account, collectionId, onSetTokenAttributes, openDetailedInformationModal, token }: Props): React.ReactElement<Props> => {
  const { attributes, tokenName, tokenUrl } = useSchema(account, collectionId, token.tokenId);

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
            {tokenName && (
              <div className='card-name'>
                <div className='card-name__title'>{tokenName.name}</div>
                <div className='card-name__field'>{tokenName.value}</div>
              </div>
            )}
            <div className='card-price'>
              <div className='card-price__title'>Price</div>
              <div className='card-price__field'>{formatKsmBalance(token.price)} KSM</div>
            </div>
          </Card.Description>
          <Card.Meta>
            <span className='link'>View
              <svg fill='none'
                height='16'
                viewBox='0 0 16 16'
                width='16'
                xmlns='http://www.w3.org/2000/svg'>
                <path d='M2.5 8H13.5'
                  stroke='var(--card-link-color)'
                  strokeLinecap='round'
                  strokeLinejoin='round'/>
                <path d='M9 3.5L13.5 8L9 12.5'
                  stroke='var(--card-link-color)'
                  strokeLinecap='round'
                  strokeLinejoin='round'/>
              </svg>
            </span>
          </Card.Meta>
        </Card.Content>
      )}
    </Card>
  );
};

export default React.memo(NftTokenCard);
