// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { memo } from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import Step from './Step';

interface StepsProps {
  step: number;
}

const SaleSteps: React.FC<StepsProps> = ({ step }) => {
  return (
    <div
      className='sale-steps'
      id='sale-steps'
    >
      <Header as='h3'>Listing this NFT</Header>
      <div className='steps'>
        <Step
          active={step === 1}
          completed={step > 1}
          inactive={step < 1}
          numb={1}
          text={'Send NFT to Escrow'}
        />
        <Step
          active={step === 2}
          completed={step > 2}
          inactive={step < 2}
          numb={2}
          text={'Wait for Deposit Registry'}
        />
        <Step
          active={step === 3}
          completed={step > 3}
          inactive={step < 3}
          numb={3}
          text={'Set Price'}
        />
      </div>
    </div>
  );
};

export default memo(SaleSteps);
