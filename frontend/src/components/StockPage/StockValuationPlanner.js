import React, {useMemo, useState} from 'react';
import '../style/stock-valuation-planner-style.css';

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatInput = (value, fallback = '') => {
    const parsed = parseMetric(value);
    return parsed === null ? fallback : Number(parsed.toFixed(2)).toString();
};

const getInitialAssumptions = (summary) => {
    const eps = parseMetric(summary.EPS);
    const trailingPE = parseMetric(summary.PERatio);
    const forwardPE = parseMetric(summary.ForwardPE);
    const bookValue = parseMetric(summary.BookValue);
    const priceToBook = parseMetric(summary.PriceToBookRatio);
    const high = parseMetric(summary['52WeekHigh']);
    const low = parseMetric(summary['52WeekLow']);
    const reportedGrowth = parseMetric(summary.QuarterlyEarningsGrowthYOY);
    let referencePrice = null;
    let referenceNote = 'Enter a current price to compare with the scenario.';

    if (eps !== null && eps > 0 && trailingPE !== null && trailingPE > 0) {
        referencePrice = eps * trailingPE;
        referenceNote = 'Reference price starts from reported EPS multiplied by trailing P/E.';
    } else if (bookValue !== null && bookValue > 0 && priceToBook !== null && priceToBook > 0) {
        referencePrice = bookValue * priceToBook;
        referenceNote = 'Reference price starts from reported book value multiplied by price-to-book.';
    } else if (high !== null && low !== null && high > 0 && low > 0) {
        referencePrice = (high + low) / 2;
        referenceNote = 'Reference price starts at the midpoint of the reported 52-week range.';
    }

    const growthPercent = reportedGrowth !== null && reportedGrowth >= -0.5 && reportedGrowth <= 1
        ? reportedGrowth * 100
        : 10;

    return {
        currentPrice: formatInput(referencePrice),
        baseEps: formatInput(eps),
        annualGrowth: formatInput(growthPercent, '10'),
        targetMultiple: formatInput(forwardPE !== null && forwardPE > 0 ? forwardPE : trailingPE, '15'),
        years: '3',
        referenceNote,
    };
};

const formatCurrency = (value) => value === null
    ? '-'
    : value.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2});

const formatPercent = (value) => value === null
    ? '-'
    : `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;

const StockValuationPlanner = ({stockData}) => {
    const {summary} = stockData;
    const initialAssumptions = useMemo(() => getInitialAssumptions(summary), [summary]);
    const [currentPrice, setCurrentPrice] = useState(initialAssumptions.currentPrice);
    const [baseEps, setBaseEps] = useState(initialAssumptions.baseEps);
    const [annualGrowth, setAnnualGrowth] = useState(initialAssumptions.annualGrowth);
    const [targetMultiple, setTargetMultiple] = useState(initialAssumptions.targetMultiple);
    const [years, setYears] = useState(initialAssumptions.years);

    const scenario = useMemo(() => {
        const parsedCurrentPrice = parseMetric(currentPrice);
        const parsedBaseEps = parseMetric(baseEps);
        const parsedGrowth = parseMetric(annualGrowth);
        const parsedMultiple = parseMetric(targetMultiple);
        const parsedYears = parseMetric(years);

        if (parsedCurrentPrice === null || parsedCurrentPrice <= 0 ||
            parsedBaseEps === null || parsedBaseEps <= 0 ||
            parsedGrowth === null || parsedGrowth <= -100 ||
            parsedMultiple === null || parsedMultiple <= 0 ||
            parsedYears === null || parsedYears < 1) {
            return null;
        }

        const projectedEps = parsedBaseEps * ((1 + (parsedGrowth / 100)) ** parsedYears);
        const targetValue = projectedEps * parsedMultiple;

        if (projectedEps <= 0 || targetValue <= 0) {
            return null;
        }

        const totalReturn = (targetValue / parsedCurrentPrice) - 1;
        const annualizedReturn = ((targetValue / parsedCurrentPrice) ** (1 / parsedYears)) - 1;

        return {projectedEps, targetValue, totalReturn, annualizedReturn};
    }, [annualGrowth, baseEps, currentPrice, targetMultiple, years]);

    const resetAssumptions = () => {
        setCurrentPrice(initialAssumptions.currentPrice);
        setBaseEps(initialAssumptions.baseEps);
        setAnnualGrowth(initialAssumptions.annualGrowth);
        setTargetMultiple(initialAssumptions.targetMultiple);
        setYears(initialAssumptions.years);
    };

    return (
        <section className="stock-valuation-planner">
            <div className="stock-valuation-planner__header">
                <div>
                    <h2>Valuation Scenario Planner</h2>
                    <span>Model an EPS growth and P/E outcome for {summary.Symbol}</span>
                </div>
                <button onClick={resetAssumptions} type="button">Reset to company data</button>
            </div>

            <p className="stock-valuation-planner__note">{initialAssumptions.referenceNote}</p>

            <div className="stock-valuation-planner__inputs">
                <label>
                    <span>Reference price</span>
                    <input min="0.01" onChange={(event) => setCurrentPrice(event.target.value)} step="0.01" type="number" value={currentPrice} />
                </label>
                <label>
                    <span>Current EPS</span>
                    <input min="0.01" onChange={(event) => setBaseEps(event.target.value)} step="0.01" type="number" value={baseEps} />
                </label>
                <label>
                    <span>Annual EPS growth</span>
                    <div className="stock-valuation-planner__suffix-input">
                        <input min="-99" onChange={(event) => setAnnualGrowth(event.target.value)} step="1" type="number" value={annualGrowth} />
                        <span>%</span>
                    </div>
                </label>
                <label>
                    <span>Target P/E</span>
                    <input min="0.1" onChange={(event) => setTargetMultiple(event.target.value)} step="0.5" type="number" value={targetMultiple} />
                </label>
                <label>
                    <span>Time horizon</span>
                    <select onChange={(event) => setYears(event.target.value)} value={years}>
                        {[1, 2, 3, 4, 5, 7, 10].map((year) => (
                            <option key={year} value={year}>{year} year{year === 1 ? '' : 's'}</option>
                        ))}
                    </select>
                </label>
            </div>

            {scenario ? (
                <div className="stock-valuation-planner__results">
                    <article>
                        <span>Projected EPS</span>
                        <strong>{formatCurrency(scenario.projectedEps)}</strong>
                        <small>After the selected growth period</small>
                    </article>
                    <article>
                        <span>Scenario value</span>
                        <strong>{formatCurrency(scenario.targetValue)}</strong>
                        <small>Projected EPS × target P/E</small>
                    </article>
                    <article className={scenario.totalReturn >= 0 ? 'is-positive' : 'is-negative'}>
                        <span>Total return</span>
                        <strong>{formatPercent(scenario.totalReturn)}</strong>
                        <small>Versus the reference price</small>
                    </article>
                    <article className={scenario.annualizedReturn >= 0 ? 'is-positive' : 'is-negative'}>
                        <span>Annualized return</span>
                        <strong>{formatPercent(scenario.annualizedReturn)}</strong>
                        <small>Compound return over {years} year{years === '1' ? '' : 's'}</small>
                    </article>
                </div>
            ) : (
                <p className="stock-valuation-planner__empty">
                    Enter a positive reference price, EPS, target P/E, and time horizon to calculate a scenario.
                </p>
            )}

            <small className="stock-valuation-planner__disclaimer">
                Scenario output is a planning model based on your assumptions, not a price forecast.
            </small>
        </section>
    );
};

export default StockValuationPlanner;
