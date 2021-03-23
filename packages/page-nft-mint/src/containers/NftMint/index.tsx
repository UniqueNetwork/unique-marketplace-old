// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { ImageType } from 'react-images-uploading/dist/typings';

import React, { useCallback, useState } from 'react';
import ImageUploading from 'react-images-uploading';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { Button, Input } from '@polkadot/react-components';

// local imports and components
import useMintApi, { ImageInterface } from '../../hooks/useMintApi';

const maxFileSize = 5000000;

function NftMint ({ account }: { account?: string }): React.ReactElement {
  const [images, setImages] = useState<ImageType[]>([]);
  const [imageBase64, setImageBase64] = useState<string>();
  const [imageFileName, setImageFileName] = useState<string>();
  const [imageName, setImageName] = useState<string>();
  const { imgLoading, serverIsReady, uploadImage, uploadingError } = useMintApi();

  const onChangeString = useCallback((value) => {
    setImageName(value);
  }, [setImageName]);

  const onFileUpload = useCallback((imageList: ImageType[]) => {
    // data for submit
    setImages(imageList);

    const imageItem: ImageType = imageList[0];

    if (imageItem) {
      const imageFileName: string = imageItem.file ? imageItem.file.name : '';
      const imageBase64String: string = imageItem.dataURL ? imageItem.dataURL : '';
      const indexRemoveTo: number = imageBase64String.indexOf('base64,');
      const shortBase64String = imageBase64String.length >= indexRemoveTo + 7
        ? imageBase64String.replace(imageBase64String.substring(0, indexRemoveTo + 7), '')
        : imageBase64String;

      setImageBase64(shortBase64String);
      setImageFileName(imageFileName);
    }
  }, []);

  const onSaveToken = useCallback(() => {
    if (imageBase64 && imageName && serverIsReady && account) {
      const newToken: ImageInterface = {
        address: account,
        filename: imageFileName || imageName,
        image: imageBase64,
        name: imageName
      };

      uploadImage(newToken);
    }
  }, [account, imageBase64, imageFileName, imageName, serverIsReady, uploadImage]);

  return (
    <main className='mint-tokens'>
      <Header as='h1'>Mint Tokens</Header>
      <Form className='collection-search'>
        <Grid className='mint-grid'>
          <Grid.Row>
            <Grid.Column width={16}>
              <Form.Field>
                <Input
                  className='isSmall'
                  label={<span>Enter your token name</span>}
                  onChange={onChangeString}
                  // value={searchString}
                  placeholder='Token Name'
                  withLabel
                />
              </Form.Field>
              <Form.Field>
                <ImageUploading
                  maxFileSize={maxFileSize}
                  maxNumber={1}
                  onChange={onFileUpload}
                  value={images}
                >
                  {({ dragProps,
                    errors,
                    imageList,
                    isDragging,
                    onImageRemove,
                    onImageUpdate,
                    onImageUpload }) => (
                    // write your building UI
                    <div className='upload__image-wrapper'>
                      { (!imageList || !(imageList as ImageType[]).length) && (
                        <div
                          className='drop-zone'
                          {...dragProps}
                          onClick={onImageUpload as (e: React.MouseEvent<HTMLDivElement>) => void}
                          style={isDragging ? { background: '#A2DD18' } : undefined}
                        >
                          Click or Drop here
                        </div>
                      )}
                      { (imageList as ImageType[]).map((image: ImageType, index: number) => (
                        <div
                          className='image-item'
                          key={index}
                        >
                          <img alt=''
                            src={image.dataURL}
                            width='100' />
                          <div className='image-item__btn-wrapper'>
                            <Button
                              icon='pencil-alt'
                              label='Update'
                              onClick={(onImageUpdate as (index: number) => void).bind(null, index)}
                            />
                            <Button
                              icon='trash-alt'
                              label='Remove'
                              onClick={(onImageRemove as (index: number) => void).bind(null, index)}
                            />
                          </div>
                        </div>
                      ))}
                      {errors && (
                        <div>
                          {errors.maxNumber && <span>Number of selected images exceed maxNumber</span>}
                          {errors.acceptType && <span>Your selected file type is not allow</span>}
                          {errors.maxFileSize && <span>Selected file size exceed maxFileSize</span>}
                          {errors.resolution && <span>Selected file is not match your desired resolution</span>}
                          {uploadingError && <span>{uploadingError}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </ImageUploading>
              </Form.Field>
              { (imageBase64 && imageName) && (
                <Button
                  icon='check'
                  label='Save'
                  onClick={onSaveToken}
                />
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
        { imgLoading && (
          <div className='dimmer-loader'>
            <Loader
              active
              inline='centered'
            >
              Minting NFT...
            </Loader>
          </div>
        )}
      </Form>
    </main>
  );
}

export default React.memo(NftMint);
