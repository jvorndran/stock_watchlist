import React from 'react';
import '../style/stock-capital-allocation-style.css';

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

const classifyCapitalAllocation = ({dividendCoverage, freeCashFlow, netCash, retainedCashFlow}) => {
    if ([dividendCoverage, freeCashFlow, netCash, retainedCashFlow].every((value) => value === null)) {
        return 'Needs allocation data';
    }

    if (freeCashFlow !== null && freeCashFlow < 0) {
        return 'Cash funding pressure';
    }

    if ((dividendCoverage !== null && dividendCoverage < 1) ||
        (retainedCashFlow !== null && retainedCashFlow < 0)) {
        return 'Dividend coverage watch';
    }

    if (netCash !== null && netCash >= 0 && retainedCashFlow !== null && retainedCashFlow >= 0) {
        return 'Funded flexibility';
    }

    if (freeCashFlow !== null && freeCashFlow >= 0) {
        return 'Self-funded operations';
    }

    return 'Balanced allocation';
};

export const buildCapitalAllocationProfile = (summary = {}) => {
    const freeCashFlow = parseMetric(summary.FreeCashflow);
    const dividendPerShare = parseMetric(summary.DividendPerShare);
    const sharesOutstanding = parseMetric(summary.SharesOutstanding);
    const totalCash = parseMetric(summary.TotalCash);
    const totalDebt = parseMetric(summary.TotalDebt);
    const marketCapitalization = parseMetric(summary.MarketCapitalization);
    const dividendCommitment = dividendPerShare !== null && dividendPerShare > 0 && sharesOutstanding !== null && sharesOutstanding > 0
        ? dividendPerShare * sharesOutstanding
        : null;
    const netCash = totalCash !== null && totalDebt !== null ? totalCash - totalDebt : null;
    const retainedCashFlow = freeCashFlow !== null && dividendCommitment !== null
        ? freeCashFlow - dividendCommitment
        : null;
    const dividendCoverage = calculateRatio(freeCashFlow, dividendCommitment);

    return {
        dividendCommitment,
        dividendCoverage,
        freeCashFlow,
        freeCashFlowYield: calculateRatio(freeCashFlow, marketCapitalization),
        hasData: [freeCashFlow, dividendCommitment, totalCash, totalDebt].some((value) => value !== null),
        label: classifyCapitalAllocation({dividendCoverage, freeCashFlow, netCash, retainedCashFlow}),
        netCash,
        retainedCashFlow,
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

const formatPercent = (value) => value === null ? '-' : `${(value * 100).toFixed(1)}%`;

const formatRatio = (value) => value === null ? '-' : `${value.toFixed(2)}x`;

const StockCapitalAllocation = ({stockData}) => {
    const {summary} = stockData;
    const profile = buildCapitalAllocationProfile(summary);
    const tone = ['Cash funding pressure', 'Dividend coverage watch'].includes(profile.label)
        ? 'is-negative'
        : profile.label === 'Needs allocation data' ? 'is-neutral' : '';
    const fundingLabel = profile.netCash === null
        ? 'Net cash / debt'
        : profile.netCash >= 0 ? 'Net cash' : 'Net debt';

    return (
        <section className="stock-capital-allocation">
            <div className="stock-capital-allocation__header">
                <div>
                    <h2>Capital Allocation</h2>
                    <span>Connect cash generation, dividends, and funding capacity for {summary.Symbol}</span>
                </div>
                <strong className={tone}>{profile.label}</strong>
            </div>

            {profile.hasData ? (
                <>
                    <div className="stock-capital-allocation__metrics">
                        <article>
                            <span>Free cash flow</span>
                            <strong className={profile.freeCashFlow !== null && profile.freeCashFlow < 0 ? 'is-negative' : ''}>
                                {formatCompactCurrency(profile.freeCashFlow)}
                            </strong>
                            <small>{formatPercent(profile.freeCashFlowYield)} of reported market capitalization</small>
                        </article>
                        <article>
                            <span>Estimated dividend commitment</span>
                            <strong>{formatCompactCurrency(profile.dividendCommitment)}</strong>
                            <small>Annual dividend per share multiplied by shares outstanding</small>
                        </article>
                        <article className={profile.retainedCashFlow !== null && profile.retainedCashFlow < 0 ? 'is-negative' : ''}>
                            <span>Cash after dividends</span>
                            <strong>{formatCompactCurrency(profile.retainedCashFlow)}</strong>
                            <small>Free cash flow less the estimated annual dividend</small>
                        </article>
                    </div>

                    <div className="stock-capital-allocation__analysis">
                        <article>
                            <span>Dividend coverage</span>
                            <strong className={profile.dividendCoverage !== null && profile.dividendCoverage < 1 ? 'is-negative' : ''}>
                                {formatRatio(profile.dividendCoverage)}
                            </strong>
                            <small>Free cash flow available for each dollar of estimated dividends</small>
                        </article>
                        <article className={profile.netCash !== null && profile.netCash < 0 ? 'is-negative' : ''}>
                            <span>{fundingLabel}</span>
                            <strong>{formatCompactCurrency(profile.netCash === null ? null : Math.abs(profile.netCash))}</strong>
                            <small>Reported cash less total debt</small>
                        </article>
                        <article>
                            <span>Capital flexibility</span>
                            <strong>{profile.label}</strong>
                            <small>Uses available cash flow, dividend, and balance-sheet context</small>
                        </article>
                    </div>
                </>
            ) : (
                <p className="stock-capital-allocation__empty">
                    Cash flow, dividend, and balance-sheet fields are not available for this symbol.
                </p>
            )}

            <small className="stock-capital-allocation__disclaimer">
                Dividend commitments use the reported annual per-share payout and current shares outstanding; buybacks, debt maturities, and acquisitions are not included.
            </small>
        </section>
    );
};

export default StockCapitalAllocation;
