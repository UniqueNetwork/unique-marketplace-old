// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState } from 'react';
import Popup from 'semantic-ui-react/dist/commonjs/modules/Popup';

import question from '@polkadot/app-accounts/Accounts/question.svg';

interface Props {
  className?: string;
  content?: JSX.Element;
  defaultPosition?:
  | 'top left'
  | 'top right'
  | 'bottom right'
  | 'bottom left'
  | 'right center'
  | 'left center'
  | 'top center'
  | 'bottom center';
  mobilePosition?:
  | 'top left'
  | 'top right'
  | 'bottom right'
  | 'bottom left'
  | 'right center'
  | 'left center'
  | 'top center'
  | 'bottom center'
}

function HelpTooltip ({ className = '', content, defaultPosition = 'right center', mobilePosition = 'bottom left' }: Props): React.ReactElement<Props> {
  const popupQuestionRef = useRef<HTMLImageElement>(null);
  const mqList = window.matchMedia('(max-width: 767px)');
  const [isMobile, setIsMobile] = useState<boolean>(mqList.matches);

  useEffect(() => {
    const onChange = () => setIsMobile(mqList.matches);

    mqList.addEventListener('change', onChange);

    return () => mqList.removeEventListener('change', onChange);
  }, [mqList]);

  return (
    <Popup
      className={className}
      content={content}
      on={'click'}
      position={isMobile ? mobilePosition : defaultPosition }
      trigger={<img
        alt='question'
        ref={popupQuestionRef}
        src={question as string}
        title='Help'
      />}
    />
  );
}

export default React.memo(HelpTooltip);
