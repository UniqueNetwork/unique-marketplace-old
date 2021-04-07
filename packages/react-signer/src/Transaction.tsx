// Copyright 2017-2021 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { QueueTx } from '@polkadot/react-components/Status/types';

import BN from 'bn.js';
import React from 'react';

import PaymentInfo from './PaymentInfo';

interface Props {
  className?: string;
  currentItem: QueueTx;
  onError: () => void;
  tip?: BN;
}

function Transaction ({ className, currentItem: { accountId, extrinsic, isUnsigned, payload }, tip }: Props): React.ReactElement<Props> | null {

  if (!extrinsic) {
    return null;
  }

  return (
    <div className={className}>
      {!isUnsigned && !payload && (
        <PaymentInfo
          accountId={accountId}
          className='tx-details'
          extrinsic={extrinsic}
          tip={tip}
        />
      )}
    </div>
  );
}

export default React.memo(Transaction);
