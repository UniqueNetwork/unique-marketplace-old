import { FC, ReactNode } from 'react';
import classNames from 'classnames';

interface ITableHeadProps {
    children: ReactNode;
    className?: string;
}

export const TableHead: FC<ITableHeadProps> = ({
    children,
    className
}: ITableHeadProps) => {
    return (
        <thead className={classNames(className)}>{children}</thead>
    );
};