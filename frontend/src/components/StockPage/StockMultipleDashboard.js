import React from 'react';
import '../style/stock-multiple-dashboard-style.css';

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '' || value === 'None' || value === '-') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatMultiple = (value) => value === null ? '-' : `${value.toFixed(1)}x`;

const formatPercent = (value) => value === null ? '-' : `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;

const classifyMultipleProfile = ({forwardPe, trailingPe, pegRatio}) => {
    if (forwardPe === null && trailingPe === null && pegRatio === null) {
        return 'Needs multiple data';
    }

    if ((forwardPe !== null && forwardPe <= 0) || (trailingPe !== null && trailingPe <= 0)) {
        return 'Loss-making multiple';
    }

    if (forwardPe !== null && trailingPe !== null && forwardPe < trailingPe * 0.9) {
        return 'Forward compression';
    }

    if (forwardPe !== null && trailingPe !== null && forwardPe > trailingPe * 1.1) {
        return 'Forward expansion';
    }

    return 'Stable multiple profile';
};

export const buildMultipleProfile = (summary = {}) => {
    const trailingPe = parseMetric(summary.PERatio);
    const forwardPe = parseMetric(summary.ForwardPE);
    const priceToSales = parseMetric(summary.PriceToSalesRatioTTM);
    const priceToBook = parseMetric(summary.PriceToBookRatio);
    const pegRatio = parseMetric(summary.PEGRatio);
    const evToRevenue = parseMetric(summary.EVToRevenue);
    const evToEbitda = parseMetric(summary.EVToEBITDA);
    const forwardPeChange = trailingPe !== null && trailingPe > 0 && forwardPe !== null
        ? (forwardPe - trailingPe) / trailingPe
        : null;

    return {
        earningsYield: trailingPe !== null && trailingPe > 0 ? 1 / trailingPe : null,
        evToEbitda,
        evToRevenue,
        forwardEarningsYield: forwardPe !== null && forwardPe > 0 ? 1 / forwardPe : null,
        forwardPe,
        forwardPeChange,
        hasData: [trailingPe, forwardPe, priceToSales, priceToBook, pegRatio, evToRevenue, evToEbitda]
            .some((value) => value !== null),
        label: classifyMultipleProfile({forwardPe, trailingPe, pegRatio}),
        pegRatio,
        priceToBook,
        priceToSales,
        trailingPe,
    };
};

const StockMultipleDashboard = ({stockData}) => {
    const {summary} = stockData;
    const profile = buildMultipleProfile(summary);
    const tone = profile.label === 'Loss-making multiple'
        ? 'is-negative'
        : profile.label === 'Needs multiple data' ? 'is-neutral' : '';
    const earningsMetrics = [
        {label: 'Trailing P/E', value: formatMultiple(profile.trailingPe), detail: 'Price / trailing EPS'},
        {label: 'Forward P/E', value: formatMultiple(profile.forwardPe), detail: formatPercent(profile.forwardPeChange) === '-' ? 'Forward comparison unavailable' : `${formatPercent(profile.forwardPeChange)} versus trailing`},
        {label: 'PEG ratio', value: formatMultiple(profile.pegRatio), detail: 'P/E relative to reported growth'},
        {label: 'Earnings yield', value: formatPercent(profile.earningsYield), detail: 'Inverse of trailing P/E'},
    ];
    const businessMetrics = [
        {label: 'Price / sales', value: formatMultiple(profile.priceToSales), detail: 'Equity value / TTM revenue'},
        {label: 'Price / book', value: formatMultiple(profile.priceToBook), detail: 'Equity value / book value'},
        {label: 'EV / revenue', value: formatMultiple(profile.evToRevenue), detail: 'Enterprise value / TTM revenue'},
        {label: 'EV / EBITDA', value: formatMultiple(profile.evToEbitda), detail: 'Enterprise value / EBITDA'},
    ];

    return (
        <section className="stock-multiple-dashboard">
            <div className="stock-multiple-dashboard__header">
                <div>
                    <h2>Valuation Multiple Dashboard</h2>
                    <span>Compare earnings, sales, book value, and enterprise-value lenses for {summary.Symbol}</span>
                </div>
                <strong className={tone}>{profile.label}</strong>
            </div>

            {profile.hasData ? (
                <div className="stock-multiple-dashboard__columns">
                    <div className="stock-multiple-dashboard__column">
                        <h3>Earnings Lens</h3>
                        {earningsMetrics.map((metric) => (
                            <article key={metric.label}>
                                <span>{metric.label}</span>
                                <strong className={metric.value.startsWith('-') ? 'is-negative' : ''}>{metric.value}</strong>
                                <small>{metric.detail}</small>
                            </article>
                        ))}
                    </div>
                    <div className="stock-multiple-dashboard__column">
                        <h3>Business Value Lens</h3>
                        {businessMetrics.map((metric) => (
                            <article key={metric.label}>
                                <span>{metric.label}</span>
                                <strong>{metric.value}</strong>
                                <small>{metric.detail}</small>
                            </article>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="stock-multiple-dashboard__empty">
                    Reported valuation multiples are not available for this symbol.
                </p>
            )}

            <small className="stock-multiple-dashboard__disclaimer">
                Multiples are reported trailing or forward data points and should be compared with companies in the same industry.
            </small>
        </section>
    );
};

export default StockMultipleDashboard;
