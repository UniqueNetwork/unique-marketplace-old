// Copyright 2020 UseTech authors & contributors

// global app props and types
import { NftCollectionInterface } from '@polkadot/react-hooks';

// external imports
import React, {memo, ReactElement, useState} from 'react';
import { Route, Switch } from 'react-router-dom'
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import { Table, AccountSelector } from '@polkadot/react-components';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';

// local imports and components
import NftDetailsModal from '../../components/NftDetailsModal';
import NftCollectionCardForSale from '../../components/NftCollectionCardForSale';
import './styles.scss';

interface BuyTokensProps {
  className?: string;
}

const collectionsForSale: Array<NftCollectionInterface> = [
  {
    decimalPoints: 0,
    description: 'Remake of classic CryptoPunks game',
    id: 4,
    isReFungible: false,
    name: 'Substrapunks',
    offchainSchema: 'https://ipfs-gateway.usetech.com/ipns/QmaMtDqE9nhMX9RQLTpaCboqg7bqkb6Gi67iCKMe8NDpCE/images/punks/image{id}.pn',
    prefix: 'PNK'
  },
  {
    decimalPoints: 0,
    description: 'The NFT collection for artists to mint and display their work',
    id: 14,
    isReFungible: false,
    name: 'Unique Gallery',
    offchainSchema: 'https://uniqueapps.usetech.com/api/images/{id',
    prefix: 'GAL',
  }
];

const BuyTokens = ({ className }: BuyTokensProps): ReactElement<BuyTokensProps> => {
  const [account, setAccount] = useState<string | null>(null);

  return (
    <div className='nft-store'>
      <Header as='h2'>Buy Tokens</Header>
      <Grid className='account-selector'>
        <Grid.Row>
          <Grid.Column width={16}>
            <AccountSelector onChange={setAccount} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Table
              empty={'No collections added'}
              header={[]}
            >
              { collectionsForSale.map((collection) => (
                <tr key={collection.id}>
                  <td className='overflow'>
                    <NftCollectionCardForSale
                      account={account}
                      canTransferTokens
                      collection={collection}
                      openTransferModal={() => {}}
                      openDetailedInformationModal={() => {}}
                      shouldUpdateTokens={null}
                    />
                  </td>
                </tr>
              ))}
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      { account && (
        <Switch>
          <Route
            path="*/token-details"
            key="TokenDetailsModal"
          >
            <NftDetailsModal
              account={account}
            />
          </Route>
        </Switch>
      )}
    </div>
  )
};

export default memo(BuyTokens);

