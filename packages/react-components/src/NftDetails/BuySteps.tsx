// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { memo } from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import Step from './Step';

interface StepProps {
  step: number;
}

const BuySteps: React.FC<StepProps> = ({ step }) => {
  return (
    <div
      className='buy-steps'
      id='buy-steps'>
      <Header as='h3'>Buying this NFT</Header>
      <div className='steps'>
        <Step
          active={step === 1}
          completed={step > 1}
          inactive={step < 1}
          numb={1}
          text='Send KSM to Escrow'
        />
        <Step
          active={step === 2}
          completed={step > 2}
          inactive={step < 2}
          numb={2}
          text='Wait for Deposit Registry'
        />
        <Step
          active={step === 3}
          completed={step > 3}
          inactive={step < 3}
          numb={3}
          text='Exchange KSM for NFT'
        />
      </div>
    </div>
  );
};

export default memo(BuySteps);
