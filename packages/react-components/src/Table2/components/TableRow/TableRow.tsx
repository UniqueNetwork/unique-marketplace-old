import { FC, ReactNode } from 'react';
import classNames from 'classnames';
import './TableRow.scss';

interface ITableRowProps {
    children: ReactNode;
    className?: string;
}

export const TableRow: FC<ITableRowProps> = ({
    children,
    className
}: ITableRowProps) => {
    return <tr className={classNames(`table-row`, className)}>{children}</tr>;
};
