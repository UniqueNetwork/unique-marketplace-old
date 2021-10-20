// Copyright 2017-2021 Art Curator Grid/Artpool authors & contributors
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line header/header
import './apps.scss';

import React from 'react';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import styled from 'styled-components';

import { ACG_URL, DISCORD_URL, INSTAGRAM_URL, LINKEDIN_URL, TELEGRAM_URL, TWITTER_URL } from '@polkadot/apps/constants';

import AcgLogoCompleteIcon from '../public/images/AcgLogoCompleteIcon.svg';
import AcgLogoIcon from '../public/images/AcgLogoIcon.svg';
import AcgLogoGreen from '../public/images/ARTPOOL_Green_RGB.svg';
import DiscordIcon from '../public/images/DiscordIcon.svg';
import InstagramIcon from '../public/images/InstagramIcon.svg';
import LinkedinIcon from '../public/images/LinkedinIcon.svg';
import TelegramIcon from '../public/images/TelegramIcon.svg';
import TwitterIcon from '../public/images/TwitterIcon.svg';

interface Props {
  className?: string;
}

function Footer ({ className }: Props): React.ReactElement<Props> {
  return (
    <>
      <footer className='app-footer'>
        <div className='app-container app-container--footer'>
          <Grid
            className={'footer--grid'}
            columns={3}
          >
            <Grid.Row>
              <Grid.Column className={'footer--grid--left'}>
                <Image
                  className='footer--grid--left--logo'
                  src={AcgLogoGreen}
                />
                <div className='footer--grid--left--copy'>
                  ©️️ 2021 Artpool By <Image
                  className='footer--grid--left--byACG'
                  src={AcgLogoIcon}
                /> Art Curator Grid
                </div>
              </Grid.Column>
              <Grid.Column className={'footer--grid--center'} />
              <Grid.Column className='footer--grid--right'>
                <a
                  href={ACG_URL}
                  target='blank'
                >
                  <Image
                    className='footer--grid--right--image'
                    src={AcgLogoCompleteIcon}
                  />
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target='blank'
                >
                  <Image
                    className='footer--grid--right--image'
                    src={InstagramIcon}
                  />
                </a>
                <a
                  href={DISCORD_URL}
                  target='blank'
                >
                  <Image
                    className='footer--grid--right--image'
                    src={DiscordIcon}
                  />
                </a>
                <a
                  href={TELEGRAM_URL}
                  target='blank'
                >
                  <Image
                    className='footer--grid--right--image'
                    src={TelegramIcon}
                  />
                </a>
                <a
                  href={TWITTER_URL}
                  target='blank'
                >
                  <Image
                    className='footer--grid--right--image'
                    src={TwitterIcon}
                  />
                </a>
                <a
                  href={LINKEDIN_URL}
                  target='blank'
                >
                  <Image
                    className='footer--grid--right--image'
                    src={LinkedinIcon}
                  />
                </a>
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
