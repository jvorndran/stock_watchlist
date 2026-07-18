import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowDown, FaArrowUp, FaPlus, FaTimes } from 'react-icons/fa';
import '../style/DashboardWatchlistWidgetStyle.css';

const parseTickerEntry = (entry) => [...new Set(entry
    .split(/[\s,;]+/)
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean))];

const starterBaskets = [
    {
        name: 'AI Leaders',
        description: 'Semis and platform names',
        symbols: ['NVDA', 'AMD', 'MSFT', 'GOOGL', 'META'],
    },
    {
        name: 'Index Core',
        description: 'Broad market ETFs',
        symbols: ['SPY', 'QQQ', 'IWM', 'DIA', 'VTI'],
    },
    {
        name: 'Defensive Yield',
        description: 'Staples, healthcare, utilities',
        symbols: ['PG', 'KO', 'JNJ', 'XLU', 'VZ'],
    },
    {
        name: 'Energy And Materials',
        description: 'Cyclicals and commodities',
        symbols: ['XLE', 'XOM', 'CVX', 'FCX', 'NUE'],
    },
];

const formatMoney = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
}).format(value);

const Watchlist = ({onAddTicker, onAddTickers, onRemoveTicker, onReorderTicker, onSaveNote, watchlist, watchlistError, watchlistNotes, watchlistNotice}) => {

    const [newTicker, setNewTicker] = useState('');
    const [searchText, setSearchText] = useState('');
    const [sortMode, setSortMode] = useState('added');
    const [portfolioValue, setPortfolioValue] = useState('10000');
    const [activeNoteTicker, setActiveNoteTicker] = useState(null);
    const [noteDraft, setNoteDraft] = useState('');
    const canReorder = sortMode === 'added' && searchText.trim().length === 0;

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

    const parsedPortfolioValue = useMemo(() => {
        const value = Number(String(portfolioValue).replace(/[^0-9.]/g, ''));
        return Number.isFinite(value) && value > 0 ? value : 0;
    }, [portfolioValue]);

    const allocationRows = useMemo(() => {
        const allocation = visibleWatchlist.length > 0 && parsedPortfolioValue > 0
            ? parsedPortfolioValue / visibleWatchlist.length
            : 0;
        const weight = visibleWatchlist.length > 0 ? 100 / visibleWatchlist.length : 0;

        return visibleWatchlist.map((symbol) => ({
            symbol,
            allocation,
            weight,
        }));
    }, [visibleWatchlist, parsedPortfolioValue]);


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

        const requestedTickers = parseTickerEntry(newTicker);
        const wasAdded = requestedTickers.length > 1
            ? await onAddTickers(requestedTickers)
            : await onAddTicker(requestedTickers[0] || '');

        if (wasAdded) {
            setNewTicker('');
        }
    };

    const handleAddBasket = async (symbols) => {
        await onAddTickers(symbols);
    };

    const openNoteEditor = (symbol) => {
        setActiveNoteTicker(symbol);
        setNoteDraft(watchlistNotes[symbol] || '');
    };

    const handleSaveNote = async (event, symbol) => {
        event.preventDefault();
        const wasSaved = await onSaveNote(symbol, noteDraft);

        if (wasSaved) {
            setActiveNoteTicker(null);
            setNoteDraft('');
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
                    <span>Add Symbols</span>
                    <input
                        maxLength="160"
                        onChange={(event) => setNewTicker(event.target.value.toUpperCase())}
                        placeholder="AAPL, MSFT, NVDA"
                        type="text"
                        value={newTicker}
                    />
                </label>
                <button aria-label="Add symbol to watchlist" type="submit">
                    <FaPlus />
                </button>
            </form>

            <div className="watchlist-baskets">
                <div className="watchlist-baskets__header">
                    <h3>Starter Baskets</h3>
                    <span>Add a themed group in one click</span>
                </div>
                <div className="watchlist-baskets__grid">
                    {starterBaskets.map((basket) => (
                        <button
                            className="watchlist-basket"
                            key={basket.name}
                            onClick={() => handleAddBasket(basket.symbols)}
                            type="button">
                            <span>{basket.name}</span>
                            <small>{basket.description}</small>
                            <strong>{basket.symbols.join(' ')}</strong>
                        </button>
                    ))}
                </div>
            </div>

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

            {watchlist.length > 1 && (
                <p className="watchlist-manager__order-hint">
                    {canReorder
                        ? 'Use the arrows to save a preferred watchlist order.'
                        : 'Choose Watchlist Order and clear search to rearrange symbols.'}
                </p>
            )}

            {watchlist.length > 0 ? (
                <div className="watchlist-chip-grid">
                    {visibleWatchlist.length > 0 ? visibleWatchlist.map((symbol) => (
                        <div className="watchlist-chip-card" key={symbol}>
                            <div className="watchlist-chip">
                                <Link to={`/dash/${symbol}`}>{symbol}</Link>
                                <div className="watchlist-chip__actions">
                                    <button
                                        aria-label={`Edit thesis note for ${symbol}`}
                                        className={watchlistNotes[symbol] ? 'watchlist-chip__note watchlist-chip__note--saved' : 'watchlist-chip__note'}
                                        onClick={() => openNoteEditor(symbol)}
                                        type="button">
                                        Note
                                    </button>
                                    {canReorder && (
                                        <>
                                            <button
                                                aria-label={`Move ${symbol} up`}
                                                disabled={watchlist.indexOf(symbol) === 0}
                                                onClick={() => onReorderTicker(symbol, 'up')}
                                                type="button">
                                                <FaArrowUp />
                                            </button>
                                            <button
                                                aria-label={`Move ${symbol} down`}
                                                disabled={watchlist.indexOf(symbol) === watchlist.length - 1}
                                                onClick={() => onReorderTicker(symbol, 'down')}
                                                type="button">
                                                <FaArrowDown />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        aria-label={`Remove ${symbol} from watchlist`}
                                        className="watchlist-chip__remove"
                                        onClick={() => onRemoveTicker(symbol)}
                                        type="button">
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>

                            {watchlistNotes[symbol] && activeNoteTicker !== symbol && (
                                <p className="watchlist-note-preview">{watchlistNotes[symbol]}</p>
                            )}

                            {activeNoteTicker === symbol && (
                                <form className="watchlist-note-editor" onSubmit={(event) => handleSaveNote(event, symbol)}>
                                    <label htmlFor={`watchlist-note-${symbol}`}>Investment thesis or follow-up</label>
                                    <textarea
                                        autoFocus
                                        id={`watchlist-note-${symbol}`}
                                        maxLength="500"
                                        onChange={(event) => setNoteDraft(event.target.value)}
                                        placeholder="What would confirm or invalidate this idea?"
                                        rows="3"
                                        value={noteDraft}
                                    />
                                    <div>
                                        <span>{noteDraft.length}/500</span>
                                        <button onClick={() => setActiveNoteTicker(null)} type="button">Cancel</button>
                                        <button type="submit">{noteDraft.trim() ? 'Save Note' : 'Clear Note'}</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )) : (
                        <p className="watchlist-manager__empty">No symbols match this watchlist search.</p>
                    )}
                </div>
            ) : (
                <p className="watchlist-manager__empty">Search for a ticker to start tracking stocks here.</p>
            )}

            <div className="watchlist-allocation">
                <div className="watchlist-allocation__header">
                    <div>
                        <h3>Equal Weight Plan</h3>
                        <span>{allocationRows.length} visible symbols</span>
                    </div>
                    <label>
                        <span>Portfolio Value</span>
                        <input
                            min="0"
                            onChange={(event) => setPortfolioValue(event.target.value)}
                            step="500"
                            type="number"
                            value={portfolioValue}
                        />
                    </label>
                </div>

                {allocationRows.length > 0 && parsedPortfolioValue > 0 ? (
                    <>
                        <div className="watchlist-allocation__summary">
                            <span>{allocationRows.length} positions</span>
                            <strong>{formatMoney(parsedPortfolioValue / allocationRows.length)}</strong>
                            <span>per symbol at {(100 / allocationRows.length).toFixed(1)}% weight</span>
                        </div>
                        <div className="watchlist-allocation__grid">
                            {allocationRows.map((row) => (
                                <div className="watchlist-allocation__row" key={row.symbol}>
                                    <Link to={`/dash/${row.symbol}`}>{row.symbol}</Link>
                                    <span>{row.weight.toFixed(1)}%</span>
                                    <strong>{formatMoney(row.allocation)}</strong>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="watchlist-manager__empty">Add or reveal symbols and enter a portfolio value to build an allocation plan.</p>
                )}
            </div>

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
