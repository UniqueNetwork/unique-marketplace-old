// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { memo } from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Step from 'semantic-ui-react/dist/commonjs/elements/Step';

interface StepProps {
  step: number;
}

const BuySteps: React.FC<StepProps> = ({ step }) => {
  return (
    <div
      className='buy-steps'
      id='buy-steps'>
      <Header as='h3'>Buying this NFT</Header>
      <Step.Group ordered>
        <Step
          active={step === 4}
          completed={step > 4}
        >
          <Step.Content>
            <Step.Title>Send Funds to Escrow</Step.Title>
          </Step.Content>
        </Step>

        <Step
          active={step === 5}
          completed={step > 5}
        >
          <Step.Content>
            <Step.Title>Wait for Deposit Registry</Step.Title>
          </Step.Content>
        </Step>

        <Step
          active={step === 6}
          completed={step > 6}
        >
          <Step.Content>
            <Step.Title>Exchange Funds for NFT</Step.Title>
          </Step.Content>
        </Step>
      </Step.Group>
    </div>
  );
};

export default memo(BuySteps);
