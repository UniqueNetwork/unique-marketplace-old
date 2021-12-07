// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback} from 'react';
import {Icon} from "@polkadot/react-components";

type HeaderDef = [React.ReactNode?, string?, number?, (() => void)?, string?];

interface Props {
  className?: string;
  filter?: React.ReactNode;
  header?: (null | undefined | HeaderDef)[];
  sortedValue?: [string, string];
  isEmpty: boolean;
  onSort?: (value: string) => void;
}

function Head ({ className = '', filter, header, isEmpty, sortedValue, onSort }: Props): React.ReactElement<Props> | null {
  if (!header?.length) {
    return null;
  }

  const _onClick = useCallback((onClick?: () => void, sortableBy?: string) => {
    onClick && onClick();
    sortableBy && onSort && onSort(sortableBy);
  }, []);


  return (
    <thead className={className}>
      {filter && (
        <tr className='filter'>
          <th colSpan={100}>{filter}</th>
        </tr>
      )}
      <tr>
        {header.filter((h): h is HeaderDef => !!h).map(([label, className = 'default', colSpan = 1, onClick, sortableBy], index) =>
          <th
            className={[className, sortableBy && 'sortable'].join(' ')}
            colSpan={colSpan}
            key={index}
            onClick={_onClick.bind(null, onClick, sortableBy)}
          >
            {index === 0
              ? (
                <span>{ label }</span>
              )
              : isEmpty
                ? ''
                : label
            }
            {sortableBy && sortedValue && sortableBy === sortedValue[1] && <span className={'order'}><Icon icon={sortedValue[0] === 'asc' ? 'long-arrow-alt-up' : 'long-arrow-alt-down'} /></span>}
          </th>
        )}
      </tr>
    </thead>
  );
}

export default React.memo(Head);
