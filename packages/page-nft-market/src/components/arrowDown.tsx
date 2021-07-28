// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, ReactElement } from 'react';

const ArrowDown = ({ active }: { active?: boolean }): ReactElement => {
  return (
    <svg fill='none'
      height='12'
      viewBox='0 0 10 12'
      width='10'
      xmlns='http://www.w3.org/2000/svg'>
      <path clipRule='evenodd'
        d='M5 0C5.27614 0 5.5 0.223858 5.5 0.5V11.5C5.5 11.7761 5.27614 12 5 12C4.72386 12 4.5 11.7761 4.5 11.5V0.5C4.5 0.223858 4.72386 0 5 0Z'
        fill={active ? 'var(--link-color)' : 'var(--title-color)'}
        fillRule='evenodd'/>
      <path clipRule='evenodd'
        d='M0.146447 6.64645C0.341709 6.45118 0.658291 6.45118 0.853553 6.64645L5 10.7929L9.14645 6.64645C9.34171 6.45118 9.65829 6.45118 9.85355 6.64645C10.0488 6.84171 10.0488 7.15829 9.85355 7.35355L5.35355 11.8536C5.15829 12.0488 4.84171 12.0488 4.64645 11.8536L0.146447 7.35355C-0.0488155 7.15829 -0.0488155 6.84171 0.146447 6.64645Z'
        fill={active ? 'var(--link-color)' : 'var(--title-color)'}
        fillRule='evenodd'/>
    </svg>
  );
};

export default memo(ArrowDown);
