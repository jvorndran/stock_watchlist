import React, {memo, useEffect, useMemo, useState} from 'react';
import axios from "axios";
import ResponsiveFinancialChart from "./FinancialChart";
import '../style/dash-indicies-style.css'

const indexes = ['NDX 100', 'S&P 500', 'Dow Jones', 'Russell 2000']

const getAverageClose = (data, period) => {
    if (!data || data.length < period) {
        return null;
    }

    const closes = data.slice(-period).map((point) => Number(point.close));
    return closes.reduce((total, close) => total + close, 0) / closes.length;
};

const formatPercent = (value) => value === null
    ? '-'
    : `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

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

    const selectedIndexRegime = useMemo(() => {
        const data = formattedStockData[selectedIndex];

        if (!data || data.length === 0) {
            return null;
        }

        const latestClose = Number(data[data.length - 1].close);
        const average20Day = getAverageClose(data, 20);
        const average50Day = getAverageClose(data, 50);
        const versus20Day = average20Day ? ((latestClose - average20Day) / average20Day) * 100 : null;
        const versus50Day = average50Day ? ((latestClose - average50Day) / average50Day) * 100 : null;
        const recentData = data.slice(-20);
        const rangeHigh = Math.max(...recentData.map((point) => Number(point.high)));
        const rangeLow = Math.min(...recentData.map((point) => Number(point.low)));
        const volatilityData = data.slice(-21);
        const dailyReturns = volatilityData.slice(1).map((point, index) => (
            (Number(point.close) / Number(volatilityData[index].close)) - 1
        ));
        const averageReturn = dailyReturns.length
            ? dailyReturns.reduce((total, value) => total + value, 0) / dailyReturns.length
            : 0;
        const variance = dailyReturns.length
            ? dailyReturns.reduce((total, value) => total + ((value - averageReturn) ** 2), 0) / dailyReturns.length
            : 0;
        const annualizedVolatility = dailyReturns.length ? Math.sqrt(variance) * Math.sqrt(252) * 100 : null;
        let label = 'Needs more history';
        let detail = 'Moving-average regime is unavailable';

        if (versus20Day !== null && versus50Day !== null) {
            if (versus20Day >= 0 && versus50Day >= 0) {
                label = 'Broad uptrend';
                detail = 'Close is above both trend averages';
            } else if (versus20Day >= 0) {
                label = 'Recovery attempt';
                detail = 'Close reclaimed the 20-day average';
            } else if (versus50Day >= 0) {
                label = 'Short-term pullback';
                detail = 'Longer trend remains supported';
            } else {
                label = 'Broad downtrend';
                detail = 'Close is below both trend averages';
            }
        }

        return {
            label,
            detail,
            versus20Day,
            versus50Day,
            annualizedVolatility,
            rangeHigh,
            rangeLow,
        };
    }, [formattedStockData, selectedIndex]);

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
            {formattedStockData.length > 0 && indexSummary && selectedIndexRegime && (

                <>

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

                <section className="index-regime-panel">
                    <div className="index-regime-panel__header">
                        <div>
                            <h2>{indexes[selectedIndex]} Market Regime</h2>
                            <span>{selectedIndexRegime.detail}</span>
                        </div>
                        <strong>{selectedIndexRegime.label}</strong>
                    </div>
                    <div className="index-regime-panel__grid">
                        <span>
                            <small>Vs 20-Day Average</small>
                            <strong>{formatPercent(selectedIndexRegime.versus20Day)}</strong>
                        </span>
                        <span>
                            <small>Vs 50-Day Average</small>
                            <strong>{formatPercent(selectedIndexRegime.versus50Day)}</strong>
                        </span>
                        <span>
                            <small>20-Day Volatility</small>
                            <strong>{selectedIndexRegime.annualizedVolatility === null ? '-' : `${selectedIndexRegime.annualizedVolatility.toFixed(1)}%`}</strong>
                        </span>
                        <span>
                            <small>20-Day Range</small>
                            <strong>{selectedIndexRegime.rangeLow.toFixed(0)} - {selectedIndexRegime.rangeHigh.toFixed(0)}</strong>
                        </span>
                    </div>
                </section>

                </>

            )}

        </div>

    );

};


export default memo(DashIndices);
