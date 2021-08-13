// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { NftCollectionInterface, SchemaVersionTypes } from '@polkadot/react-hooks/useCollection';
import type { MetadataJsonType } from '@polkadot/react-hooks/useMetadata';

import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';

import { Dropdown, Input, TextArea } from '@polkadot/react-components';
import trash from '@polkadot/react-components/ManageCollection/trash.svg';
import arrowLeft from '@polkadot/react-components/NftDetails/arrowLeft.svg';
import { ProtobufAttributeType } from '@polkadot/react-components/util/protobufUtils';
import { useDecoder, useMetadata } from '@polkadot/react-hooks';
import { useCollection } from '@polkadot/react-hooks/useCollection';
import { keyring } from '@polkadot/ui-keyring';

import ManageCollectionAttributes from './ManageCollectionAttributes';

interface Props {
  account?: string;
  addCollection: (collection: NftCollectionInterface) => void;
  basePath: string;
  setShouldUpdateTokens?: (collectionId: string) => void;
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
  const { account, addCollection, basePath, setShouldUpdateTokens } = props;
  const history = useHistory();
  const query = new URLSearchParams(useLocation().search);
  const collectionId = query.get('collectionId') || '';
  const { addCollectionAdmin,
    confirmSponsorship,
    createCollection,
    getCollectionAdminList,
    getCollectionOnChainSchema,
    getCreatedCollectionCount,
    getDetailedCollectionInfo,
    removeCollectionAdmin,
    removeCollectionSponsor,
    saveConstOnChainSchema,
    saveVariableOnChainSchema,
    setCollectionSponsor,
    setOffChainSchema,
    setSchemaVersion } = useCollection();
  const { getAndParseOffchainSchemaMetadata } = useMetadata();
  const { collectionName16Decoder, hex2a } = useDecoder();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tokenPrefix, setTokenPrefix] = useState<string>('');
  const [adminAddress, setAdminAddress] = useState<string>('');
  const [sponsorAddress, setSponsorAddress] = useState<string>('');
  const [constOnChainSchema, setConstOnChainSchema] = useState<ProtobufAttributeType>();
  const [variableOnChainSchema, setVariableOnChainSchema] = useState<ProtobufAttributeType>();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminAddressError, setIsAdminAddressError] = useState<boolean>(false);
  const [isSponsorAddressError, setIsSponsorAddressError] = useState<boolean>(false);
  const [collectionAdminList, setCollectionAdminList] = useState<string[]>([]);
  // const [deletingCurrentAdmin, toggleDeletingCurrentAdmin] = useState<boolean>(false);
  // const [settingCurrentAdmin, toggleSettingCurrentAdmin] = useState<boolean>(false);
  // const [settingSponsor, toggleSettingSponsor] = useState<boolean>(false);
  // const [approvingSponsor, toggleApprovingSponsor] = useState<boolean>(false);
  const [currentSchemaVersion, setCurrentSchemaVersion] = useState<SchemaVersionTypes>();
  // const [settingSchemaVersion, toggleSettingSchemaVersion] = useState<boolean>(false);
  const [currentOffchainSchema, setCurrentOffchainSchema] = useState<string>('');
  // const [offchainSchemaError, setOffchainSchemaError] = useState<boolean>(false);
  // const [settingOffChainSchema, toggleSettingOffChainSchema] = useState<boolean>(false);
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface>();
  const [isAddressCurrentlyInAdminList, setIsAddressCurrentlyInAdminList] = useState<boolean>(false);

  const [audioUrl, setAudioUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [pageUrl, setPageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  // const [isAudioUrlError, toggleAudioUrlError] = useState<boolean>(false);
  // const [isImageUrlError, toggleImageUrlError] = useState<boolean>(false);
  // const [isPageUrlError, togglePageUrlError] = useState<boolean>(false);
  // const [isVideoUrlError, toggleVideoUrlError] = useState<boolean>(false);

  const decodeOffChainSchema = useCallback((info: NftCollectionInterface): string => {
    try {
      if (collectionInfo?.SchemaVersion === 'ImageURL') {
        return hex2a(info.OffchainSchema);
      } else {
        // {"metadata" : "https://whitelabel.market/metadata/{id}"}
        const offChainSchemaDecoded = hex2a(info.OffchainSchema);
        const schemaParsed = JSON.parse(offChainSchemaDecoded) as { metadata: string };

        return schemaParsed.metadata;
      }
    } catch (e) {
      console.log('decodeOffChainSchema error', e);
    }

    return '';
  }, [collectionInfo, hex2a]);

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
          setCurrentOffchainSchema(decodeOffChainSchema(info));

          // add collection to storage
          addCollection(info);

          if (info.Sponsorship.confirmed) {
            setSponsorAddress(info.Sponsorship.confirmed);
          }

          if (info.SchemaVersion === 'Unique') {
            const schema: { metadata: string, metadataJson: MetadataJsonType } = await getAndParseOffchainSchemaMetadata(info);

            if (schema.metadataJson.audio) {
              setAudioUrl(schema.metadataJson.audio);
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
  }, [addCollection, collectionId, collectionName16Decoder, decodeOffChainSchema, getAndParseOffchainSchemaMetadata, getDetailedCollectionInfo, hex2a]);

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
      setIsSponsorAddressError(false);
      setSponsorAddress(value);
    } catch (e) {
      setIsSponsorAddressError(true);
    }
  }, []);

  const onSetDescription = useCallback((value: string) => {
    setDescription(value);
  }, []);

  const onDeleteAdmin = useCallback((address: string) => {
    if (account && collectionId && isAdmin) {
      removeCollectionAdmin({ account, adminAddress: address, collectionId, successCallback: fetchCollectionAdminList });
    }
  }, [account, collectionId, fetchCollectionAdminList, isAdmin, removeCollectionAdmin]);

  const onSetCurrentAdmin = useCallback(() => {
    if (account && collectionId && adminAddress) {
      addCollectionAdmin({ account, collectionId, newAdminAddress: adminAddress, successCallback: fetchCollectionAdminList });
      setAdminAddress('');
    }
  }, [account, addCollectionAdmin, adminAddress, collectionId, fetchCollectionAdminList]);

  const onSetSponsor = useCallback(() => {
    if (account && collectionId && sponsorAddress) {
      setCollectionSponsor({ account, collectionId, newSponsor: sponsorAddress, successCallback: fetchCollectionInfo });
      setSponsorAddress('');
    }
  }, [account, collectionId, fetchCollectionInfo, setCollectionSponsor, sponsorAddress]);

  const onApproveSponsor = useCallback(() => {
    if (account && collectionId) {
      confirmSponsorship({ account, collectionId, successCallback: fetchCollectionInfo });
    }
  }, [account, collectionId, confirmSponsorship, fetchCollectionInfo]);

  const onRemoveSponsor = useCallback(() => {
    if (account && collectionId) {
      removeCollectionSponsor({ account, collectionId, successCallback: fetchCollectionInfo });
    }
  }, [account, collectionId, fetchCollectionInfo, removeCollectionSponsor]);

  const onSetSchemaVersion = useCallback(() => {
    if (account && collectionId && currentSchemaVersion) {
      setSchemaVersion({ account, collectionId, schemaVersion: currentSchemaVersion, successCallback: fetchCollectionInfo });
    }
  }, [account, collectionId, currentSchemaVersion, fetchCollectionInfo, setSchemaVersion]);

  const onSetOffchainSchema = useCallback(() => {
    if (account && collectionId && collectionInfo) {
      let schema = '';

      if (collectionInfo?.SchemaVersion === 'ImageURL') {
        schema = currentOffchainSchema;
      } else {
        schema = `{"metadata" : "${currentOffchainSchema}"}`;
      }

      setOffChainSchema({ account, collectionId, schema, successCallback: fetchCollectionInfo });
    }
  }, [account, collectionId, collectionInfo, currentOffchainSchema, fetchCollectionInfo, setOffChainSchema]);

  const goToCollection = useCallback(async () => {
    const collectionCount = await getCreatedCollectionCount();
    const collections: Array<NftCollectionInterface> = JSON.parse(localStorage.getItem('tokenCollections') || '[]') as NftCollectionInterface[];
    const newCollections = [...collections];
    const newCollectionInfo: NftCollectionInterface = (await getDetailedCollectionInfo(collectionCount.toString())) as NftCollectionInterface;

    newCollections.push({ ...newCollectionInfo, id: collectionCount.toString() });

    localStorage.setItem('tokenCollections', JSON.stringify(newCollections));

    history.push('/wallet/');
  }, [history, getDetailedCollectionInfo, getCreatedCollectionCount]);

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

  const presetOnChainData = useCallback(() => {
    if (collectionInfo) {
      const onChainSchema = getCollectionOnChainSchema(collectionInfo);

      if (onChainSchema) {
        const { constSchema, variableSchema } = onChainSchema;

        if (constSchema) {
          setConstOnChainSchema(constSchema);
        }

        if (variableSchema) {
          setVariableOnChainSchema(variableSchema);
        }
      }
    }
  }, [collectionInfo, getCollectionOnChainSchema]);

  useEffect(() => {
    if (collectionId && !currentSchemaVersion) {
      void fetchCollectionInfo();
    }
  }, [collectionId, currentSchemaVersion, fetchCollectionInfo]);

  useEffect(() => {
    if (collectionId) {
      void fetchCollectionAdminList();
    }
  }, [collectionId, fetchCollectionAdminList]);

  useEffect(() => {
    if (collectionId && collectionInfo && collectionAdminList) {
      setIsAdmin(!!collectionAdminList.find((address: string) => address.toString() === account) || collectionInfo.Owner === account);
    }
  }, [account, collectionAdminList, collectionId, collectionInfo]);

  useEffect(() => {
    if (collectionId && collectionInfo) {
      presetOnChainData();
    }
  }, [collectionId, collectionInfo, presetOnChainData]);

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
          src={arrowLeft}
        />
        back
      </a>
      <div className='unique-card'>
        <Header as='h3'>Base settings</Header>
        <form className='unique-form'>
          <Grid className='manage-collection--form--grid'>
            <Grid.Row>
              <Grid.Column width={8}>
                <div className='form-field'>
                  <Input
                    className='isSmall'
                    isDisabled={!!collectionId}
                    onChange={setName}
                    placeholder='Enter collection name'
                    value={name}
                  />
                </div>
                <div className='form-field'>
                  <TextArea
                    isDisabled={!!collectionId}
                    onChange={onSetDescription}
                    placeholder={'Enter collection description'}
                    seed={description}
                  />
                </div>
                <div className='form-field'>
                  <Input
                    className='isSmall'
                    isDisabled={!!collectionId}
                    isError={tokenPrefix?.length > 16}
                    onChange={setTokenPrefix}
                    placeholder='Enter token prefix, max 16 symbols'
                    value={tokenPrefix}
                  />
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </form>
        <Header as='h3'>Schema version</Header>
        <form className='unique-form'>
          <Grid className='manage-collection--form--grid'>
            <Grid.Row>
              <Grid.Column width={8}>
                <div className='form-field'>
                  <Dropdown
                    defaultValue={currentSchemaVersion}
                    isDisabled={!isAdmin && !!collectionId}
                    onChange={setCurrentSchemaVersion}
                    options={SchemaOptions}
                    placeholder='Select Attribute Type'
                    value={currentSchemaVersion}
                  />
                </div>
              </Grid.Column>
              <Grid.Column
                className='flex'
                width={8}
              >
                { isAdmin && (
                  <div className='form-field'>
                    <Button
                      content={
                        <>
                          Set schema version
                        </>
                      }
                      onClick={onSetSchemaVersion}
                    />
                  </div>
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </form>
        { !collectionId && (
          <Button
            content={'Create'}
            disabled={!name || !tokenPrefix || tokenPrefix.length > 16}
            onClick={onCreateCollection}
          />
        )}
      </div>

      { (isAdmin || collectionId) && (
        <>
          <div className='unique-card'>
            <Header as='h3'>Offchain Schema</Header>
            <div className='manage-collection--form'>
              <Grid className='manage-collection--form--grid'>
                <Grid.Row>
                  <Grid.Column width={16}>
                    <div className='custom-table offchain-schema'>
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
                  </Grid.Column>
                  <Grid.Column
                    className='flex'
                    width={8}
                  >
                    <Button
                      content={
                        <>
                          Set Offchain Schema
                        </>
                      }
                      onClick={onSetOffchainSchema}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>
          </div>
          <div className='unique-card'>
            <Header as='h3'>Sponsor</Header>
            <form className='unique-form'>
              <Grid className='manage-collection--form--grid'>
                <Grid.Row>
                  <Grid.Column width={8}>
                    <Input
                      className='isSmall'
                      isDisabled={!isAdmin}
                      isError={isSponsorAddressError}
                      label='Please enter the sponsor address'
                      onChange={onSetSponsorAddress}
                      placeholder='Collection sponsor address'
                      value={sponsorAddress}
                    />
                  </Grid.Column>
                  <Grid.Column
                    className='flex'
                    width={8}
                  >
                    <Button
                      content={
                        <>
                          Set sponsor
                        </>
                      }
                      disabled={!sponsorAddress || !isAdmin}
                      onClick={onSetSponsor}
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={8}>
                    { collectionInfo?.Sponsorship.unconfirmed && (
                      <div className='text-block error'>
                        {collectionInfo?.Sponsorship.unconfirmed} unconfirmed
                      </div>
                    )}
                    { collectionInfo?.Sponsorship.disabled && (
                      <div className='text-block disabled'>
                        {collectionInfo?.Sponsorship.unconfirmed} disabled
                      </div>
                    )}
                    { collectionInfo?.Sponsorship.confirmed && (
                      <div className='text-block confirmed'>
                        {collectionInfo?.Sponsorship.unconfirmed} confirmed
                      </div>
                    )}
                  </Grid.Column>
                  { sponsorAddress === account && (
                    <Grid.Column width={4}>
                      <Button
                        content={
                          <>
                            Confirm sponsor
                          </>
                        }
                        onClick={onApproveSponsor}
                      />
                    </Grid.Column>
                  )}
                  <Grid.Column width={4}>
                    <Button
                      content={
                        <>
                          Remove sponsor
                        </>
                      }
                      disabled={!isAdmin}
                      onClick={onRemoveSponsor}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </form>
          </div>
          <div className='unique-card'>
            <Header as='h3'>Collection admin list</Header>
            { collectionAdminList?.length > 0 && (
              <div className='custom-table admin-table'>
                <div className='table-header'>
                  <div className='tr'>
                    <div className='th'>
                      Address
                    </div>
                    <div className='th' />
                  </div>
                </div>
                <div className='table-body'>
                  { collectionAdminList.map((address) => (
                    <div
                      className='tr edit'
                      key={address}
                    >
                      <div className='td'>
                        {address.toString()}
                      </div>
                      <div className='td'>
                        <img
                          alt='delete'
                          onClick={onDeleteAdmin.bind(null, address)}
                          src={trash as string}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <form className='unique-form'>
              <Grid className='manage-collection--form--grid'>
                <Grid.Row>
                  <Grid.Column width={8}>
                    <Input
                      className='isSmall'
                      isDisabled={!isAdmin}
                      isError={isAdminAddressError || isAddressCurrentlyInAdminList}
                      label='Please enter the admin address'
                      onChange={onSetAdminAddress}
                      placeholder='Collection admin address'
                      value={adminAddress}
                    />
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
                          </>
                        }
                        disabled={!adminAddress || !isAdmin}
                        onClick={onSetCurrentAdmin}
                      />
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </form>
          </div>
          <div className='unique-card'>
            <ManageCollectionAttributes
              account={account}
              basePath={basePath}
              collectionId={collectionId}
              constOnChainSchema={constOnChainSchema}
              fetchCollectionInfo={fetchCollectionInfo}
              isAdmin={isAdmin}
              saveConstOnChainSchema={saveConstOnChainSchema}
              saveVariableOnChainSchema={saveVariableOnChainSchema}
              variableOnChainSchema={variableOnChainSchema}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(ManageCollection);
