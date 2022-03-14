import React, { FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import { ComponentProps, IconProps } from '../types';
import './Select.scss';
import Icon from '../IconUIKit/Icon';

interface SelectProps extends ComponentProps {
    options: {
        id: string | number;
        title: string | number;
        iconLeft?: IconProps;
        iconRight?: IconProps;
    }[];
    additionalText?: string | number;
    error?: boolean;
    label?: string;
    statusText?: string;
}

const Select: FC<SelectProps> = ({
    id,
    value,
    autoFocus,
    label,
    additionalText,
    statusText,
    className,
    defaultValue,
    error,
    options,
    placeholder,
    disabled,
    tabIndex = -1,
    onChange,
    onFocus,
    onBlur
}) => {
    useEffect(() => {
        if (
            defaultValue &&
            options.findIndex((option) => option.id === defaultValue)
        ) {
            onChange(defaultValue);
        }
    }, []);

    const selected = options.find((option) => option.id === value);
    const icon = selected?.iconLeft || selected?.iconRight;

    const [dropped, setDropped] = useState<boolean>(!!autoFocus);

    const handleMouseDown = () => {
        console.log('handleMouseDown');
        !disabled && setDropped(!dropped);
    };

    const handleClickOutside = () => {
        console.log('outsideClick');
        document.removeEventListener('mousedown', handleClickOutside);
        setDropped(false);
    };

    const handleMouseLeave = () => {
        document.addEventListener('mousedown', handleClickOutside);
    };

    const handleMouseEnter = () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };

    const handleOptionSelect = (value: string | number | undefined) => {
        console.log('in handleOptionSelect', value);
        setDropped(false);
        console.log('select value', value);
        onChange!(value);
    };

    return (
        <div className={classNames('unique-select', className, { error })}>
            {label && <label htmlFor={id}>{label}</label>}
            {additionalText && (
                <div className="additional-text">{additionalText}</div>
            )}
            <div
                className={classNames('select-wrapper', {
                    dropped,
                    disabled
                })}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                onFocus={onFocus}
                onBlur={onBlur}
                tabIndex={tabIndex}
                id={id}
            >
                <div
                    className={classNames('select-value', {
                        'with-icon': icon,
                        'to-left': selected?.iconLeft,
                        'to-right': selected?.iconRight
                    })}
                    onMouseDown={handleMouseDown}
                >
                    {selected?.id ? (
                        <>
                            {selected.title}
                            {icon && <Icon {...icon} />}
                        </>
                    ) : (
                        placeholder && (
                            <span className="select-placeholder">
                                {placeholder}
                            </span>
                        )
                    )}
                </div>
                {dropped && options && (
                    <div className="select-dropdown">
                        {options.map((option) => {
                            const icon = option.iconLeft || option.iconRight;
                            return (
                                <div
                                    className={classNames('dropdown-option', {
                                        selected: option.id === selected?.id,
                                        'with-icon': icon,
                                        'to-left': option.iconLeft,
                                        'to-right': option.iconRight,
                                        disabled
                                    })}
                                    key={option.id}
                                    onClick={() =>
                                        handleOptionSelect(option.id)
                                    }
                                >
                                    {option.title}
                                    {icon && <Icon {...icon} />}
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="icon-wrapper" onMouseDown={handleMouseDown}><Icon name="triangle" size={8} /></div>
            </div>
            {statusText && <div className="status-text">{statusText}</div>}
        </div>
    );
};

export default Select;
