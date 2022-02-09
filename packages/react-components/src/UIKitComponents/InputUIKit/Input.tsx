import React, { ChangeEvent, FC } from 'react';
import classNames from 'classnames';
import { ComponentProps, IconProps } from '../types';
import './Input.scss';
import Icon from '../IconUIKit/Icon';

interface InputProps extends ComponentProps {
    additionalText?: string;
    error?: boolean;
    label?: string;
    statusText?: string;
    type?: 'number' | 'string' | 'password';
    iconLeft?: IconProps;
    iconRight?: IconProps;
}

const InputText: FC<InputProps> = ({
    id,
    label,
    additionalText,
    statusText,
    type = 'string',
    className,
    error,
    disabled,
    value,
    defaultValue,
    iconLeft,
    iconRight,
    onChange,
    ...rest
}: InputProps) => {
    const icon = iconLeft || iconRight;
    return (
        <div className={classNames('unique-input', className, { error })}>
            {label && <label htmlFor={id}>{label}</label>}
            {additionalText && (
                <div className="additional-text">{additionalText}</div>
            )}
            <div
                className={classNames('input-wrapper', {
                    'with-icon': icon,
                    'to-left': iconLeft,
                    'to-right': iconRight,
                    disabled
                })}
            >
                <input
                    type={type}
                    id={id}
                    disabled={disabled}
                    value={value?.toString()}
                    defaultValue={defaultValue?.toString()}
                    {...(onChange && {
                        onChange: (e: ChangeEvent<HTMLInputElement>) =>
                            onChange(e.target.value)
                    })}
                    {...rest}
                />
                {icon && <Icon {...icon} />}
            </div>
            {statusText && <div className="status-text">{statusText}</div>}
        </div>
    );
};

export default InputText;
