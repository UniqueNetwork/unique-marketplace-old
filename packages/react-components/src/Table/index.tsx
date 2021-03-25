// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

import Body from './Body';
import Foot from './Foot';
import Head from './Head';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  empty?: React.ReactNode | false;
  emptySpinner?: React.ReactNode;
  filter?: React.ReactNode;
  footer?: React.ReactNode;
  header?: [React.ReactNode?, string?, number?, (() => void)?][];
  isFixed?: boolean;
  legend?: React.ReactNode;
}

function extractKids (children: React.ReactNode): [boolean, React.ReactNode] {
  if (!Array.isArray(children)) {
    return [!children, children];
  }

  const kids = children.filter((child) => !!child);
  const isEmpty = kids.length === 0;

  return [isEmpty, isEmpty ? null : kids];
}

function Table ({ children, className = '', empty, emptySpinner, filter, footer, header, isFixed, legend }: TableProps): React.ReactElement<TableProps> {
  const [isEmpty, kids] = extractKids(children);

  return (
    <div className={`ui--Table ${className}`}>
      {legend}
      <table className={`${(isFixed && !isEmpty) ? 'isFixed' : 'isNotFixed'} highlight--bg-faint`}>
        <Head
          filter={filter}
          header={header}
          isEmpty={isEmpty}
        />
        <Body
          empty={empty}
          emptySpinner={emptySpinner}
        >
          {kids}
        </Body>
        <Foot
          footer={footer}
          isEmpty={isEmpty}
        />
      </table>
    </div>
  );
}

export default React.memo(styled(Table)`
  max-width: 100%;
  width: 100%;
  padding: var(--gap);
  background-color: var(--white-color);

  table {
    border-spacing: 0;
    max-width: 100%;
    overflow: hidden;
    position: relative;
    width: 100%;
    font: 400 16px/24px var(--font-roboto);
    z-index: 1;

    th {
      font: 500 16px/24px var(--font-roboto);
    }

    &.isFixed {
      table-layout: fixed;
    }

    tr {
      max-width: 100%;
      width: 100%;

      td,
      &:not(.filter) th {

        &.all {
          width: 100%;

          summary {
            white-space: normal;
          }
        }
      }
    }
  }
`);
