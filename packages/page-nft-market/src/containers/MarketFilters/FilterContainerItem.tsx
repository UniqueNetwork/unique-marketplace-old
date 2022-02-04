// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useCallback } from 'react';

import { useCollectionCover, useDecoder } from '@polkadot/react-hooks';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';
import { Checkbox } from '@polkadot/react-components';

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
      <Checkbox
        label={collectionName16Decoder(collection.name)}
        onChange={onCheckBoxMockFunc}
        value={collectionsChecked.includes(collection.id)}
      />
      <div
        className='collection-img'
        style={ { backgroundImage: `url(${imgUrl || ''})` }}
      />
    </div>
  );
};

export default memo(FilterContainerItem);
