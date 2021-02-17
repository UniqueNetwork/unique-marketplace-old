import React, { memo } from 'react';
import Step from 'semantic-ui-react/dist/commonjs/elements/Step';
import './styles.scss';

interface StepProps {
  step: number;
}

const BuySteps: React.FC<StepProps> = ({ step }) => {
  return (
    <div className='buy-steps' id='buy-steps'>
      <h3 id="tradeTitle">Buying this NFT</h3>
      <Step.Group ordered>
        <Step active={step === 1} completed={step > 1}>
          <Step.Content>
            <Step.Title>Send KSM to Escrow</Step.Title>
          </Step.Content>
        </Step>

        <Step active={step === 2} completed={step > 2}>
          <Step.Content>
            <Step.Title>Wait for Deposit Registry</Step.Title>
          </Step.Content>
        </Step>

        <Step active={step === 3} completed={step > 3}>
          <Step.Content>
            <Step.Title>Exchange KSM for NFT</Step.Title>
          </Step.Content>
        </Step>
      </Step.Group>
    </div>
  )
};

export default memo(BuySteps);
