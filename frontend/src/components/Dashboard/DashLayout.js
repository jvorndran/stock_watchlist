import Header from "../Header";
import Watchlist from "./Watchlist";
import DashNews from "./DashNews";
import DashIndices from "./DashIndices";
import '../../index.css'
import '../style/dash-layout-style.css'
import React, {useEffect, useMemo, useState} from "react";
import axios from "axios";


const DashLayout = () => {

    const [initialNewsData, setInitialNewsData] = useState({});
    const [watchlist, setWatchlist] = useState([]);
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
                    setWatchlist(watchlistData.watchlist);
                    setWatchlistError('');
                    setWatchlistNotice('');
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
                    watchlist={watchlist}
                    watchlistError={watchlistError}
                    watchlistNotice={watchlistNotice}
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
