// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { memo, useCallback, useState } from 'react';

// import { Popup } from '@polkadot/react-components';
import closeIcon from './closeIcon.svg';

interface Props {
  isDisabled?: boolean;
  setValues: (values: string[]) => void;
  values: string[];
}

function EnumInput ({ isDisabled, setValues, values }: Props): React.ReactElement {
  // const [allEnums, setAllEnums] = useState<string[]>(values);
  const [currentEnum, setCurrentEnum] = useState<string>('');

  const addItem = useCallback(() => {
    if (!currentEnum) {
      return;
    }

    if (currentEnum.length && !values.find((item: string) => item.toLowerCase() === currentEnum.toLowerCase())) {
      setValues([
        ...values,
        currentEnum
      ]);
      setCurrentEnum('');
    } else {
      alert('Warning. You are trying to add already existed item');
      setCurrentEnum('');
    }
  }, [currentEnum, setValues, values]);

  const deleteItem = useCallback((enumItem: string) => {
    if (isDisabled) {
      return;
    }

    setValues(values.filter((item: string) => item.toLowerCase() !== enumItem.toLowerCase()));
  }, [isDisabled, setValues, values]);

  const changeCurrentEnum = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentEnum(e.target.value);
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addItem();
    }
  }, [addItem]);

  return (
    <div className='enum-input'>
      <div className='enum-input--content'>
        <div className='enum-input--content--elements'>
          { values.map((enumItem: string) => (
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
            /* <Popup
              basic
              key={enumItem}
              style={{ top: '-50px' }}
              trigger={
                <div
                  className='enum-input--item'
                >
                  {enumItem}
                  <img
                    alt='delete item'
                    onClick={deleteItem.bind(null, enumItem)}
                    src={closeIcon as string}
                  />
                </div>
              }
            >
              popup content
            </Popup> */
          ))}
        </div>
        <input
          className='enum-input--input'
          disabled={isDisabled}
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
