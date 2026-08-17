import React from 'react';
import '../style/stock-earnings-cash-bridge-style.css';

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '' || value === 'None' || value === '-') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const calculatePerShare = (amount, sharesOutstanding) => {
    if (amount === null || sharesOutstanding === null || sharesOutstanding <= 0) {
        return null;
    }

    return amount / sharesOutstanding;
};

const calculateCoverage = (cashPerShare, earningsPerShare) => {
    if (cashPerShare === null || earningsPerShare === null || earningsPerShare <= 0) {
        return null;
    }

    return cashPerShare / earningsPerShare;
};

const classifyCashBacking = ({earningsPerShare, freeCashFlowPerShare, operatingCashFlowPerShare}) => {
    if ([earningsPerShare, freeCashFlowPerShare, operatingCashFlowPerShare].every((value) => value === null)) {
        return 'Needs earnings and cash data';
    }

    if (earningsPerShare !== null && earningsPerShare <= 0) {
        return freeCashFlowPerShare !== null && freeCashFlowPerShare > 0
            ? 'Cash-positive turnaround'
            : 'Loss with cash outflow';
    }

    const cashCoverage = calculateCoverage(freeCashFlowPerShare, earningsPerShare);

    if (cashCoverage !== null && cashCoverage >= 0.8) {
        return 'Cash-backed earnings';
    }

    if (cashCoverage !== null && cashCoverage >= 0.4) {
        return 'Partial cash conversion';
    }

    if (freeCashFlowPerShare !== null && freeCashFlowPerShare < 0) {
        return 'Free cash flow deficit';
    }

    return 'Weak cash conversion';
};

export const buildEarningsCashBridge = (summary = {}) => {
    const earningsPerShare = parseMetric(summary.DilutedEPSTTM) ?? parseMetric(summary.EPS);
    const operatingCashFlow = parseMetric(summary.OperatingCashflow);
    const freeCashFlow = parseMetric(summary.FreeCashflow);
    const sharesOutstanding = parseMetric(summary.SharesOutstanding);
    const operatingCashFlowPerShare = calculatePerShare(operatingCashFlow, sharesOutstanding);
    const freeCashFlowPerShare = calculatePerShare(freeCashFlow, sharesOutstanding);

    return {
        cashEarningsGap: freeCashFlowPerShare !== null && earningsPerShare !== null
            ? freeCashFlowPerShare - earningsPerShare
            : null,
        earningsPerShare,
        freeCashFlowCoverage: calculateCoverage(freeCashFlowPerShare, earningsPerShare),
        freeCashFlowPerShare,
        hasData: [earningsPerShare, operatingCashFlowPerShare, freeCashFlowPerShare]
            .some((value) => value !== null),
        label: classifyCashBacking({earningsPerShare, freeCashFlowPerShare, operatingCashFlowPerShare}),
        operatingCashFlowCoverage: calculateCoverage(operatingCashFlowPerShare, earningsPerShare),
        operatingCashFlowPerShare,
    };
};

const formatCurrency = (value) => value === null
    ? '-'
    : value.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2});

const formatRatio = (value) => value === null ? '-' : `${value.toFixed(2)}x`;

const StockEarningsCashBridge = ({stockData}) => {
    const {summary} = stockData;
    const bridge = buildEarningsCashBridge(summary);
    const tone = ['Loss with cash outflow', 'Free cash flow deficit', 'Weak cash conversion'].includes(bridge.label)
        ? 'is-negative'
        : bridge.label === 'Needs earnings and cash data' ? 'is-neutral' : '';
    const cashGapDetail = bridge.cashEarningsGap === null
        ? 'Needs both EPS and free cash flow per share'
        : bridge.cashEarningsGap >= 0
            ? 'Free cash flow exceeds reported earnings per share'
            : 'Free cash flow trails reported earnings per share';

    return (
        <section className="stock-earnings-cash-bridge">
            <div className="stock-earnings-cash-bridge__header">
                <div>
                    <h2>Earnings-to-Cash Bridge</h2>
                    <span>Test whether reported earnings are supported by per-share cash generation for {summary.Symbol}</span>
                </div>
                <strong className={tone}>{bridge.label}</strong>
            </div>

            {bridge.hasData ? (
                <>
                    <div className="stock-earnings-cash-bridge__metrics">
                        <article>
                            <span>Reported EPS</span>
                            <strong className={bridge.earningsPerShare !== null && bridge.earningsPerShare < 0 ? 'is-negative' : ''}>
                                {formatCurrency(bridge.earningsPerShare)}
                            </strong>
                            <small>Trailing earnings allocated per share</small>
                        </article>
                        <article>
                            <span>Operating cash / share</span>
                            <strong className={bridge.operatingCashFlowPerShare !== null && bridge.operatingCashFlowPerShare < 0 ? 'is-negative' : ''}>
                                {formatCurrency(bridge.operatingCashFlowPerShare)}
                            </strong>
                            <small>Operating cash flow across reported shares</small>
                        </article>
                        <article>
                            <span>Free cash flow / share</span>
                            <strong className={bridge.freeCashFlowPerShare !== null && bridge.freeCashFlowPerShare < 0 ? 'is-negative' : ''}>
                                {formatCurrency(bridge.freeCashFlowPerShare)}
                            </strong>
                            <small>Cash remaining after reported investment needs</small>
                        </article>
                    </div>

                    <div className="stock-earnings-cash-bridge__analysis">
                        <article>
                            <span>Operating cash / EPS</span>
                            <strong>{formatRatio(bridge.operatingCashFlowCoverage)}</strong>
                            <small>Operating cash generated for each dollar of positive EPS</small>
                        </article>
                        <article>
                            <span>Free cash flow / EPS</span>
                            <strong className={bridge.freeCashFlowCoverage !== null && bridge.freeCashFlowCoverage < 0.4 ? 'is-negative' : ''}>
                                {formatRatio(bridge.freeCashFlowCoverage)}
                            </strong>
                            <small>Free cash flow generated for each dollar of positive EPS</small>
                        </article>
                        <article>
                            <span>Cash earnings gap</span>
                            <strong className={bridge.cashEarningsGap !== null && bridge.cashEarningsGap < 0 ? 'is-negative' : ''}>
                                {formatCurrency(bridge.cashEarningsGap)}
                            </strong>
                            <small>{cashGapDetail}</small>
                        </article>
                    </div>
                </>
            ) : (
                <p className="stock-earnings-cash-bridge__empty">
                    EPS, cash flow, and shares-outstanding data are not available for this symbol.
                </p>
            )}

            <small className="stock-earnings-cash-bridge__disclaimer">
                This bridge compares trailing reported figures and does not adjust for one-time items, acquisition spending, or working-capital timing.
            </small>
        </section>
    );
};

export default StockEarningsCashBridge;
