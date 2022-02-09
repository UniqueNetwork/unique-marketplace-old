import React, { FC } from 'react';
import classNames from 'classnames';
import './Tabs.scss';

interface TabsProps {
    activeIndex: number;
    children?: JSX.Element[];
    labels?: string[];
    disabledIndexes?: number[];
    onClick?(activeIndex: number): void;
}

const Tabs: FC<TabsProps> = ({
    activeIndex,
    labels,
    children,
    disabledIndexes,
    onClick
}: TabsProps) => (
    <div
        className={classNames({
            'unique-tabs-labels': labels,
            'unique-tabs-contents': children
        })}
    >
        {labels
            ? labels.map((label, index) => {
                  const disabled = disabledIndexes?.includes(index);
                  return (
                      <div
                          key={`tab-label-${index}`}
                          {...(!disabled && {
                              onClick: () => {
                                  onClick?.(index);
                              }
                          })}
                          className={classNames('tab-label', {
                              active: activeIndex === index,
                              disabled
                          })}
                      >
                          {label}
                      </div>
                  );
              })
            : children?.[activeIndex]}
    </div>
);

export default Tabs;
