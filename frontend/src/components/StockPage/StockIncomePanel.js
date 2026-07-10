import React from 'react';
import '../style/stock-income-panel-style.css';

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
    return parsed === null ? '-' : `${(parsed * 100).toFixed(2)}%`;
};

const formatDate = (value) => {
    if (!value || value === 'None') {
        return '-';
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return '-';
    }

    return parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const getPayoutRatio = (summary) => {
    const dividendPerShare = parseMetric(summary.DividendPerShare);
    const earningsPerShare = parseMetric(summary.EPS);

    if (dividendPerShare === null || earningsPerShare === null || earningsPerShare <= 0) {
        return null;
    }

    return dividendPerShare / earningsPerShare;
};

const getIncomeLabel = (summary) => {
    const dividendYield = parseMetric(summary.DividendYield);
    const dividendPerShare = parseMetric(summary.DividendPerShare);

    if (!dividendYield && !dividendPerShare) {
        return 'No dividend reported';
    }

    if (dividendYield >= 0.04) {
        return 'High yield profile';
    }

    if (dividendYield >= 0.015) {
        return 'Dividend contributor';
    }

    return 'Low yield profile';
};

const StockIncomePanel = ({ stockData }) => {
    const { summary } = stockData;
    const payoutRatio = getPayoutRatio(summary);

    const incomeMetrics = [
        {
            label: 'Dividend Yield',
            value: formatPercent(summary.DividendYield),
            detail: getIncomeLabel(summary),
        },
        {
            label: 'Dividend Per Share',
            value: formatCurrency(summary.DividendPerShare),
            detail: `EPS ${formatCurrency(summary.EPS)}`,
        },
        {
            label: 'Payout Ratio',
            value: formatPercent(payoutRatio),
            detail: payoutRatio === null ? 'Needs dividend and EPS data' : 'Dividend per share divided by EPS',
        },
        {
            label: 'Ex-Dividend Date',
            value: formatDate(summary.ExDividendDate),
            detail: 'Shareholder eligibility date',
        },
        {
            label: 'Payment Date',
            value: formatDate(summary.DividendDate),
            detail: 'Reported dividend payment date',
        },
    ];

    return (
        <section className="stock-income-panel">
            <div className="stock-income-panel__header">
                <div>
                    <h2>Income Profile</h2>
                    <span>{summary.Symbol}</span>
                </div>
                <strong>{getIncomeLabel(summary)}</strong>
            </div>

            <div className="stock-income-panel__grid">
                {incomeMetrics.map((metric) => (
                    <article className="stock-income-card" key={metric.label}>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                        <small>{metric.detail}</small>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default StockIncomePanel;
