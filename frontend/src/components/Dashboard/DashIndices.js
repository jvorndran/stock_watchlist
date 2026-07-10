import React, {memo, useEffect, useMemo, useState} from 'react';
import axios from "axios";
import ResponsiveFinancialChart from "./FinancialChart";
import '../style/dash-indicies-style.css'

const indexes = ['NDX 100', 'S&P 500', 'Dow Jones', 'Russell 2000']

const DashIndices = () => {

    const [formattedStockData, setFormattedStockData] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(0)

    const getCloseChange = (data, lookbackDays) => {
        if (!data || data.length <= lookbackDays) {
            return null;
        }

        return data[data.length - 1].close - data[data.length - 1 - lookbackDays].close;
    };

    const formatChange = (value) => value === null ? '-' : `${value > 0 ? '+' : ''}${value.toFixed(2)}`;

    const getChangeColor = (value) => value === null || value >= 0 ? 'green' : '#d73d4a';

    const indexSummary = useMemo(() => {
        if (!formattedStockData.length) {
            return null;
        }

        const rows = formattedStockData.map((data, dataIndex) => ({
            name: indexes[dataIndex],
            close: data[data.length - 1]?.close,
            dailyChange: getCloseChange(data, 1),
            weeklyChange: getCloseChange(data, 5),
        }));
        const rowsWithDailyChange = rows.filter((row) => row.dailyChange !== null);
        const bestDaily = rowsWithDailyChange.reduce((bestRow, row) => (
            !bestRow || row.dailyChange > bestRow.dailyChange ? row : bestRow
        ), null);
        const weakestDaily = rowsWithDailyChange.reduce((weakestRow, row) => (
            !weakestRow || row.dailyChange < weakestRow.dailyChange ? row : weakestRow
        ), null);

        return {
            advancers: rowsWithDailyChange.filter((row) => row.dailyChange >= 0).length,
            decliners: rowsWithDailyChange.filter((row) => row.dailyChange < 0).length,
            bestDaily,
            weakestDaily,
            rows,
        };
    }, [formattedStockData]);

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
            {formattedStockData.length > 0 && indexSummary && (

                <div className='index-grid rounded-3xl'>
                    <div><ResponsiveFinancialChart data={formattedStockData[selectedIndex]}/></div>

                    <div className="index-breadth-panel">
                        <div>
                            <span>Advancers</span>
                            <strong>{indexSummary.advancers}/{indexSummary.rows.length}</strong>
                        </div>
                        <div>
                            <span>Decliners</span>
                            <strong>{indexSummary.decliners}</strong>
                        </div>
                        <div>
                            <span>Best 1D</span>
                            <strong>{indexSummary.bestDaily?.name || '-'}</strong>
                            <small>{formatChange(indexSummary.bestDaily?.dailyChange ?? null)}</small>
                        </div>
                        <div>
                            <span>Weakest 1D</span>
                            <strong>{indexSummary.weakestDaily?.name || '-'}</strong>
                            <small>{formatChange(indexSummary.weakestDaily?.dailyChange ?? null)}</small>
                        </div>
                    </div>

                    <div style={{marginLeft: '10%', marginRight: '10%'}}>
                        <div></div>
                        <div>Close</div>
                        <div>1D</div>
                        <div>1Wk</div>
                    </div>

                    {indexSummary.rows.map((dataItem, dataIndex) => (
                        <div onClick={() => setIndexFunction(dataIndex)}
                             className={selectedIndex === dataIndex ? 'selected-index index-table-element' : 'index-table-element'}
                             style={{cursor: 'pointer'}}
                             key={dataItem.name}>

                            <div className='text-base'>
                                {dataItem.name}
                            </div>
                            <div>
                                {dataItem.close ? dataItem.close.toFixed(2) : '-'}
                            </div>
                            <div style={{color: getChangeColor(dataItem.dailyChange)}}>
                                {formatChange(dataItem.dailyChange)}
                            </div>
                            <div style={{color: getChangeColor(dataItem.weeklyChange)}}>
                                {formatChange(dataItem.weeklyChange)}
                            </div>
                        </div>
                    ))}

                </div>

            )}

        </div>

    );

};


export default memo(DashIndices);
