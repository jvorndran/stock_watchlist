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


                <div className='index-grid rounded-3xl'>
                    <div><ResponsiveFinancialChart data={formattedStockData[index]} /></div>

                    <div></div>

                    <div style={{marginLeft: '10%', marginRight: '10%'}}>
                        <div></div>
                        <div>Close</div>
                        <div>1D</div>
                        <div>1Wk</div>
                    </div>



                    {formattedStockData.map((dataItem, dataIndex) =>(
                        <div onClick={() => setIndexFunction(dataIndex)}
                              className={index === dataIndex ? 'selected-index index-table-element' : 'index-table-element'}
                             style={{cursor: 'pointer'}}>
                            <div className='text-base'>
                                {indexes[dataIndex]}
                            </div>
                            <div>
                                {formattedStockData[dataIndex][formattedStockData[dataIndex].length - 1].close.toFixed(2)}
                            </div>
                            <div style={{
                                color: (formattedStockData[dataIndex][formattedStockData[dataIndex].length - 1].close - formattedStockData[dataIndex][formattedStockData[dataIndex].length - 2].close) > 0 ? 'green' : '#d73d4a'
                            }}>
                                {(formattedStockData[dataIndex][formattedStockData[dataIndex].length - 1].close - formattedStockData[dataIndex][formattedStockData[dataIndex].length - 2].close).toFixed(2)}
                            </div>
                            <div style={{
                                color: (formattedStockData[dataIndex][formattedStockData[dataIndex].length - 1].close - formattedStockData[dataIndex][formattedStockData[dataIndex].length - 2].close) > 0 ? 'green' : '#d73d4a'
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


export default memo(DashIndices);