import React, {memo, useEffect, useState} from 'react';
import axios from "axios";
import ResponsiveFinancialChart from "./FinancialChart";

const DashIndices = () => {

    const [priceData, setPriceData] = useState({});
    const [formattedStockData, setFormattedStockData] = useState({})

    useEffect(() => {

        axios.get('http://localhost:3500/api/indices')
            .then(response => {
                const priceDataObj = response.data
                const formattedData = formatData(priceDataObj);
                setPriceData(priceDataObj)
                setFormattedStockData(formattedData)
                console.log(formattedData)
            })
            .catch(error => {
                console.error(error)
            })


    }, [])


    function formatData (data){
        const formattedData = data.map((stock) => {
            return stock.dates.map((date, index) => ({
                date: new Date(date),
                open: stock.opens[index],
                high: stock.highs[index],
                low: stock.lows[index],
                close: stock.closes[index],
                volume: stock.volumes[index],
            }));
        });
        return formattedData;
    }


    return (

        <div style={chartGrid}>

            {formattedStockData.length > 0 &&
                formattedStockData.map((priceDataArray, index) => (
                    <div style={gridItemStyle}>
                        <ResponsiveFinancialChart data={priceDataArray} />
                    </div>
                ))}


        </div>

    );

};

const gridItemStyle = {
    boxSizing: "border-box",
    display: "block",
    height: "350px",
    width: "95%",
    borderRadius: "10px",
    border: "1px solid white",
    background: "#191c27",
    marginLeft: "20px",
    marginRight: "20px"
}

const chartGrid = {
    marginBottom: '20px',
    marginTop: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1vw',
    paddingLeft: "3vw",
    paddingRight: "3vw",
    justifyContent: 'space-evenly',
    justifyItems: 'center',
    alignContent: 'space-evenly',
    alignItems: 'center'
};
export default memo(DashIndices);