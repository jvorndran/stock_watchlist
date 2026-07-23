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

const escapeCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const tradePlanStorageKey = 'stock-watchlist-trade-plans-v1';
const watchlistTagStorageKey = 'stock-watchlist-research-tags-v1';
const emptyTradePlan = {entry: '', stop: '', target: ''};
const researchTagOptions = [
    {key: 'core', label: 'Core'},
    {key: 'swing', label: 'Swing'},
    {key: 'earnings', label: 'Earnings'},
    {key: 'income', label: 'Income'},
];

const loadTradePlans = () => {
    try {
        const storedPlans = JSON.parse(window.localStorage.getItem(tradePlanStorageKey) || '{}');
        return storedPlans && typeof storedPlans === 'object' && !Array.isArray(storedPlans)
            ? storedPlans
            : {};
    } catch (error) {
        return {};
    }
};

const loadWatchlistTags = () => {
    try {
        const storedTags = JSON.parse(window.localStorage.getItem(watchlistTagStorageKey) || '{}');
        return storedTags && typeof storedTags === 'object' && !Array.isArray(storedTags)
            ? storedTags
            : {};
    } catch (error) {
        return {};
    }
};

const parsePositiveNumber = (value) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
};

const analyzeTradePlan = (plan, riskBudget) => {
    const entry = parsePositiveNumber(plan?.entry);
    const stop = parsePositiveNumber(plan?.stop);
    const target = parsePositiveNumber(plan?.target);
    const isLong = stop < entry && entry < target;
    const isShort = target < entry && entry < stop;

    if (!entry || !stop || !target || (!isLong && !isShort)) {
        return null;
    }

    const riskPerShare = Math.abs(entry - stop);
    const rewardPerShare = Math.abs(target - entry);
    const shares = Math.floor(parsePositiveNumber(riskBudget) / riskPerShare);

    return {
        capital: shares * entry,
        direction: isLong ? 'Long' : 'Short',
        entry,
        reward: shares * rewardPerShare,
        rewardMultiple: rewardPerShare / riskPerShare,
        shares,
        stop,
        target,
    };
};

const getWorkflowState = (symbol, watchlistNotes, tradePlans) => {
    const hasNote = Boolean(String(watchlistNotes[symbol] || '').trim());
    const hasPlan = Boolean(tradePlans[symbol]);

    return {hasNote, hasPlan, ready: hasNote && hasPlan};
};

const Watchlist = ({onAddTicker, onAddTickers, onRemoveTicker, onReorderTicker, onSaveNote, watchlist, watchlistError, watchlistNotes, watchlistNotice}) => {

    const [newTicker, setNewTicker] = useState('');
    const [searchText, setSearchText] = useState('');
    const [sortMode, setSortMode] = useState('added');
    const [portfolioValue, setPortfolioValue] = useState('10000');
    const [activeNoteTicker, setActiveNoteTicker] = useState(null);
    const [noteDraft, setNoteDraft] = useState('');
    const [activePlanTicker, setActivePlanTicker] = useState(null);
    const [planDraft, setPlanDraft] = useState(emptyTradePlan);
    const [planMessage, setPlanMessage] = useState('');
    const [riskBudget, setRiskBudget] = useState('250');
    const [tradePlans, setTradePlans] = useState(loadTradePlans);
    const [workflowFilter, setWorkflowFilter] = useState('all');
    const [watchlistTags, setWatchlistTags] = useState(loadWatchlistTags);
    const [tagFilter, setTagFilter] = useState('all');
    const [researchExportMessage, setResearchExportMessage] = useState('');
    const canReorder = sortMode === 'added' && searchText.trim().length === 0 && workflowFilter === 'all' && tagFilter === 'all';

    const workflowSummary = useMemo(() => watchlist.reduce((summary, symbol) => {
        const workflowState = getWorkflowState(symbol, watchlistNotes, tradePlans);

        if (workflowState.ready) {
            summary.ready += 1;
        }
        if (!workflowState.hasNote) {
            summary.needsNote += 1;
        }
        if (!workflowState.hasPlan) {
            summary.needsPlan += 1;
        }
        if (!workflowState.hasNote && !workflowState.hasPlan) {
            summary.unprepared += 1;
        }

        return summary;
    }, {ready: 0, needsNote: 0, needsPlan: 0, unprepared: 0}), [watchlist, watchlistNotes, tradePlans]);

    const workflowViews = [
        {key: 'all', label: 'All Symbols', count: watchlist.length, detail: 'Full watchlist'},
        {key: 'ready', label: 'Ready', count: workflowSummary.ready, detail: 'Thesis and plan saved'},
        {key: 'needs-note', label: 'Needs Thesis', count: workflowSummary.needsNote, detail: 'Missing a thesis note'},
        {key: 'needs-plan', label: 'Needs Plan', count: workflowSummary.needsPlan, detail: 'Missing entry, stop, or target'},
        {key: 'unprepared', label: 'Unprepared', count: workflowSummary.unprepared, detail: 'No thesis or trade plan'},
    ];

    const visibleWatchlist = useMemo(() => {
        const normalizedSearch = searchText.trim().toUpperCase();
        const filteredSymbols = watchlist.filter((symbol) => {
            const matchesSearch = normalizedSearch.length === 0 || symbol.toUpperCase().includes(normalizedSearch);
            const workflowState = getWorkflowState(symbol, watchlistNotes, tradePlans);
            const matchesWorkflow = workflowFilter === 'all' ||
                (workflowFilter === 'ready' && workflowState.ready) ||
                (workflowFilter === 'needs-note' && !workflowState.hasNote) ||
                (workflowFilter === 'needs-plan' && !workflowState.hasPlan) ||
                (workflowFilter === 'unprepared' && !workflowState.hasNote && !workflowState.hasPlan);
            const symbolTags = Array.isArray(watchlistTags[symbol]) ? watchlistTags[symbol] : [];
            const matchesTag = tagFilter === 'all' || symbolTags.includes(tagFilter);

            return matchesSearch && matchesWorkflow && matchesTag;
        });

        if (sortMode === 'az') {
            return [...filteredSymbols].sort((firstSymbol, secondSymbol) => firstSymbol.localeCompare(secondSymbol));
        }

        if (sortMode === 'za') {
            return [...filteredSymbols].sort((firstSymbol, secondSymbol) => secondSymbol.localeCompare(firstSymbol));
        }

        return filteredSymbols;
    }, [watchlist, watchlistNotes, tradePlans, watchlistTags, searchText, sortMode, workflowFilter, tagFilter]);

    const tagCounts = useMemo(() => researchTagOptions.reduce((counts, tag) => {
        counts[tag.key] = watchlist.filter((symbol) => (
            Array.isArray(watchlistTags[symbol]) && watchlistTags[symbol].includes(tag.key)
        )).length;
        return counts;
    }, {}), [watchlist, watchlistTags]);

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
        try {
            window.localStorage.setItem(tradePlanStorageKey, JSON.stringify(tradePlans));
        } catch (error) {
            setPlanMessage('Trade plans could not be saved in this browser.');
        }
    }, [tradePlans]);

    useEffect(() => {
        try {
            window.localStorage.setItem(watchlistTagStorageKey, JSON.stringify(watchlistTags));
        } catch (error) {
            setPlanMessage('Research tags could not be saved in this browser.');
        }
    }, [watchlistTags]);


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
        setActivePlanTicker(null);
        setActiveNoteTicker(symbol);
        setNoteDraft(watchlistNotes[symbol] || '');
    };

    const openPlanEditor = (symbol) => {
        setActiveNoteTicker(null);
        setActivePlanTicker(symbol);
        setPlanDraft(tradePlans[symbol] || emptyTradePlan);
        setPlanMessage('');
    };

    const handlePlanDraftChange = (field, value) => {
        setPlanDraft((currentDraft) => ({...currentDraft, [field]: value}));
    };

    const toggleResearchTag = (symbol, tag) => {
        setWatchlistTags((currentTags) => {
            const symbolTags = Array.isArray(currentTags[symbol]) ? currentTags[symbol] : [];
            const nextSymbolTags = symbolTags.includes(tag)
                ? symbolTags.filter((savedTag) => savedTag !== tag)
                : [...symbolTags, tag];
            const nextTags = {...currentTags};

            if (nextSymbolTags.length > 0) {
                nextTags[symbol] = nextSymbolTags;
            } else {
                delete nextTags[symbol];
            }

            return nextTags;
        });
    };

    const handleSaveTradePlan = (event, symbol) => {
        event.preventDefault();
        const analysis = analyzeTradePlan(planDraft, riskBudget);

        if (!analysis) {
            setPlanMessage('Use positive levels ordered stop < entry < target for long plans, or target < entry < stop for short plans.');
            return;
        }

        const normalizedPlan = {
            entry: analysis.entry,
            stop: analysis.stop,
            target: analysis.target,
        };
        setTradePlans((currentPlans) => ({...currentPlans, [symbol]: normalizedPlan}));
        setActivePlanTicker(null);
        setPlanDraft(emptyTradePlan);
        setPlanMessage(`${symbol} trade plan saved.`);
    };

    const handleRemoveTradePlan = (symbol) => {
        setTradePlans((currentPlans) => {
            const nextPlans = {...currentPlans};
            delete nextPlans[symbol];
            return nextPlans;
        });
        setActivePlanTicker(null);
        setPlanDraft(emptyTradePlan);
        setPlanMessage(`${symbol} trade plan cleared.`);
    };

    const handleSaveNote = async (event, symbol) => {
        event.preventDefault();
        const wasSaved = await onSaveNote(symbol, noteDraft);

        if (wasSaved) {
            setActiveNoteTicker(null);
            setNoteDraft('');
        }
    };

    const exportResearchView = () => {
        if (visibleWatchlist.length === 0) {
            setResearchExportMessage('No visible watchlist symbols to export.');
            return;
        }

        const headers = [
            'Ticker',
            'Research Tags',
            'Thesis Note',
            'Plan Direction',
            'Entry',
            'Stop',
            'Target',
            'Reward Risk Multiple',
            'Risk Budget',
            'Shares',
            'Capital Required',
            'Planned Reward'
        ];
        const rows = visibleWatchlist.map((symbol) => {
            const plan = tradePlans[symbol];
            const analysis = analyzeTradePlan(plan, riskBudget);
            const tags = (Array.isArray(watchlistTags[symbol]) ? watchlistTags[symbol] : [])
                .map((tagKey) => researchTagOptions.find((option) => option.key === tagKey)?.label || tagKey)
                .join('; ');

            return [
                symbol,
                tags,
                watchlistNotes[symbol] || '',
                analysis?.direction || '',
                plan?.entry || '',
                plan?.stop || '',
                plan?.target || '',
                analysis ? analysis.rewardMultiple.toFixed(2) : '',
                analysis ? parsePositiveNumber(riskBudget).toFixed(2) : '',
                analysis?.shares || '',
                analysis ? analysis.capital.toFixed(2) : '',
                analysis ? analysis.reward.toFixed(2) : ''
            ];
        });
        const csv = [headers, ...rows]
            .map((row) => row.map(escapeCsvValue).join(','))
            .join('\r\n');
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = downloadUrl;
        link.download = `watchlist-research-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        setResearchExportMessage(`${rows.length} visible symbol${rows.length === 1 ? '' : 's'} exported with research details.`);
    };

    return (
        <section className="watchlist-manager">
            <div className="watchlist-manager__header">
                <div>
                    <h2>Watchlist</h2>
                    <span>{visibleWatchlist.length} of {watchlist.length} tracked symbols</span>
                </div>
                <button className="watchlist-manager__export" onClick={exportResearchView} type="button">
                    Export Research CSV
                </button>
            </div>

            {watchlistError && <p className="watchlist-manager__error">{watchlistError}</p>}
            {watchlistNotice && <p className="watchlist-manager__notice">{watchlistNotice}</p>}
            {researchExportMessage && <p className="watchlist-manager__export-message" aria-live="polite">{researchExportMessage}</p>}

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
                <label>
                    <span>Research Tag</span>
                    <select onChange={(event) => setTagFilter(event.target.value)} value={tagFilter}>
                        <option value="all">All Tags</option>
                        {researchTagOptions.map((tag) => (
                            <option key={tag.key} value={tag.key}>{tag.label} ({tagCounts[tag.key] || 0})</option>
                        ))}
                    </select>
                </label>
            </div>

            <section className="watchlist-workflow" aria-labelledby="watchlist-workflow-title">
                <div className="watchlist-workflow__header">
                    <div>
                        <h3 id="watchlist-workflow-title">Research Readiness</h3>
                        <span>Focus the dashboard on ideas that are ready or still need planning.</span>
                    </div>
                    <strong>{workflowSummary.ready} ready</strong>
                </div>
                <div className="watchlist-workflow__grid">
                    {workflowViews.map((view) => (
                        <button
                            aria-pressed={workflowFilter === view.key}
                            className={workflowFilter === view.key ? 'watchlist-workflow__card watchlist-workflow__card--active' : 'watchlist-workflow__card'}
                            key={view.key}
                            onClick={() => setWorkflowFilter(view.key)}
                            type="button">
                            <span>{view.label}</span>
                            <strong>{view.count}</strong>
                            <small>{view.detail}</small>
                        </button>
                    ))}
                </div>
            </section>

            <div className="watchlist-risk-budget">
                <div>
                    <h3>Trade Plan Risk Budget</h3>
                    <span>Size every saved setup from the maximum dollars you are willing to lose.</span>
                </div>
                <label>
                    <span>Risk per trade</span>
                    <input
                        inputMode="decimal"
                        min="1"
                        onChange={(event) => setRiskBudget(event.target.value)}
                        step="25"
                        type="number"
                        value={riskBudget}
                    />
                </label>
            </div>

            {planMessage && <p className="watchlist-plan-message" aria-live="polite">{planMessage}</p>}

            {watchlist.length > 1 && (
                <p className="watchlist-manager__order-hint">
                    {canReorder
                        ? 'Use the arrows to save a preferred watchlist order.'
                        : 'Choose All Symbols and Watchlist Order, then clear search to rearrange symbols.'}
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
                                    <button
                                        aria-label={`Edit trade plan for ${symbol}`}
                                        className={tradePlans[symbol] ? 'watchlist-chip__plan watchlist-chip__plan--saved' : 'watchlist-chip__plan'}
                                        onClick={() => openPlanEditor(symbol)}
                                        type="button">
                                        Plan
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

                            <div className="watchlist-research-tags" aria-label={`${symbol} research tags`}>
                                <span>Tags</span>
                                {researchTagOptions.map((tag) => {
                                    const isActive = Array.isArray(watchlistTags[symbol]) && watchlistTags[symbol].includes(tag.key);

                                    return (
                                        <button
                                            aria-pressed={isActive}
                                            className={isActive ? 'watchlist-research-tag watchlist-research-tag--active' : 'watchlist-research-tag'}
                                            key={tag.key}
                                            onClick={() => toggleResearchTag(symbol, tag.key)}
                                            type="button">
                                            {tag.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {watchlistNotes[symbol] && activeNoteTicker !== symbol && (
                                <p className="watchlist-note-preview">{watchlistNotes[symbol]}</p>
                            )}

                            {tradePlans[symbol] && activePlanTicker !== symbol && (() => {
                                const analysis = analyzeTradePlan(tradePlans[symbol], riskBudget);

                                return analysis ? (
                                    <div className="watchlist-plan-preview">
                                        <strong>{analysis.direction} {analysis.rewardMultiple.toFixed(1)}R</strong>
                                        <span>Entry ${analysis.entry.toFixed(2)}</span>
                                        <span>Stop ${analysis.stop.toFixed(2)}</span>
                                        <span>Target ${analysis.target.toFixed(2)}</span>
                                        <span>{analysis.shares.toLocaleString()} shares / {formatMoney(analysis.capital)} capital</span>
                                        <span>{formatMoney(analysis.reward)} planned reward</span>
                                    </div>
                                ) : null;
                            })()}

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

                            {activePlanTicker === symbol && (
                                <form className="watchlist-plan-editor" onSubmit={(event) => handleSaveTradePlan(event, symbol)}>
                                    <div className="watchlist-plan-editor__header">
                                        <strong>{symbol} entry, stop, and target</strong>
                                        <span>Long and short setups supported</span>
                                    </div>
                                    <div className="watchlist-plan-editor__fields">
                                        {['entry', 'stop', 'target'].map((field) => (
                                            <label key={field}>
                                                <span>{field}</span>
                                                <input
                                                    inputMode="decimal"
                                                    min="0.01"
                                                    onChange={(event) => handlePlanDraftChange(field, event.target.value)}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    type="number"
                                                    value={planDraft[field]}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                    <div className="watchlist-plan-editor__actions">
                                        {tradePlans[symbol] && (
                                            <button className="watchlist-plan-editor__clear" onClick={() => handleRemoveTradePlan(symbol)} type="button">
                                                Clear plan
                                            </button>
                                        )}
                                        <button onClick={() => setActivePlanTicker(null)} type="button">Cancel</button>
                                        <button type="submit">Save plan</button>
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
