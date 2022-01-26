// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useCallback } from 'react';

import { useCollectionCover, useDecoder } from '@polkadot/react-hooks';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

interface Props {
  collection: NftCollectionInterface;
  collectionsChecked: string[];
  filterCurrent: (id: string) => void;
  onCheckBoxMockFunc: () => void;
}

const FilterContainerItem: React.FC<Props> = (props: Props) => {
  const { collection, collectionsChecked, filterCurrent, onCheckBoxMockFunc } = props;
  const { imgUrl } = useCollectionCover(collection);
  const { collectionName16Decoder } = useDecoder();

  const onFilterCurrent = useCallback(() => {
    filterCurrent(collection.id);
  }, [collection, filterCurrent]);

  return (
    <div
      className={`collections-main ${collectionsChecked.includes(collection.id) ? 'collections-main-background' : ''}`}
      key={collection.id}
      onClick={onFilterCurrent}
    >
      <div className='custom-checkbox'>
        <div className='checkbox-input'>
          <input
            checked={collectionsChecked.includes(collection.id)}
            data-current={collection.id}
            onChange={onCheckBoxMockFunc}
            type='checkbox'
          />
        </div>
        <div className='checkbox-title'>{collectionName16Decoder(collection.name)}</div>
      </div>
      <div
        className='collection-img'
        style={ { backgroundImage: `url(${imgUrl || ''})` }}
      />
    </div>
  );
};

export default memo(FilterContainerItem);
