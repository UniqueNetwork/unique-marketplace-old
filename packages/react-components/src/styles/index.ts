// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { createGlobalStyle } from 'styled-components';

import cssComponents from './components';
import cssForm from './form';
import cssMedia from './media';
import cssRx from './rx';
import cssSemantic from './semantic';
import cssTheme from './theme';

interface Props {
  uiHighlight?: string;
}

export default createGlobalStyle<Props & ThemeProps>(({ theme, uiHighlight }: Props & ThemeProps) => `
  /* Add our overrides */
  ${cssSemantic(theme)}
  ${cssTheme}
  ${cssForm}
  ${cssMedia}
  ${cssRx}
  ${cssComponents(theme)}
`);
