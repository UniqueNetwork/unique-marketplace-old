// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { memo, useCallback, useState } from 'react';

import closeIcon from './closeIcon.svg';

function EnumInput (): React.ReactElement {
  const [allEnums, setAllEnums] = useState<string[]>([
    'Yellow jacket',
    'Pink cap'
  ]);
  const [currentEnum, setCurrentEnum] = useState<string>('');

  const addItem = useCallback(() => {
    if (!currentEnum) {
      return;
    }

    if (!allEnums.find((item: string) => item.toLowerCase() === currentEnum.toLowerCase())) {
      setAllEnums([
        ...allEnums,
        currentEnum
      ]);
      setCurrentEnum('');
    } else {
      alert('Warning. You are trying to add already existed item');
    }
  }, [allEnums, currentEnum]);

  const deleteItem = useCallback((enumItem: string) => {
    console.log('deleteItem');
    setAllEnums((prevState: string[]) => prevState.filter((item: string) => item.toLowerCase() !== enumItem.toLowerCase()));
  }, []);

  const changeCurrentEnum = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentEnum(e.target.value);
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('do validate');
      addItem();
    }
  }, [addItem]);

  console.log('allEnums', allEnums);

  return (
    <div className='enum-input'>
      <div className='enum-input--content'>
        { allEnums.map((enumItem: string) => (
          <div
            className='enum-input--item'
            key={enumItem}
          >
            {enumItem}
            <img
              alt='delete item'
              onClick={deleteItem.bind(null, enumItem)}
              src={closeIcon as string}
            />
          </div>
        ))}
        <input
          className='enum-input--input'
          onBlur={addItem}
          onChange={changeCurrentEnum}
          onKeyDown={onKeyDown}
          type='text'
          value={currentEnum}
        />
      </div>
    </div>
  );
}

export default memo(EnumInput);
