// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ColumnsProps } from './types';

import React from 'react';
import styled from 'styled-components';

function Columns ({ children, className = '' }: ColumnsProps): React.ReactElement<ColumnsProps> {
  return (
    <div className={`ui--Modal-Columns ${className}`}>{children}</div>
  );
}

export default React.memo(styled(Columns)`
  align-items: center;
  display: flex;
  justify-content: space-between;

  &+& {
    margin-top: 0.25rem;
  }
`);
