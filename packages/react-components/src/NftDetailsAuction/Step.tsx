// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { memo } from 'react';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

interface StepProps {
  active: boolean;
  completed: boolean;
  inactive: boolean;
  numb: number;
  text: string;
}

const Step: React.FC<StepProps> = ({ active, completed, inactive, numb, text }: StepProps) => {
  return (
    <div className='step'>
      { inactive && (
        <div className='inactive'>{numb}</div>
      )}
      { active && (
        <Loader
          active
          inline='centered'
        >
        </Loader>
      )}
      { completed && (
        <svg fill='none'
          height='25'
          viewBox='0 0 25 25'
          width='25'
          xmlns='http://www.w3.org/2000/svg'>
          <circle cx='12.5'
            cy='12.5'
            fill='none'
            r='12'
            stroke='var(--card-link-color)'/>
          <path d='M19.1875 9.06299L11.3125 16.9376L7.375 13.0005'
            stroke='var(--card-link-color)'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.125'/>
        </svg>
      )}
      <span>{text}</span>
    </div>
  );
};

export default memo(Step);
