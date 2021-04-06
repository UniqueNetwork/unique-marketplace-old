// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { useCallback, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { Input } from '@polkadot/react-components';
import { keyring } from '@polkadot/ui-keyring';

interface Props {
  account: string;
}

function ManageCollection (props: Props): React.ReactElement<Props> {
  const { account } = props;
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [tokenPrefix, setTokenPrefix] = useState<string>();
  const [adminAddress, setAdminAddress] = useState<string>();
  const [sponsorAddress, setSponsorAddress] = useState<string>();
  const [showAdminForm, toggleAdminForm] = useState<boolean>(true);
  const [showSponsorForm, toggleSponsorForm] = useState<boolean>(true);
  const [isAdminAddressError, setIsAdminAddressError] = useState<boolean>(true);
  const [isSponsorAddressError, setIsSponsorAddressError] = useState<boolean>(true);
  const [deletingCurrentAdmin, toggleDeletingCurrentAdmin] = useState<boolean>(false);
  const [settingCurrentAdmin, toggleSettingCurrentAdmin] = useState<boolean>(false);
  const [settingSponsor, toggleSettingSponsor] = useState<boolean>(false);
  const [approvingSponsor, toggleApprovingSponsor] = useState<boolean>(false);

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

  return (
    <div className='manage-collection'>
      {account}
      Задать/подтвердить режим спонсора
      Создать метаданные и задать схему
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
                <Input
                  className='isSmall'
                  onChange={setDescription}
                  placeholder='Enter collection description'
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
              <Form.Field>
                Collection sponsor: currentSponsorAddress
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
              </Form.Field>
              { showSponsorForm && (
                <>
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
                  <Form.Field>
                    <Button
                      content={
                        <>
                          Set collection sponsor
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
                  </Form.Field>
                </>
              )}
              <Form.Field>
                Collection admin: currentAdminAddress
                <Button
                  content={
                    <>
                      Delete current admin
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
              </Form.Field>
              { showAdminForm && (
                <>
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
                  <Form.Field>
                    <Button
                      content={
                        <>
                          Set collection admin
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
                  </Form.Field>
                </>
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </div>
  );
}

export default React.memo(ManageCollection);
