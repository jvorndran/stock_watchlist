import React from 'react';
import '../style/stock-balance-sheet-health-style.css';

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '' || value === 'None' || value === '-') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const normalizeDebtToEquity = (value) => {
    const parsed = parseMetric(value);

    if (parsed === null || parsed < 0) {
        return null;
    }

    return parsed > 10 ? parsed / 100 : parsed;
};

const classifyBalanceSheet = ({currentRatio, debtCoverage, debtToEquity, netCash}) => {
    if ([currentRatio, debtCoverage, debtToEquity, netCash].every((value) => value === null)) {
        return 'Needs balance sheet data';
    }

    if ((currentRatio !== null && currentRatio < 1) ||
        (debtCoverage !== null && debtCoverage < 0.35 && netCash !== null && netCash < 0)) {
        return 'Liquidity watch';
    }

    if ((debtToEquity !== null && debtToEquity > 2) ||
        (debtCoverage !== null && debtCoverage < 0.6 && netCash !== null && netCash < 0)) {
        return 'Leverage elevated';
    }

    if (netCash !== null && netCash >= 0 && (currentRatio === null || currentRatio >= 1.25)) {
        return 'Net cash buffer';
    }

    if ((currentRatio !== null && currentRatio >= 1.5) ||
        (debtToEquity !== null && debtToEquity <= 0.75)) {
        return 'Conservative funding';
    }

    return 'Balanced funding';
};

export const buildBalanceSheetHealth = (summary = {}) => {
    const cash = parseMetric(summary.TotalCash);
    const debt = parseMetric(summary.TotalDebt);
    const currentRatio = parseMetric(summary.CurrentRatio);
    const debtToEquity = normalizeDebtToEquity(summary.DebtToEquity);
    const cashPerShare = parseMetric(summary.CashPerShare);
    const netCash = cash !== null && debt !== null ? cash - debt : null;
    const debtCoverage = cash !== null && debt !== null && debt > 0 ? cash / debt : null;

    return {
        cash,
        cashPerShare,
        currentRatio,
        debt,
        debtCoverage,
        debtToEquity,
        hasData: [cash, debt, currentRatio, debtToEquity, cashPerShare].some((value) => value !== null),
        label: classifyBalanceSheet({currentRatio, debtCoverage, debtToEquity, netCash}),
        netCash,
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

const formatRatio = (value) => value === null ? '-' : `${value.toFixed(2)}x`;

const StockBalanceSheetHealth = ({stockData}) => {
    const {summary} = stockData;
    const health = buildBalanceSheetHealth(summary);
    const tone = ['Liquidity watch', 'Leverage elevated'].includes(health.label)
        ? 'is-negative'
        : health.label === 'Needs balance sheet data' ? 'is-neutral' : '';
    const fundingLabel = health.netCash === null
        ? 'Net cash / debt'
        : health.netCash >= 0 ? 'Net cash' : 'Net debt';
    const fundingValue = health.netCash === null
        ? '-'
        : formatCompactCurrency(Math.abs(health.netCash));

    return (
        <section className="stock-balance-sheet-health">
            <div className="stock-balance-sheet-health__header">
                <div>
                    <h2>Balance Sheet Health</h2>
                    <span>Liquidity and funding context for {summary.Symbol}</span>
                </div>
                <strong className={tone}>{health.label}</strong>
            </div>

            {health.hasData ? (
                <>
                    <div className="stock-balance-sheet-health__metrics">
                        <article>
                            <span>Total cash</span>
                            <strong>{formatCompactCurrency(health.cash)}</strong>
                            <small>Reported cash and equivalents</small>
                        </article>
                        <article>
                            <span>Total debt</span>
                            <strong>{formatCompactCurrency(health.debt)}</strong>
                            <small>Reported interest-bearing debt</small>
                        </article>
                        <article className={health.netCash !== null && health.netCash < 0 ? 'is-negative' : ''}>
                            <span>{fundingLabel}</span>
                            <strong>{fundingValue}</strong>
                            <small>Cash less total debt</small>
                        </article>
                    </div>

                    <div className="stock-balance-sheet-health__ratios">
                        <article>
                            <span>Current ratio</span>
                            <strong className={health.currentRatio !== null && health.currentRatio < 1 ? 'is-negative' : ''}>
                                {formatRatio(health.currentRatio)}
                            </strong>
                            <small>Short-term assets relative to liabilities</small>
                        </article>
                        <article>
                            <span>Debt to equity</span>
                            <strong className={health.debtToEquity !== null && health.debtToEquity > 2 ? 'is-negative' : ''}>
                                {formatRatio(health.debtToEquity)}
                            </strong>
                            <small>Reported leverage, normalized to a ratio</small>
                        </article>
                        <article>
                            <span>Cash coverage</span>
                            <strong className={health.debtCoverage !== null && health.debtCoverage < 0.6 ? 'is-negative' : ''}>
                                {formatRatio(health.debtCoverage)}
                            </strong>
                            <small>Cash available for each dollar of debt</small>
                        </article>
                        <article>
                            <span>Cash per share</span>
                            <strong>{formatCurrency(health.cashPerShare)}</strong>
                            <small>Balance-sheet cash allocated per share</small>
                        </article>
                    </div>
                </>
            ) : (
                <p className="stock-balance-sheet-health__empty">
                    Cash, debt, and liquidity data are not available for this symbol.
                </p>
            )}

            <small className="stock-balance-sheet-health__disclaimer">
                Funding labels summarize reported balance-sheet fields and do not replace a review of maturities or off-balance-sheet obligations.
            </small>
        </section>
    );
};

export default StockBalanceSheetHealth;
