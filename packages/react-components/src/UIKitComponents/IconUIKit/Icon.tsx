import React, { FC } from 'react';
import Icons from '../static/icons/icons.svg';
import { IconProps } from '../types';

const Icon: FC<IconProps> = ({
    name,
    file,
    size,
    color = '#7f90a1'
}: IconProps) =>
    file ? (
        <img width={size} height={size} src={file} />
    ) : (
        <svg
            className={`icon icon-${name}`}
            fill={color}
            width={size}
            height={size}
        >
            <use xlinkHref={`${Icons}#icon-${name}`} />
        </svg>
    );

export default Icon;
