// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionsProps } from './types';

import React from 'react';

import Button from '../Button';

function Actions ({ children, className = '' }: ActionsProps) {
  return (
    <div className={className}>
      <Button.Group>
        {children}
      </Button.Group>
    </div>
  );
}

export default React.memo(Actions);
