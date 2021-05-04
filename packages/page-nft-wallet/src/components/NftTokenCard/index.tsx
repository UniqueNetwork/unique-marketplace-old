// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Item from 'semantic-ui-react/dist/commonjs/views/Item';

import { useSchema } from '@polkadot/react-hooks';
import { TypeRegistry } from '@polkadot/types';

interface Props {
  account: string;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  localRegistry?: TypeRegistry;
  openTransferModal: (collection: NftCollectionInterface, tokenId: string, balance: number) => void;
  shouldUpdateTokens: string | undefined;
  token: string;
}

function NftTokenCard ({ account, canTransferTokens, collection, localRegistry, openTransferModal, token }: Props): React.ReactElement<Props> {
  const { attributes, reFungibleBalance, tokenUrl } = useSchema(account, collection.id, token, localRegistry);
  const history = useHistory();

  const openDetailedInformationModal = useCallback((collectionId: string | number, tokenId: string) => {
    history.push(`/wallet/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const editToken = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/wallet/manage-token?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const attrebutesToShow = useMemo(() => {
    if (attributes) {
      return [...Object.keys(attributes).map((attr: string) => {
        if (attr.toLowerCase().includes('hash')) {
          return `${attr}: ${(attributes[attr] as string).substring(0, 8)}...`;
        }

        return `${attr}: ${(attributes[attr] as string)}`;
      })].join(', ');
    }

    return '';
  }, [attributes]);

  const canEditToken = true;

  if (!reFungibleBalance && collection?.Mode?.reFungible) {
    return <></>;
  }

  return (
    <tr
      className='token-row'
      key={token}
    >
      <td className='token-image'>
        <a onClick={openDetailedInformationModal.bind(null, collection.id, token)}>
          { tokenUrl && (
            <Item.Image
              size='mini'
              src={tokenUrl}
            />
          )}
        </a>
      </td>
      <td className='token-name'>
        #{token.toString()}
      </td>
      <td className='token-balance'>
        { collection && Object.prototype.hasOwnProperty.call(collection.Mode, 'reFungible') && <span>Balance: {reFungibleBalance}</span> }
      </td>
      <td className='token-attributes'>
        { attributes && Object.values(attributes).length > 0 && attrebutesToShow}
      </td>
      <td className='token-actions'>
        <Button
          disabled={!canTransferTokens}
          onClick={openTransferModal.bind(null, collection, token, reFungibleBalance)}
          primary
        >
          Transfer token
        </Button>
        { canEditToken && (
          <Button
            disabled={!canTransferTokens}
            onClick={editToken.bind(null, collection.id, token)}
            primary
          >
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}

export default React.memo(NftTokenCard);
