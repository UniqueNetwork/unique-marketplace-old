// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import Item from 'semantic-ui-react/dist/commonjs/views/Item';

import { Tooltip } from '@polkadot/react-components';
import { useSchema } from '@polkadot/react-hooks';
import { HoldType } from '@polkadot/react-hooks/useCollections';

interface Props {
  account: string;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  onHold: HoldType[];
  openTransferModal: (collection: NftCollectionInterface, tokenId: string, balance: number) => void;
  token: string;
  tokensSelling: string[];
}

function NftTokenCard ({ account, canTransferTokens, collection, onHold, openTransferModal, token, tokensSelling }: Props): React.ReactElement<Props> {
  const { attributes, tokenUrl } = useSchema(account, collection.id, token);
  const [tokenState, setTokenState] = useState<'none' | 'selling' | 'onHold'>('none');
  const history = useHistory();

  const openDetailedInformationModal = useCallback((collectionId: string | number, tokenId: string) => {
    history.push(`/wallet/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const attrebutesToShow = useMemo(() => {
    if (attributes) {
      return [...Object.keys(attributes).map((attr: string) => {
        if (attr.toLowerCase().includes('hash')) {
          return `${attr}: ${(attributes[attr] as string).substring(0, 8)}...`;
        }

        if (Array.isArray(attributes[attr])) {
          return `${attr}: ${((attributes[attr] as string[]).join(', '))}`;
        }

        return `${attr}: ${(attributes[attr] as string)}`;
      })].join(', ');
    }

    return '';
  }, [attributes]);

  const updateTokenState = useCallback(() => {
    let tState: 'none' | 'selling' | 'onHold' = 'none';

    if (tokensSelling.indexOf(token) !== -1) {
      tState = 'selling';
    } else if (onHold.find((item) => item.tokenId === token)) {
      tState = 'onHold';
    }

    setTokenState(tState);
  }, [onHold, token, tokensSelling]);

  const onOpen = useCallback(() => {
    openDetailedInformationModal(collection.id, token);
  }, [collection, token, openDetailedInformationModal]);

  const onOpenTransfer = useCallback(() => {
    openTransferModal(collection, token, 1);
  }, [collection, token, openTransferModal]);

  useEffect(() => {
    updateTokenState();
  }, [updateTokenState]);

  return (
    <div
      className='token-row'
      key={token}
    >
      <div
        className='token-image'
        onClick={onOpen}
      >
        { tokenUrl && (
          <Item.Image
            size='mini'
            src={tokenUrl}
          />
        )}
      </div>
      <div
        className='token-info-attributes'
        onClick={onOpen}
      >
        <div className='token-name'>
          #{token.toString()}
        </div>
        <div className='token-attributes'>
          { attributes && Object.values(attributes).length > 0 && (
            <span>
              <strong>Attributes: </strong>{attrebutesToShow}
            </span>
          )}
        </div>
      </div>
      <div className='token-actions'>
        { canTransferTokens && tokenState === 'none' && (
          <>
            {/* <img
              alt={'add'}
              data-for='Transfer nft'
              data-tip='Transfer nft'
              onClick={onOpenTransfer}
              src={transfer as string}
              title='add'
            /> */}
            <Tooltip
              arrowColor={'transparent'}
              backgroundColor={'var(--border-color)'}
              place='bottom'
              text={'Transfer nft'}
              textColor={'var(--sub-header-text-transform)'}
              trigger={'Transfer nft'}
            />
          </>
        )}
        { tokenState === 'selling' && (
          <span className='token-state'>
            Selling
          </span>
        )}
        { tokenState === 'onHold' && (
          <span className='token-state'>
            On hold
          </span>
        )}
      </div>
    </div>
  );
}

export default React.memo(NftTokenCard);
