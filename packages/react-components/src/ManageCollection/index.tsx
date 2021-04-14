// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { useCallback, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import {Dropdown, Input} from '@polkadot/react-components';
import { TypeRegistry } from '@polkadot/types';
import { keyring } from '@polkadot/ui-keyring';

import ManageCollectionAttributes from './ManageCollectionAttributes';

interface Props {
  account?: string;
  localRegistry?: TypeRegistry;
}

export type SchemaVersionTypes = 'ImageURL' | 'Unique';

export type UniqueSchema = {
  audio?: string;
  image?: string;
  page?: string;
  video?: string;
}

type SchemaOption = {
  text: string;
  value: SchemaVersionTypes;
}

const SchemaOptions: SchemaOption[] = [
  {
    text: 'ImageUrl',
    value: 'ImageURL'
  },
  {
    text: 'Unique',
    value: 'Unique'
  }
];

function ManageCollection (props: Props): React.ReactElement<Props> {
  const { account, localRegistry } = props;
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [tokenPrefix, setTokenPrefix] = useState<string>();
  const [adminAddress, setAdminAddress] = useState<string>();
  const [sponsorAddress, setSponsorAddress] = useState<string>();
  const [showAdminForm, toggleAdminForm] = useState<boolean>(true);
  const [showSponsorForm, toggleSponsorForm] = useState<boolean>(true);
  const [isAdminAddressError, setIsAdminAddressError] = useState<boolean>(false);
  const [isSponsorAddressError, setIsSponsorAddressError] = useState<boolean>(false);
  const [deletingCurrentAdmin, toggleDeletingCurrentAdmin] = useState<boolean>(false);
  const [settingCurrentAdmin, toggleSettingCurrentAdmin] = useState<boolean>(false);
  const [settingSponsor, toggleSettingSponsor] = useState<boolean>(false);
  const [approvingSponsor, toggleApprovingSponsor] = useState<boolean>(false);
  const [currentSchemaVersion, setCurrentSchemaVersion] = useState<SchemaVersionTypes>('Unique');
  const [settingSchemaVersion, toggleSettingSchemaVersion] = useState<boolean>(false);
  const [currentOffchainSchema, setCurrentOffchainSchema] = useState<SchemaVersionTypes>('Unique');
  const [settingOffChainSchema, toggleSettingOffChainSchema] = useState<boolean>(false);

  const [audioUrl, setAudioUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [pageUrl, setPageUrl] = useState<string>('');
  const [isAudioUrlError, toggleAudioUrlError] = useState<boolean>(false);
  const [isImageUrlError, toggleImageUrlError] = useState<boolean>(false);
  const [isPageUrlError, togglePageUrlError] = useState<boolean>(false);

  const onSetAdminAddress = useCallback((value: string) => {
    try {
      keyring.decodeAddress(value);
      setIsSponsorAddressError(false);
      setSponsorAddress(value);
    } catch (e) {
      setIsSponsorAddressError(true);
    }
  }, []);

  const onSetSponsorAddress = useCallback((value: string) => {
    try {
      keyring.decodeAddress(value);
      setIsAdminAddressError(false);
      setAdminAddress(value);
    } catch (e) {
      setIsAdminAddressError(true);
    }
  }, []);

  const onSetDescription = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);

  const onDeleteCurrentAdmin = useCallback(() => {
    console.log('onDeleteCurrentAdmin');
  }, []);

  const onSetCurrentAdmin = useCallback(() => {
    console.log('onSetCurrentAdmin');
  }, []);

  const onSetSponsor = useCallback(() => {
    console.log('onSetSponsor');
  }, []);

  const onApproveSponsor = useCallback(() => {
    console.log('onApproveSponsor');
  }, []);

  const onSetSchemaVersion = useCallback(() => {
    console.log('onSetSchemaVersion');
  }, []);

  const onSetOffchainSchema = useCallback(() => {
    console.log('onSetOffchainSchema');
  }, []);

  // collectionInfo.SchemaVersion.isImageUrl, imageUrl = hex2a(collectionInfo.OffchainSchema) + {id}
  // collectionMetadata.metadata, collectionMetadata = hex2a(collectionInfo.OffchainSchema) - get metadata
  // hex2a(collectionInfo.OffchainSchema)
  // setSchemaVersion(collection_id, version)
  // setOffchainSchema(collection_id, schema)

  return (
    <div className='manage-collection'>
      <Header as='h3'>Collection advanced settings</Header>
      <Form className='manage-collection--form'>
        <Grid className='manage-collection--form--grid'>
          <Grid.Row>
            <Grid.Column width={8}>
              <Form.Field>
                <Input
                  className='isSmall'
                  onChange={setName}
                  placeholder='Enter collection name'
                  value={name}
                />
              </Form.Field>
              <Form.Field>
                <textarea
                  onChange={onSetDescription}
                  placeholder={'Enter collection description'}
                  rows={2}
                  value={description}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  className='isSmall'
                  onChange={setTokenPrefix}
                  placeholder='Enter token prefix'
                  value={tokenPrefix}
                />
              </Form.Field>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
      <Header as='h3'>Schema version</Header>
      <Form className='manage-collection--form'>
        <Grid className='manage-collection--form--grid'>
          <Grid.Row>
            <Grid.Column width={8}>
              <Form.Field>
                <Dropdown
                  onChange={setCurrentSchemaVersion}
                  options={SchemaOptions}
                  placeholder='Select Attribute Type'
                  value={currentSchemaVersion}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column
              className='flex'
              width={8}
            >
              <Form.Field>
                <Button
                  content={
                    <>
                      Set schema version
                      { settingSchemaVersion && (
                        <Loader
                          active
                          inline='centered'
                        />
                      )}
                    </>
                  }
                  onClick={onSetSchemaVersion}
                />
              </Form.Field>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>

      <Header as='h3'>Offchain Schema</Header>
      <Form className='manage-collection--form'>
        <Grid className='manage-collection--form--grid'>
          <Grid.Row>
            <Grid.Column width={8}>
              <Form.Field>
                <div className='schema-table offchain-schema'>
                  <div className='table-header'>
                    <div className='tr'>
                      <div className='th'>
                        Type
                      </div>
                      <div className='th'>
                        Url
                      </div>
                    </div>
                  </div>
                  <div className='table-body'>
                    <div className='tr edit'>
                      <div className='td'>
                        Audio
                      </div>
                      <div className='td'>
                        <Input
                          className='isSmall'
                          isError={isAudioUrlError}
                          label='Please enter the audio url'
                          onChange={setAudioUrl}
                          placeholder='Audio url address'
                          value={audioUrl}
                        />
                      </div>
                    </div>
                    <div className='tr edit'>
                      <div className='td'>
                        Image
                      </div>
                      <div className='td'>
                        <Input
                          className='isSmall'
                          isError={isImageUrlError}
                          label='Please enter the image url'
                          onChange={setImageUrl}
                          placeholder='Image url address'
                          value={imageUrl}
                        />
                      </div>
                    </div>
                    <div className='tr edit'>
                      <div className='td'>
                        Page
                      </div>
                      <div className='td'>
                        <Input
                          className='isSmall'
                          isError={isPageUrlError}
                          label='Please enter the page url'
                          onChange={setPageUrl}
                          placeholder='Page url address'
                          value={pageUrl}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Form.Field>
            </Grid.Column>
            <Grid.Column
              className='flex'
              width={8}
            >
              <Form.Field>
                <Button
                  content={
                    <>
                      Set Offchain Schema
                      { settingOffChainSchema && (
                        <Loader
                          active
                          inline='centered'
                        />
                      )}
                    </>
                  }
                  onClick={onSetOffchainSchema}
                />
              </Form.Field>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>

      <Header as='h3'>Collection sponsor</Header>
      <Form className='manage-collection--form'>
        <Grid className='manage-collection--form--grid'>
          <Grid.Row>
            <Grid.Column width={8}>
              <Form.Field>
                <Input
                  className='isSmall'
                  isError={isSponsorAddressError}
                  label='Please enter the sponsor address'
                  onChange={onSetSponsorAddress}
                  placeholder='Collection sponsor address'
                  value={sponsorAddress}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column
              className='flex'
              width={8}
            >
              <div className='button-group'>
                <Button
                  content={
                    <>
                      Set sponsor
                      { settingSponsor && (
                        <Loader
                          active
                          inline='centered'
                        />
                      )}
                    </>
                  }
                  onClick={onSetSponsor}
                />
                <Button
                  content={
                    <>
                      Approve sponsor
                      { approvingSponsor && (
                        <Loader
                          active
                          inline='centered'
                        />
                      )}
                    </>
                  }
                  onClick={onApproveSponsor}
                />
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
      <Header as='h3'>Collection admin</Header>
      <Form className='manage-collection--form'>
        <Grid className='manage-collection--form--grid'>
          <Grid.Row>
            <Grid.Column width={8}>
              <Form.Field>
                <Input
                  className='isSmall'
                  isError={isAdminAddressError}
                  label='Please enter the admin address'
                  onChange={onSetAdminAddress}
                  placeholder='Collection admin address'
                  value={adminAddress}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column
              className='flex'
              width={8}
            >
              <div className='button-group'>
                <Button
                  content={
                    <>
                      Set admin
                      { settingCurrentAdmin && (
                        <Loader
                          active
                          inline='centered'
                        />
                      )}
                    </>
                  }
                  onClick={onSetCurrentAdmin}
                />
                <Button
                  content={
                    <>
                      Delete admin
                      { deletingCurrentAdmin && (
                        <Loader
                          active
                          inline='centered'
                        />
                      )}
                    </>
                  }
                  onClick={onDeleteCurrentAdmin}
                />
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
      <ManageCollectionAttributes
        account={account}
        localRegistry={localRegistry}
      />
    </div>
  );
}

export default React.memo(ManageCollection);
