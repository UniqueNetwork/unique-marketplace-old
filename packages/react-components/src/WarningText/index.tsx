// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { memo, ReactElement } from 'react';

import infoIcon from './infoIcon.svg';
import warningIcon from './warningIcon.svg';

interface WarningTextProps {
  color: 'info' | 'warning';
  text: string;
}

function WarningText ({ color = 'info', text }: WarningTextProps): ReactElement {
  return (
    <div className={`warning-text ${color}`}>
      <img
        alt='info-icon'
        src={(color === 'info' ? infoIcon : warningIcon) as string}
      />
      {text}
    </div>
  );
}

export default memo(WarningText);
