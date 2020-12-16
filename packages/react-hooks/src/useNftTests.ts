// Copyright 2020 UseTech authors & contributors
import {useCallback, useContext} from 'react';
import { useApi } from '@polkadot/react-hooks';
import { StatusContext } from '@polkadot/react-components/Status';

// https://docs.google.com/document/d/1WED9VP8Yj52Un4qmkGDpzjesQTzwwoDgYMk1Ty8yftQ/edit
export function useNftTests(account: string | null | undefined) {
  const { api } = useApi();
  const { queueExtrinsic } = useContext(StatusContext);

  const createCollection = useCallback(() => {
    const name = [0x53, 0x75, 0x62, 0x73, 0x74, 0x72, 0x61, 0x70, 0x75, 0x6e, 0x6b, 0x73];
    const description = [0x52, 0x65, 0x6d, 0x61, 0x6b, 0x65, 0x20, 0x6f, 0x66, 0x20, 0x63, 0x6c, 0x61, 0x73, 0x73, 0x69, 0x63, 0x20, 0x43, 0x72, 0x79, 0x70, 0x74, 0x6f, 0x50, 0x75, 0x6e, 0x6b, 0x73, 0x20, 0x67, 0x61, 0x6d, 0x65];
    const tokenPrefix = [0x50, 0x4e, 0x4b];
    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: api.tx.nft.createCollection(name, description, tokenPrefix, { "NFT": 20 }),
      isUnsigned: false,
      txFailedCb: () => console.log('createCollection fail'),
      txStartCb: () => console.log('transfer start'),
      txSuccessCb: () => console.log('createCollection success'),
      txUpdateCb: () => console.log('transfer update')
    });
  }, [account, api, queueExtrinsic]);

  const createToken = useCallback(() => {
    const name = [0x53, 0x75, 0x62, 0x73, 0x74, 0x72, 0x61, 0x70, 0x75, 0x6e, 0x6b, 0x73];
    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: api.tx.nft.createItem(5, account, name),
      isUnsigned: false,
      txFailedCb: () => console.log('createCollection fail'),
      txStartCb: () => console.log('transfer start'),
      txSuccessCb: () => console.log('createCollection success'),
      txUpdateCb: () => console.log('transfer update')
    });
  }, [account, api, queueExtrinsic]);

  return {
    createCollection,
    createToken
  };
}
