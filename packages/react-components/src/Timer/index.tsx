// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

import { useCalculateTimeLeft } from '@polkadot/react-hooks';
import React from 'react';


interface Props {
    time: Date;
}

function Timer({ time }: Props): React.ReactElement<Props> {

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    function checkTime(i: number) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    const localeDate = new Date(time);

    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December']
    const year = localeDate.getFullYear();
    const monthNumber = localeDate.getMonth();
    const day = localeDate.getDate();

    const hours = localeDate.getHours();
    const minutes = checkTime(localeDate.getMinutes());

    var suffix = hours >= 12 ? "PM" : "AM";
    var hoursFormat = ((hours + 11) % 12 + 1);

    const { secondsLeft, minutesLeft, hoursLeft, daysLeft } = useCalculateTimeLeft(time);

    return (
        <TimerStyled>
            <ShortTimer>
                {`Auction ends ${months[monthNumber]} ${day}, ${year} at  ${hoursFormat}:${minutes} ${suffix} ${timezone}`}
            </ShortTimer>
            {daysLeft < 2  && <DetailedTimer>
                <Cell>
                    <Numbers>{checkTime(daysLeft)}</Numbers>
                    <Description>{daysLeft > 1 ? 'Days' : 'Day'}</Description>
                </Cell>
                <Cell>
                    <Numbers>{checkTime(hoursLeft)}</Numbers>
                    <Description>{hoursLeft > 1 ? 'Hours' : 'Hour'}</Description>
                </Cell>
                <Cell>
                    <Numbers>{checkTime(minutesLeft)}</Numbers>
                    <Description>{minutesLeft > 1 ? 'Minutes' : 'Minute'}</Description>
                </Cell>
                <Cell>
                    <Numbers>{checkTime(secondsLeft)}</Numbers>
                    <Description>{secondsLeft > 1 ? 'Seconds' : 'Second'}</Description>
                </Cell>
            </DetailedTimer>}
        </TimerStyled>
    );
}

const TimerStyled = styled.div`
`;

const ShortTimer = styled.div`
  font: 500 16px/24px var(--font-inter);
  color: #81858E;
  margin-bottom: 8px;
`;

const DetailedTimer = styled.div`
  display: flex;
`;

const Cell = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 24px;
`;

const Numbers = styled.div`
  display: flex;
  font: 500 20px/28px var(--font-inter);
  color: #040B1D;
`;

const Description = styled.div`
  font: 400 16px/24px var(--font-inter);
  color: #81858E;
`;

export default React.memo(Timer);



