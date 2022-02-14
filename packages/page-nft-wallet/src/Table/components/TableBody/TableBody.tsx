import { FC, ReactNode } from 'react';
import classNames from 'classnames';
import './TableBody.scss';

interface ITableBodyProps {
    children: ReactNode;
    className?: string;
}

export const TableBody: FC<ITableBodyProps> = ({
    children,
    className
}: ITableBodyProps) => {
    return (
        <tbody className={classNames(`table-body`, className)}>
            {children}
        </tbody>
    );
};
