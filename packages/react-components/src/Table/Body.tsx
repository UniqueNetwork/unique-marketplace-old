// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

import { isString } from '@polkadot/util';

import Spinner from '../Spinner';

interface Props {
  children?: React.ReactNode;
  className?: string;
  empty?: React.ReactNode | false;
  emptySpinner?: React.ReactNode;
}

function Body ({ children, className = '', empty, emptySpinner }: Props): React.ReactElement<Props> {
  return (
    <tbody className={className}>
      {children || (
        <tr><td colSpan={100}>{
          isString(empty)
            ? <div className='empty'>{empty}</div>
            : empty || <Spinner label={emptySpinner} />
        }</td></tr>
      )}
    </tbody>
  );
}

export default React.memo(styled(Body)`
  position: relative;
  background: var(--bg-table);

      .trades-row:hover{
      background-color: #EBF8FF;
    }

  td {
    padding: calc(var(--gap) / 2) var(--gap);
    text-align: left;
    vertical-align: middle;
    border-bottom: 1px solid var(--bg-page);

    label {
      display: block !important;
      white-space: nowrap;
    }

    div.empty {
      opacity: 0.6;
      padding: 0.25rem;
    }

    .ui--Spinner {
      margin: 0 auto;

      .text {
        margin-bottom: 0;
      }
    }

    &.address {
      min-width: 11rem;
      overflow-x: hidden;
    }

    &.badge {
      padding: 0.5rem;
    }

    &.button {
      padding: 0.5rem;
      text-align: right;
      white-space: nowrap;

      > * {
        vertical-align: middle;
      }

      .ui--Toggle {
        display: inline-block;
        white-space: nowrap;

        label {
          display: inline-block !important;
        }
      }
    }

    &.combined {
      border-top-width: 0;
    }

    &.expand {
      &:not(.left) {
        text-align: right;
      }

      .ui--Expander+.ui--Expander {
        margin-top: 0.375rem;
      }
    }

    &.hash {
      font: var(--font-mono);
    }

    &.links {
      padding: 0.5rem 0.75rem;
      text-align: center;
      width: 0;
    }

    &.no-pad-left {
      padding-left: 0.125rem;
    }

    &.no-pad-right {
      padding-right: 0.125rem;
    }

    &.number {
      text-align: right;
    }

    &.relative {
      position: relative;
    }

    &.overflow {
      max-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;

    }
     &.tradeList {

      max-width:300px;
      white-space: nowrap;
      text-align: left;
      font-size:12px;
    }

     &.token-id:hover {
      cursor:pointer;
      color: #1DB0FF;
      text-decoration: underline;
    }
    &.box-buyer-seler{

    }

    &.start {
      text-align: left;
    }

    &.together {
      white-space: nowrap;
    }

    &.top {
      vertical-align: top;
    }

    &.middle {
      text-align: center;
    }

    &.mini {
      padding: 0 !important;
      width: fit-content;
      white-space: normal;

      > div {
        margin-right: 0.75rem;
        max-width: 3.8rem;
        min-width: 3.8rem;
      }
    }

    &.favorite .ui--Icon.isSelected {
      color: darkorange;
    }

    .ui--Button-Group .ui--Button:not(.isToplevel) {
      margin: 0;
    }
  }

  tr {

    &.transparent {
      background: transparent;
    }

    .ui--Button-Group {
      margin: 0;
    }

    .ui--Button:not(.isIcon):not(:hover) {
      background: transparent !important;
      box-shadow: none !important;
    }

    .ui.toggle.checkbox input:checked~.box:before,
    .ui.toggle.checkbox input:checked~label:before {
      background-color: #eee !important;
    }
     @media  (max-width: 1366px) {
        .date{
          width:190px;
        }
          .price{
          width:80px;
        }
    }
  }
`);
