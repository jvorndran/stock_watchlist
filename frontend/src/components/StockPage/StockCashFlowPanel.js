import React from 'react';
import '../style/stock-cash-flow-panel-style.css';

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

const classifyCashFlow = ({freeCashFlow, freeCashFlowMargin, operatingCashFlow, operatingToFreeCashFlow}) => {
    if ([freeCashFlow, freeCashFlowMargin, operatingCashFlow, operatingToFreeCashFlow].every((value) => value === null)) {
        return 'Needs cash flow data';
    }

    if (operatingCashFlow !== null && operatingCashFlow < 0) {
        return 'Operating cash outflow';
    }

    if (freeCashFlow !== null && freeCashFlow < 0) {
        return 'Free cash flow pressure';
    }

    if (freeCashFlowMargin !== null && freeCashFlowMargin >= 0.12 &&
        operatingToFreeCashFlow !== null && operatingToFreeCashFlow >= 0.65) {
        return 'Strong cash generation';
    }

    if (freeCashFlow !== null && freeCashFlow >= 0) {
        return 'Positive cash generation';
    }

    return 'Mixed cash conversion';
};

export const buildCashFlowProfile = (summary = {}) => {
    const revenue = parseMetric(summary.RevenueTTM);
    const operatingCashFlow = parseMetric(summary.OperatingCashflow);
    const freeCashFlow = parseMetric(summary.FreeCashflow);
    const marketCapitalization = parseMetric(summary.MarketCapitalization);
    const sharesOutstanding = parseMetric(summary.SharesOutstanding);
    const operatingCashFlowMargin = calculateRatio(operatingCashFlow, revenue);
    const freeCashFlowMargin = calculateRatio(freeCashFlow, revenue);
    const operatingToFreeCashFlow = operatingCashFlow !== null && operatingCashFlow > 0
        ? freeCashFlow === null ? null : freeCashFlow / operatingCashFlow
        : null;
    const cashInvestment = operatingCashFlow !== null && freeCashFlow !== null
        ? operatingCashFlow - freeCashFlow
        : null;
    const freeCashFlowYield = calculateRatio(freeCashFlow, marketCapitalization);
    const freeCashFlowPerShare = calculateRatio(freeCashFlow, sharesOutstanding);

    return {
        cashInvestment,
        freeCashFlow,
        freeCashFlowMargin,
        freeCashFlowPerShare,
        freeCashFlowYield,
        hasData: [operatingCashFlow, freeCashFlow].some((value) => value !== null),
        label: classifyCashFlow({freeCashFlow, freeCashFlowMargin, operatingCashFlow, operatingToFreeCashFlow}),
        operatingCashFlow,
        operatingCashFlowMargin,
        operatingToFreeCashFlow,
        revenue,
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

const StockCashFlowPanel = ({stockData}) => {
    const {summary} = stockData;
    const cashFlow = buildCashFlowProfile(summary);
    const tone = ['Operating cash outflow', 'Free cash flow pressure'].includes(cashFlow.label)
        ? 'is-negative'
        : cashFlow.label === 'Needs cash flow data' ? 'is-neutral' : '';
    const investmentLabel = cashFlow.cashInvestment === null
        ? 'Cash investment'
        : cashFlow.cashInvestment < 0 ? 'Cash release' : 'Cash investment';

    return (
        <section className="stock-cash-flow-panel">
            <div className="stock-cash-flow-panel__header">
                <div>
                    <h2>Cash Flow Quality</h2>
                    <span>Operating cash conversion and free cash flow for {summary.Symbol}</span>
                </div>
                <strong className={tone}>{cashFlow.label}</strong>
            </div>

            {cashFlow.hasData ? (
                <>
                    <div className="stock-cash-flow-panel__metrics">
                        <article>
                            <span>Operating cash flow</span>
                            <strong className={cashFlow.operatingCashFlow !== null && cashFlow.operatingCashFlow < 0 ? 'is-negative' : ''}>
                                {formatCompactCurrency(cashFlow.operatingCashFlow)}
                            </strong>
                            <small>{formatPercent(cashFlow.operatingCashFlowMargin)} of trailing revenue</small>
                        </article>
                        <article>
                            <span>Free cash flow</span>
                            <strong className={cashFlow.freeCashFlow !== null && cashFlow.freeCashFlow < 0 ? 'is-negative' : ''}>
                                {formatCompactCurrency(cashFlow.freeCashFlow)}
                            </strong>
                            <small>{formatPercent(cashFlow.freeCashFlowMargin)} of trailing revenue</small>
                        </article>
                        <article className={cashFlow.cashInvestment !== null && cashFlow.cashInvestment < 0 ? 'is-positive' : ''}>
                            <span>{investmentLabel}</span>
                            <strong>{formatCompactCurrency(cashFlow.cashInvestment === null ? null : Math.abs(cashFlow.cashInvestment))}</strong>
                            <small>Operating cash flow less free cash flow</small>
                        </article>
                    </div>

                    <div className="stock-cash-flow-panel__analysis">
                        <article>
                            <span>Free cash conversion</span>
                            <strong className={cashFlow.operatingToFreeCashFlow !== null && cashFlow.operatingToFreeCashFlow < 0 ? 'is-negative' : ''}>
                                {formatPercent(cashFlow.operatingToFreeCashFlow)}
                            </strong>
                            <small>Free cash flow retained from positive operating cash flow</small>
                        </article>
                        <article>
                            <span>Free cash flow yield</span>
                            <strong className={cashFlow.freeCashFlowYield !== null && cashFlow.freeCashFlowYield < 0 ? 'is-negative' : ''}>
                                {formatPercent(cashFlow.freeCashFlowYield)}
                            </strong>
                            <small>Free cash flow relative to reported market capitalization</small>
                        </article>
                        <article>
                            <span>Free cash flow / share</span>
                            <strong className={cashFlow.freeCashFlowPerShare !== null && cashFlow.freeCashFlowPerShare < 0 ? 'is-negative' : ''}>
                                {formatCurrency(cashFlow.freeCashFlowPerShare)}
                            </strong>
                            <small>Free cash flow allocated across reported shares outstanding</small>
                        </article>
                    </div>
                </>
            ) : (
                <p className="stock-cash-flow-panel__empty">
                    Operating cash flow, free cash flow, and revenue data are not available for this symbol.
                </p>
            )}

            <small className="stock-cash-flow-panel__disclaimer">
                Cash flow is reported on a trailing basis; cash investment can also reflect acquisitions, working-capital changes, or other timing effects.
            </small>
        </section>
    );
};

export default StockCashFlowPanel;
