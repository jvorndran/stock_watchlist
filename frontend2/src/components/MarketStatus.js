import React, { useEffect, useState } from 'react';
import "./style/MarketStatusStyle.css"

const isMarketOpen = (currentTime) => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentDay = currentTime.getDay();

    const isWeekday = currentDay >= 1 && currentDay <= 5;
    const isMarketHours = currentHour >= 9 && currentHour < 16;
    const isMarketMinutes = currentHour === 9 ? currentMinute >= 30 : true;

    return isWeekday && isMarketHours && isMarketMinutes;
};

const MarketStatus = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const marketOpen = isMarketOpen(currentTime);

    return (
        <div className={`market-status ${marketOpen ? 'open' : 'closed'}`}>
            <span className="time">{currentTime.toLocaleTimeString()}</span>
            <span className="status">{marketOpen ? ' Market Open' : ' Market Closed'}</span>
        </div>
    );
};

export default MarketStatus;
