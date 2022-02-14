/**
 * @author Anna Mikhailova <amikhailova@usetech.com>
 */

import React, { FC } from 'react';
import classNames from 'classnames';
import './Text.scss';

interface ITextProps {
    children: string;
    size?: 'xs' | 's' | 'm' | 'l';
    weight?: 'regular' | 'medium';
    color?: string;
    className?: string;
}

const Text: FC<ITextProps> = ({
    children,
    size = 'm',
    weight = 'regular',
    color = 'secondary-500',
    className
}: ITextProps) => {
    return (
        <span
            className={classNames(
                'unique-text',
                `size-${size}`,
                `weight-${weight}`,
                `color-${color}`,
                className
            )}
        >
            {children}
        </span>
    );
};

export default Text;
