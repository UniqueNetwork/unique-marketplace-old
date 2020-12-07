import React from 'react';
import Step from 'semantic-ui-react/dist/commonjs/elements/Step';
import './styles.scss';


const TradeContainer = () => {
  return (
    <div className='trade-container' id='tradecontainer'>
      <h3 id="tradeTitle">Selling this NFT</h3>

      <Step.Group ordered>
        <Step completed>
          <Step.Content>
            <Step.Title>Send NFT to Escrow</Step.Title>
            {/*<Step.Description>Send NFT to Escrow</Step.Description>*/}
          </Step.Content>
        </Step>

        <Step completed>
          <Step.Content>
            <Step.Title>Wait for Deposit Registry</Step.Title>
          </Step.Content>
        </Step>

        <Step active>
          <Step.Content>
            <Step.Title>Set Price</Step.Title>
          </Step.Content>
        </Step>
      </Step.Group>

      <div id='trading'>
      </div>

      <Step.Group ordered>
        <Step completed>
          <Step.Content>
            <Step.Title>Send KSM to Escrow</Step.Title>
          </Step.Content>
        </Step>

        <Step completed>
          <Step.Content>
            <Step.Title>Wait for Deposit Registry</Step.Title>
          </Step.Content>
        </Step>

        <Step active>
          <Step.Content>
            <Step.Title>Exchange KSM for NFT</Step.Title>
          </Step.Content>
        </Step>
      </Step.Group>

      {/*<div className="container" id='sellProgress'>
        <ul className="progressbar">
          <li id="sell1">
            <div className='progressStatus'>Send NFT to Escrow</div>
          </li>
          <li id="sell2">
            <div className='progressStatus'>Wait for Deposit Registry</div>
          </li>
          <li id="sell3">
            <div className='progressStatus'>Set Price</div>
          </li>
        </ul>
      </div>*/}

      {/*<div className="container" id='buyProgress'>
        <ul className="progressbar">
          <li id="buy1">
            <div className='progressStatus'>Send KSM to Escrow</div>
          </li>
          <li id="buy2">
            <div className='progressStatus'>Wait for Deposit Registry</div>
          </li>
          <li id="buy3">
            <div className='progressStatus'>Exchange KSM for NFT</div>
          </li>
        </ul>
      </div>*/}
    </div>
  )
};

export default TradeContainer;
