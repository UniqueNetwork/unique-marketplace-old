// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { Metadata } from '@polkadot/metadata';
import metaStatic from '@polkadot/metadata/static';
import { TypeRegistry } from '@polkadot/types';

export const useRegistry = (): TypeRegistry | undefined => {
  const [localRegistry, setLocalRegistry] = useState<TypeRegistry>();

  const createRegistry = useCallback(() => {
    const registry = new TypeRegistry();

    const metadata = new Metadata(registry, metaStatic);

    registry.setMetadata(metadata);

    setLocalRegistry(registry);
  }, []);

  useEffect(() => {
    createRegistry();
  }, [createRegistry]);

  return localRegistry;
};
