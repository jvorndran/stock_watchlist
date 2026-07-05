import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaTimes } from 'react-icons/fa';
import '../style/DashboardWatchlistWidgetStyle.css';

const Watchlist = ({onAddTicker, onRemoveTicker, watchlist, watchlistError, watchlistNotice}) => {

    const [newTicker, setNewTicker] = useState('');
    const [searchText, setSearchText] = useState('');
    const [sortMode, setSortMode] = useState('added');

    const visibleWatchlist = useMemo(() => {
        const normalizedSearch = searchText.trim().toUpperCase();
        const filteredSymbols = watchlist.filter((symbol) => (
            normalizedSearch.length === 0 || symbol.toUpperCase().includes(normalizedSearch)
        ));

        if (sortMode === 'az') {
            return [...filteredSymbols].sort((firstSymbol, secondSymbol) => firstSymbol.localeCompare(secondSymbol));
        }

        if (sortMode === 'za') {
            return [...filteredSymbols].sort((firstSymbol, secondSymbol) => secondSymbol.localeCompare(firstSymbol));
        }

        return filteredSymbols;
    }, [watchlist, searchText, sortMode]);


    useEffect(() => {
        const tradingViewContainer = document.getElementById('tradingview-widget-symbols');

        const script = document.createElement('script');
        script.type = "text/javascript"
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
        script.async = true;
        script.defer = true;
        script.innerHTML = JSON.stringify({
            symbols: visibleWatchlist.map((symbol) => ({
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
            if (tradingViewContainer) {
                tradingViewContainer.innerHTML = '';
            }
        };
    }, [visibleWatchlist]);

    const handleAddTicker = async (event) => {
        event.preventDefault();

        const wasAdded = await onAddTicker(newTicker);

        if (wasAdded) {
            setNewTicker('');
        }
    };

    return (
        <section className="watchlist-manager">
            <div className="watchlist-manager__header">
                <div>
                    <h2>Watchlist</h2>
                    <span>{visibleWatchlist.length} of {watchlist.length} tracked symbols</span>
                </div>
            </div>

            {watchlistError && <p className="watchlist-manager__error">{watchlistError}</p>}
            {watchlistNotice && <p className="watchlist-manager__notice">{watchlistNotice}</p>}

            <form className="watchlist-manager__add-form" onSubmit={handleAddTicker}>
                <label>
                    <span>Add Symbol</span>
                    <input
                        maxLength="12"
                        onChange={(event) => setNewTicker(event.target.value.toUpperCase())}
                        placeholder="Ticker"
                        type="text"
                        value={newTicker}
                    />
                </label>
                <button aria-label="Add symbol to watchlist" type="submit">
                    <FaPlus />
                </button>
            </form>

            <div className="watchlist-manager__controls">
                <label>
                    <span>Search Symbols</span>
                    <input
                        onChange={(event) => setSearchText(event.target.value)}
                        placeholder="Filter watchlist"
                        type="search"
                        value={searchText}
                    />
                </label>
                <label>
                    <span>Sort</span>
                    <select onChange={(event) => setSortMode(event.target.value)} value={sortMode}>
                        <option value="added">Watchlist Order</option>
                        <option value="az">Ticker A-Z</option>
                        <option value="za">Ticker Z-A</option>
                    </select>
                </label>
            </div>

            {watchlist.length > 0 ? (
                <div className="watchlist-chip-grid">
                    {visibleWatchlist.length > 0 ? visibleWatchlist.map((symbol) => (
                        <div className="watchlist-chip" key={symbol}>
                            <Link to={`/dash/${symbol}`}>{symbol}</Link>
                            <button
                                aria-label={`Remove ${symbol} from watchlist`}
                                onClick={() => onRemoveTicker(symbol)}
                                type="button">
                                <FaTimes />
                            </button>
                        </div>
                    )) : (
                        <p className="watchlist-manager__empty">No symbols match this watchlist search.</p>
                    )}
                </div>
            ) : (
                <p className="watchlist-manager__empty">Search for a ticker to start tracking stocks here.</p>
            )}

            <div id="tradingview-widget" className="tradingview-widget-container">
                <div id="tradingview-widget-symbols" className="tradingview-widget-container__widget"></div>
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
