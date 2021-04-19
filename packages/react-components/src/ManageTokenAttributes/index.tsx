// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { AttributeType } from '../util/scaleUtils';

import React, {memo, useCallback, useEffect, useState} from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import { Dropdown, Input } from '@polkadot/react-components';
import { TypeRegistry } from '@polkadot/types';

export type TokenAttribute = {
  name: string;
  value?: string;
  values: string[];
}

interface Props {
  account?: string;
  localRegistry?: TypeRegistry;
}

function ManageTokenAttributes (props: Props): React.ReactElement<Props> {
  const [collectionAttributes, setCollectionAttributes] = useState<AttributeType[]>([{
    count: 'single',
    name: 'Path1',
    pluralName: 'Path1',
    type: 'Bytes',
    values: []
  },
  {
    count: 'single',
    name: 'Path2',
    pluralName: 'Paths2',
    type: '_enum',
    values: ['value1', 'value2', 'value3', 'value4']
  },
  {
    count: 'array',
    name: 'Path3',
    pluralName: 'Paths3',
    type: '_enum',
    values: ['value11', 'value22', 'value33', 'value44']
  }
  ]);
  const [tokenAttributes, setTokenAttributes] = useState<{ [key: string]: TokenAttribute }>({});

  const setAttributeValue = useCallback(() => {
    console.log('setAttributeValue');
  }, []);

  const presetTokenAttributes = useCallback(() => {
    if (collectionAttributes && collectionAttributes.length) {
      const tokenAttrs: {[key: string]: TokenAttribute} = {};

      collectionAttributes.forEach((collectionAttr: AttributeType) => {
        tokenAttrs[collectionAttr.name] = {
          name: collectionAttr.name,
          value: '',
          values: []
        };
      });

      setTokenAttributes(tokenAttrs);
    }
  }, [collectionAttributes]);

  useEffect(() => {
    presetTokenAttributes();
  }, [presetTokenAttributes]);

  return (
    <div className='manage-collection'>
      <Header as='h3'>Token attributes</Header>
      <Form className='manage-collection--form'>
        <Grid className='manage-collection--form--grid'>
          <Grid.Row>
            <Grid.Column width={8}>
              { Object.values(tokenAttributes).length > 0 && collectionAttributes.length > 0 && collectionAttributes.map((collectionAttribute: AttributeType) => (
                <Form.Field key={collectionAttribute.name}>
                  { collectionAttribute.type === 'Bytes' && (
                    <Input
                      className='isSmall'
                      onChange={setAttributeValue.bind(null, collectionAttribute.name)}
                      placeholder={`Enter ${collectionAttribute.name}, ${collectionAttribute.type}`}
                      value={tokenAttributes[collectionAttribute.name].value}
                    />
                  )}
                  { collectionAttribute.type === '_enum' && (
                    <Dropdown
                      isMultiple={collectionAttribute.count === 'array'}
                      onChange={setAttributeValue}
                      options={collectionAttribute.values.map((val) => ({ text: val, value: val }))}
                      placeholder='Select Attribute Type'
                      value={collectionAttribute.count === 'single' ? tokenAttributes[collectionAttribute.name].value : tokenAttributes[collectionAttribute.name].values}
                    />
                  )}
                </Form.Field>
              ))}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </div>
  );
}

export default memo(ManageTokenAttributes);
