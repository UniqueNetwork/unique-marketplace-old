// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { AttributeItemType, FieldRuleType, FieldType, ProtobufAttributeType } from '../util/protobufUtils';

import React, { useCallback, useEffect, useState } from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import { Dropdown, Input } from '@polkadot/react-components';
import EnumsInput from '@polkadot/react-components/EnumsInput';
import { useMetadata } from '@polkadot/react-hooks';
import { TypeRegistry } from '@polkadot/types';

import protobufJsonExample from '../util/protobufJsonExample';
import close from './close.svg';
import floppy from './floppy.svg';
import pencil from './pencil.svg';
import plus from './plus.svg';
import trash from './trash.svg';

type TypeOption = {
  text: string;
  value: FieldType;
}

const TypeOptions: TypeOption[] = [
  {
    text: 'string',
    value: 'string'
  },
  {
    text: 'enumerable',
    value: 'enum'
  }
];

type CountOption = {
  text: string;
  value: FieldRuleType;
}

const CountOptions: CountOption[] = [
  {
    text: 'optional',
    value: 'optional'
  },
  {
    text: 'required',
    value: 'required'
  },
  {
    text: 'repeated',
    value: 'repeated'
  }
];

interface Props {
  account?: string;
  isAdmin?: boolean;
  localRegistry?: TypeRegistry;
}

function ManageCollectionAttributes (props: Props): React.ReactElement<Props> {
  const { isAdmin, localRegistry } = props;
  const [attributes, setAttributes] = useState<AttributeType[]>([]);

  const [currentAttributeName, setCurrentAttributeName] = useState<string>('');
  const [currentAttributePluralName, setCurrentAttributePluralName] = useState<string>('');
  const [currentAttributeNameError, setCurrentAttributeNameError] = useState<string>();
  const [currentAttributePluralNameError, setCurrentAttributePluralNameError] = useState<string>();
  const [currentAttributeType, setCurrentAttributeType] = useState<AttributeTypes>('Bytes');
  const [currentAttributeCountType, setCurrentAttributeCountType] = useState<CountType>('single');

  const [currentAttributeEnumValue, setCurrentAttributeEnumValue] = useState<string>('');
  const [currentAttributeEnumValueError, setCurrentAttributeEnumValueError] = useState<string>();
  const [currentAttributeValues, setCurrentAttributeValues] = useState<string[]>([]);
  const { decodeStruct, encodeStruct } = useMetadata(localRegistry);

  // const tx = api.tx.nft.setConstOnChainSchema(collection_id, schema)

  const clearCurrentAttribute = useCallback(() => {
    setCurrentAttributeName('');
    setCurrentAttributePluralName('');
    setCurrentAttributeType('Bytes');
    setCurrentAttributeValues([]);
    setCurrentAttributeEnumValue('');
  }, []);

  const addAttribute = useCallback(() => {
    if (attributes.find((item: AttributeType) => item.name === currentAttributeName)) {
      setCurrentAttributeNameError('You already have attribute with same name!');

      return;
    }

    if (attributes.find((item: AttributeType) => item.pluralName === currentAttributeName && currentAttributeName !== '')) {
      setCurrentAttributePluralNameError('You already have attribute with same plural name!');

      return;
    }

    if (currentAttributeName && currentAttributeType) {
      setAttributes([
        ...attributes, {
          count: currentAttributeCountType,
          name: currentAttributeName,
          pluralName: currentAttributePluralName,
          type: currentAttributeType,
          values: currentAttributeValues
        }
      ]
      );
      clearCurrentAttribute();
      setCurrentAttributeNameError(undefined);
    }
  }, [attributes, clearCurrentAttribute, currentAttributeCountType, currentAttributeName, currentAttributePluralName, currentAttributeType, currentAttributeValues]);

  const onSaveAll = useCallback(() => {
    console.log('onSaveAll');
    // localStorage.removeItem('collectionAttributes');
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

  const onAddItem = useCallback(() => {
    console.log('onAddItem');
  }, []);

  const onDeleteItem = useCallback(() => {
    console.log('onDeleteItem');
  }, []);

  const onEditItem = useCallback(() => {
    console.log('onEditItem');
  }, []);

  const onSaveItem = useCallback(() => {
    if (!isAdmin) {
      return;
    }

    console.log('onSaveItem');
  }, [isAdmin]);

  const onCancelSavingItem = useCallback(() => {
    if (!isAdmin) {
      return;
    }

    console.log('onCancelSavingItem');
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('collectionAttributes', JSON.stringify(attributes));
  }, [attributes]);

  useEffect(() => {
    try {
      const attrs: AttributeType[] = JSON.parse(localStorage.getItem('collectionAttributes') || '{}') as AttributeType[];

      setAttributes(attrs);
    } catch (e) {
      console.log('AttrLocalStorage parse error', e);
    }
  }, []);

  return (
    <div className='manage-collection-attributes'>
      <Header as='h3'>Manage collection ConstOnChainSchema</Header>
      <div className='custom-table collection-attributes'>
        <div className='table-header'>
          <div className='tr'>
            <div className='th'>
              Name
            </div>
            <div className='th'>
              Type
            </div>
            <div className='th'>
              Possible values
            </div>
            <div className='th'>
              <img
                alt={'add'}
                onClick={onAddItem}
                src={plus as string}
              />
            </div>
          </div>
        </div>
        <div className='table-body'>
          <div className='tr'>
            <div className='td'>
              First Name
            </div>
            <div className='td'>
              string
            </div>
            <div className='td'>
              Petia
            </div>
            <div className='td action'>
              <img
                alt='edit'
                src={pencil as string}
              />
            </div>
            <div className='td action'>
              <img
                alt='delete'
                src={trash as string}
              />
            </div>
          </div>
          <div className='tr'>
            <div className='td'>
              First Name
            </div>
            <div className='td'>
              string
            </div>
            <div className='td'>
              Petia
            </div>
            <div className='td action'>
              <img
                alt='edit'
                onClick={onEditItem}
                src={pencil as string}
              />
            </div>
            <div className='td action'>
              <img
                alt='delete'
                onClick={onDeleteItem}
                src={trash as string}
              />
            </div>
          </div>

          <div className='tr edit'>
            <div className='td'>
              <Input
                className='isSmall'
                isDisabled={!isAdmin}
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
            </div>
            <div className='td'>
              <Dropdown
                isDisabled={!isAdmin}
                onChange={setCurrentAttributeType}
                options={TypeOptions}
                placeholder='Select Attribute Type'
                value={currentAttributeType}
              />
            </div>
            <div className='td'>
            </div>
            <div className='td no-padded'>
              <img
                alt={'Save'}
                onClick={onSaveItem}
                src={floppy as string}
              />
            </div>
            <div className='td no-padded'>
              <img
                alt={'Cancel'}
                onClick={onCancelSavingItem}
                src={close as string}
              />
            </div>
          </div>

          <div className='tr edit'>
            <div className='td'>
              <Input
                className='isSmall'
                isDisabled={!isAdmin}
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
            </div>
            <div className='td'>
              <Dropdown
                isDisabled={!isAdmin}
                onChange={setCurrentAttributeType}
                options={TypeOptions}
                placeholder='Select Attribute Type'
                value={currentAttributeType}
              />
            </div>
            <div className='td'>
              <div className='enum-field'>
                <Dropdown
                  onChange={setCurrentAttributeCountType}
                  options={CountOptions}
                  placeholder='Select Attribute Count Type'
                  value={currentAttributeCountType}
                />
                <EnumsInput
                  isDisabled={!isAdmin}
                />
              </div>
            </div>
            <div className='td no-padded'>
              <img
                alt={'Save'}
                onClick={onSaveItem}
                src={floppy as string}
              />
            </div>
            <div className='td no-padded'>
              <img
                alt={'Cancel'}
                onClick={onCancelSavingItem}
                src={close as string}
              />
            </div>
          </div>
        </div>
        <div className='table-footer'>
          <Button
            content={'Save'}
            disabled={!isAdmin}
            onClick={onSaveAll}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(ManageCollectionAttributes);
