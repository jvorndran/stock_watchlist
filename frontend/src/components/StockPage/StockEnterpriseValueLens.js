import React from 'react';
import '../style/stock-enterprise-value-lens-style.css';

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '' || value === 'None' || value === '-') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const calculateRatio = (amount, base) => {
    if (amount === null || base === null || base <= 0) {
        return null;
    }

    return amount / base;
};

const classifyEnterpriseValue = ({evToEbitda, evToRevenue}) => {
    if (evToEbitda === null && evToRevenue === null) {
        return 'Needs EV multiple data';
    }

    if ((evToEbitda !== null && evToEbitda >= 25) || (evToRevenue !== null && evToRevenue >= 8)) {
        return 'Premium multiple';
    }

    if ((evToEbitda !== null && evToEbitda <= 10) && (evToRevenue === null || evToRevenue <= 3)) {
        return 'Lower multiple';
    }

    return 'Mid-range multiple';
};

export const buildEnterpriseValueProfile = (summary = {}) => {
    const revenue = parseMetric(summary.RevenueTTM);
    const ebitda = parseMetric(summary.EBITDA);
    const marketCapitalization = parseMetric(summary.MarketCapitalization);
    const evToRevenue = parseMetric(summary.EVToRevenue);
    const evToEbitda = parseMetric(summary.EVToEBITDA);
    const revenueBasedEstimate = revenue !== null && evToRevenue !== null && evToRevenue >= 0
        ? revenue * evToRevenue
        : null;
    const ebitdaBasedEstimate = ebitda !== null && ebitda > 0 && evToEbitda !== null && evToEbitda >= 0
        ? ebitda * evToEbitda
        : null;
    const estimates = [revenueBasedEstimate, ebitdaBasedEstimate].filter((estimate) => estimate !== null);
    const estimatedEnterpriseValue = estimates.length > 0
        ? estimates.reduce((total, estimate) => total + estimate, 0) / estimates.length
        : null;

    return {
        ebitda,
        estimatedEnterpriseValue,
        evToEbitda,
        evToRevenue,
        financingPremium: calculateRatio(estimatedEnterpriseValue, marketCapitalization) === null
            ? null
            : calculateRatio(estimatedEnterpriseValue, marketCapitalization) - 1,
        hasData: evToEbitda !== null || evToRevenue !== null,
        label: classifyEnterpriseValue({evToEbitda, evToRevenue}),
        marketCapitalization,
        revenue,
        revenueBasedEstimate,
        ebitdaBasedEstimate,
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

const formatPercent = (value) => value === null
    ? '-'
    : `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;

const formatRatio = (value) => value === null ? '-' : `${value.toFixed(1)}x`;

const StockEnterpriseValueLens = ({stockData}) => {
    const {summary} = stockData;
    const profile = buildEnterpriseValueProfile(summary);
    const tone = profile.label === 'Premium multiple'
        ? 'is-premium'
        : profile.label === 'Needs EV multiple data' ? 'is-neutral' : '';
    const estimateSources = [profile.revenueBasedEstimate, profile.ebitdaBasedEstimate].filter((estimate) => estimate !== null).length;

    return (
        <section className="stock-enterprise-value-lens">
            <div className="stock-enterprise-value-lens__header">
                <div>
                    <h2>Enterprise Value Lens</h2>
                    <span>Frame revenue and EBITDA multiples against {summary.Symbol}&apos;s market capitalization</span>
                </div>
                <strong className={tone}>{profile.label}</strong>
            </div>

            {profile.hasData ? (
                <>
                    <div className="stock-enterprise-value-lens__metrics">
                        <article>
                            <span>EV / Revenue</span>
                            <strong>{formatRatio(profile.evToRevenue)}</strong>
                            <small>Enterprise value relative to trailing revenue</small>
                        </article>
                        <article>
                            <span>EV / EBITDA</span>
                            <strong>{formatRatio(profile.evToEbitda)}</strong>
                            <small>Enterprise value relative to reported EBITDA</small>
                        </article>
                        <article className={profile.financingPremium !== null && profile.financingPremium > 0 ? 'is-premium' : ''}>
                            <span>EV premium</span>
                            <strong>{formatPercent(profile.financingPremium)}</strong>
                            <small>Estimated enterprise value versus market capitalization</small>
                        </article>
                    </div>

                    <div className="stock-enterprise-value-lens__analysis">
                        <article>
                            <span>Estimated enterprise value</span>
                            <strong>{formatCompactCurrency(profile.estimatedEnterpriseValue)}</strong>
                            <small>Average of {estimateSources} available multiple-based estimate{estimateSources === 1 ? '' : 's'}</small>
                        </article>
                        <article>
                            <span>Market capitalization</span>
                            <strong>{formatCompactCurrency(profile.marketCapitalization)}</strong>
                            <small>Reported equity value reference</small>
                        </article>
                        <article>
                            <span>Operating bases</span>
                            <strong>{formatCompactCurrency(profile.revenue)} / {formatCompactCurrency(profile.ebitda)}</strong>
                            <small>Trailing revenue / reported EBITDA</small>
                        </article>
                    </div>
                </>
            ) : (
                <p className="stock-enterprise-value-lens__empty">
                    Enterprise value multiples are not available for this symbol.
                </p>
            )}

            <small className="stock-enterprise-value-lens__disclaimer">
                The enterprise value estimate is derived from reported multiples and operating metrics; differences from market capitalization can reflect debt, cash, preferred equity, or data timing.
            </small>
        </section>
    );
};

export default StockEnterpriseValueLens;
