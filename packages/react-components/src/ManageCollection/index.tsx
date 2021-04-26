// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface, SchemaVersionTypes } from '@polkadot/react-hooks/useCollection';
import type { MetadataJsonType } from '@polkadot/react-hooks/useMetadata';

import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { Dropdown, Input, TextArea } from '@polkadot/react-components';
import arrowLeft from '@polkadot/react-components/NftDetails/arrowLeft.svg';
import { useDecoder, useMetadata } from '@polkadot/react-hooks';
import { useCollection } from '@polkadot/react-hooks/useCollection';
import { TypeRegistry } from '@polkadot/types';
import { keyring } from '@polkadot/ui-keyring';

import ManageCollectionAttributes from './ManageCollectionAttributes';

interface Props {
  account?: string;
  addCollection: (collection: NftCollectionInterface) => void;
  localRegistry?: TypeRegistry;
  setShouldUpdateTokens?: (collectionId: string) => void;
}

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
  const { account, addCollection, localRegistry, setShouldUpdateTokens } = props;
  const history = useHistory();
  const query = new URLSearchParams(useLocation().search);
  const collectionId = query.get('collectionId') || '';
  const { addCollectionAdmin,
    confirmSponsorship,
    createCollection,
    getCollectionAdminList,
    getCreatedCollectionCount,
    getDetailedCollectionInfo,
    removeCollectionAdmin,
    removeCollectionSponsor,
    setCollectionSponsor,
    setOffChainSchema,
    setSchemaVersion } = useCollection();
  const { getAndParseOffchainSchemaMetadata } = useMetadata(localRegistry);
  const { collectionName16Decoder, hex2a } = useDecoder();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tokenPrefix, setTokenPrefix] = useState<string>('');
  const [adminAddress, setAdminAddress] = useState<string>('');
  const [sponsorAddress, setSponsorAddress] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminAddressError, setIsAdminAddressError] = useState<boolean>(false);
  const [isSponsorAddressError, setIsSponsorAddressError] = useState<boolean>(false);
  const [collectionAdminList, setCollectionAdminList] = useState<string[]>([]);
  const [deletingCurrentAdmin, toggleDeletingCurrentAdmin] = useState<boolean>(false);
  const [settingCurrentAdmin, toggleSettingCurrentAdmin] = useState<boolean>(false);
  const [settingSponsor, toggleSettingSponsor] = useState<boolean>(false);
  const [approvingSponsor, toggleApprovingSponsor] = useState<boolean>(false);
  const [currentSchemaVersion, setCurrentSchemaVersion] = useState<SchemaVersionTypes>();
  const [settingSchemaVersion, toggleSettingSchemaVersion] = useState<boolean>(false);
  const [currentOffchainSchema, setCurrentOffchainSchema] = useState<string>('');
  const [settingOffChainSchema, toggleSettingOffChainSchema] = useState<boolean>(false);
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface>();
  const [isAddressCurrentlyInAdminList, setIsAddressCurrentlyInAdminList] = useState<boolean>(false);

  const [audioUrl, setAudioUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [pageUrl, setPageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  const [isAudioUrlError, toggleAudioUrlError] = useState<boolean>(false);
  const [isImageUrlError, toggleImageUrlError] = useState<boolean>(false);
  const [isPageUrlError, togglePageUrlError] = useState<boolean>(false);
  const [isVideoUrlError, toggleVideoUrlError] = useState<boolean>(false);

  const fetchCollectionInfo = useCallback(async () => {
    // collectionInfo.SchemaVersion.isImageUrl
    try {
      if (collectionId) {
        const info: NftCollectionInterface = (await getDetailedCollectionInfo(collectionId)) as NftCollectionInterface;

        if (info) {
          setCollectionInfo(info);
          setCurrentSchemaVersion(info.SchemaVersion);
          setName(collectionName16Decoder(info.Name));
          setDescription(collectionName16Decoder(info.Description));
          setTokenPrefix(hex2a(info.TokenPrefix));
          setCurrentOffchainSchema(hex2a(info.OffchainSchema));

          // add collection to storage
          addCollection(info);

          if (info.Sponsorship.confirmed) {
            setSponsorAddress(info.Sponsorship.confirmed);
          }

          if (info.SchemaVersion === 'Unique') {
            const schema: { metadata: string, metadataJson: MetadataJsonType } = await getAndParseOffchainSchemaMetadata(info);

            if (schema.metadataJson.audio) {
              setImageUrl(schema.metadataJson.audio);
            }

            if (schema.metadataJson.image) {
              setImageUrl(schema.metadataJson.image);
            }

            if (schema.metadataJson.page) {
              setPageUrl(schema.metadataJson.page);
            }

            if (schema.metadataJson.video) {
              setVideoUrl(schema.metadataJson.video);
            }
          } else if (info.SchemaVersion === 'ImageURL') {
            if (info.OffchainSchema) {
              setImageUrl(hex2a(info.OffchainSchema).replace('{id}', '1'));
            }
          }
        }
      }
    } catch (e) {
      console.log('fetchCollectionInfo error', e);
    }
  }, [addCollection, collectionId, collectionName16Decoder, getAndParseOffchainSchemaMetadata, getDetailedCollectionInfo, hex2a]);

  const fetchCollectionAdminList = useCallback(async () => {
    if (collectionId) {
      const adminList = await getCollectionAdminList(collectionId) as string[];

      setCollectionAdminList(adminList || []);
    }
  }, [collectionId, getCollectionAdminList]);

  const onSetAdminAddress = useCallback((value: string) => {
    try {
      keyring.decodeAddress(value);
      setIsAdminAddressError(false);
      setAdminAddress(value);
      setIsAddressCurrentlyInAdminList(!!collectionAdminList.find((address: string) => address.toString() === value));
    } catch (e) {
      setIsAdminAddressError(true);
    }
  }, [collectionAdminList]);

  const onSetSponsorAddress = useCallback((value: string) => {
    try {
      keyring.decodeAddress(value);
      setIsAdminAddressError(false);
      setAdminAddress(value);
    } catch (e) {
      setIsAdminAddressError(true);
    }
  }, []);

  const onSetDescription = useCallback((value: string) => {
    setDescription(value);
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
    if (account && collectionId && currentSchemaVersion) {
      setSchemaVersion({ account, collectionId, schemaVersion: currentSchemaVersion, successCallback: fetchCollectionInfo });
    }
  }, [account, collectionId, currentSchemaVersion, fetchCollectionInfo, setSchemaVersion]);

  const onSetOffchainSchema = useCallback(() => {
    if (account && collectionId) {
      setOffChainSchema({ account, collectionId, schema: currentOffchainSchema, successCallback: fetchCollectionInfo });
    }
  }, [account, collectionId, currentOffchainSchema, fetchCollectionInfo, setOffChainSchema]);

  const goToCollection = useCallback(async () => {
    const collectionCount = await getCreatedCollectionCount();

    history.push(`/wallet/manage-collection?collectionId=${collectionCount}`);
  }, [getCreatedCollectionCount, history]);

  const onCreateCollection = useCallback(() => {
    if (account && name && tokenPrefix) {
      createCollection(account, {
        description,
        modeprm: { nft: null },
        name,
        tokenPrefix
      }, {
        onSuccess: goToCollection
      });
    }
  }, [account, createCollection, description, goToCollection, name, tokenPrefix]);

  const goBack = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShouldUpdateTokens && setShouldUpdateTokens('all');
    history.push('/wallet/');
  }, [history, setShouldUpdateTokens]);

  useEffect(() => {
    if (!currentSchemaVersion) {
      void fetchCollectionInfo();
    }
  }, [currentSchemaVersion, fetchCollectionInfo]);

  useEffect(() => {
    void fetchCollectionAdminList();
  }, [fetchCollectionAdminList]);

  useEffect(() => {
    console.log('collectionInfo.Owner', collectionInfo?.Owner, 'account', account, 'collectionAdminList', collectionAdminList);

    if (collectionInfo && collectionAdminList) {
      setIsAdmin(!!collectionAdminList.find((address: string) => address.toString() === account) || collectionInfo.Owner === account);
    }
  }, [account, collectionAdminList, collectionInfo]);

  // hex2a(collectionInfo.OffchainSchema)
  // setSchemaVersion(collection_id, version)
  // https://whitelabel.market/metadata/{id}

  console.log('info currentOffchainSchema', currentOffchainSchema, 'isAdmin', isAdmin);

  return (
    <div className='manage-collection'>
      <Header as='h1'>
        { collectionId ? 'Manage Collection' : 'Create collection' }
      </Header>
      <a
        className='go-back'
        href='/'
        onClick={goBack}
      >
        <Image
          className='go-back'
          src={arrowLeft}
        />
        back
      </a>
      <Header as='h3'>Collection advanced settings</Header>
      <Form className='manage-collection--form'>
        <Grid className='manage-collection--form--grid'>
          <Grid.Row>
            <Grid.Column width={8}>
              <Form.Field>
                <Input
                  className='isSmall'
                  isDisabled={!!collectionId}
                  onChange={setName}
                  placeholder='Enter collection name'
                  value={name}
                />
              </Form.Field>
              <Form.Field>
                <TextArea
                  isDisabled={!!collectionId}
                  onChange={onSetDescription}
                  placeholder={'Enter collection description'}
                  seed={description}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  className='isSmall'
                  isDisabled={!!collectionId}
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
                  defaultValue={currentSchemaVersion}
                  isDisabled={!isAdmin && !!collectionId}
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
              { isAdmin && (
                <Form.Field>
                  <Button
                    content={
                      <>
                        Set schema version
                        {settingSchemaVersion && (
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
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
      { !collectionId && (
        <Button
          content={'Create'}
          disabled={!name || !tokenPrefix}
          onClick={onCreateCollection}
        />
      )}

      { (isAdmin || collectionId) && (
        <>
          <Header as='h3'>Offchain Schema</Header>
          <Form className='manage-collection--form'>
            <Grid className='manage-collection--form--grid'>
              <Grid.Row>
                <Grid.Column width={16}>
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
                            OffChain schema url
                          </div>
                          <div className='td'>
                            <Input
                              className='isSmall'
                              isDisabled={!isAdmin}
                              isError={isAudioUrlError}
                              label='Please enter the OffChain schema url'
                              onChange={setCurrentOffchainSchema}
                              placeholder='OffChain schema url'
                              value={currentOffchainSchema}
                            />
                          </div>
                        </div>
                        { currentOffchainSchema && collectionInfo?.SchemaVersion === 'ImageURL' && (
                          <div className='tr edit'>
                            <div className='td'>
                              Image, token #1
                            </div>
                            <div className='td'>
                              <a
                                href={imageUrl}
                                rel='noopener noreferrer'
                                target='_blank'
                              >
                                {imageUrl}
                              </a>
                            </div>
                          </div>
                        )}
                        { currentOffchainSchema && collectionInfo?.SchemaVersion === 'Unique' && (
                          <>
                            <div className='tr edit'>
                              <div className='td'>
                                Audio, token #1
                              </div>
                              <div className='td'>
                                <a
                                  href={audioUrl}
                                  rel='noopener noreferrer'
                                  target='_blank'
                                >
                                  {audioUrl}
                                </a>
                              </div>
                            </div>
                            <div className='tr edit'>
                              <div className='td'>
                                Image, token #1
                              </div>
                              <div className='td'>
                                <a
                                  href={imageUrl}
                                  rel='noopener noreferrer'
                                  target='_blank'
                                >
                                  {imageUrl}
                                </a>
                              </div>
                            </div>
                            <div className='tr edit'>
                              <div className='td'>
                                Page, token #1
                              </div>
                              <div className='td'>
                                <a
                                  href={pageUrl}
                                  rel='noopener noreferrer'
                                  target='_blank'
                                >
                                  {pageUrl}
                                </a>
                              </div>
                            </div>
                            <div className='tr edit'>
                              <div className='td'>
                                Video, token #1
                              </div>
                              <div className='td'>
                                <a
                                  href={videoUrl}
                                  rel='noopener noreferrer'
                                  target='_blank'
                                >
                                  {videoUrl}
                                </a>
                              </div>
                            </div>
                          </>
                        )}
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
                      isDisabled={!isAdmin}
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
                      disabled={!isAdmin}
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
                      disabled={sponsorAddress !== account}
                      onClick={onApproveSponsor}
                    />
                  </div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Form>
          <Header as='h3'>Collection admin list</Header>
          { collectionAdminList?.length > 0 && (
            <ul>
              { collectionAdminList.map((address) => (
                <li key={address.toString()}>{address.toString()}</li>
              ))}
            </ul>
          )}
          <Form className='manage-collection--form'>
            <Grid className='manage-collection--form--grid'>
              <Grid.Row>
                <Grid.Column width={8}>
                  <Form.Field>
                    <Input
                      className='isSmall'
                      isDisabled={!isAdmin}
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
                          Add admin
                          { settingCurrentAdmin && (
                            <Loader
                              active
                              inline='centered'
                            />
                          )}
                        </>
                      }
                      disabled={!isAdmin}
                      onClick={onSetCurrentAdmin}
                    />
                    <Button
                      content={
                        <>
                          Remove admin
                          { deletingCurrentAdmin && (
                            <Loader
                              active
                              inline='centered'
                            />
                          )}
                        </>
                      }
                      disabled={!adminAddress || isAddressCurrentlyInAdminList || !isAdmin}
                      onClick={onDeleteCurrentAdmin}
                    />
                  </div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Form>
          <ManageCollectionAttributes
            account={account}
            isAdmin={isAdmin}
            localRegistry={localRegistry}
          />
        </>
      )}
    </div>
  );
}

export default React.memo(ManageCollection);
