import React from 'react';
import '../style/stock-target-panel-style.css';

const parseMetric = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatCurrency = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `$${parsed.toFixed(2)}`;
};

const formatPercent = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `${parsed > 0 ? '+' : ''}${parsed.toFixed(1)}%`;
};

const getBetaLabel = (beta) => {
    const parsedBeta = parseMetric(beta);

    if (parsedBeta === null) {
        return 'Risk unavailable';
    }

    if (parsedBeta >= 1.3) {
        return 'High volatility';
    }

    if (parsedBeta <= 0.8) {
        return 'Defensive beta';
    }

    return 'Market-like beta';
};

const getTargetRange = (summary) => {
    const target = parseMetric(summary.AnalystTargetPrice);
    const low = parseMetric(summary['52WeekLow']);
    const high = parseMetric(summary['52WeekHigh']);

    if (target === null || low === null || high === null || high <= low) {
        return null;
    }

    const rawPosition = ((target - low) / (high - low)) * 100;

    return {
        markerPosition: Math.min(100, Math.max(0, rawPosition)),
        rawPosition,
        target,
        low,
        high,
    };
};

const describeTargetPosition = (range) => {
    if (!range) {
        return 'Target range unavailable';
    }

    if (range.rawPosition > 100) {
        return `${formatPercent(((range.target - range.high) / range.high) * 100)} above 52-week high`;
    }

    if (range.rawPosition < 0) {
        return `${formatPercent(((range.target - range.low) / range.low) * 100)} below 52-week low`;
    }

    return `${range.rawPosition.toFixed(0)}% through the 52-week range`;
};

const StockTargetPanel = ({ stockData }) => {
    const { summary } = stockData;
    const range = getTargetRange(summary);
    const beta = parseMetric(summary.Beta);
    const targetToLow = range ? ((range.target - range.low) / range.target) * 100 : null;
    const targetToHigh = range ? ((range.target - range.high) / range.high) * 100 : null;

    const targetMetrics = [
        {
            label: 'Analyst Target',
            value: formatCurrency(summary.AnalystTargetPrice),
            detail: describeTargetPosition(range),
        },
        {
            label: '52W High Gap',
            value: formatPercent(targetToHigh),
            detail: 'Target versus prior high',
        },
        {
            label: 'Low Cushion',
            value: formatPercent(targetToLow),
            detail: 'Target versus 52-week low',
        },
        {
            label: 'Beta Read',
            value: beta === null ? '-' : `${beta.toFixed(2)}x`,
            detail: getBetaLabel(summary.Beta),
        },
    ];

    return (
        <section className="stock-target-panel">
            <div className="stock-target-panel__header">
                <h2>Target And Range</h2>
                <span>{summary.Symbol}</span>
            </div>

            <div className="stock-target-panel__grid">
                {targetMetrics.map((metric) => (
                    <article className="stock-target-card" key={metric.label}>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                        <small>{metric.detail}</small>
                    </article>
                ))}
            </div>

            <div className="stock-target-range">
                <div className="stock-target-range__labels">
                    <span>52W Low {formatCurrency(summary['52WeekLow'])}</span>
                    <span>Target {formatCurrency(summary.AnalystTargetPrice)}</span>
                    <span>52W High {formatCurrency(summary['52WeekHigh'])}</span>
                </div>
                <div className="stock-target-range__track">
                    {range && (
                        <span
                            className="stock-target-range__marker"
                            style={{left: `${range.markerPosition}%`}}
                        />
                    )}
                </div>
            </div>
        </section>
    );
};

export default StockTargetPanel;
