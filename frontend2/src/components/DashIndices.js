import React, {memo, useEffect, useState} from 'react';
import axios from "axios";
import ResponsiveFinancialChart from "./FinancialChart";
import './style/dash-indicies-style.css'

const DashIndices = () => {

    const [priceData, setPriceData] = useState({});
    const [formattedStockData, setFormattedStockData] = useState({})
    const [index, setIndex] = useState(0)


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
        let formattedData = data.map((stock) => {
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

    function setIndexFunction(num){
        setIndex(num)
    }

    const indexes = ['NDX 100', 'S&P 500', 'Dow Jones', 'Russell 2000']

    return (

        <div>

            {formattedStockData.length > 0 && (


                <div className='index-grid'>
                    <div><ResponsiveFinancialChart data={formattedStockData[index]} /></div>

                    <div style={{marginLeft: '10%', marginRight: '10%'}}>
                        <div></div>
                        <div>Price</div>
                        <div>1D</div>
                        <div>1Wk</div>
                    </div>

                    {formattedStockData.map((dataItem, dataIndex) =>(
                        <div onClick={() => setIndexFunction(dataIndex)}
                              className={index === dataIndex ? 'bold-text index-table-element' : 'index-table-element'}
                             style={{cursor: 'pointer'}}>
                            <div>
                                {indexes[dataIndex]}
                            </div>
                            <div>
                                {formattedStockData[dataIndex][formattedStockData[dataIndex].length - 1].close.toFixed(2)}
                            </div>
                            <div style={{
                                color: (formattedStockData[dataIndex][formattedStockData[dataIndex].length - 1].close - formattedStockData[dataIndex][formattedStockData[dataIndex].length - 2].close) > 0 ? 'green' : '#b21d2b'
                            }}>
                                {(formattedStockData[dataIndex][formattedStockData[dataIndex].length - 1].close - formattedStockData[dataIndex][formattedStockData[dataIndex].length - 2].close).toFixed(2)}
                            </div>
                            <div style={{
                                color: (formattedStockData[dataIndex][formattedStockData[dataIndex].length - 1].close - formattedStockData[dataIndex][formattedStockData[dataIndex].length - 2].close) > 0 ? 'green' : '#b21d2b'
                            }}>
                                {(formattedStockData[dataIndex][formattedStockData[dataIndex].length - 1].close - formattedStockData[dataIndex][formattedStockData[dataIndex].length - 6].close).toFixed(2)}
                            </div>
                        </div>
                    ))}

                </div>

            )}

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