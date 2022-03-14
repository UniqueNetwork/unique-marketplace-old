/**
 * @author Anna Mikhailova <amikhailova@usetech.com>
 */

import React, { FC } from 'react';
import classNames from 'classnames';
import './Heading.scss';

interface IHeadingProps {
    children: string;
    size?: '1' | '2' | '3' | '4';
    className?: string;
}

const Heading: FC<IHeadingProps> = ({
    children,
    size = '1',
    className
}: IHeadingProps) => {
    const Component = `h${size}` as keyof JSX.IntrinsicElements;
    return (
        <Component
            className={classNames(
                'unique-font-heading',
                `size-${size}`,
                className
            )}
        >
            {children}
        </Component>
    );
};

export default Heading;
