// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';
import { NftCollectionInterface, useCollection } from '@polkadot/react-hooks/useCollection';

export function useCollectionCover (collectionInfo: NftCollectionInterface | undefined): { imgUrl: string | undefined } {
  const { getCollectionOnChainSchema } = useCollection();
  const [imgUrl, setImgUrl] = useState<string>();
  const { ipfsGateway } = envConfig;

  const fillCollectionCover = useCallback(() => {
    if (collectionInfo?.variableOnChainSchema && ipfsGateway) {
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
    }
  }, [collectionInfo, getCollectionOnChainSchema, ipfsGateway]);

  useEffect(() => {
    fillCollectionCover();
  }, [fillCollectionCover]);

  return {
    imgUrl
  };
}
