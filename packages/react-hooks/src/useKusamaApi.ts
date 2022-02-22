// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { useCallback, useContext, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api/promise';
import envConfig from '@polkadot/apps-config/envConfig';
import { StatusContext } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks/useApi';
import { useKusamaBalance } from '@polkadot/react-hooks/useKusamaBalance';
import { formatStrBalance } from '@polkadot/react-hooks/utils';
import { encodeAddress } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/api';

const keyring = new Keyring({ type: 'sr25519' });

interface UseKusamaApiInterface {
  encodedKusamaAccount: string | undefined;
  formatKsmBalance: (balance: BN | undefined) => string;
  getKusamaTransferFee: (recipient: string, value: BN) => Promise<BN | null>;
  kusamaApi: ApiPromise | undefined;
  kusamaAvailableBalance: BN | undefined;
  kusamaTransfer: (recipient: string, value: BN, onSuccess: (status: string) => void, onFail: (status: string) => void) => void;
}

export function formatKsmBalance (value: BN | undefined = new BN(0)): string {
  const { kusamaDecimals } = envConfig;

  return formatStrBalance(value, kusamaDecimals);
}

export const useKusamaApi = (account?: string): UseKusamaApiInterface => {
  const { isKusamaApiConnected, isKusamaApiReady, kusamaApi } = useApi();
  const [api, setApi] = useState<ApiPromise>();
  const [encodedKusamaAccount, setEncodedKusamaAccount] = useState<string>();
  const { queueExtrinsic } = useContext(StatusContext);
  const { kusamaAvailableBalance } = useKusamaBalance(api, account);

  console.log('kusamaAvailableBalance', kusamaAvailableBalance);

  const kusamaTransfer = useCallback(async (recipient: string, value: BN, onSuccess: (status: string) => void, onFail: (status: string) => void) => {
    if (encodedKusamaAccount && api) {
      const extrinsic = api.tx.balances
        .transfer(recipient, value);

      const publicKey = keyring.decodeAddress(account);

      console.log('publicKey', publicKey);

      queueExtrinsic({
        accountId: encodedKusamaAccount,
        extrinsic,
        isUnsigned: false,
        txFailedCb: () => { onFail('SIGN_TRANSACTION_FAIL'); },
        txStartCb: () => { onSuccess('SIGN_SUCCESS'); },
        txSuccessCb: () => { onSuccess('TRANSFER_SUCCESS'); },
        txUpdateCb: (data) => { console.log('update', data); }
      });
    }
  }, [account, api, encodedKusamaAccount, queueExtrinsic]);

  const getKusamaTransferFee = useCallback(async (recipient: string, value: BN): Promise<BN | null> => {
    if (encodedKusamaAccount && api) {
      const transferFee = await api.tx.balances.transfer(recipient, value).paymentInfo(encodedKusamaAccount) as { partialFee: BN };

      return transferFee.partialFee;
    } else return null;
  }, [encodedKusamaAccount, api]);

  const initKusamaApi = useCallback(() => {
    if (isKusamaApiReady && isKusamaApiConnected) {
      setApi(kusamaApi);
    }
  }, [isKusamaApiReady, isKusamaApiConnected, kusamaApi]);

  useEffect(() => {
    if (account) {
      setEncodedKusamaAccount(encodeAddress(account, 2));
    }
  }, [account]);

  useEffect(() => {
    initKusamaApi();
  }, [initKusamaApi]);

  return {
    encodedKusamaAccount,
    formatKsmBalance,
    getKusamaTransferFee,
    kusamaApi: api,
    kusamaAvailableBalance,
    kusamaTransfer
  };
};
