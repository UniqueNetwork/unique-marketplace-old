import { FC } from 'react';
import classNames from 'classnames';
import './DashedDivider.scss';

interface IDashedDividerProps {
    colSpan: number;
    className?: string;
}

export const DashedDivider: FC<IDashedDividerProps> = ({
    colSpan,
    className
}: IDashedDividerProps) => {
    return (
        <tr>
            <td colSpan={colSpan}>
                <div className={classNames(`border`, className)} />
            </td>
        </tr>
    );
};
