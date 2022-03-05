// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, ReactElement } from 'react';
import styled from 'styled-components';

import infoIcon from './infoIcon.svg';
import warningIcon from './warningIcon.svg';

interface WarningTextProps {
  className: string;
  text: string | React.ReactNode;
}

function WarningText ({ className = 'info', text }: WarningTextProps): ReactElement {
  return (
    <div className={`warning-text ${className}`}>
      <img
        alt='info-icon'
        src={(className.includes('info') ? infoIcon : warningIcon) as string}
      />
      {text}
    </div>
  );
}

export default memo(styled(WarningText)`
  display: flex;
  background-color: var(--modal-warning-background-color);
  align-items: center;
  padding: calc(var(--gap) / 2);
  border-radius: calc(var(--gap) / 4);
  margin: calc((var(--gap) / 2) * 3) 0;

  font-family: var(--font-roboto);
  font-size: 14px;
  line-height: 22px;
  margin-bottom: 0;

  &.warning {
    color: var(--warning-text-color);
    background-color: var(--warning-background-color);
  }

  &.info {
    color: var(--info-text-color);
    background-color: var(--info-background-color);
  }

  &.no-margin {
    margin: 0;
  }

  a {
    margin: 0 calc(var(--gap) / 2);
  }

  img {
    margin: 0 calc(var(--gap) / 2);
  }
`);
