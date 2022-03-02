import { useEffect, useState } from "react";

export const useCalculateTimeLeft = (time: Date) => {

    const today = new Date().toISOString();
    const ms = new Date(time).getTime() - new Date(today).getTime();

    const daysLeftInitial = Math.floor(ms / (24 * 60 * 60 * 1000));
    const daysMs = daysLeftInitial * 24 * 60 * 60 * 1000;
    const hoursLeftInitial = Math.floor((ms - daysMs) / (60 * 60 * 1000));
    const hoursMs = hoursLeftInitial * 60 * 60 * 1000;
    const minutesLeftInitial = Math.floor((ms - hoursMs - daysMs) / (60 * 1000));
    const minutesMs = minutesLeftInitial * 60 * 1000;
    const secondsLeftInitial = Math.floor((ms - minutesMs - hoursMs - daysMs) / 1000);

    const [secondsLeft, setSecondsLeft] = useState<number>(secondsLeftInitial);
    const [minutesLeft, setMinutesLeft] = useState<number>(minutesLeftInitial);
    const [hoursLeft, setHoursLeft] = useState<number>(hoursLeftInitial);
    const [daysLeft, setDaysLeft] = useState<number>(daysLeftInitial);

    const tick = () => {
        console.log('in tick');
        const today = new Date().toISOString();
        const ms = new Date(time).getTime() - new Date(today).getTime();

        const daysLeft = Math.floor(ms / (24 * 60 * 60 * 1000));
        const daysMs = daysLeft * 24 * 60 * 60 * 1000;
        const hoursLeft = Math.floor((ms - daysMs) / (60 * 60 * 1000));
        const hoursMs = hoursLeft * 60 * 60 * 1000;
        const minutesLeft = Math.floor((ms - hoursMs - daysMs) / (60 * 1000));
        const minutesMs = minutesLeft * 60 * 1000;
        const secondsLeft = Math.floor((ms - minutesMs - hoursMs - daysMs) / 1000);
        setSecondsLeft(secondsLeft);
        setMinutesLeft(minutesLeft);
        setHoursLeft(hoursLeft);
        setDaysLeft(daysLeft);
    }

    useEffect(() => {
        const interval = setInterval(tick, 1000);
        return () => { clearInterval(interval) };
    }, [])

    return { secondsLeft, minutesLeft, hoursLeft, daysLeft };
}






