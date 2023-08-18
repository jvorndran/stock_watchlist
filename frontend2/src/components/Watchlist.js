import React, { useEffect, useState } from 'react';

const Watchlist = () => {

    const [watchlist, setWatchlist] = useState([]);

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {

                const token = localStorage.getItem('jwt');


                const response = await fetch('http://localhost:3500/api/watchlist', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                });

                if (response.ok) {
                    const watchlistData = await response.json();
                    setWatchlist(watchlistData.watchlist);
                } else {
                    console.error('Failed to fetch watchlist');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchWatchlist();

    }, []);

    useEffect(() => {
        const tradingViewContainer = document.getElementById('tradingview-widget');

        const script = document.createElement('script');
        script.type = "text/javascript"
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
        script.async = true;
        script.defer = true;
        script.innerHTML = JSON.stringify({
            symbols: watchlist.map((symbol) => ({
                proName: `NYSE:${symbol}`,
                title: symbol,
            })),
            showSymbolLogo: true,
            colorTheme: 'dark',
            isTransparent: false,
            displayMode: 'adaptive',
            locale: 'en',
        });

        if (tradingViewContainer) {
            tradingViewContainer.appendChild(script);
        }


        return () => {
            tradingViewContainer.innerHTML = '';
        };
    }, [watchlist]);

    return (
        <div id="tradingview-widget" className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
            <div className="tradingview-widget-copyright">
                <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
                    <span className="blue-text">Track all markets on TradingView</span>
                </a>
            </div>
        </div>
    );
};

export default Watchlist;
