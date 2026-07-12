import React from 'react';
import '../style/stock-trend-panel-style.css';

const parseMetric = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatCurrency = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `$${parsed.toFixed(2)}`;
};

const formatPercent = (value) => (
    value === null ? '-' : `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
);

const positionInRange = (value, low, high) => {
    if (value === null || low === null || high === null || high <= low) {
        return null;
    }

    return Math.min(100, Math.max(0, ((value - low) / (high - low)) * 100));
};

const StockTrendPanel = ({ stockData }) => {
    const { summary } = stockData;
    const fiftyDayAverage = parseMetric(summary['50DayMovingAverage']);
    const twoHundredDayAverage = parseMetric(summary['200DayMovingAverage']);
    const weekLow = parseMetric(summary['52WeekLow']);
    const weekHigh = parseMetric(summary['52WeekHigh']);
    const crossoverSpread = fiftyDayAverage !== null && twoHundredDayAverage
        ? ((fiftyDayAverage - twoHundredDayAverage) / twoHundredDayAverage) * 100
        : null;
    const fiftyDayPosition = positionInRange(fiftyDayAverage, weekLow, weekHigh);
    const twoHundredDayPosition = positionInRange(twoHundredDayAverage, weekLow, weekHigh);
    const distanceToHigh = fiftyDayAverage !== null && weekHigh
        ? ((fiftyDayAverage - weekHigh) / weekHigh) * 100
        : null;
    const distanceAboveLow = fiftyDayAverage !== null && weekLow
        ? ((fiftyDayAverage - weekLow) / weekLow) * 100
        : null;
    const trendLabel = crossoverSpread === null
        ? 'Needs moving-average data'
        : crossoverSpread >= 0 ? '50-day above 200-day' : '50-day below 200-day';

    return (
        <section className="stock-trend-panel">
            <div className="stock-trend-panel__header">
                <div>
                    <h2>Technical Trend</h2>
                    <span>{trendLabel}</span>
                </div>
                <strong className={crossoverSpread !== null && crossoverSpread < 0 ? 'is-negative' : 'is-positive'}>
                    {formatPercent(crossoverSpread)} spread
                </strong>
            </div>

            <div className="stock-trend-panel__metrics">
                <span><small>50-Day Average</small><strong>{formatCurrency(fiftyDayAverage)}</strong></span>
                <span><small>200-Day Average</small><strong>{formatCurrency(twoHundredDayAverage)}</strong></span>
                <span><small>50-Day To High</small><strong>{formatPercent(distanceToHigh)}</strong></span>
                <span><small>50-Day Above Low</small><strong>{formatPercent(distanceAboveLow)}</strong></span>
            </div>

            <div className="stock-trend-panel__range">
                <div className="stock-trend-panel__range-labels">
                    <span>52W low {formatCurrency(weekLow)}</span>
                    <span>52W high {formatCurrency(weekHigh)}</span>
                </div>
                <div className="stock-trend-panel__track">
                    {twoHundredDayPosition !== null && (
                        <span
                            className="stock-trend-panel__marker stock-trend-panel__marker--long"
                            style={{left: `${twoHundredDayPosition}%`}}
                            title={`200-day average ${formatCurrency(twoHundredDayAverage)}`} />
                    )}
                    {fiftyDayPosition !== null && (
                        <span
                            className="stock-trend-panel__marker stock-trend-panel__marker--short"
                            style={{left: `${fiftyDayPosition}%`}}
                            title={`50-day average ${formatCurrency(fiftyDayAverage)}`} />
                    )}
                </div>
                <div className="stock-trend-panel__legend">
                    <span><i className="stock-trend-panel__dot stock-trend-panel__dot--short" />50-day</span>
                    <span><i className="stock-trend-panel__dot stock-trend-panel__dot--long" />200-day</span>
                </div>
            </div>
        </section>
    );
};

export default StockTrendPanel;
