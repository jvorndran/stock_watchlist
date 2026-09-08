import React, {useMemo, useState} from 'react';
import '../style/stock-income-panel-style.css';

const parseMetric = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatCurrency = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `$${parsed.toFixed(2)}`;
};

const formatPercent = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `${(parsed * 100).toFixed(2)}%`;
};

const formatDate = (value) => {
    if (!value || value === 'None') {
        return '-';
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return '-';
    }

    return parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatInput = (value, fallback = '') => {
    const parsed = parseMetric(value);
    return parsed === null || parsed <= 0 ? fallback : Number(parsed.toFixed(2)).toString();
};

const getReinvestmentReference = (summary) => {
    const fiftyDayAverage = parseMetric(summary['50DayMovingAverage']);
    const weekLow = parseMetric(summary['52WeekLow']);
    const weekHigh = parseMetric(summary['52WeekHigh']);
    const dividendPerShare = parseMetric(summary.DividendPerShare);
    const dividendYield = parseMetric(summary.DividendYield);

    if (fiftyDayAverage !== null && fiftyDayAverage > 0) {
        return {price: fiftyDayAverage, note: 'Reference price starts at the reported 50-day moving average.'};
    }

    if (weekLow !== null && weekHigh !== null && weekHigh > weekLow) {
        return {price: (weekLow + weekHigh) / 2, note: 'Reference price starts at the midpoint of the reported 52-week range.'};
    }

    if (dividendPerShare !== null && dividendYield !== null && dividendPerShare > 0 && dividendYield > 0) {
        return {price: dividendPerShare / dividendYield, note: 'Reference price is inferred from dividend per share and reported yield.'};
    }

    return {price: null, note: 'Enter a reference share price to model dividend reinvestment.'};
};

export const calculateDividendReinvestment = ({
    dividendGrowth,
    dividendPerShare,
    initialShares,
    priceGrowth,
    projectionYears,
    referencePrice,
}) => {
    const startingDividend = parseMetric(dividendPerShare);
    const startingShares = parseMetric(initialShares);
    const startingPrice = parseMetric(referencePrice);
    const dividendGrowthRate = parseMetric(dividendGrowth);
    const priceGrowthRate = parseMetric(priceGrowth);
    const years = parseMetric(projectionYears);

    if (startingDividend === null || startingDividend <= 0 ||
        startingShares === null || startingShares <= 0 ||
        startingPrice === null || startingPrice <= 0 ||
        dividendGrowthRate === null || dividendGrowthRate <= -100 ||
        priceGrowthRate === null || priceGrowthRate <= -100 ||
        years === null || years < 1) {
        return null;
    }

    let shares = startingShares;
    let cumulativeDividends = 0;

    for (let year = 0; year < Math.floor(years); year += 1) {
        const dividendForYear = startingDividend * ((1 + (dividendGrowthRate / 100)) ** year);
        const priceForYear = startingPrice * ((1 + (priceGrowthRate / 100)) ** year);
        const cashDividend = shares * dividendForYear;

        cumulativeDividends += cashDividend;
        shares += cashDividend / priceForYear;
    }

    const endingPrice = startingPrice * ((1 + (priceGrowthRate / 100)) ** years);
    const nextDividendPerShare = startingDividend * ((1 + (dividendGrowthRate / 100)) ** years);

    return {
        annualIncomeAtHorizon: shares * nextDividendPerShare,
        cumulativeDividends,
        endingPrice,
        endingValue: shares * endingPrice,
        sharesAdded: shares - startingShares,
        totalShares: shares,
    };
};

const getPayoutRatio = (summary) => {
    const dividendPerShare = parseMetric(summary.DividendPerShare);
    const earningsPerShare = parseMetric(summary.EPS);

    if (dividendPerShare === null || earningsPerShare === null || earningsPerShare <= 0) {
        return null;
    }

    return dividendPerShare / earningsPerShare;
};

const getIncomeLabel = (summary) => {
    const dividendYield = parseMetric(summary.DividendYield);
    const dividendPerShare = parseMetric(summary.DividendPerShare);

    if (!dividendYield && !dividendPerShare) {
        return 'No dividend reported';
    }

    if (dividendYield >= 0.04) {
        return 'High yield profile';
    }

    if (dividendYield >= 0.015) {
        return 'Dividend contributor';
    }

    return 'Low yield profile';
};

const StockIncomePanel = ({ stockData }) => {
    const { summary } = stockData;
    const payoutRatio = getPayoutRatio(summary);
    const [shares, setShares] = useState('100');
    const [dividendGrowth, setDividendGrowth] = useState('5');
    const [projectionYears, setProjectionYears] = useState('5');
    const reinvestmentReference = useMemo(() => getReinvestmentReference(summary), [summary]);
    const [reinvestmentPrice, setReinvestmentPrice] = useState(() => formatInput(reinvestmentReference.price));
    const [priceGrowth, setPriceGrowth] = useState('4');
    const incomeProjection = useMemo(() => {
        const dividendPerShare = parseMetric(summary.DividendPerShare);
        const shareCount = parseMetric(shares);
        const growthRate = parseMetric(dividendGrowth);
        const years = parseMetric(projectionYears);

        if (dividendPerShare === null || dividendPerShare <= 0 ||
            shareCount === null || shareCount <= 0 ||
            growthRate === null || growthRate <= -100 ||
            years === null || years < 1) {
            return null;
        }

        const annualIncome = dividendPerShare * shareCount;
        const growthMultiplier = 1 + (growthRate / 100);
        const futureDividendPerShare = dividendPerShare * (growthMultiplier ** years);
        const futureAnnualIncome = futureDividendPerShare * shareCount;
        const cumulativeIncome = Array.from({length: years}, (_, index) => (
            annualIncome * (growthMultiplier ** index)
        )).reduce((total, income) => total + income, 0);

        return {
            annualIncome,
            cumulativeIncome,
            futureAnnualIncome,
            futureDividendPerShare,
            monthlyIncome: annualIncome / 12,
        };
    }, [dividendGrowth, projectionYears, shares, summary.DividendPerShare]);

    const incomeMetrics = [
        {
            label: 'Dividend Yield',
            value: formatPercent(summary.DividendYield),
            detail: getIncomeLabel(summary),
        },
        {
            label: 'Dividend Per Share',
            value: formatCurrency(summary.DividendPerShare),
            detail: `EPS ${formatCurrency(summary.EPS)}`,
        },
        {
            label: 'Payout Ratio',
            value: formatPercent(payoutRatio),
            detail: payoutRatio === null ? 'Needs dividend and EPS data' : 'Dividend per share divided by EPS',
        },
        {
            label: 'Ex-Dividend Date',
            value: formatDate(summary.ExDividendDate),
            detail: 'Shareholder eligibility date',
        },
        {
            label: 'Payment Date',
            value: formatDate(summary.DividendDate),
            detail: 'Reported dividend payment date',
        },
    ];
    const reinvestmentProjection = useMemo(() => calculateDividendReinvestment({
        dividendGrowth,
        dividendPerShare: summary.DividendPerShare,
        initialShares: shares,
        priceGrowth,
        projectionYears,
        referencePrice: reinvestmentPrice,
    }), [dividendGrowth, priceGrowth, projectionYears, reinvestmentPrice, shares, summary.DividendPerShare]);

    return (
        <section className="stock-income-panel">
            <div className="stock-income-panel__header">
                <div>
                    <h2>Income Profile</h2>
                    <span>{summary.Symbol}</span>
                </div>
                <strong>{getIncomeLabel(summary)}</strong>
            </div>

            <div className="stock-income-panel__grid">
                {incomeMetrics.map((metric) => (
                    <article className="stock-income-card" key={metric.label}>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                        <small>{metric.detail}</small>
                    </article>
                ))}
            </div>

            <div className="stock-income-planner">
                <div className="stock-income-planner__header">
                    <div>
                        <h3>Dividend Income Planner</h3>
                        <span>Project cash income from the reported annual dividend per share.</span>
                    </div>
                    <strong>{formatCurrency(summary.DividendPerShare)} starting dividend</strong>
                </div>

                <div className="stock-income-planner__controls">
                    <label>
                        <span>Shares Owned</span>
                        <input min="1" onChange={(event) => setShares(event.target.value)} step="1" type="number" value={shares} />
                    </label>
                    <label>
                        <span>Annual Dividend Growth</span>
                        <div className="stock-income-planner__suffix-input">
                            <input min="-99" onChange={(event) => setDividendGrowth(event.target.value)} step="0.5" type="number" value={dividendGrowth} />
                            <span>%</span>
                        </div>
                    </label>
                    <label>
                        <span>Projection Horizon</span>
                        <select onChange={(event) => setProjectionYears(event.target.value)} value={projectionYears}>
                            {[1, 3, 5, 7, 10, 15, 20].map((year) => (
                                <option key={year} value={year}>{year} year{year === 1 ? '' : 's'}</option>
                            ))}
                        </select>
                    </label>
                </div>

                {incomeProjection ? (
                    <div className="stock-income-planner__results">
                        <article>
                            <span>Annual Income Now</span>
                            <strong>{formatCurrency(incomeProjection.annualIncome)}</strong>
                            <small>{formatCurrency(incomeProjection.monthlyIncome)} monthly average</small>
                        </article>
                        <article>
                            <span>Year {projectionYears} Dividend</span>
                            <strong>{formatCurrency(incomeProjection.futureDividendPerShare)}</strong>
                            <small>Per share after assumed growth</small>
                        </article>
                        <article>
                            <span>Year {projectionYears} Income</span>
                            <strong>{formatCurrency(incomeProjection.futureAnnualIncome)}</strong>
                            <small>At the current share count</small>
                        </article>
                        <article>
                            <span>Cumulative Income</span>
                            <strong>{formatCurrency(incomeProjection.cumulativeIncome)}</strong>
                            <small>Before taxes and reinvestment</small>
                        </article>
                    </div>
                ) : (
                    <p className="stock-income-planner__empty">
                        A positive reported dividend and share count are required to build an income projection.
                    </p>
                )}

                <div className="stock-income-reinvestment">
                    <div className="stock-income-reinvestment__header">
                        <div>
                            <h3>Dividend Reinvestment Scenario</h3>
                            <span>Reinvest each modeled annual dividend into fractional shares at the selected price path.</span>
                        </div>
                        <strong>{reinvestmentReference.note}</strong>
                    </div>
                    <div className="stock-income-reinvestment__controls">
                        <label>
                            <span>Reference Share Price</span>
                            <input min="0.01" onChange={(event) => setReinvestmentPrice(event.target.value)} step="0.01" type="number" value={reinvestmentPrice} />
                        </label>
                        <label>
                            <span>Annual Price Change</span>
                            <div className="stock-income-planner__suffix-input">
                                <input min="-99" onChange={(event) => setPriceGrowth(event.target.value)} step="0.5" type="number" value={priceGrowth} />
                                <span>%</span>
                            </div>
                        </label>
                    </div>
                    {reinvestmentProjection ? (
                        <div className="stock-income-reinvestment__results">
                            <article>
                                <span>Shares At Horizon</span>
                                <strong>{reinvestmentProjection.totalShares.toFixed(2)}</strong>
                                <small>+{reinvestmentProjection.sharesAdded.toFixed(2)} from dividends</small>
                            </article>
                            <article>
                                <span>Annual Income At Horizon</span>
                                <strong>{formatCurrency(reinvestmentProjection.annualIncomeAtHorizon)}</strong>
                                <small>Using the selected dividend-growth assumption</small>
                            </article>
                            <article>
                                <span>Cumulative Dividends Reinvested</span>
                                <strong>{formatCurrency(reinvestmentProjection.cumulativeDividends)}</strong>
                                <small>Before taxes or transaction costs</small>
                            </article>
                            <article>
                                <span>Estimated Position Value</span>
                                <strong>{formatCurrency(reinvestmentProjection.endingValue)}</strong>
                                <small>{formatCurrency(reinvestmentProjection.endingPrice)} modeled share price</small>
                            </article>
                        </div>
                    ) : (
                        <p className="stock-income-planner__empty">Add a positive reference share price to run the dividend reinvestment scenario.</p>
                    )}
                    <small className="stock-income-reinvestment__disclaimer">This simplified model assumes annual reinvestment at the selected price path; dividends, prices, taxes, and trading costs can differ.</small>
                </div>

                <small className="stock-income-planner__disclaimer">
                    The growth rate is an assumption, not a forecast or guarantee of future distributions.
                </small>
            </div>
        </section>
    );
};

export default StockIncomePanel;
