// Copyright 2017-2020 @polkadot/react-query authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { useState } from 'react';
import { Compact } from '@polkadot/types';
import { formatBalance } from '@polkadot/util';

interface BareProps {
  className?: string;
  style?: Record<string, any>;
}

interface Props extends BareProps {
  children?: React.ReactNode;
  isShort?: boolean;
  label?: React.ReactNode;
  labelPost?: React.ReactNode;
  value?: Compact<any> | BN | string | null | 'all';
  withSi?: boolean;
}

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;
const K_LENGTH = 3 + 1;

function format (value: Compact<any> | BN | string, currency: string, withSi?: boolean, _isShort?: boolean): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);

  if (prefix.length > M_LENGTH) {
    // TODO Format with balance-postfix
    return formatBalance(value);
  }

  return <>{prefix}{!isShort && (<>.<span className='ui--FormatBalance-postfix'>{`000${postfix || ''}`.slice(-3)}</span></>)} <span className='currency'>{currency}</span></>;
}

function FormatBalance ({ children, className, isShort, label, labelPost, value, withSi }: Props): React.ReactElement<Props> {
  const [currency] = useState(formatBalance.getDefaults().unit);

  return (
    <div className={`ui--FormatBalance ${className}`}>
      {label || ''}
      <span className={`ui--FormatBalance-value ${className}`}>
        { value
          ? value === 'all' ? 'everything' : format(value, currency, withSi, isShort) : '-'
        }
      </span>
      <span className='ui--FormatBalance-label'>{labelPost}{children}</span>
    </div>
  );
}

export default React.memo(FormatBalance);
