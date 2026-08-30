import Header from "../Header";
import Watchlist from "./Watchlist";
import DashNews from "./DashNews";
import DashIndices from "./DashIndices";
import '../../index.css'
import '../style/dash-layout-style.css'
import React, {useEffect, useMemo, useState} from "react";
import axios from "axios";

const watchlistTagStorageKey = 'stock-watchlist-research-tags-v1';
const tradePlanStorageKey = 'stock-watchlist-trade-plans-v1';

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

const DashLayout = () => {

    const [initialNewsData, setInitialNewsData] = useState({});
    const [watchlist, setWatchlist] = useState([]);
    const [watchlistNotes, setWatchlistNotes] = useState({});
    const [watchlistTags, setWatchlistTags] = useState(loadWatchlistTags);
    const [tradePlans, setTradePlans] = useState(loadTradePlans);
    const [watchlistError, setWatchlistError] = useState('');
    const [watchlistNotice, setWatchlistNotice] = useState('');

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {

                const token = localStorage.getItem('jwt');

                const response = await fetch('https://findashboard-api.onrender.com/api/watchlist', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                });

                if (response.ok) {
                    const watchlistData = await response.json();
                    const accountTags = watchlistData.tags || {};
                    const storedTags = loadWatchlistTags();
                    const accountTradePlans = watchlistData.tradePlans || {};
                    const storedTradePlans = loadTradePlans();
                    setWatchlist(watchlistData.watchlist);
                    setWatchlistNotes(watchlistData.notes || {});
                    setWatchlistTags({...storedTags, ...accountTags});
                    setTradePlans({...storedTradePlans, ...accountTradePlans});
                    setWatchlistError('');
                    setWatchlistNotice('');

                    const localOnlyTags = Object.entries(storedTags).filter(([symbol, tags]) => (
                        watchlistData.watchlist.includes(symbol) &&
                        !accountTags[symbol] &&
                        Array.isArray(tags) &&
                        tags.length > 0
                    ));
                    await Promise.allSettled(localOnlyTags.map(([symbol, tags]) => (
                        fetch(
                            `https://findashboard-api.onrender.com/api/watchlist/${encodeURIComponent(symbol)}/tags`,
                            {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({tags}),
                            }
                        )
                    )));
                    const localOnlyTradePlans = Object.entries(storedTradePlans).filter(([symbol, plan]) => (
                        watchlistData.watchlist.includes(symbol) &&
                        !accountTradePlans[symbol] &&
                        plan &&
                        typeof plan === 'object'
                    ));
                    await Promise.allSettled(localOnlyTradePlans.map(([symbol, plan]) => (
                        fetch(
                            `https://findashboard-api.onrender.com/api/watchlist/${encodeURIComponent(symbol)}/trade-plan`,
                            {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({plan}),
                            }
                        )
                    )));
                } else {
                    setWatchlistError('Unable to load watchlist');
                    console.error('Failed to fetch watchlist');
                }
            } catch (error) {
                setWatchlistError('Unable to load watchlist');
                console.error('Error:', error);
            }
        };

        fetchWatchlist();

    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(watchlistTagStorageKey, JSON.stringify(watchlistTags));
        } catch (error) {
            setWatchlistError('Research tags could not be cached in this browser');
        }
    }, [watchlistTags]);

    useEffect(() => {
        try {
            window.localStorage.setItem(tradePlanStorageKey, JSON.stringify(tradePlans));
        } catch (error) {
            setWatchlistError('Trade plans could not be cached in this browser');
        }
    }, [tradePlans]);


    useEffect(() => {

        axios.get('https://findashboard-api.onrender.com/dash')
            .then(response => {
                const slicedData = response.data.feed.slice(0,10)
                setInitialNewsData(slicedData);
            })
            .catch(error => {
                console.error(error);
            });
    },[]);


    const newsData = useMemo(() => initialNewsData, [initialNewsData])

    const normalizeTickers = (stockTickers) => [...new Set(stockTickers
        .map((ticker) => ticker.trim().toUpperCase())
        .filter(Boolean))];

    const addToWatchlist = async (stockTicker) => {
        const normalizedTicker = stockTicker.trim().toUpperCase();

        if (!normalizedTicker) {
            setWatchlistError('Enter a ticker before adding it');
            setWatchlistNotice('');
            return false;
        }

        if (watchlist.includes(normalizedTicker)) {
            setWatchlistNotice(`${normalizedTicker} is already on your watchlist`);
            setWatchlistError('');
            return true;
        }

        try {
            const token = localStorage.getItem('jwt');

            const response = await fetch('https://findashboard-api.onrender.com/api/watchlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ stockTicker: normalizedTicker }),
            });

            if (response.ok) {
                const watchlistData = await response.json();
                setWatchlist(watchlistData.watchlist);
                setWatchlistNotice(`${normalizedTicker} added to your watchlist`);
                setWatchlistError('');
                return true;
            }

            setWatchlistError(`Unable to add ${normalizedTicker}`);
            setWatchlistNotice('');
            return false;
        } catch (error) {
            setWatchlistError(`Unable to add ${normalizedTicker}`);
            setWatchlistNotice('');
            console.error('Error:', error);
            return false;
        }
    };

    const saveWatchlistNote = async (stockTicker, note) => {
        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch(
                `https://findashboard-api.onrender.com/api/watchlist/${encodeURIComponent(stockTicker)}/note`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({note}),
                }
            );

            if (response.ok) {
                const watchlistData = await response.json();
                setWatchlistNotes(watchlistData.notes || {});
                setWatchlistNotice(note.trim() ? `${stockTicker} thesis note saved` : `${stockTicker} thesis note cleared`);
                setWatchlistError('');
                return true;
            }

            const errorData = await response.json().catch(() => ({}));
            setWatchlistError(errorData.message || `Unable to save ${stockTicker} note`);
            setWatchlistNotice('');
            return false;
        } catch (error) {
            setWatchlistError(`Unable to save ${stockTicker} note`);
            setWatchlistNotice('');
            console.error('Error:', error);
            return false;
        }
    };

    const saveWatchlistTags = async (stockTicker, tags) => {
        const previousTags = watchlistTags;
        const nextTags = {...watchlistTags};

        if (tags.length > 0) {
            nextTags[stockTicker] = tags;
        } else {
            delete nextTags[stockTicker];
        }
        setWatchlistTags(nextTags);

        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch(
                `https://findashboard-api.onrender.com/api/watchlist/${encodeURIComponent(stockTicker)}/tags`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({tags}),
                }
            );

            if (response.ok) {
                const watchlistData = await response.json();
                setWatchlistTags(watchlistData.tags || {});
                setWatchlistNotice(`${stockTicker} research tags synced to your account`);
                setWatchlistError('');
                return true;
            }

            const errorData = await response.json().catch(() => ({}));
            setWatchlistTags(previousTags);
            setWatchlistError(errorData.message || `Unable to sync ${stockTicker} tags`);
            setWatchlistNotice('');
            return false;
        } catch (error) {
            setWatchlistTags(previousTags);
            setWatchlistError(`Unable to sync ${stockTicker} tags`);
            setWatchlistNotice('');
            console.error('Error:', error);
            return false;
        }
    };

    const saveWatchlistTradePlan = async (stockTicker, plan) => {
        const previousPlans = tradePlans;
        const nextPlans = {...tradePlans};

        if (plan) {
            nextPlans[stockTicker] = plan;
        } else {
            delete nextPlans[stockTicker];
        }
        setTradePlans(nextPlans);

        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch(
                `https://findashboard-api.onrender.com/api/watchlist/${encodeURIComponent(stockTicker)}/trade-plan`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({plan}),
                }
            );

            if (response.ok) {
                const watchlistData = await response.json();
                setTradePlans(watchlistData.tradePlans || {});
                setWatchlistNotice(plan
                    ? `${stockTicker} trade plan synced to your account`
                    : `${stockTicker} trade plan cleared`);
                setWatchlistError('');
                return true;
            }

            const errorData = await response.json().catch(() => ({}));
            setTradePlans(previousPlans);
            setWatchlistError(errorData.message || `Unable to sync ${stockTicker} trade plan`);
            setWatchlistNotice('');
            return false;
        } catch (error) {
            setTradePlans(previousPlans);
            setWatchlistError(`Unable to sync ${stockTicker} trade plan`);
            setWatchlistNotice('');
            console.error('Error:', error);
            return false;
        }
    };

    const restoreWatchlistResearchSnapshot = async (snapshot) => {
        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('https://findashboard-api.onrender.com/api/watchlist/research-snapshot', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(snapshot),
            });

            if (response.ok) {
                const watchlistData = await response.json();
                setWatchlist(watchlistData.watchlist || []);
                setWatchlistNotes(watchlistData.notes || {});
                setWatchlistTags(watchlistData.tags || {});
                setTradePlans(watchlistData.tradePlans || {});
                setWatchlistError('');
                setWatchlistNotice('Watchlist research restored from backup');
                return true;
            }

            setWatchlistError('Unable to restore the watchlist research backup');
            setWatchlistNotice('');
            return false;
        } catch (error) {
            setWatchlistError('Unable to restore the watchlist research backup');
            setWatchlistNotice('');
            console.error('Error:', error);
            return false;
        }
    };

    const addTickersToWatchlist = async (stockTickers) => {
        const normalizedTickers = normalizeTickers(stockTickers);

        if (normalizedTickers.length === 0) {
            setWatchlistError('Enter at least one ticker before adding it');
            setWatchlistNotice('');
            return false;
        }

        if (normalizedTickers.length === 1) {
            return addToWatchlist(normalizedTickers[0]);
        }

        const tickersToAdd = normalizedTickers.filter((ticker) => !watchlist.includes(ticker));

        if (tickersToAdd.length === 0) {
            setWatchlistNotice('Those symbols are already on your watchlist');
            setWatchlistError('');
            return true;
        }

        try {
            const token = localStorage.getItem('jwt');

            const response = await fetch('https://findashboard-api.onrender.com/api/watchlist/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ stockTickers: tickersToAdd }),
            });

            if (response.ok) {
                const watchlistData = await response.json();
                setWatchlist(watchlistData.watchlist);
                setWatchlistNotice(`${tickersToAdd.length} symbols added to your watchlist`);
                setWatchlistError('');
                return true;
            }

            setWatchlistError('Unable to add those symbols');
            setWatchlistNotice('');
            return false;
        } catch (error) {
            setWatchlistError('Unable to add those symbols');
            setWatchlistNotice('');
            console.error('Error:', error);
            return false;
        }
    };

    const removeFromWatchlist = async (stockTicker) => {
        try {
            const token = localStorage.getItem('jwt');

            const response = await fetch(`https://findashboard-api.onrender.com/api/watchlist/${encodeURIComponent(stockTicker)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const watchlistData = await response.json();
                setWatchlist(watchlistData.watchlist);
                setWatchlistNotes(watchlistData.notes || {});
                setWatchlistTags(watchlistData.tags || {});
                setTradePlans(watchlistData.tradePlans || {});
                setWatchlistError('');
                setWatchlistNotice(`${stockTicker} removed from your watchlist`);
            } else {
                setWatchlistError(`Unable to remove ${stockTicker}`);
                setWatchlistNotice('');
            }
        } catch (error) {
            setWatchlistError(`Unable to remove ${stockTicker}`);
            setWatchlistNotice('');
            console.error('Error:', error);
        }
    };

    const reorderWatchlist = async (stockTicker, direction) => {
        const currentIndex = watchlist.indexOf(stockTicker);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (currentIndex < 0 || targetIndex < 0 || targetIndex >= watchlist.length) {
            return false;
        }

        const reorderedWatchlist = [...watchlist];
        [reorderedWatchlist[currentIndex], reorderedWatchlist[targetIndex]] =
            [reorderedWatchlist[targetIndex], reorderedWatchlist[currentIndex]];

        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('https://findashboard-api.onrender.com/api/watchlist/order', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({stockTickers: reorderedWatchlist}),
            });

            if (response.ok) {
                const watchlistData = await response.json();
                setWatchlist(watchlistData.watchlist);
                setWatchlistError('');
                setWatchlistNotice(`${stockTicker} moved ${direction}`);
                return true;
            }

            setWatchlistError(`Unable to move ${stockTicker}`);
            setWatchlistNotice('');
            return false;
        } catch (error) {
            setWatchlistError(`Unable to move ${stockTicker}`);
            setWatchlistNotice('');
            console.error('Error:', error);
            return false;
        }
    };

    return (
        <>
            <div className='bg-gray-200'>

                <div className='z-50'>
                    <Header />
                </div>

                <Watchlist
                    onAddTickers={addTickersToWatchlist}
                    onAddTicker={addToWatchlist}
                    onRemoveTicker={removeFromWatchlist}
                    onReorderTicker={reorderWatchlist}
                    onRestoreResearchSnapshot={restoreWatchlistResearchSnapshot}
                    onSaveNote={saveWatchlistNote}
                    onSaveTags={saveWatchlistTags}
                    onSaveTradePlan={saveWatchlistTradePlan}
                    tradePlans={tradePlans}
                    watchlist={watchlist}
                    watchlistError={watchlistError}
                    watchlistNotes={watchlistNotes}
                    watchlistNotice={watchlistNotice}
                    watchlistTags={watchlistTags}
                />

                <div className='dash-news-container py-4 z-10'>
                    <div className="rounded-3xl p-2 row-span-2" style={{background: "#22232d"}}>
                        <DashNews newsData={newsData}  />
                    </div>
                    <div className='chart-container'>
                        <DashIndices />
                    </div>

                </div>

            </div>
        </>
    )

}
export default DashLayout
