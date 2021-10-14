// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';

import { Dropdown, EnumsInput, Input } from '@polkadot/react-components';
import close from '@polkadot/react-components/ManageCollection/close.svg';
import floppy from '@polkadot/react-components/ManageCollection/floppy.svg';
import pencil from '@polkadot/react-components/ManageCollection/pencil.svg';
import plus from '@polkadot/react-components/ManageCollection/plus.svg';
import trash from '@polkadot/react-components/ManageCollection/trash.svg';
import StatusContext from '@polkadot/react-components/Status/Context';
import { AttributeItemType, FieldRuleType, FieldType, fillAttributes, fillProtobufJson, ProtobufAttributeType } from '@polkadot/react-components/util/protobufUtils';

import { CountOptions, TypeOptions } from './types';

interface Props {
  account?: string;
  collectionId?: string;
  fetchCollectionInfo: () => void;
  isAdmin?: boolean;
  onChainSchema?: ProtobufAttributeType;
  saveOnChainSchema: (args: { account: string, collectionId: string, schema: string, successCallback?: () => void, errorCallback?: () => void }) => void;
}

function ManageOnChainSchema (props: Props): React.ReactElement<Props> {
  const { account, collectionId, fetchCollectionInfo, isAdmin, onChainSchema, saveOnChainSchema } = props;
  const { queueAction } = useContext(StatusContext);
  const [attributes, setAttributes] = useState<AttributeItemType[]>([]);

  const [currentAttributeName, setCurrentAttributeName] = useState<string>('');
  const [currentAttributeNameError, setCurrentAttributeNameError] = useState<string>();
  const [currentAttributeType, setCurrentAttributeType] = useState<FieldType>('string');
  const [currentAttributeCountType, setCurrentAttributeCountType] = useState<FieldRuleType>('optional');

  const [currentAttributeValues, setCurrentAttributeValues] = useState<string[]>([]);
  const [currentAttribute, setCurrentAttribute] = useState<AttributeItemType>();

  const clearCurrentAttribute = useCallback(() => {
    setCurrentAttributeName('');
    setCurrentAttributeType('string');
    setCurrentAttributeCountType('optional');
    setCurrentAttributeValues([]);
    setCurrentAttribute(undefined);
    setCurrentAttributeNameError(undefined);
  }, []);

  const resetInfo = useCallback(() => {
    fetchCollectionInfo();
    clearCurrentAttribute();
  }, [clearCurrentAttribute, fetchCollectionInfo]);

  const onSaveAll = useCallback(() => {
    try {
      const protobufJson: ProtobufAttributeType = fillProtobufJson(attributes);

      if (account && collectionId) {
        saveOnChainSchema({ account, collectionId, schema: JSON.stringify(protobufJson), successCallback: resetInfo });
      }
    } catch (e) {
      console.log('save onChain schema error', e);
    }
  }, [account, attributes, collectionId, resetInfo, saveOnChainSchema]);

  const onAddItem = useCallback(() => {
    if (!isAdmin) {
      return;
    }

    setCurrentAttribute({
      fieldType: 'string',
      name: '',
      rule: 'optional',
      values: []
    });
  }, [isAdmin]);

  const onSaveItem = useCallback(() => {
    if (!isAdmin) {
      return;
    }

    // edit existed attribute
    if (currentAttribute?.id) {
      const targetIndex = attributes.findIndex((item: AttributeItemType) => item.id === currentAttribute.id);

      if (targetIndex !== -1) {
        const newAttributes = [...attributes];

        newAttributes[targetIndex] = {
          fieldType: currentAttributeType,
          id: attributes.length,
          name: currentAttributeName,
          rule: currentAttributeCountType,
          values: currentAttributeValues
        };

        setAttributes(newAttributes);
        clearCurrentAttribute();
      }
      // add new attribute
    } else {
      if (attributes.find((item: AttributeItemType) => item.name === currentAttributeName)) {
        setCurrentAttributeNameError('You already have attribute with same name!');

        queueAction({
          action: 'action',
          message: 'You already have attribute with same name!',
          status: 'error'
        });

        return;
      }

      if (currentAttributeName && currentAttributeType) {
        setAttributes([
          ...attributes, {
            fieldType: currentAttributeType,
            id: attributes.length,
            name: currentAttributeName,
            rule: currentAttributeCountType,
            values: currentAttributeValues
          }
        ]);
        clearCurrentAttribute();
      }
    }
  }, [attributes, clearCurrentAttribute, currentAttribute, currentAttributeCountType, currentAttributeName, currentAttributeType, currentAttributeValues, isAdmin, queueAction]);

  const onCancelSavingItem = useCallback(() => {
    if (!isAdmin) {
      return;
    }

    clearCurrentAttribute();
  }, [isAdmin, clearCurrentAttribute]);

  const editAttribute = useCallback((attribute: AttributeItemType) => {
    setCurrentAttribute(attribute);
    setCurrentAttributeName(attribute.name);
    setCurrentAttributeType(attribute.fieldType);
    setCurrentAttributeCountType(attribute.rule);
    setCurrentAttributeValues(attribute.values);
  }, []);

  const deleteAttribute = useCallback((targetAttribute: AttributeItemType) => {
    setAttributes([
      ...attributes.filter((attribute: AttributeItemType) => attribute.id !== targetAttribute.id)
    ]);
  }, [attributes]);

  useEffect(() => {
    if (onChainSchema) {
      setAttributes(fillAttributes(onChainSchema));
    } else {
      setAttributes([]);
    }
  }, [onChainSchema]);

  return (
    <div className='on-chain-schema'>
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
              rule
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
          { attributes.map((attribute: AttributeItemType) => {
            if (attribute.id === currentAttribute?.id) {
              return (
                <div
                  className='tr edit'
                  key={attribute.id}
                >
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
                    <Dropdown
                      onChange={setCurrentAttributeCountType}
                      options={CountOptions}
                      placeholder='Select Attribute Count Type'
                      value={currentAttributeCountType}
                    />
                  </div>
                  <div className='td'>
                    <EnumsInput
                      isDisabled={!isAdmin || currentAttributeType === 'string'}
                      setValues={setCurrentAttributeValues}
                      values={currentAttributeValues}
                    />
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
              );
            }

            return (
              <div
                className='tr'
                key={attribute.id}
              >
                <div className='td'>
                  {attribute.name}
                </div>
                <div className='td'>
                  {attribute.fieldType}
                </div>
                <div className='td'>
                  {attribute.rule}
                </div>
                <div className='td'>
                  <div className='enum-attributes'>
                    {attribute.values.join(', ')}
                  </div>
                </div>
                { isAdmin && (
                  <>
                    <div className='td action'>
                      <img
                        alt='edit'
                        onClick={editAttribute.bind(null, attribute)}
                        src={pencil as string}
                      />
                    </div>
                    <div className='td action'>
                      <img
                        alt='delete'
                        onClick={deleteAttribute.bind(null, attribute)}
                        src={trash as string}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
          { (currentAttribute && !currentAttribute.name) && (
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
                <Dropdown
                  onChange={setCurrentAttributeCountType}
                  options={CountOptions}
                  placeholder='Select Attribute Count Type'
                  value={currentAttributeCountType}
                />
              </div>
              <div className='td'>
                <EnumsInput
                  isDisabled={!isAdmin || currentAttributeType === 'string'}
                  setValues={setCurrentAttributeValues}
                  values={currentAttributeValues}
                />
              </div>
              { isAdmin && (
                <>
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
                </>
              )}
            </div>
          )}
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

export default memo(ManageOnChainSchema);
