import React, {memo, useEffect, useState} from 'react';
import axios from "axios";
import ResponsiveFinancialChart from "./FinancialChart";
import '../style/dash-indicies-style.css'

const indexes = ['NDX 100', 'S&P 500', 'Dow Jones', 'Russell 2000']

const DashIndices = () => {

    const [formattedStockData, setFormattedStockData] = useState({})
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {

        axios.get('https://findashboard-api.onrender.com/api/indices')
            .then(response => {
                const priceDataObj = response.data
                const formattedData = formatData(priceDataObj);
                setFormattedStockData(formattedData)
            })
            .catch(error => {
                console.error(error)
            })
    }, [])

    function formatData(data) {
        return data.map((stock) => {
            return stock.dates.map((date, index) => ({
                date: new Date(date),
                open: stock.opens[index],
                high: stock.highs[index],
                low: stock.lows[index],
                close: stock.closes[index],
                volume: stock.volumes[index],
            }));
        });
    }

    function setIndexFunction(num) {
        setSelectedIndex(num)
    }

    return (

        <div>
            {formattedStockData.length > 0 && (

                <div className='index-grid rounded-3xl'>
                    <div><ResponsiveFinancialChart data={formattedStockData[selectedIndex]}/></div>

                    <div></div>

                    <div style={{marginLeft: '10%', marginRight: '10%'}}>
                        <div></div>
                        <div>Close</div>
                        <div>1D</div>
                        <div>1Wk</div>
                    </div>

                    {formattedStockData.map((dataItem, dataIndex) => (
                        <div onClick={() => setIndexFunction(dataIndex)}
                             className={selectedIndex === dataIndex ? 'selected-index index-table-element' : 'index-table-element'}
                             style={{cursor: 'pointer'}}
                             key={indexes[dataIndex]}>

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