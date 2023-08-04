import Header from "./Header";
import Watchlist from "./Watchlist";
import DashNews from "./DashNews";
import DashIndices from "./DashIndices";
import '../index.css'
import React, {useEffect, useMemo, useState} from "react";
import axios from "axios";


const background = {
    backgroundImage: "url(../img/stars.jpg)",
    backgroundSize: "cover"
}

const newsContainer = {
    background: "#22232d",
    marginLeft: "10vw",
    marginRight: "10vw"
}


const DashLayout = () => {

    const [initialNewsData, setNewsData] = useState({});


    useEffect(() => {

        axios.get('http://localhost:3500/dash')
            .then(response => {
                const slicedData = response.data.feed.slice(20,26)
                setNewsData(slicedData);
            })
            .catch(error => {
                console.error(error);
            });
    },[]);


    const newsData = useMemo(() => initialNewsData, [initialNewsData])

    return (
        <>
            <div style={background}>

                <Header />

                <Watchlist />

                <DashIndices />

                <div className="rounded-3xl p-2" style={newsContainer}>
                    <DashNews newsData={newsData}  />
                </div>


                <div className="tradingview-widget-copyright">
                    <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
                        <span className="blue-text">Track all markets on TradingView</span>
                    </a>
                </div>


            </div>
        </>
    )

}
export default DashLayout
