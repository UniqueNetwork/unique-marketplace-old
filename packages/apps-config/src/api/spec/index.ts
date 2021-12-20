// Copyright 2017-2021 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OverrideBundleDefinition } from '@polkadot/types/types';

import opal from './opal';
import quartz from './quartz';
import unique from './unique';

// NOTE: The mapping is done from specName in state.getRuntimeVersion
const spec: Record<string, OverrideBundleDefinition> = {
  nft: unique,
  opal: opal,
  quartz: quartz
};

export default spec;
