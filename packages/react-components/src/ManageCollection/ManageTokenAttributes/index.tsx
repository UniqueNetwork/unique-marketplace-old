// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { AttributeItemType, ProtobufAttributeType } from '@polkadot/react-components/util/protobufUtils';
import type { TokenDetailsInterface } from '@polkadot/react-hooks/useToken';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import { Dropdown, Input } from '@polkadot/react-components';
import { useCollection, useToken } from '@polkadot/react-hooks';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

export type TokenAttribute = {
  name: string;
  values: string[];
}

interface Props {
  account?: string;
  setShouldUpdateTokens?: (collectionId: string) => void;
}

function ManageTokenAttributes (props: Props): React.ReactElement<Props> {
  const query = new URLSearchParams(useLocation().search);
  const tokenId = query.get('tokenId') || '';
  const collectionId = query.get('collectionId') || '';
  const { constOnChainSchema, getDetailedCollectionInfo, variableOnChainSchema } = useCollection();
  const { getDetailedTokenInfo } = useToken();
  const [collectionAttributes, setCollectionAttributes] = useState<AttributeItemType[]>([]);
  const [tokenAttributes, setTokenAttributes] = useState<{ [key: string]: TokenAttribute }>({});
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface>();
  const [tokenInfo, setTokenInfo] = useState<TokenDetailsInterface>();

  const fetchCollectionAndTokenInfo = useCallback(async () => {
    // collectionInfo.SchemaVersion.isImageUrl
    try {
      if (collectionId) {
        const info: NftCollectionInterface = (await getDetailedCollectionInfo(collectionId)) as NftCollectionInterface;

        setCollectionInfo(info);

        if (tokenId) {
          const tokenInfo: TokenDetailsInterface = (await getDetailedTokenInfo(collectionId, tokenId));

          setTokenInfo(tokenInfo);
        }
      }
    } catch (e) {
      console.log('fetchCollectionAndTokenInfo error', e);
    }
  }, [collectionId, getDetailedCollectionInfo, getDetailedTokenInfo, tokenId]);

  const setAttributeValue = useCallback(() => {
    console.log('setAttributeValue');
  }, []);

  const presetTokenAttributes = useCallback(() => {
    /* if (collectionAttributes && collectionAttributes.length) {
      const tokenAttrs: {[key: string]: TokenAttribute} = {};

      collectionAttributes.forEach((collectionAttr: AttributeType) => {
        tokenAttrs[collectionAttr.name] = {
          name: collectionAttr.name,
          value: '',
          values: []
        };
      });

      setTokenAttributes(tokenAttrs);
    } */
  }, [collectionAttributes]);

  useEffect(() => {
    void fetchCollectionAndTokenInfo();
  }, [fetchCollectionAndTokenInfo]);

  console.log('info collectionInfo', collectionInfo);
  console.log('info tokenInfo', tokenInfo);
  console.log('info constOnChainSchema', constOnChainSchema);
  console.log('info variableOnChainSchema', variableOnChainSchema);

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
