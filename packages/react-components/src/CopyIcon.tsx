// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo } from 'react';

interface Props {
  color?: string;
}

function CopyIcon ({ color = 'var(--title-color)' }: Props): React.ReactElement<Props> {
  return (
    <svg fill='none'
      height='24'
      viewBox='0 0 24 24'
      width='24'
      xmlns='http://www.w3.org/2000/svg'>
      <path clipRule='evenodd'
        d='M7.5 3.74927C7.5 3.33505 7.83579 2.99927 8.25 2.99927H20.25C20.6642 2.99927 21 3.33505 21 3.74927V15.7493C21 16.1635 20.6642 16.4993 20.25 16.4993H15.75C15.3358 16.4993 15 16.1635 15 15.7493C15 15.3351 15.3358 14.9993 15.75 14.9993H19.5V4.49927H9V8.24927C9 8.66348 8.66421 8.99927 8.25 8.99927C7.83579 8.99927 7.5 8.66348 7.5 8.24927V3.74927Z'
        fill={color}
        fillRule='evenodd' />
      <path clipRule='evenodd'
        d='M3 8.24951C3 7.8353 3.33579 7.49951 3.75 7.49951H15.75C16.1642 7.49951 16.5 7.8353 16.5 8.24951V20.2495C16.5 20.6637 16.1642 20.9995 15.75 20.9995H3.75C3.33579 20.9995 3 20.6637 3 20.2495V8.24951ZM4.5 8.99951V19.4995H15V8.99951H4.5Z'
        fill={color}
        fillRule='evenodd' />
    </svg>
  );
}

export default memo(CopyIcon);
