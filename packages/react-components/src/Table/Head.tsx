// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

type HeaderDef = [React.ReactNode?, string?, number?, (() => void)?];

interface Props {
  className?: string;
  filter?: React.ReactNode;
  header?: (null | undefined | HeaderDef)[];
  isEmpty: boolean;
}

function Head ({ className = '', filter, header, isEmpty }: Props): React.ReactElement<Props> | null {
  if (!header?.length) {
    return null;
  }

  return (
    <thead className={className}>
      {filter && (
        <tr className='filter'>
          <th colSpan={100}>{filter}</th>
        </tr>
      )}
      <tr>
        {header.filter((h): h is HeaderDef => !!h).map(([label, className = 'default', colSpan = 1, onClick], index) =>
          <th
            className={className}
            colSpan={colSpan}
            key={index}
            onClick={onClick}
          >
            {index === 0
              ? (
                <span>{ label }</span>
              )
              : isEmpty
                ? ''
                : label
            }
          </th>
        )}
      </tr>
    </thead>
  );
}

export default React.memo(Head);
