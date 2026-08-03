import React from 'react';
import '../style/stock-profitability-panel-style.css';

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '' || value === 'None' || value === '-') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const calculateMargin = (amount, revenue) => {
    const parsedAmount = parseMetric(amount);
    const parsedRevenue = parseMetric(revenue);

    if (parsedAmount === null || parsedRevenue === null || parsedRevenue <= 0) {
        return null;
    }

    return parsedAmount / parsedRevenue;
};

const classifyProfitability = ({netMargin, operatingMargin, returnOnAssets, returnOnEquity}) => {
    if ([netMargin, operatingMargin, returnOnAssets, returnOnEquity].every((value) => value === null)) {
        return 'Needs more data';
    }

    if ((netMargin !== null && netMargin < 0) || (operatingMargin !== null && operatingMargin < 0)) {
        return 'Margin pressure';
    }

    if (netMargin !== null && netMargin >= 0.15 &&
        returnOnEquity !== null && returnOnEquity >= 0.15 &&
        returnOnAssets !== null && returnOnAssets >= 0.07) {
        return 'High-return profile';
    }

    if (netMargin !== null && netMargin >= 0.08 &&
        ((returnOnEquity !== null && returnOnEquity >= 0.1) ||
            (returnOnAssets !== null && returnOnAssets >= 0.05))) {
        return 'Healthy profitability';
    }

    if (netMargin !== null && netMargin >= 0) {
        return 'Positive, thin margins';
    }

    return 'Mixed profitability';
};

export const buildProfitabilityProfile = (summary = {}) => {
    const revenue = parseMetric(summary.RevenueTTM);
    const grossProfit = parseMetric(summary.GrossProfitTTM);
    const ebitda = parseMetric(summary.EBITDA);
    const grossMargin = calculateMargin(grossProfit, revenue);
    const ebitdaMargin = calculateMargin(ebitda, revenue);
    const operatingMargin = parseMetric(summary.OperatingMarginTTM);
    const netMargin = parseMetric(summary.ProfitMargin);
    const returnOnAssets = parseMetric(summary.ReturnOnAssetsTTM);
    const returnOnEquity = parseMetric(summary.ReturnOnEquityTTM);
    const marginRetention = grossMargin !== null && grossMargin !== 0 && netMargin !== null
        ? netMargin / grossMargin
        : null;
    const returnGap = returnOnAssets !== null && returnOnEquity !== null
        ? returnOnEquity - returnOnAssets
        : null;
    const marginValues = [grossMargin, ebitdaMargin, operatingMargin, netMargin];
    const returnValues = [returnOnAssets, returnOnEquity];

    return {
        ebitda,
        ebitdaMargin,
        grossMargin,
        grossProfit,
        hasData: [revenue, grossProfit, ebitda, ...marginValues, ...returnValues]
            .some((value) => value !== null),
        label: classifyProfitability({netMargin, operatingMargin, returnOnAssets, returnOnEquity}),
        marginRetention,
        netMargin,
        operatingMargin,
        returnGap,
        returnOnAssets,
        returnOnEquity,
        revenue,
    };
};

const formatPercent = (value) => value === null
    ? '-'
    : `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;

const formatCompactCurrency = (value) => {
    if (value === null) {
        return '-';
    }

    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
    });
};

const barWidth = (value) => value === null ? 0 : Math.min(100, Math.abs(value) * 100);

const StockProfitabilityPanel = ({stockData}) => {
    const {summary} = stockData;
    const profile = buildProfitabilityProfile(summary);
    const qualityTone = profile.label === 'Margin pressure'
        ? 'is-negative'
        : ['Needs more data', 'Mixed profitability'].includes(profile.label) ? 'is-neutral' : '';
    const marginRows = [
        {label: 'Gross margin', value: profile.grossMargin, detail: 'Gross profit / revenue'},
        {label: 'EBITDA margin', value: profile.ebitdaMargin, detail: 'EBITDA / revenue'},
        {label: 'Operating margin', value: profile.operatingMargin, detail: 'Reported TTM'},
        {label: 'Net margin', value: profile.netMargin, detail: 'Profit retained after expenses'},
    ];

    return (
        <section className="stock-profitability-panel">
            <div className="stock-profitability-panel__header">
                <div>
                    <h2>Profitability Quality</h2>
                    <span>Margin conversion and capital returns for {summary.Symbol}</span>
                </div>
                <strong className={qualityTone}>{profile.label}</strong>
            </div>

            {profile.hasData ? (
                <>
                    <div className="stock-profitability-panel__scale">
                        <article>
                            <span>Revenue TTM</span>
                            <strong>{formatCompactCurrency(profile.revenue)}</strong>
                            <small>Trailing business scale</small>
                        </article>
                        <article>
                            <span>Gross Profit TTM</span>
                            <strong>{formatCompactCurrency(profile.grossProfit)}</strong>
                            <small>{formatPercent(profile.grossMargin)} of revenue</small>
                        </article>
                        <article>
                            <span>EBITDA</span>
                            <strong>{formatCompactCurrency(profile.ebitda)}</strong>
                            <small>{formatPercent(profile.ebitdaMargin)} of revenue</small>
                        </article>
                    </div>

                    <div className="stock-profitability-panel__analysis">
                        <div className="stock-profitability-panel__margins">
                            <h3>Margin Ladder</h3>
                            {marginRows.map((row) => (
                                <div className="stock-profitability-panel__margin" key={row.label}>
                                    <div>
                                        <span>{row.label}</span>
                                        <strong className={row.value !== null && row.value < 0 ? 'is-negative' : ''}>
                                            {formatPercent(row.value)}
                                        </strong>
                                    </div>
                                    <div className="stock-profitability-panel__track">
                                        <span
                                            aria-label={`${row.label} ${formatPercent(row.value)}`}
                                            className={row.value !== null && row.value < 0 ? 'is-negative' : ''}
                                            role="img"
                                            style={{width: `${barWidth(row.value)}%`}}
                                        />
                                    </div>
                                    <small>{row.detail}</small>
                                </div>
                            ))}
                        </div>

                        <div className="stock-profitability-panel__returns">
                            <h3>Capital Returns</h3>
                            <article>
                                <span>Return on assets</span>
                                <strong className={profile.returnOnAssets !== null && profile.returnOnAssets < 0 ? 'is-negative' : ''}>
                                    {formatPercent(profile.returnOnAssets)}
                                </strong>
                                <small>Profitability relative to the asset base</small>
                            </article>
                            <article>
                                <span>Return on equity</span>
                                <strong className={profile.returnOnEquity !== null && profile.returnOnEquity < 0 ? 'is-negative' : ''}>
                                    {formatPercent(profile.returnOnEquity)}
                                </strong>
                                <small>Profitability relative to shareholder equity</small>
                            </article>
                            <article>
                                <span>Equity / asset return gap</span>
                                <strong className={profile.returnGap !== null && profile.returnGap < 0 ? 'is-negative' : ''}>
                                    {formatPercent(profile.returnGap)}
                                </strong>
                                <small>ROE minus ROA; review leverage when the gap is wide</small>
                            </article>
                            <article>
                                <span>Gross-to-net retention</span>
                                <strong className={profile.marginRetention !== null && profile.marginRetention < 0 ? 'is-negative' : ''}>
                                    {formatPercent(profile.marginRetention)}
                                </strong>
                                <small>Net margin retained from each point of gross margin</small>
                            </article>
                        </div>
                    </div>
                </>
            ) : (
                <p className="stock-profitability-panel__empty">
                    Revenue, margin, and capital-return data are not available for this symbol.
                </p>
            )}

            <small className="stock-profitability-panel__disclaimer">
                Quality labels summarize reported trailing metrics and do not adjust for industry differences.
            </small>
        </section>
    );
};

export default StockProfitabilityPanel;
