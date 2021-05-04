// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { useMemo } from 'react';
import Tab from 'semantic-ui-react/dist/commonjs/modules/Tab/Tab';

import ManageOnChainSchema from './ManageOnChainSchema';

interface Props {
  account?: string;
  basePath: string;
  collectionId?: string;
  constOnChainSchema?: string;
  fetchCollectionInfo: () => void;
  isAdmin?: boolean;
  variableOnChainSchema?: string;
}

function ManageCollectionAttributes (props: Props): React.ReactElement<Props> {
  const { account, collectionId, constOnChainSchema, fetchCollectionInfo, isAdmin, variableOnChainSchema } = props;

  const panes = useMemo(() => [
    {
      menuItem: 'ConstOnChainSchema',
      // eslint-disable-next-line react/display-name
      render: () => (
        <ManageOnChainSchema
          account={account}
          collectionId={collectionId}
          fetchCollectionInfo={fetchCollectionInfo}
          isAdmin={isAdmin}
          onChainSchema={constOnChainSchema}
          type={'const'}
        />
      )
    },
    {
      menuItem: 'VariableOnChainSchema',
      // eslint-disable-next-line react/display-name
      render: () => (
        <ManageOnChainSchema
          account={account}
          collectionId={collectionId}
          fetchCollectionInfo={fetchCollectionInfo}
          isAdmin={isAdmin}
          onChainSchema={variableOnChainSchema}
          type={'variable'}
        />
      )
    }
  ], [account, collectionId, constOnChainSchema, fetchCollectionInfo, isAdmin, variableOnChainSchema]);

  return (
    <div className='manage-collection-attributes'>
      <Tab
        panes={panes}
      />
    </div>
  );
}

export default React.memo(ManageCollectionAttributes);
