// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { AttributeType } from '../util/scaleUtils';

import React, { memo, useCallback, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import { Input } from '@polkadot/react-components';
import { TypeRegistry } from '@polkadot/types';

interface Props {
  account?: string;
  localRegistry?: TypeRegistry;
}

function ManageToken (props: Props): React.ReactElement<Props> {
  const [tokenAttributes, setTokenAttributes] = useState<AttributeType[]>([{
    count: 'single',
    name: 'Path1',
    pluralName: 'Path1',
    type: 'Bytes',
    values: []
  }]);

  const setAttributeValue = useCallback(() => {
    console.log('setAttributeValue');
  }, []);

  return (
    <div className='manage-collection'>
      <Header as='h3'>Token attributes</Header>
      <Form className='manage-collection--form'>
        <Grid className='manage-collection--form--grid'>
          <Grid.Row>
            <Grid.Column width={8}>
              <Form.Field>
                <Input
                  className='isSmall'
                  onChange={setAttributeValue}
                  placeholder={`Enter ${tokenAttributes[0].name}`}
                  value={name}
                />
              </Form.Field>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </div>
  );
}

export default memo(ManageToken);
