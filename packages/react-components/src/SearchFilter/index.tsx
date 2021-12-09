// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { memo } from 'react';

import clearIcon from '@polkadot/app-accounts/Accounts/clearIcon.svg';
import searchIcon from '@polkadot/app-accounts/Accounts/searchIcon.svg';
import { Input } from '@polkadot/react-components';

interface Props {
  clearSearch: () => void;
  searchString: string;
  setSearchString: (str: string) => void;
}

function SearchFilter (props: Props): React.ReactElement<Props> {
  const { clearSearch, searchString, setSearchString } = props;

  return (
    <Input
      autoFocus
      className='isSmall'
      icon={
        <img
          alt='search'
          className='search-icon'
          src={searchIcon as string}
        />
      }
      onChange={setSearchString}
      placeholder='Search by account name'
      value={searchString}
      withLabel
    >
      { searchString?.length > 0 && (
        <img
          alt='clear'
          className='clear-icon'
          onClick={clearSearch}
          src={clearIcon as string}
        />
      )}
    </Input>
  );
}

export default memo(SearchFilter);
