// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { useCallback, useContext, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api/promise';
import { typesBundle, typesChain } from '@polkadot/apps-config';
import envConfig from '@polkadot/apps-config/envConfig';
import { StatusContext } from '@polkadot/react-components';
import { BalanceInterface } from '@polkadot/react-hooks/useBalance';
import ApiSigner from '@polkadot/react-signer/signers/ApiSigner';
import { WsProvider } from '@polkadot/rpc-provider';
import { TypeRegistry } from '@polkadot/types/create';
import { encodeAddress } from '@polkadot/util-crypto';

const { kusamaDecimals, minPrice } = envConfig;

interface UseKusamaApiInterface {
  formatKsmBalance: (balance: BN | undefined) => string;
  getKusamaBalance: () => void;
  getKusamaTransferFee: (recipient: string, value: BN) => Promise<BN | null>;
  kusamaApi: ApiPromise | undefined;
  kusamaBalance: BalanceInterface | undefined;
  kusamaTransfer: (recipient: string, value: BN, onSuccess: (status: string) => void, onFail: (status: string) => void) => void;
}

export function formatKsmBalance (value: BN | undefined = new BN(0)): string {
  return formatStrBalance(kusamaDecimals, value);
}

export function formatStrBalance (decimals: number, value: BN | undefined = new BN(0)): string {
  const floatValue = parseFloat(value.toString()) / Math.pow(10, decimals);
  const arr = floatValue.toString().split('.');

  if (floatValue === 0) {
    return '0';
  }

  if (floatValue < minPrice && floatValue > 0) {
    return `< ${minPrice}`;
  }

  return `${arr[0]}${arr[1] ? `.${arr[1].substr(0, 6)}` : ''}`;
}

export const useKusamaApi = (account?: string): UseKusamaApiInterface => {
  const { queuePayload, queueSetTxStatus } = useContext(StatusContext);
  const [kusamaApi, setKusamaApi] = useState<ApiPromise>();
  const [kusamaBalance, setKusamaBalance] = useState<BalanceInterface>();
  const [encodedKusamaAccount, setEncodedKusamaAccount] = useState<string>();
  const { queueExtrinsic } = useContext(StatusContext);
  const kusamaParity = 'wss://kusama-rpc.polkadot.io';
  const kusamaFinality = 'wss://polkadot.api.onfinality.io/public-ws';

  const getKusamaBalance = useCallback(async () => {
    try {
      if (kusamaApi && encodedKusamaAccount) {
        const kusamaAccountBalance: { data: BalanceInterface } = await kusamaApi.query.system.account(encodedKusamaAccount);

        setKusamaBalance(kusamaAccountBalance.data);
      }
    } catch (e) {
      console.log('kusama balance error', e);
    }
  }, [encodedKusamaAccount, kusamaApi]);

  const initKusamaApi = useCallback((kusamaUrl) => {
    const registry = new TypeRegistry();
    const provider = new WsProvider(kusamaUrl);
    const signer = new ApiSigner(registry, queuePayload, queueSetTxStatus);
    const types = {} as Record<string, Record<string, string>>;

    const api = new ApiPromise({ provider, registry, signer, types, typesBundle, typesChain });

    api.on('ready', (): void => {
      // console.log('kusama api ready');
      setKusamaApi(api);
    });

    api.on('error', (): void => {
      console.log('kusama api error');

      void api.disconnect().then(() => {
        initKusamaApi(kusamaFinality);
      });
    });
  }, [queuePayload, queueSetTxStatus]);

  const kusamaTransfer = useCallback((recipient: string, value: BN, onSuccess: (status: string) => void, onFail: (status: string) => void) => {
    if (encodedKusamaAccount && kusamaApi) {
      queueExtrinsic({
        accountId: encodedKusamaAccount,
        extrinsic: kusamaApi.tx.balances
          .transfer(recipient, value),
        isUnsigned: false,
        txFailedCb: () => { onFail('SEND_MONEY_FAIL'); },
        txStartCb: () => { console.log('start'); },
        txSuccessCb: () => { onSuccess('SEND_MONEY_SUCCESS'); },
        txUpdateCb: () => { console.log('update'); }
      });
    }
  }, [encodedKusamaAccount, kusamaApi, queueExtrinsic]);

  const getKusamaTransferFee = useCallback(async (recipient: string, value: BN): Promise<BN | null> => {
    if (encodedKusamaAccount && kusamaApi) {
      const transferFee = await kusamaApi.tx.balances.transfer(recipient, value).paymentInfo(encodedKusamaAccount) as { partialFee: BN };

      return transferFee.partialFee;
    } else return null;
  }, [encodedKusamaAccount, kusamaApi]);

  useEffect(() => {
    if (account) {
      setEncodedKusamaAccount(encodeAddress(account, 2));
    }
  }, [account]);

  useEffect(() => {
    void getKusamaBalance();
  }, [getKusamaBalance]);

  useEffect(() => {
    initKusamaApi(kusamaParity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    formatKsmBalance,
    getKusamaBalance,
    getKusamaTransferFee,
    kusamaApi,
    kusamaBalance,
    kusamaTransfer
  };
};
