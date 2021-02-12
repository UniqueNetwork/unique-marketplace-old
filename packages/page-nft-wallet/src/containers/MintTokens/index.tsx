// Copyright 2020-2021 UseTech authors & contributors

// global app props and types
import { ImageInterface } from '../../types';

// external imports
import React, { useCallback, useState } from 'react';
import { Button, Input } from '@polkadot/react-components';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

// local imports and components
import useMintApi from '../../hooks/useMintApi';
import './styles.scss';
import AccountSelector from "../../components/AccountSelector";

interface MintTokensProps {
  className?: string;
}

const maxFileSize = 5000000;

function MintTokens ({ className }: MintTokensProps): React.ReactElement<MintTokensProps> {
  const [images, setImages] = React.useState([]);
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [imageName, setImageName] = useState<string | undefined>();
  const [account, setAccount] = useState<string | null>(null);
  const { imgLoading, serverIsReady, uploadImage } = useMintApi();

  const onChangeString = useCallback((value) => {
    setImageName(value);
  }, [setImageName]);

  const onFileUpload = useCallback((imageList: ImageListType) => {
    // data for submit
    setImages(imageList as never[]);
    const imageBase64String = imageList[0] && imageList[0].dataURL ? imageList[0].dataURL : '';
    const indexRemoveTo = imageBase64String.indexOf('base64,');
    const shortBase64String = imageBase64String.length >= indexRemoveTo + 7
      ? imageBase64String.replace(imageBase64String.substring(0, indexRemoveTo + 7), "")
      : imageBase64String;
    setImageBase64(shortBase64String);
  }, []);

  const onSaveToken = useCallback(() => {
    if (imageBase64 && imageName && serverIsReady && account) {
      const newToken: ImageInterface = {
        address: account,
        image: imageBase64,
        name: imageName
      };

      uploadImage(newToken);
    }
  }, [imageBase64, imageName]);

  return (
    <main className="mint-tokens">
      <Header as='h1'>Mint Tokens</Header>
      <Form className='collection-search'>
        <Grid className='mint-grid'>
          <Grid.Row>
            <Grid.Column width={16}>
              <AccountSelector onChange={setAccount} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <Form.Field>
                <Input
                  className='explorer--query label-small'
                  label={<span>Enter your token name</span>}
                  onChange={onChangeString}
                  // value={searchString}
                  placeholder='Token Name'
                  withLabel
                />
              </Form.Field>
              <Form.Field>
                <ImageUploading
                  value={images}
                  onChange={onFileUpload}
                  maxFileSize={maxFileSize}
                  maxNumber={1}
                >
                  {({
                      errors,
                      imageList,
                      onImageUpload,
                      onImageUpdate,
                      onImageRemove,
                      isDragging,
                      dragProps
                    }) => (
                    // write your building UI
                    <div className='upload__image-wrapper'>
                      { (!imageList || !imageList.length) && (
                        <div
                          className='drop-zone'
                          {...dragProps}
                          style={isDragging ? { background: "#A2DD18" } : undefined}
                          onClick={onImageUpload}
                        >
                          Click or Drop here
                        </div>
                      )}
                      {imageList.map((image, index) => (
                        <div key={index} className='image-item'>
                          <img src={image.dataURL} alt='' width='100' />
                          <div className='image-item__btn-wrapper'>
                            <Button
                              icon='pencil-alt'
                              label='Update'
                              onClick={onImageUpdate.bind(null, index)}
                            />
                            <Button
                              icon='trash-alt'
                              label='Remove'
                              onClick={onImageRemove.bind(null, index)}
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
            <Loader active inline='centered'>Minting NFT...</Loader>
          </div>
        )}
      </Form>
    </main>
  );
}

export default React.memo(MintTokens);
