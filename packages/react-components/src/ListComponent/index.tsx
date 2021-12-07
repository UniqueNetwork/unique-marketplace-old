// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { ReactText } from 'react';
import {Table} from '@polkadot/react-components';


interface Props {
  children: React.ReactNode | React.ReactNode[];
  empty?: string;
  header: ReactText[][];
  sortedValue?: [string, string];
  onSort?: (value: string) => void;
}

function ListComponent (props: Props): React.ReactElement<Props> {
  const { children, empty, header, sortedValue, onSort} = props;

  return (
    <div className='list-component'>
      <Table
        empty={empty || 'No items'}
        header={header}
        sortedValue={sortedValue}
        onSort={onSort}
      >
        {children}
      </Table>
    </div>
  );
}

export default React.memo(ListComponent);
