// Copyright 2017-2022 @polkadot/react-components, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

import Input from '../Input';
import password from './password.svg';

interface Props {
  autoFocus?: boolean;
  children?: React.ReactNode;
  className?: string;
  defaultValue?: string;
  help?: string;
  isDisabled?: boolean;
  isError?: boolean;
  isFull?: boolean;
  label?: string;
  labelExtra?: React.ReactNode;
  name?: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  onEscape?: () => void;
  placeholder?: string;
  tabIndex?: number;
  value: string;
  withLabel?: boolean;
}

function Password ({ autoFocus, children, className = '', defaultValue, help, isDisabled, isError, isFull, label, labelExtra, name, onChange, onEnter, onEscape, placeholder, tabIndex, value, withLabel }: Props): React.ReactElement<Props> {
  return (
    <Input
      autoFocus={autoFocus}
      className={`ui--Password ${className}`}
      defaultValue={defaultValue}
      help={help}
      icon={
        <img
          alt='password'
          src={password as string}
        />
      }
      isDisabled={isDisabled}
      isError={isError}
      isFull={isFull}
      label={label}
      labelExtra={labelExtra}
      name={name}
      onChange={onChange}
      onEnter={onEnter}
      onEscape={onEscape}
      placeholder='Password'
      tabIndex={tabIndex}
      type='password'
      value={value}
      withLabel={withLabel}
    >
      {children}
    </Input>
  );
}

export default React.memo(styled(Password)`

  .ui.left.icon.input.ui--Input {
    input {
      background: var(--bg-page);
      border: 1px solid var(--border-color);
      padding-left: var(--gap) !important;
      border-radius: 4px;
    }
  }

  img {
    position: absolute;
    right: 18px;
    top: 9px;
  }
`);
