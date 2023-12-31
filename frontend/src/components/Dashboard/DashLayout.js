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

    return (
        <>
            <div className='bg-gray-200'>

                <div className='z-50'>
                    <Header />
                </div>

                <Watchlist watchlist={watchlist} />

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
