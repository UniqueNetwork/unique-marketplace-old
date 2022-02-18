// Copyright 2017-2021 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const useTimeToFinishAuction = (stopAt: Date) => {

    const today = new Date().toISOString();
    const ms = new Date(stopAt).getTime() - new Date(today).getTime();

    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor(ms / (60 * 1000));

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} left`
    }

    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} left`
    }

    if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} left`
    }

    return '';
}