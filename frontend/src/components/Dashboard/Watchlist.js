import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import '../style/DashboardWatchlistWidgetStyle.css';

const Watchlist = ({onRemoveTicker, watchlist, watchlistError}) => {


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
        <section className="watchlist-manager">
            <div className="watchlist-manager__header">
                <div>
                    <h2>Watchlist</h2>
                    <span>{watchlist.length} tracked symbols</span>
                </div>
            </div>

            {watchlistError && <p className="watchlist-manager__error">{watchlistError}</p>}

            {watchlist.length > 0 ? (
                <div className="watchlist-chip-grid">
                    {watchlist.map((symbol) => (
                        <div className="watchlist-chip" key={symbol}>
                            <Link to={`/dash/${symbol}`}>{symbol}</Link>
                            <button
                                aria-label={`Remove ${symbol} from watchlist`}
                                onClick={() => onRemoveTicker(symbol)}
                                type="button">
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="watchlist-manager__empty">Search for a ticker to start tracking stocks here.</p>
            )}

            <div id="tradingview-widget" className="tradingview-widget-container">
                <div className="tradingview-widget-container__widget"></div>
                <div className="tradingview-widget-copyright">
                    <a href="https://www.tradingview.com/" rel="noopener noreferrer nofollow" target="_blank">
                        <span className="blue-text">Track all markets on TradingView</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Watchlist;
