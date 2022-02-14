import { FC, ReactNode } from 'react';
import classNames from 'classnames';
import './TableHeaderCell.scss';

interface ITableHeaderCellProps {
    children: ReactNode;
    className?: string;
    width?: string | number;
}

export const TableHeaderCell: FC<ITableHeaderCellProps> = ({
    children,
    width,
    className
}: ITableHeaderCellProps) => {
    return (
        <th
            className={classNames(`table-header-cell`, className)}
            style={{ width }}
        >
            {children}
        </th>
    );
};
