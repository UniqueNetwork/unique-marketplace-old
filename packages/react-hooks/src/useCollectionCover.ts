// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';
import { useDecoder, useMetadata } from '@polkadot/react-hooks';
import { NftCollectionInterface, useCollection } from '@polkadot/react-hooks/useCollection';

export function useCollectionCover (collectionInfo: NftCollectionInterface | undefined): { imgUrl: string | undefined } {
  const { getCollectionOnChainSchema } = useCollection();
  const { hex2a } = useDecoder();
  const { getTokenImageUrl } = useMetadata();
  const [imgUrl, setImgUrl] = useState<string>();
  const { ipfsGateway } = envConfig;

  const fillCollectionCover = useCallback(async () => {
    if (collectionInfo) {
      if (collectionInfo.variableOnChainSchema && hex2a(collectionInfo.variableOnChainSchema) && ipfsGateway) {
        const onChainSchema = getCollectionOnChainSchema(collectionInfo);

        if (onChainSchema) {
          const { variableSchema } = onChainSchema;

          if (variableSchema?.collectionCover) {
            setImgUrl(`${ipfsGateway}/${variableSchema.collectionCover}`);
          } else {
            console.log('variableSchema is empty');
          }
        }
      } else {
        console.log('onChainSchema is empty');

        const tokenImage = await getTokenImageUrl(collectionInfo, '1');

        setImgUrl(tokenImage);
      }
    }
  }, [collectionInfo, getCollectionOnChainSchema, getTokenImageUrl, hex2a, ipfsGateway]);

  useEffect(() => {
    void fillCollectionCover();
  }, [fillCollectionCover]);

  return {
    imgUrl
  };
}
