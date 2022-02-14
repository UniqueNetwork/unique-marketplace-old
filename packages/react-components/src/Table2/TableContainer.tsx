import * as React from 'react';
import { FC } from 'react';
import './TableContainer.scss';
import {
    DashedDivider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow
} from './components';
import classNames from 'classnames';
import Heading from '../UIKitComponents/Heading/Heading';
import Icon from '../UIKitComponents/IconUIKit/Icon';
import Text from '../UIKitComponents/Text/Text';

export type TSize = 'm' | 's';
export type TColor = 'primary' | 'blue-grey';

type TColumn = {
    title: string;
    key: string;
    width?: number;
    headingTextSize?: TSize;
    color?: TColor;
    icon?: string;
    render: (rowNumber: number) => JSX.Element;
    columnHeadingClickHandle?: (column: string) => void;
};

interface ITableContainerProps {
    columns: Array<TColumn>;
    data: Array<{ [key: string]: string }>;
    title?: string;
    className?: string;
}

const TableContainer: FC<ITableContainerProps> = ({
    columns,
    data,
    title,
    className
}: ITableContainerProps) => {
    const tableTitle = title ? (
        <caption style={{ textAlign: 'left', marginBottom: '16px' }}>
            <Heading size="2">{title}</Heading>
        </caption>
    ) : null;

    const tableHead = (
        <TableRow>
            {columns.map((column) => {
                return (
                    <TableHeaderCell key={column.key} width={column.width}>
                        <div
                            className={classNames('column-heading', {
                                'cursor-pointer':
                                    column.columnHeadingClickHandle
                            })}
                            onClick={
                                column.columnHeadingClickHandle
                                    ? () =>
                                          column.columnHeadingClickHandle!(
                                              column.key
                                          )
                                    : () => {}
                            }
                        >
                            <Text
                                size={column.headingTextSize || 'm'}
                                color={
                                    column.color === 'primary'
                                        ? 'primary-500'
                                        : 'blue-grey-600'
                                }
                            >
                                {column.title}
                            </Text>
                            {column.icon && (
                                <div className="icon-wrapper">
                                    <Icon
                                        color={
                                            column.color === 'primary'
                                                ? '#009CF0'
                                                : '#647789'
                                        }
                                        name={column.icon}
                                        size={18}
                                    ></Icon>
                                </div>
                            )}
                        </div>
                    </TableHeaderCell>
                );
            })}
        </TableRow>
    );
    const tableBody = data.map((rowData, i) => {
        const row = columns.map((column, index) => {
            return (
                <TableCell key={`${i}-${column.key}-${index}`}>
                    {column.render ? column.render(i) : rowData[column.key]}
                </TableCell>
            );
        });
        return (
            <React.Fragment key={`${rowData.fee}-${i}`}>
                <TableRow>{row}</TableRow>
                <DashedDivider colSpan={columns.length} />
            </React.Fragment>
        );
    });

    return (
        <Table className={classNames('unique-table-outer', className)}>
            {title && tableTitle}
            <TableHead>{tableHead}</TableHead>
            <TableBody>{tableBody}</TableBody>
        </Table>
    );
};

export default TableContainer;
