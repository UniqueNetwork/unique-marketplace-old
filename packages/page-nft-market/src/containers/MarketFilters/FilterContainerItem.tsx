// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useCallback } from 'react';

import { useDecoder } from '@polkadot/react-hooks';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

interface Props {
  collection: NftCollectionInterface;
  collections: NftCollectionInterface[];
  collectionsChecked: string[];
  filterCurrent: (id: string) => void;
  images: string[];
  index: number;
  onCheckBoxMockFunc: () => void;
}

const FilterContainerItem: React.FC<Props> = (props: Props) => {
  const { collection, collections, collectionsChecked, filterCurrent, images, index, onCheckBoxMockFunc } = props;
  const { collectionName16Decoder } = useDecoder();

  const onFilterCurrent = useCallback(() => {
    filterCurrent(collection.id);
  }, [collection, filterCurrent]);

  return (
    <div
      className={`collections-main ${collectionsChecked.includes(String(collection.id)) ? 'collections-main-background' : ''}`}
      key={collection.id}
      onClick={onFilterCurrent}
    >
      <div className='custom-checkbox'>
        <div className='checkbox-input'>
          <input
            checked={collectionsChecked.includes(String(collection.id))}
            data-current={collection.id}
            onChange={onCheckBoxMockFunc}
            type='checkbox'
          />
        </div>
        <div className='checkbox-title'>{collectionName16Decoder(collection.Name)}</div>
      </div>
      { images.length === collections.length && images[index] !== '' && (
        <div
          className='collection-img'
          style={ { backgroundImage: `url(${images.length === collections.length ? images[index] : ''})` }}
        />
      )}
    </div>
  );
};

export default memo(FilterContainerItem);
