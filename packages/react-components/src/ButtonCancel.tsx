// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import Button from './Button';

interface Props {
  className?: string;
  isDisabled?: boolean;
  label?: string;
  onClick: () => void;
  tabIndex?: number;
}

function ButtonCancel ({ className = '', isDisabled, label, onClick, tabIndex }: Props): React.ReactElement<Props> {
  return (
    <Button
      className={className}
      icon='times'
      isDisabled={isDisabled}
      label={label || 'Cancel'}
      onClick={onClick}
      tabIndex={tabIndex}
    />
  );
}

export default React.memo(ButtonCancel);
