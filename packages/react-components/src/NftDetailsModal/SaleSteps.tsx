// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { memo } from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Step from 'semantic-ui-react/dist/commonjs/elements/Step';

interface StepProps {
  step: number;
}

const SaleSteps: React.FC<StepProps> = ({ step }) => {
  return (
    <div
      className='sale-steps'
      id='sale-steps'
    >
      <Header as='h3'>Selling this NFT</Header>
      <Step.Group ordered>
        <Step
          active={step === 1}
          completed={step > 1}
        >
          <Step.Content>
            <Step.Title>Send NFT to Escrow</Step.Title>
            {/* <Step.Description>Send NFT to Escrow</Step.Description> */}
          </Step.Content>
        </Step>

        <Step
          active={step === 2}
          completed={step > 2}
        >
          <Step.Content>
            <Step.Title>Wait for Deposit Registry</Step.Title>
          </Step.Content>
        </Step>

        <Step
          active={step === 3}
          completed={step > 3}
        >
          <Step.Content>
            <Step.Title>Set Price</Step.Title>
          </Step.Content>
        </Step>
      </Step.Group>
    </div>
  );
};

export default memo(SaleSteps);
