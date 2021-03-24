// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { ReactText } from 'react';
import { Tab } from 'semantic-ui-react';

import { Table } from '@polkadot/react-components';

interface Props {
  children: React.ReactNode | React.ReactNode[];
  empty?: string;
  header: ReactText[][];
}

function ListComponent (props: Props): React.ReactElement<Props> {
  const { children, empty, header } = props;

  const panes = [
    {
      menuItem: 'My trades'
    },
    {
      menuItem: 'All trades'
    }
  ];

  return (
    <div className='list-component'>
      <Tab
        panes={panes}
      />
      <Table
        empty={empty || 'No items'}
        header={header}
      >
        {children}
      </Table>
    </div>
  );
}

export default React.memo(ListComponent);
