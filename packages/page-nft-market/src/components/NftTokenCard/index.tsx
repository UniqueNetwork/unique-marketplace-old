// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import type { OfferType } from '@polkadot/react-hooks/useCollections';

import BN from 'bn.js';
import React, { useCallback } from 'react';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Card from 'semantic-ui-react/dist/commonjs/views/Card';

import { useApi, useDecoder, useSchema } from '@polkadot/react-hooks';
import { formatKsmBalance } from '@polkadot/react-hooks/useKusamaApi';
import logoKusama from '../../../../../packages/apps/public/logos/kusama.svg';
import { useTimeToFinishAuction } from '@polkadot/react-hooks/useTimeToFinishAuction';
import { useBidStatus } from '@polkadot/react-hooks/useBidStatus';
import { adaptiveFixed } from '@polkadot/react-components/util';

interface Props {
  account: string | undefined;
  collectionId: string;
  openDetailedInformationModal: (collectionId: string, tokenId: string) => void;
  token: OfferType;
}

const NftTokenCard = ({ account, collectionId, openDetailedInformationModal, token }: Props): React.ReactElement<Props> => {
  const { collectionInfo, tokenName, tokenUrl } = useSchema(account, collectionId, token.tokenId);
  const { collectionName16Decoder, hex2a } = useDecoder();
  const { bids, status, stopAt } = token.auction;
  const timeToFinish = useTimeToFinishAuction(stopAt);
   const { yourBidIsLeading, yourBidIsOutbid } = useBidStatus(bids, account);
  const { systemChain } = useApi();
  const currentChain = systemChain.split(' ')[0];
  const onCardClick = useCallback(() => {
    openDetailedInformationModal(collectionId, token.tokenId);
  }, [collectionId, openDetailedInformationModal, token]);

  return (
    <Card
      className='token-card'
      key={token.tokenId}
      onClick={onCardClick}
    >
      {token && (
        <Image
          src={tokenUrl}
          ui={false}
          wrapped
        />
      )}
      {!!(token && collectionInfo) && (
        <Card.Content>
          <Card.Description>
            <div className='card-name'>
              <div className='card-name__title'>{hex2a(collectionInfo.tokenPrefix)} {`#${token.tokenId}`} {tokenName?.value}</div>
              <div className='card-name__field'>
                <a href={`https://uniquescan.io/${currentChain}/collections/${collectionId}`}>
                  {`${collectionName16Decoder(collectionInfo.name)} [${collectionId}]`}
                </a>
              </div>
            </div>
            {token.price && (!status) && (
              <>
                <div className='card-price'>
                  <div className='card-price__title'>{formatKsmBalance(new BN(token.price))}</div>
                  <img width={16} src={logoKusama as string} />
                </div>
                <div className='caption grey'>Price</div>
              </>
            )}
            {/* {status === 'created' && ( */}
              <>
                <div className='card-price'>
                  <div className='card-price__title'> {adaptiveFixed(Number(formatKsmBalance(new BN(token.price))), 4)}</div>
                  <img width={16} src={logoKusama as string} />
                </div>
                <div className='caption-row'>
                  {yourBidIsLeading && <div className='caption green'> Leading bid</div>}
                  {yourBidIsOutbid && <div className='caption red'> Outbid</div>}
                  {!yourBidIsLeading && !yourBidIsOutbid && <div className='caption grey'>{bids[0] ? 'Last bid' : 'Minimum bid '}</div>}
                  <div className='caption'>{timeToFinish}</div>
                </div>
              </>
            {/* )} */}
          </Card.Description>
          <Card.Meta>
            <span className='link'>View
              <svg
                fill='none'
                height='16'
                viewBox='0 0 16 16'
                width='16'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M2.5 8H13.5'
                  stroke='var(--card-link-color)'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M9 3.5L13.5 8L9 12.5'
                  stroke='var(--card-link-color)'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
          </Card.Meta>
        </Card.Content>
      )}
    </Card>
  );
};

export default React.memo(NftTokenCard);
