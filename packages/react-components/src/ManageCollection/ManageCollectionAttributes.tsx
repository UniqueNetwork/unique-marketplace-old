// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { useCallback, useEffect, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

// import Dropdown from 'semantic-ui-react/dist/commonjs/modules/Dropdown';
import { Dropdown, Input } from '@polkadot/react-components';

// type AttributeTypes = 'Bytes' | '_enum';

type TypeOption = {
  text: string;
  value: string;
}

const TypeOptions = [
  {
    text: 'string',
    value: 'Bytes'
  },
  {
    text: 'enumerable',
    value: '_enum'
  }
];

type AttributeType = {
  name: string;
  type: string;
  values: string[];
};

interface Props {
  account?: string;
}

// [{ name: 'Name1', type: '_enum', values: ['enum1', 'enum2'] }, { name: 'Name2', type: 'string' }];

function ManageCollectionAttributes (props: Props): React.ReactElement<Props> {
  const { account } = props;
  const [currentAttributeName, setCurrentAttributeName] = useState<string>('');
  const [currentAttributeNameError, setCurrentAttributeNameError] = useState<string>();
  const [currentAttributeType, setCurrentAttributeType] = useState<string>('Bytes');
  const [currentAttributeEnumValue, setCurrentAttributeEnumValue] = useState<string>('');
  const [currentAttributeEnumValueError, setCurrentAttributeEnumValueError] = useState<string>();
  const [currentAttributeValues, setCurrentAttributeValues] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<AttributeType[]>([]);

  const clearCurrentAttribute = useCallback(() => {
    setCurrentAttributeName('');
    setCurrentAttributeType('Bytes');
    setCurrentAttributeEnumValue('');
  }, []);

  const addAttribute = useCallback(() => {
    if (currentAttributeName && currentAttributeType && !attributes.find((item: AttributeType) => item.name === currentAttributeName)) {
      setAttributes((prevAttributes: AttributeType[]) => [...prevAttributes, { name: currentAttributeName, type: currentAttributeType, values: currentAttributeValues }]);
      clearCurrentAttribute();
      setCurrentAttributeNameError(undefined);
    } else {
      setCurrentAttributeNameError('You already have attribute with same name!');
    }
  }, [attributes, clearCurrentAttribute, currentAttributeName, currentAttributeType, currentAttributeValues]);

  const onSaveAll = useCallback(() => {
    console.log('onSaveAll');
  }, []);

  const onAddField = useCallback(() => {
    addAttribute();
  }, [addAttribute]);

  const addEnumValue = useCallback(() => {
    if (!currentAttributeValues.find((enumValue: string) => enumValue === currentAttributeEnumValue)) {
      setCurrentAttributeValues((prevState) => [...prevState, currentAttributeEnumValue]);
      setCurrentAttributeEnumValueError(undefined);
    } else {
      setCurrentAttributeEnumValueError('You already have attribute with same name!');
    }
  }, [currentAttributeEnumValue, currentAttributeValues]);

  const onAddEnumField = useCallback(() => {
    addEnumValue();
    setCurrentAttributeEnumValue('');
  }, [addEnumValue]);

  return (
    <div className='manage-collection'>
      <Header as='h3'>Manage collection ConstOnChainSchema</Header>
      { attributes.length > 0 && (
        <div className='attributes'>
          <div
            className='attribute'
          >
            <div>Name</div>
            <div>Type</div>
            <div>Enum</div>
          </div>
          { attributes.map((attribute) => (
            <div
              className='attribute'
              key={attribute.name}
            >
              <div>{attribute.name}</div>
              <div>{attribute.type}</div>
              <div>{attribute?.values.join(', ')}</div>
            </div>
          ))}
        </div>
      )}
      <Form className='manage-collection--form'>
        <div className='attribute-form'>
          <Form.Field>
            <Dropdown
              onChange={setCurrentAttributeType}
              options={TypeOptions}
              placeholder='Select Attribute Type'
              value={currentAttributeType}
            />
          </Form.Field>
          <Form.Field>
            <Input
              className='isSmall'
              isError={!!currentAttributeNameError}
              label='Please enter the Attribute name'
              onChange={setCurrentAttributeName}
              placeholder='Attribute name'
              value={currentAttributeName}
            />
            { currentAttributeNameError && (
              <div className='field-error'>
                {currentAttributeNameError}
              </div>
            )}
          </Form.Field>
          <Button
            content='+'
            disabled={!currentAttributeType || !currentAttributeName || (currentAttributeType === '_enum' && currentAttributeValues.length < 2)}
            onClick={onAddField}
          />
        </div>
        currentAttributeName: {currentAttributeName}
        currentAttributeType: {currentAttributeType}
        {currentAttributeType === '_enum' && (
          <div className='attribute-enum-form'>
            <Form.Field>
              <Input
                className='isSmall'
                isError={!!currentAttributeEnumValueError}
                label='Please enter an enum attribute'
                onChange={setCurrentAttributeEnumValue}
                placeholder='Enum attribute'
                value={currentAttributeEnumValue}
              />
              { currentAttributeEnumValueError && (
                <div className='field-error'>
                  {currentAttributeEnumValueError}
                </div>
              )}
            </Form.Field>
            <Form.Field>
              <Button
                content='+'
                onClick={onAddEnumField}
              />
            </Form.Field>
            Enum values: {currentAttributeValues.join(', ')}
          </div>
        )}
        <Form.Field>
          <Button
            content='Save'
            disabled={!attributes.length}
            onClick={onSaveAll}
          />
        </Form.Field>
      </Form>
    </div>
  );
}

export default React.memo(ManageCollectionAttributes);
