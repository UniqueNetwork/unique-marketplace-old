// Copyright 2017-2021 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconName } from '@fortawesome/fontawesome-svg-core';
import type { TFunction } from 'i18next';
import type { KeyringStore } from '@polkadot/ui-keyring/types';

import React from 'react';

import { AppProps, BareProps } from '@polkadot/react-components/types';

export type RouteGroup = 'accounts' | 'developer' | 'governance' | 'network' | 'nft' | 'settings';

export interface RouteProps extends AppProps, BareProps {
  account?: string;
  location: any;
}

export interface Route {
  Component: React.ComponentType<RouteProps>;
  Modal?: React.ComponentType<any>;
  display: {
    isHidden?: boolean;
    isModal?: boolean;
    needsAccounts?: boolean;
    needsApi?: (string | string[])[];
    needsSudo?: boolean;
  };
  group: RouteGroup;
  icon: IconName;
  isIgnored?: boolean;
  name: string;
  text: string;
  useCounter?: () => number | string | null;
}

export type Routes = Route[];

interface Props {
  create: (t: TFunction) => Routes;
  store?: KeyringStore;
}

declare module 'uiCore/ApiWrapper' {
  const ApiWrapper: React.ComponentType;

  export default ApiWrapper;
}
