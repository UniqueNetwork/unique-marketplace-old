// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';

// local imports and components
import { AppProps as Props } from '@polkadot/react-components/types';

function Faq (): React.ReactElement<Props> {
  return (
    <main className='faq-page'>
      <Header as='h1'>FAQ</Header>
      <div className='faq'>
        <Header as='h4'>Q: How can I connect my wallet?</Header>
        <p>A: You can use either <a href='https://polkadot.js.org/extension/'>https://polkadot.js.org/extension/</a> or the market `Accounts` page. Restore your wallet through the seed phrase, JSON file+password or QR code.</p>
        <p>Make sure that using Chrome or Firefox desktop with the Polkadot.js browser extension you’ve set your wallet account setting to `allow use on any chain`.</p>
        <p>Note that this option is not available to Ledger or TrustWallet users, their support will be added later. Rest assured your NFT is still safe in your wallet!</p>
        <Header as='h4'>Q: I connected the right wallet to the app but it shows that my SubstraPunk|Chelobrick belongs to a different address. Why?</Header>
        <p>A: Substrate account addresses (Polkadot, Kusama etc.) may look different on different networks but they have all the same private key underneath. You can see all transformations of any address on <a href='https://polkadot.subscan.io/tools/ss58_transform'>https://polkadot.subscan.io/tools/ss58_transform</a></p>
        <Header as='h4'>Q: How can I create a wallet?</Header>
        <p>A: You can use either <a href='https://polkadot.js.org/extension/'>https://polkadot.js.org/extension/</a> or the market ‘Accounts’ page and follow the instructions. </p>
        <p>Keep your wallet seed phrase safe! Write it down on paper or export the JSON key with a password you would never forget.</p>
        <Header as='h4'>Q: How can I get KSM to my account?</Header>
        <p>A: You need to transfer (withdraw) from the other wallet or exchange. To do that:</p>
        <ol>
          <li>Copy your address at the marketplace (click on the icon at the top right corner);</li>
          <li>Go to the <a href='https://polkadot.subscan.io/tools/ss58_transform'>https://polkadot.subscan.io/tools/ss58_transform</a> and transform your address;</li>
          <li>Copy your address at Kusama network;</li>
          <li>Use this Kusama address to send KSM from any wallet or exchange;</li>
        </ol>
        <Header as='h4'>Q: I see my NTF on the My tokens page twice and one of them is `on hold`</Header>
        <p>A: It can happen if the previous version of the market had information about an unfinished listing. In that case:</p>
        <ol>
          <li>Go to the page of ‘on hold’ token and complete listing;</li>
          <li>Then delist this token;</li>
        </ol>
        <Header as='h4'>Q: I see the error `1010: Invalid Transaction: Inability to pay some fees, e.g. account balance too low`</Header>
        <p>A: Just wail for half a minute and try again</p>
        <Header as='h4'>Q: I am trying to buy an NFT, but I am seeing the other owner and the “Withdraw your KSM” button on the header is active. Why?</Header>
        <p>A: Unfortunately someone has beaten you in buying the same NFT, but you can either withdraw your KSM back to your wallet or leave it in the deposit balance to use in future purchases.</p>

        <Header as='h4'>Q: How to transfer KSM to the other wallet or exchange?</Header>
        <p>A: KSM that you use and see on the marketplace is on your Kusama (Substrate) account, you don't have to withdraw it. You can interact with your wallet using any Polkadot/Kusama network tool.
              To transfer KSM to the other wallet or exchange:</p>
        <ol>
          <li>Go to 'Accounts' at <a href='https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama-rpc.polkadot.io#/accounts'>https://polkadot.js.org/apps/accounts</a></li>
          <li> Restore your wallet through the seed phrase, JSON file+password or QR code.Make sure that using Chrome or Firefox desktop with the Polkadot.js browser extension you’ve set your wallet account setting to 'allow use on any chain'.</li>
          <li>Send KSM anywhere you want</li>
        </ol>

      </div>
    </main>
  );
}

export default React.memo(Faq);
