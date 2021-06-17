// Copyright 2017-2021 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import './initSettings';
import 'semantic-ui-css/semantic.min.css';

// import '@polkadot/react-components/i18n';
import React from 'react';
import ReactDOM from 'react-dom';

import create from '@polkadot/apps-routing';

// import loadComponent from './loadComponent';
import ApiWrapper from 'uiCore/ApiWrapper';

// const ApiWrapper = React.lazy(() => import('uiCore/ApiWrapper'));

const rootId = 'root';
const rootElement = document.getElementById(rootId);

if (!rootElement) {
  throw new Error(`Unable to find element with id '${rootId}'`);
}

// loadComponent('uiCore', 'ApiWrapper');

ReactDOM.render(
  <div>
    <ApiWrapper
      create={create}
    />
  </div>,
  rootElement
);
