// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { ReactText } from 'react';

// import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import { Table } from '@polkadot/react-components';

// import Arrow from './image/arrow.svg';

interface Props {
  children: React.ReactNode | React.ReactNode[];
  empty?: string;
  header: ReactText[][];
}

function ListComponent (props: Props): React.ReactElement<Props> {
  const { children, empty, header } = props;

  return (
    <div className='list-component'>
      <Table
        empty={empty || 'No items'}
        header={header}
      >
        {children}
      </Table>
      {/* <div className='pagination-trades'>
        <div className='pagination-trades__page'>
          On page: 4
          <a><Image src={Arrow} /></a>
        </div>
        <div className='pagination-trades__pagination'>
          1 of 4 page
          <div className='pagination-trades__arrows'>
            <a className='pagination-trades__back'>
              <Image src={Arrow} />
            </a>
            <a className='pagination-trades__forvard'>
              <Image src={Arrow} />
            </a>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default React.memo(ListComponent);
