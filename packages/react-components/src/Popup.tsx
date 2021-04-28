// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PopupProps } from 'semantic-ui-react';

import React from 'react';
import { Popup as SUIPopup } from 'semantic-ui-react';

interface Props {
  basic?: boolean;
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  offset?: PopupProps['offset'];
  on?: PopupProps['on'];
  onClose?: () => void;
  position?: PopupProps['position'];
  style?: PopupProps['style'];
  trigger?: React.ReactNode;
}

function Popup ({ basic, children, className = '', isOpen, offset, on = 'click', onClose, position = 'bottom right', style, trigger }: Props): React.ReactElement<Props> {
  return (
    <SUIPopup
      basic={basic}
      className={className}
      offset={offset}
      on={on}
      onClose={onClose}
      open={isOpen}
      position={position}
      style={style}
      trigger={trigger}
    >
      {children}
    </SUIPopup>
  );
}

export default React.memo(Popup);
