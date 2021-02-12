// Copyright 2020 UseTech authors & contributors
import React, { useCallback, useEffect } from 'react';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import { Button } from '@polkadot/react-components';
import { NftCollectionInterface } from '@polkadot/react-hooks';
import useSchema from '../../hooks/useSchema';

import './styles.scss';

interface Props {
  collection: NftCollectionInterface;
  closeModal: () => void;
  tokenId: string;
}

function TokenDetailsModal({ collection, closeModal, tokenId }: Props): React.ReactElement<Props> {
  const { tokenUrl } = useSchema(collection.id, tokenId);

  const getTokenDetails = useCallback(async () => {
    if ((!collection.id && collection.id !== 0) || (!tokenId && tokenId !== '0')) {
      return;
    }
  }, [collection.id, tokenId]);

  useEffect(() => {
    void getTokenDetails();
  }, []);

  return (
    <Modal className="token-details" size='tiny' open onClose={closeModal}>
      <Modal.Header>NFT Token Details</Modal.Header>
      <Modal.Content image>
        <img className='token-image' id="ItemPreview" src={tokenUrl} />
      </Modal.Content>
      <Modal.Actions>
        <Button
          icon='check'
          label='Ok'
          onClick={closeModal}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(TokenDetailsModal);
