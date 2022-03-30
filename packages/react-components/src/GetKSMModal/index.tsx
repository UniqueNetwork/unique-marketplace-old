// Copyright 2017-2022 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './style.scss';

import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import React, { useCallback, useEffect, useRef } from 'react';

import envConfig from '@polkadot/apps-config/envConfig';
import { Modal } from '@polkadot/react-components';

interface Props {
  onClose: () => void;
}

function GetKSMModal ({ onClose }: Props): React.ReactElement<Props> {
  const ref = useRef<HTMLDivElement>(null);

  const handleGetKSMClickByRamp = useCallback(() => {
    const containerNode = ref.current ?? document.getElementById('root') as HTMLDivElement;

    console.log('containerNode', containerNode);

    const RampModal = new RampInstantSDK({
      containerNode,
      hostApiKey: envConfig.rampApiKey as string ?? '',
      hostAppName: 'Unique Marketplace',
      hostLogoUrl: 'https://uniquescan.io/logos/unique.svg',
      swapAsset: 'KSM',
      variant: 'embedded-mobile'
    });

    RampModal
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .on('WIDGET_CLOSE', () => {
        onClose();
      })
      .show();
  }, [onClose]);

  useEffect(() => {
    handleGetKSMClickByRamp();
  }, [handleGetKSMClickByRamp]);

  return (
    <Modal
      className='unique-modal'
      onClose={onClose}
      open
      style={{ height: '750px', width: '424px' }}
    >
      <Modal.Content>
        <div style={{ height: '667px', width: '375px' }} ref={ref} />
      </Modal.Content>
    </Modal>
  );
}

export default React.memo(GetKSMModal);
