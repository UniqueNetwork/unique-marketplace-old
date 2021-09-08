import React from 'react';
import styled from 'styled-components';
import './apps.scss';

import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';

import ArtpoolGreen from '../public/logos/artpool_hover.svg';
import byArtCuratorGrid from '../public/images/byArtCuratorGrid.svg';
import instagramLogo from '../public/images/instagramLogo.svg';
import acg from '../public/images/acg.svg';

interface Props {
  className?: string;
}

function Footer ({ className }: Props): React.ReactElement<Props> {
  return (
    <>
      <footer className='app-footer'>
        <div className='app-container app-container--footer'>
          <Grid className={'footer--grid'} columns={3}>
            <Grid.Row>
              <Grid.Column className={'footer--grid--left'}>
                <Image src={ArtpoolGreen} className='footer--grid--left--logo'/>
                <div className='footer--grid--left--copy'>
                  ©️️ 2021 Artpool <Image src={byArtCuratorGrid} className='footer--grid--left--byACG' />
                </div>
              </Grid.Column>
              <Grid.Column className={'footer--grid--center'}>
                <Grid columns={2} className={'footer--grid--center--links'}>
                  <Grid.Row>
                    <Grid.Column >
                      <a href={'/'}><p>About</p></a>
                      <a href={'/'}><p>NFTs</p></a>
                      <a href={'/'}><p>Projects</p></a>
                      <a href={'/'}><p>Community</p></a>
                    </Grid.Column>
                    <Grid.Column>
                      <a href={'/'}><p>FAQ</p></a>
                      <a href={'/'}><p>Help</p></a>
                      <a href={'/'}><p>Privacy</p></a>
                      <a href={'/'}><p>Terms of Service</p></a>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>


              </Grid.Column>
              <Grid.Column className='footer--grid--right'>
                <Image src={acg} className='footer--grid--right--image'/>
                <Image src={instagramLogo}  className='footer--grid--right--image'/>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </footer>
    </>

  );
}

export default React.memo(styled(Footer)`
  background: #f2f2f2;
  font-size: 0.85rem;
  line-height: 1rem;
  overflow: hidden;
  padding: 0.5rem 1rem;
  position: fixed;
  right: 0;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
  top: 0;

  div {
    display: inline-block;
    vertical-align: middle;
  }

  > div {
    border-left: 1px solid #ccc;
    padding: 0 0.5rem;

    &:first-child {
      border-width: 0;
    }
  }
`);
