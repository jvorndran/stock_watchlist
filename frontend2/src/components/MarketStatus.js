import React, { useEffect, useState } from 'react';
import "./style/market-status-style.css"
import logo from "../img/svg/NYSE-The-New-York-Stock-Exchang-New.svg"

const isMarketOpen = (currentTime) => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentDay = currentTime.getDay();

    const isWeekday = currentDay >= 1 && currentDay <= 5;
    const isMarketHours = currentHour >= 9 && currentHour < 16;
    const isMarketMinutes = currentHour === 9 ? currentMinute >= 30 : true;

    return isWeekday && isMarketHours && isMarketMinutes;
};

const getTimeUntilMarket = (currentTime, isMarketOpen) => {
    if (!isMarketOpen) {
        // If it's not a weekday (Saturday or Sunday), set the next market open time for Monday
        if (currentTime.getDay() === 6) {
            currentTime.setDate(currentTime.getDate() + 2);
        } else if (currentTime.getDay() === 0) {
            currentTime.setDate(currentTime.getDate() + 1);
        }
        currentTime.setHours(9, 30, 0, 0); // Set next market open time to 9:30 AM
    } else {
        currentTime.setHours(16, 0, 0, 0); // Set next market close time to 4:00 PM
    }

    const timeDifference = currentTime - new Date();

    // Convert time difference to hours, minutes, and seconds
    const hours = Math.abs(Math.floor(timeDifference / (1000 * 60 * 60)));
    const minutes = Math.abs(Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)));
    const seconds = Math.abs(Math.floor((timeDifference % (1000 * 60)) / 1000));


    const formattedHours = hours > 9 ? hours.toString() : '0' + hours.toString();
    const formattedMinutes = minutes > 9 ? minutes.toString() : '0' + minutes.toString();
    const formattedSeconds = seconds > 9 ? seconds.toString() : '0' + seconds.toString();

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

const MarketStatus = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={`market-status-container ${isMarketOpen(currentTime) ? 'open' : 'closed'} mx-4 px-4`}>
            <div className='mt-2 image-container'><img src={logo} alt='' className="market-logo" /></div>
            <hr className="mt-1" />
            <div>
                {isMarketOpen(currentTime) ? 'Closes' : 'Opens'} in {getTimeUntilMarket(new Date(), isMarketOpen(currentTime))}
            </div>
        </div>
    );
};

export default MarketStatus;
