import React, {useMemo, useState} from 'react';
import '../style/stock-position-planner-style.css';

const parsePositiveMetric = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const formatInput = (value, fallback = '') => {
    const parsed = parsePositiveMetric(value);
    return parsed === null ? fallback : Number(parsed.toFixed(2)).toString();
};

const getReferencePrice = (summary) => {
    const fiftyDayAverage = parsePositiveMetric(summary['50DayMovingAverage']);
    const weekLow = parsePositiveMetric(summary['52WeekLow']);
    const weekHigh = parsePositiveMetric(summary['52WeekHigh']);
    const eps = parsePositiveMetric(summary.EPS);
    const trailingPe = parsePositiveMetric(summary.PERatio);

    if (fiftyDayAverage !== null) {
        return {price: fiftyDayAverage, note: 'Entry starts at the reported 50-day moving average.'};
    }

    if (weekLow !== null && weekHigh !== null && weekHigh > weekLow) {
        return {price: (weekLow + weekHigh) / 2, note: 'Entry starts at the midpoint of the 52-week range.'};
    }

    if (eps !== null && trailingPe !== null) {
        return {price: eps * trailingPe, note: 'Entry starts from reported EPS multiplied by trailing P/E.'};
    }

    return {price: null, note: 'Enter an entry, stop, and target to build a position plan.'};
};

export const calculatePositionPlan = ({accountSize, riskPercent, entry, stop, target, direction = 'long'}) => {
    const parsedAccountSize = parsePositiveMetric(accountSize);
    const parsedRiskPercent = parsePositiveMetric(riskPercent);
    const parsedEntry = parsePositiveMetric(entry);
    const parsedStop = parsePositiveMetric(stop);
    const parsedTarget = parsePositiveMetric(target);
    const isShort = direction === 'short';

    if (
        parsedAccountSize === null ||
        parsedRiskPercent === null ||
        parsedRiskPercent > 100 ||
        parsedEntry === null ||
        parsedStop === null ||
        parsedTarget === null ||
        (!isShort && (parsedStop >= parsedEntry || parsedTarget <= parsedEntry)) ||
        (isShort && (parsedStop <= parsedEntry || parsedTarget >= parsedEntry))
    ) {
        return null;
    }

    const riskBudget = parsedAccountSize * (parsedRiskPercent / 100);
    const riskPerShare = Math.abs(parsedEntry - parsedStop);
    const rewardPerShare = isShort
        ? parsedEntry - parsedTarget
        : parsedTarget - parsedEntry;
    const riskSizedShares = Math.floor(riskBudget / riskPerShare);
    const affordableShares = Math.floor(parsedAccountSize / parsedEntry);
    const shares = Math.min(riskSizedShares, affordableShares);

    if (shares < 1) {
        return null;
    }

    return {
        affordableShares,
        capitalRequired: shares * parsedEntry,
        plannedReward: shares * rewardPerShare,
        plannedRisk: shares * riskPerShare,
        rewardMultiple: rewardPerShare / riskPerShare,
        riskBudget,
        riskLimited: riskSizedShares <= affordableShares,
        riskPerShare,
        riskSizedShares,
        shares,
        direction: isShort ? 'short' : 'long',
    };
};

const formatCurrency = (value) => value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
});

const StockPositionPlanner = ({stockData}) => {
    const {summary} = stockData;
    const reference = useMemo(() => getReferencePrice(summary), [summary]);
    const initialEntry = reference.price;
    const [direction, setDirection] = useState('long');
    const [accountSize, setAccountSize] = useState('25000');
    const [riskPercent, setRiskPercent] = useState('1');
    const [entry, setEntry] = useState(formatInput(initialEntry));
    const [stop, setStop] = useState(formatInput(initialEntry === null ? null : initialEntry * 0.92));
    const [target, setTarget] = useState(formatInput(initialEntry === null ? null : initialEntry * 1.16));

    const plan = useMemo(() => calculatePositionPlan({
        accountSize,
        direction,
        riskPercent,
        entry,
        stop,
        target,
    }), [accountSize, direction, entry, riskPercent, stop, target]);

    const applyDirection = (nextDirection) => {
        const isShort = nextDirection === 'short';
        const parsedEntry = parsePositiveMetric(entry) || initialEntry;

        setDirection(nextDirection);
        setStop(formatInput(parsedEntry === null ? null : parsedEntry * (isShort ? 1.08 : 0.92)));
        setTarget(formatInput(parsedEntry === null ? null : parsedEntry * (isShort ? 0.84 : 1.16)));
    };

    const resetPlan = () => {
        setAccountSize('25000');
        setRiskPercent('1');
        setEntry(formatInput(initialEntry));
        setStop(formatInput(initialEntry === null ? null : initialEntry * (direction === 'short' ? 1.08 : 0.92)));
        setTarget(formatInput(initialEntry === null ? null : initialEntry * (direction === 'short' ? 0.84 : 1.16)));
    };

    return (
        <section className="stock-position-planner">
            <div className="stock-position-planner__header">
                <div>
                    <h2>Position Risk Planner</h2>
                    <span>Size a {direction} position in {summary.Symbol} from maximum account risk</span>
                </div>
                <button onClick={resetPlan} type="button">Reset plan</button>
            </div>

            <p className="stock-position-planner__note">{reference.note}</p>

            <div aria-label="Trade Direction" className="stock-position-planner__direction" role="group">
                <button
                    aria-pressed={direction === 'long'}
                    className={direction === 'long' ? 'is-active' : ''}
                    onClick={() => applyDirection('long')}
                    type="button">
                    Long
                </button>
                <button
                    aria-pressed={direction === 'short'}
                    className={direction === 'short' ? 'is-active is-short' : ''}
                    onClick={() => applyDirection('short')}
                    type="button">
                    Short
                </button>
                <span>
                    {direction === 'short'
                        ? 'Stop above entry; target below entry.'
                        : 'Stop below entry; target above entry.'}
                </span>
            </div>

            <div className="stock-position-planner__inputs">
                <label>
                    <span>Account Size</span>
                    <input
                        aria-label="Account Size"
                        min="1"
                        onChange={(event) => setAccountSize(event.target.value)}
                        step="100"
                        type="number"
                        value={accountSize}
                    />
                </label>
                <label>
                    <span>Risk Per Trade</span>
                    <div className="stock-position-planner__suffix-input">
                        <input
                            aria-label="Risk Per Trade"
                            max="100"
                            min="0.01"
                            onChange={(event) => setRiskPercent(event.target.value)}
                            step="0.25"
                            type="number"
                            value={riskPercent}
                        />
                        <span>%</span>
                    </div>
                </label>
                <label>
                    <span>Entry Price</span>
                    <input
                        aria-label="Entry Price"
                        min="0.01"
                        onChange={(event) => setEntry(event.target.value)}
                        step="0.01"
                        type="number"
                        value={entry}
                    />
                </label>
                <label>
                    <span>Stop Price</span>
                    <input
                        aria-label="Stop Price"
                        min="0.01"
                        onChange={(event) => setStop(event.target.value)}
                        step="0.01"
                        type="number"
                        value={stop}
                    />
                </label>
                <label>
                    <span>Target Price</span>
                    <input
                        aria-label="Target Price"
                        min="0.01"
                        onChange={(event) => setTarget(event.target.value)}
                        step="0.01"
                        type="number"
                        value={target}
                    />
                </label>
            </div>

            {plan ? (
                <>
                    <div className="stock-position-planner__results">
                        <article>
                            <span>Position Size</span>
                            <strong>{plan.shares.toLocaleString()} shares {plan.direction === 'short' ? 'short' : 'long'}</strong>
                            <small>{plan.riskLimited ? 'Limited by risk budget' : 'Limited by account buying power'}</small>
                        </article>
                        <article>
                            <span>Capital Required</span>
                            <strong>{formatCurrency(plan.capitalRequired)}</strong>
                            <small>{formatCurrency(plan.riskBudget)} maximum risk budget</small>
                        </article>
                        <article>
                            <span>Planned Risk</span>
                            <strong>{formatCurrency(plan.plannedRisk)}</strong>
                            <small>{formatCurrency(plan.riskPerShare)} per share</small>
                        </article>
                        <article className="is-positive">
                            <span>Planned Reward</span>
                            <strong>{formatCurrency(plan.plannedReward)}</strong>
                            <small>{plan.rewardMultiple.toFixed(2)}R reward/risk</small>
                        </article>
                    </div>

                    {!plan.riskLimited && (
                        <p className="stock-position-planner__warning">
                            Buying power caps this plan at {plan.affordableShares.toLocaleString()} shares before the full risk budget is used.
                        </p>
                    )}
                </>
            ) : (
                <p className="stock-position-planner__empty">
                    Enter an account size with a valid {direction} stop and target to calculate the position.
                </p>
            )}

            <small className="stock-position-planner__disclaimer">
                Position sizing is a planning aid. It does not account for slippage, gaps, commissions, or taxes.
            </small>
        </section>
    );
};

export default StockPositionPlanner;
