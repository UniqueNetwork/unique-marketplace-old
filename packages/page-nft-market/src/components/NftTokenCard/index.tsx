// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { OfferType } from '@polkadot/react-hooks/useCollections';

import BN from 'bn.js';
import React, { useCallback } from 'react';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Card from 'semantic-ui-react/dist/commonjs/views/Card';

import { useDecoder, useSchema } from '@polkadot/react-hooks';
import { formatKsmBalance } from '@polkadot/react-hooks/useKusamaApi';
//===================================================//

import Tilt from 'react-parallax-tilt';
//===============================================//


interface Props {
  account: string | undefined;
  collectionId: string;
  openDetailedInformationModal: (collectionId: string, tokenId: string) => void;
  token: OfferType;
}

const NftTokenCard = ({ account, collectionId, openDetailedInformationModal, token }: Props): React.ReactElement<Props> => {
  const { collectionInfo, tokenName, tokenUrl } = useSchema(account, collectionId, token.tokenId);
  const { collectionName16Decoder, hex2a } = useDecoder();

  const onCardClick = useCallback(() => {
    openDetailedInformationModal(collectionId, token.tokenId);
  }, [collectionId, openDetailedInformationModal, token]);




  //==================================//



  //================================//
  return (
    <Tilt
      className="parallax-effect"
      perspective={500}
      glareEnable={true} glareMaxOpacity={0.6} glareColor="#057453" glarePosition="all" glareBorderRadius="1px"
    >
      <div className="inner-element">
        <Card
          raised
          className='token-card'
          key={token.tokenId}
          onClick={onCardClick}

        >


          {token && (

            <Image
              src={tokenUrl}
              ui={false}
              size='medium'
              centered

            />

          )}
          {!!(token && collectionInfo) && (



            <Card.Content>
              <Card.Description>

                <div className='card-name'>
                  <div className='card-name__title'>{hex2a(collectionInfo.tokenPrefix)} {`#${token.tokenId}`} {tokenName?.value}</div>
                  <div className='card-name__field'>{collectionName16Decoder(collectionInfo.name)}</div>
                </div>
                {token.price && (
                  <div className='card-price'>
                    <div className='card-price__title'> {formatKsmBalance(new BN(token.price))} KSM</div>
                  </div>
                )}

              </Card.Description>

              <Card.Meta>
                <span className='link'>View
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 14L8 10H16L12 14Z" fill="black" />
                  </svg>

                </span>
              </Card.Meta>


            </Card.Content>


          )}

        </Card >

      </div>
    </Tilt>
  );
};

export default React.memo(NftTokenCard);