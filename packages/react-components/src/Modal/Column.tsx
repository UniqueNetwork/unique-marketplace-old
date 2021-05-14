// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ColumnProps } from './types';

import React from 'react';

function Column ({ children, className = '' }: ColumnProps): React.ReactElement<ColumnProps> {
  return (
    <div className={`ui--Modal-Column ${className}`}>
      {children}
    </div>
  );
}

export default React.memo(Column);
