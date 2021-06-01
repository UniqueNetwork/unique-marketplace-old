// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { memo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop (): null {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default memo(ScrollToTop);
