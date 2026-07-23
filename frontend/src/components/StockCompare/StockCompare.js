import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import '../style/stock-compare-style.css';

const comparisonEndpoint = 'https://findashboard-api.onrender.com/dash';

export const parseSymbolEntry = (value) => [...new Set(String(value || '')
    .split(/[\s,;]+/)
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => /^[A-Z0-9.-]{1,12}$/.test(symbol)))]
    .slice(0, 4);

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '' || value === 'None') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatNumber = (value, digits = 2) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : parsed.toFixed(digits);
};

const formatPercent = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `${(parsed * 100).toFixed(1)}%`;
};

const formatCurrency = (value) => {
    const parsed = parseMetric(value);
    return parsed === null
        ? '-'
        : parsed.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2});
};

const formatMarketCap = (value) => {
    const parsed = parseMetric(value);

    if (parsed === null) {
        return '-';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(parsed);
};

const fetchComparisonData = async (symbols) => {
    const results = await Promise.allSettled(symbols.map(async (symbol) => {
        const response = await fetch(`${comparisonEndpoint}/${encodeURIComponent(symbol)}`);

        if (!response.ok) {
            throw new Error(`${symbol} returned ${response.status}`);
        }

        const stockData = await response.json();

        if (!stockData?.summary?.Symbol) {
            throw new Error(`${symbol} has no company overview`);
        }

        return stockData.summary;
    }));

    return {
        summaries: results
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value),
        failedCount: results.filter((result) => result.status === 'rejected').length,
    };
};

const metricRows = [
    {label: 'Market Cap', field: 'MarketCapitalization', format: formatMarketCap},
    {label: 'Trailing P/E', field: 'PERatio', format: formatNumber},
    {label: 'Forward P/E', field: 'ForwardPE', format: formatNumber},
    {label: 'Earnings Per Share', field: 'EPS', format: formatCurrency},
    {label: 'Analyst Target', field: 'AnalystTargetPrice', format: formatCurrency},
    {label: 'Revenue Growth', field: 'QuarterlyRevenueGrowthYOY', format: formatPercent},
    {label: 'Earnings Growth', field: 'QuarterlyEarningsGrowthYOY', format: formatPercent},
    {label: 'Profit Margin', field: 'ProfitMargin', format: formatPercent},
    {label: 'Dividend Yield', field: 'DividendYield', format: formatPercent},
    {label: 'Beta', field: 'Beta', format: formatNumber},
    {label: '52-Week Low', field: '52WeekLow', format: formatCurrency},
    {label: '52-Week High', field: '52WeekHigh', format: formatCurrency},
];

const getLeader = (summaries, field, direction = 'high') => {
    const candidates = summaries
        .map((summary) => ({summary, value: parseMetric(summary[field])}))
        .filter((candidate) => candidate.value !== null);

    if (candidates.length === 0) {
        return null;
    }

    return candidates.reduce((leader, candidate) => (
        direction === 'low'
            ? candidate.value < leader.value ? candidate : leader
            : candidate.value > leader.value ? candidate : leader
    ), candidates[0]);
};

const StockCompare = () => {
    const initialSymbols = useMemo(() => {
        const querySymbols = new URLSearchParams(window.location.search).get('symbols');
        const parsedSymbols = parseSymbolEntry(querySymbols);

        return parsedSymbols.length >= 2 ? parsedSymbols : ['AAPL', 'MSFT'];
    }, []);
    const [symbolsInput, setSymbolsInput] = useState(initialSymbols.join(', '));
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [comparisonError, setComparisonError] = useState('');

    const runComparison = useCallback(async (symbols) => {
        if (symbols.length < 2) {
            setComparisonError('Enter at least two valid ticker symbols to compare.');
            return;
        }

        setLoading(true);
        setComparisonError('');

        try {
            const comparison = await fetchComparisonData(symbols);

            setSummaries(comparison.summaries);
            setComparisonError(comparison.failedCount > 0
                ? `${comparison.failedCount} symbol${comparison.failedCount === 1 ? '' : 's'} could not be loaded.`
                : '');

            const sharedUrl = new URL(window.location.href);
            sharedUrl.search = '';
            sharedUrl.searchParams.set('symbols', symbols.join(','));
            window.history.replaceState({}, '', `${sharedUrl.pathname}${sharedUrl.search}`);
        } catch (error) {
            setSummaries([]);
            setComparisonError('Company overviews could not be loaded right now.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        runComparison(initialSymbols);
    }, [initialSymbols, runComparison]);

    const highlights = useMemo(() => ([
        {
            label: 'Revenue Growth Leader',
            leader: getLeader(summaries, 'QuarterlyRevenueGrowthYOY'),
            format: formatPercent,
        },
        {
            label: 'Profit Margin Leader',
            leader: getLeader(summaries, 'ProfitMargin'),
            format: formatPercent,
        },
        {
            label: 'Lowest Forward P/E',
            leader: getLeader(summaries, 'ForwardPE', 'low'),
            format: formatNumber,
        },
        {
            label: 'Highest Dividend Yield',
            leader: getLeader(summaries, 'DividendYield'),
            format: formatPercent,
        },
    ]), [summaries]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const symbols = parseSymbolEntry(symbolsInput);

        setSymbolsInput(symbols.join(', '));
        runComparison(symbols);
    };

    return (
        <main className="stock-compare">
            <section className="stock-compare__hero">
                <div>
                    <span>Research Workspace</span>
                    <h1>Company Comparison</h1>
                    <p>Compare valuation, growth, profitability, income, and risk metrics for two to four stocks.</p>
                </div>
                <Link to="/dash">Back to Dashboard</Link>
            </section>

            <form className="stock-compare__form" onSubmit={handleSubmit}>
                <label>
                    <span>Ticker Symbols</span>
                    <input
                        aria-describedby="stock-compare-help"
                        onChange={(event) => setSymbolsInput(event.target.value)}
                        placeholder="AAPL, MSFT, GOOGL"
                        type="text"
                        value={symbolsInput}
                    />
                </label>
                <button disabled={loading} type="submit">
                    {loading ? 'Loading Companies...' : 'Compare Stocks'}
                </button>
                <small id="stock-compare-help">Separate symbols with commas or spaces. The first four valid symbols are used.</small>
            </form>

            {comparisonError && <p aria-live="polite" className="stock-compare__error">{comparisonError}</p>}

            {summaries.length > 0 && (
                <>
                    <section className="stock-compare__highlights">
                        {highlights.map((highlight) => (
                            <article key={highlight.label}>
                                <span>{highlight.label}</span>
                                <strong>{highlight.leader?.summary.Symbol || '-'}</strong>
                                <small>{highlight.leader ? highlight.format(highlight.leader.value) : 'No reported data'}</small>
                            </article>
                        ))}
                    </section>

                    <section className="stock-compare__table-wrap">
                        <table className="stock-compare__table">
                            <thead>
                                <tr>
                                    <th scope="col">Metric</th>
                                    {summaries.map((summary) => (
                                        <th key={summary.Symbol} scope="col">
                                            <Link to={`/dash/${summary.Symbol}`}>{summary.Symbol}</Link>
                                            <span>{summary.Name}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {metricRows.map((metric) => (
                                    <tr key={metric.field}>
                                        <th scope="row">{metric.label}</th>
                                        {summaries.map((summary) => (
                                            <td key={`${summary.Symbol}-${metric.field}`}>
                                                {metric.format(summary[metric.field])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </>
            )}

            {!loading && summaries.length === 0 && (
                <section className="stock-compare__empty">
                    Enter two to four symbols to open the comparison workspace.
                </section>
            )}
        </main>
    );
};

export default StockCompare;
