import React from 'react';
import '../style/stock-risk-checklist-style.css';

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '' || value === 'None') {
        return null;
    }

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

const formatTargetGap = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `${parsed > 0 ? '+' : ''}${(parsed * 100).toFixed(1)}%`;
};

const checkStatus = (hasData, isWatch, isMonitor = false) => {
    if (!hasData) {
        return 'missing';
    }

    if (isWatch) {
        return 'watch';
    }

    return isMonitor ? 'monitor' : 'clear';
};

const getTargetGap = (summary) => {
    const target = parseMetric(summary.AnalystTargetPrice);
    const high = parseMetric(summary['52WeekHigh']);

    if (target === null || high === null || high <= 0) {
        return null;
    }

    return (target - high) / high;
};

const buildChecklist = (summary) => {
    const forwardPe = parseMetric(summary.ForwardPE);
    const pegRatio = parseMetric(summary.PEGRatio);
    const revenueGrowth = parseMetric(summary.QuarterlyRevenueGrowthYOY);
    const earningsGrowth = parseMetric(summary.QuarterlyEarningsGrowthYOY);
    const operatingMargin = parseMetric(summary.OperatingMarginTTM);
    const profitMargin = parseMetric(summary.ProfitMargin);
    const beta = parseMetric(summary.Beta);
    const targetGap = getTargetGap(summary);

    return [
        {
            label: 'Valuation Stretch',
            status: checkStatus(forwardPe !== null || pegRatio !== null, forwardPe > 35 || pegRatio > 3, forwardPe > 25 || pegRatio > 2),
            metric: `Forward PE ${formatRatio(forwardPe)} | PEG ${formatRatio(pegRatio)}`,
            detail: 'Flags high forward earnings or growth-adjusted multiples.',
        },
        {
            label: 'Growth Momentum',
            status: checkStatus(revenueGrowth !== null || earningsGrowth !== null, revenueGrowth < 0 || earningsGrowth < 0, revenueGrowth < 0.05 || earningsGrowth < 0.05),
            metric: `Revenue ${formatPercent(revenueGrowth)} | EPS ${formatPercent(earningsGrowth)}`,
            detail: 'Checks whether recent revenue and earnings growth remain positive.',
        },
        {
            label: 'Margin Quality',
            status: checkStatus(operatingMargin !== null || profitMargin !== null, operatingMargin < 0.05 || profitMargin < 0, operatingMargin < 0.12 || profitMargin < 0.05),
            metric: `Operating ${formatPercent(operatingMargin)} | Profit ${formatPercent(profitMargin)}`,
            detail: 'Highlights weak operating leverage or negative profitability.',
        },
        {
            label: 'Volatility Load',
            status: checkStatus(beta !== null, beta >= 1.5, beta >= 1.2),
            metric: `Beta ${formatRatio(beta)}`,
            detail: 'Compares the stock beta with broad-market volatility.',
        },
        {
            label: 'Target Support',
            status: checkStatus(targetGap !== null, targetGap < -0.1, targetGap < 0),
            metric: `Target gap ${formatTargetGap(targetGap)}`,
            detail: 'Compares analyst target price with the 52-week high.',
        },
    ];
};

const getStatusLabel = (status) => {
    if (status === 'clear') {
        return 'Clear';
    }

    if (status === 'watch') {
        return 'Watch';
    }

    if (status === 'monitor') {
        return 'Monitor';
    }

    return 'Needs data';
};

const StockRiskChecklist = ({ stockData }) => {
    const { summary } = stockData;
    const checks = buildChecklist(summary);
    const clearCount = checks.filter((check) => check.status === 'clear').length;
    const watchCount = checks.filter((check) => check.status === 'watch').length;

    return (
        <section className="stock-risk-checklist">
            <div className="stock-risk-checklist__header">
                <div>
                    <h2>Risk Checklist</h2>
                    <span>{summary.Symbol}</span>
                </div>
                <strong>{clearCount} clear / {watchCount} watch</strong>
            </div>

            <div className="stock-risk-checklist__grid">
                {checks.map((check) => (
                    <article className={`stock-risk-card stock-risk-card--${check.status}`} key={check.label}>
                        <div className="stock-risk-card__topline">
                            <span>{check.label}</span>
                            <strong>{getStatusLabel(check.status)}</strong>
                        </div>
                        <p>{check.metric}</p>
                        <small>{check.detail}</small>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default StockRiskChecklist;
