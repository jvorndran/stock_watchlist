import React from 'react';
import '../style/stock-growth-momentum-style.css';

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '' || value === 'None' || value === '-') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const calculateRatio = (amount, base) => {
    if (amount === null || base === null || base === 0) {
        return null;
    }

    return amount / base;
};

const classifyMomentum = ({earningsGrowth, revenueGrowth}) => {
    if (earningsGrowth === null && revenueGrowth === null) {
        return 'Needs growth data';
    }

    if (revenueGrowth !== null && earningsGrowth !== null) {
        if (revenueGrowth >= 0.15 && earningsGrowth >= revenueGrowth) {
            return 'Expanding margins';
        }

        if (revenueGrowth >= 0.1 && earningsGrowth > 0) {
            return 'Broad-based growth';
        }

        if (revenueGrowth >= 0 && earningsGrowth < 0) {
            return 'Margin pressure';
        }

        if (revenueGrowth < 0 && earningsGrowth < 0) {
            return 'Contracting';
        }

        if (revenueGrowth < 0 && earningsGrowth >= 0.1) {
            return 'Earnings-led recovery';
        }
    }

    return 'Mixed momentum';
};

export const buildGrowthMomentumProfile = (summary = {}) => {
    const revenueGrowth = parseMetric(summary.QuarterlyRevenueGrowthYOY);
    const earningsGrowth = parseMetric(summary.QuarterlyEarningsGrowthYOY);
    const revenue = parseMetric(summary.RevenueTTM);
    const marketCapitalization = parseMetric(summary.MarketCapitalization);
    const sharesOutstanding = parseMetric(summary.SharesOutstanding);

    return {
        earningsGrowth,
        earningsPerShare: parseMetric(summary.DilutedEPSTTM) ?? parseMetric(summary.EPS),
        growthSpread: earningsGrowth !== null && revenueGrowth !== null ? earningsGrowth - revenueGrowth : null,
        hasData: [earningsGrowth, revenueGrowth, revenue].some((value) => value !== null),
        label: classifyMomentum({earningsGrowth, revenueGrowth}),
        revenue,
        revenueGrowth,
        revenuePerShare: calculateRatio(revenue, sharesOutstanding),
        salesMultiple: calculateRatio(marketCapitalization, revenue),
    };
};

const formatCompactCurrency = (value) => value === null
    ? '-'
    : value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
    });

const formatCurrency = (value) => value === null
    ? '-'
    : value.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2});

const formatPercent = (value) => value === null
    ? '-'
    : `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;

const formatRatio = (value) => value === null ? '-' : `${value.toFixed(1)}x`;

const StockGrowthMomentum = ({stockData}) => {
    const {summary} = stockData;
    const momentum = buildGrowthMomentumProfile(summary);
    const tone = ['Margin pressure', 'Contracting'].includes(momentum.label)
        ? 'is-negative'
        : momentum.label === 'Needs growth data' ? 'is-neutral' : '';
    const spreadDetail = momentum.growthSpread === null
        ? 'Needs revenue and earnings growth data'
        : momentum.growthSpread >= 0
            ? 'Earnings are growing faster than revenue'
            : 'Revenue is growing faster than earnings';

    return (
        <section className="stock-growth-momentum">
            <div className="stock-growth-momentum__header">
                <div>
                    <h2>Growth Momentum</h2>
                    <span>Compare reported revenue and earnings direction for {summary.Symbol}</span>
                </div>
                <strong className={tone}>{momentum.label}</strong>
            </div>

            {momentum.hasData ? (
                <>
                    <div className="stock-growth-momentum__metrics">
                        <article>
                            <span>Revenue growth</span>
                            <strong className={momentum.revenueGrowth !== null && momentum.revenueGrowth < 0 ? 'is-negative' : ''}>
                                {formatPercent(momentum.revenueGrowth)}
                            </strong>
                            <small>Reported quarterly year-over-year growth</small>
                        </article>
                        <article>
                            <span>Earnings growth</span>
                            <strong className={momentum.earningsGrowth !== null && momentum.earningsGrowth < 0 ? 'is-negative' : ''}>
                                {formatPercent(momentum.earningsGrowth)}
                            </strong>
                            <small>Reported quarterly year-over-year growth</small>
                        </article>
                        <article>
                            <span>Growth spread</span>
                            <strong className={momentum.growthSpread !== null && momentum.growthSpread < 0 ? 'is-negative' : ''}>
                                {formatPercent(momentum.growthSpread)}
                            </strong>
                            <small>{spreadDetail}</small>
                        </article>
                    </div>

                    <div className="stock-growth-momentum__analysis">
                        <article>
                            <span>Trailing revenue</span>
                            <strong>{formatCompactCurrency(momentum.revenue)}</strong>
                            <small>Reported trailing twelve-month revenue</small>
                        </article>
                        <article>
                            <span>Revenue per share</span>
                            <strong>{formatCurrency(momentum.revenuePerShare)}</strong>
                            <small>Revenue allocated across reported shares</small>
                        </article>
                        <article>
                            <span>Sales multiple</span>
                            <strong>{formatRatio(momentum.salesMultiple)}</strong>
                            <small>Market capitalization relative to trailing revenue</small>
                        </article>
                    </div>
                </>
            ) : (
                <p className="stock-growth-momentum__empty">
                    Revenue and quarterly growth data are not available for this symbol.
                </p>
            )}

            <small className="stock-growth-momentum__disclaimer">
                Growth rates are reported snapshots; compare multiple periods before treating a change as a durable trend.
            </small>
        </section>
    );
};

export default StockGrowthMomentum;
