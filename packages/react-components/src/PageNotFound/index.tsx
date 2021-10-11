// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './style.scss';

import React from 'react';

import errorSvg from './images/error.svg';

function PageNotFound (): React.ReactElement {
  return (
    <div className='error-main'>
      <div className='error-content'>
        <div className='error-img'>
          <img alt='Error'
            src={errorSvg as string}/>
        </div>
        <div className='error-text'>
          <p>404</p>
          <p>Page not found</p>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PageNotFound);
