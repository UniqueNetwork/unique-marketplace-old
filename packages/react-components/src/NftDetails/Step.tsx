// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { memo } from 'react';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import completeStep from '@polkadot/react-components/NftDetails/completeStep.svg';

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
        <Image
          className='go-back'
          src={completeStep}
        />
      )}
      <span>{text}</span>
    </div>
  );
};

export default memo(Step);
