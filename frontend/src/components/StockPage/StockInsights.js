import React from 'react';
import '../style/stock-insights-style.css';

const parseMetric = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatRatio = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `${parsed.toFixed(2)}x`;
};

const formatPercent = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `${(parsed * 100).toFixed(1)}%`;
};

const formatCurrency = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `$${parsed.toFixed(2)}`;
};

const formatMarketCap = (value) => {
    const parsed = parseMetric(value);

    if (parsed === null) {
        return '-';
    }

    if (parsed >= 1000000000000) {
        return `$${(parsed / 1000000000000).toFixed(2)}T`;
    }

    return `$${(parsed / 1000000000).toFixed(1)}B`;
};

const getForwardPeChange = (summary) => {
    const trailingPe = parseMetric(summary.PERatio);
    const forwardPe = parseMetric(summary.ForwardPE);

    if (!trailingPe || forwardPe === null) {
        return '-';
    }

    const change = ((forwardPe - trailingPe) / trailingPe) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
};

const StockInsights = ({ stockData }) => {
    const { summary } = stockData;

    const insights = [
        {
            label: 'Valuation',
            value: formatRatio(summary.ForwardPE),
            meta: `PE ${formatRatio(summary.PERatio)} | PEG ${formatRatio(summary.PEGRatio)}`,
            detail: `${getForwardPeChange(summary)} forward PE change`,
        },
        {
            label: 'Growth',
            value: formatPercent(summary.QuarterlyRevenueGrowthYOY),
            meta: `EPS growth ${formatPercent(summary.QuarterlyEarningsGrowthYOY)}`,
            detail: `Revenue/share ${formatCurrency(summary.RevenuePerShareTTM)}`,
        },
        {
            label: 'Profitability',
            value: formatPercent(summary.OperatingMarginTTM),
            meta: `Profit margin ${formatPercent(summary.ProfitMargin)}`,
            detail: `ROA ${formatPercent(summary.ReturnOnAssetsTTM)}`,
        },
        {
            label: 'Risk Range',
            value: formatRatio(summary.Beta),
            meta: `52W ${formatCurrency(summary['52WeekLow'])} - ${formatCurrency(summary['52WeekHigh'])}`,
            detail: `Target ${formatCurrency(summary.AnalystTargetPrice)} | Cap ${formatMarketCap(summary.MarketCapitalization)}`,
        },
    ];

    return (
        <section className="stock-insights">
            <div className="stock-insights__header">
                <h2>Fundamentals Snapshot</h2>
                <span>{summary.Symbol}</span>
            </div>

            <div className="stock-insights__grid">
                {insights.map((insight) => (
                    <article className="stock-insight-card" key={insight.label}>
                        <span>{insight.label}</span>
                        <strong>{insight.value}</strong>
                        <p>{insight.meta}</p>
                        <small>{insight.detail}</small>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default StockInsights;
