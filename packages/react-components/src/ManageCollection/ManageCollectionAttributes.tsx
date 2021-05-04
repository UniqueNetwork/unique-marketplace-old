// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { useMemo } from 'react';
import Tab from 'semantic-ui-react/dist/commonjs/modules/Tab/Tab';

import { ProtobufAttributeType } from '@polkadot/react-components/util/protobufUtils';

import ManageOnChainSchema from './ManageOnChainSchema';

interface Props {
  account?: string;
  basePath: string;
  collectionId?: string;
  constOnChainSchema?: ProtobufAttributeType;
  fetchCollectionInfo: () => void;
  isAdmin?: boolean;
  saveConstOnChainSchema: (args: { account: string, collectionId: string, schema: string, successCallback?: () => void, errorCallback?: () => void }) => void;
  saveVariableOnChainSchema: (args: { account: string, collectionId: string, schema: string, successCallback?: () => void, errorCallback?: () => void }) => void;
  variableOnChainSchema?: ProtobufAttributeType;
}

function ManageCollectionAttributes (props: Props): React.ReactElement<Props> {
  const { account, collectionId, constOnChainSchema, fetchCollectionInfo, isAdmin, saveConstOnChainSchema, saveVariableOnChainSchema, variableOnChainSchema } = props;

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
          saveOnChainSchema={saveConstOnChainSchema}
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
          saveOnChainSchema={saveVariableOnChainSchema}
        />
      )
    }
  ], [account, collectionId, constOnChainSchema, fetchCollectionInfo, isAdmin, saveConstOnChainSchema, saveVariableOnChainSchema, variableOnChainSchema]);

  return (
    <div className='manage-collection-attributes'>
      <Tab
        panes={panes}
      />
    </div>
  );
}

export default React.memo(ManageCollectionAttributes);
