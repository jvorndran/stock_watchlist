import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StockChart from './StockChart';
import StockNews from './StockNews';
import StockStatistics from './StockStatistics';
import StockSubHeader from './StockSubHeader';
import StockPageHeader from "./StockPageHeader";
import "../../index.css"

const StockPage = () => {
    const { stock_ticker } = useParams();
    const [stockData, setStockData] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stock data from the server
                const response = await fetch(`http://localhost:3500/dash/${stock_ticker}`);
                const data = await response.json();
                console.log(data)
                setStockData(data);
            } catch (error) {
                console.error(error);
            }
        };



        fetchData();

    }, [stock_ticker]);

    return (
        <div>
            {stockData && (
                <>
                    <StockPageHeader stockData={stockData} />

                    {/*<div className="grid-cols-2 bg-gray-500">*/}

                    <StockSubHeader stockData={stockData} />

                    {/*</div>*/}



                    <StockChart stockData={stockData} />


                    <StockStatistics stockData={stockData} />

                    <div className="rounded-3xl p-2" style={newsContainer}>

                        <StockNews stockData={stockData} />

                    </div>
                </>
            )}
        </div>
    );
};

const newsContainer = {
    background: "#22232d",
    marginLeft: "10vw",
    marginRight: "10vw"
}

export default StockPage;

