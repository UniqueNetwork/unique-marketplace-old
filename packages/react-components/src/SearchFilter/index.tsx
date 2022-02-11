// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo } from 'react';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';
import styled from 'styled-components';

import clearIcon from '@polkadot/app-accounts/Accounts/clearIcon.svg';
import searchIcon from '@polkadot/app-accounts/Accounts/searchIcon.svg';
import { Input } from '@polkadot/react-components';

interface Props {
  className?: string;
  clearSearch: () => void;
  loading?: boolean;
  searchString: string;
  setSearchString: (str: string) => void;
  placeholder: string;
}

function SearchFilter (props: Props): React.ReactElement<Props> {
  const { className, clearSearch, loading, searchString, setSearchString, placeholder } = props;

  return (
    <Input
      autoFocus
      className={`${className} isSmall`}
      icon={
        <img
          alt='search'
          className='search-icon'
          src={searchIcon as string}
        />
      }
      onChange={setSearchString}
      placeholder={placeholder}
      value={searchString}
      withLabel
    >
      { loading && (
        <Loader
          active
          inline='centered'
          key='loading-search'
        />
      )}
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

export default memo(styled(SearchFilter)`
  .search-icon {
    position: absolute;
    margin: 6px var(--gap);
    width: 25px;
    height: 25px;
  }

  .clear-icon {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 15px;
    transform: translateY(calc(100% - 16px));
  }

  .ui.centered.inline.loader {
    position: absolute;
    left: calc(100% - 40px);
    top: 7px;

    &:after, &:before {
      left: 0;
    }
  }
`);
