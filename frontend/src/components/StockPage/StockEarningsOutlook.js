import React from 'react';
import '../style/stock-earnings-outlook-style.css';

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '' || value === 'None' || value === '-') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const parsePositiveMetric = (value) => {
    const parsed = parseMetric(value);
    return parsed !== null && parsed > 0 ? parsed : null;
};

const getReferencePrice = (summary) => {
    const eps = parsePositiveMetric(summary.EPS);
    const trailingPE = parsePositiveMetric(summary.PERatio);
    const bookValue = parsePositiveMetric(summary.BookValue);
    const priceToBook = parsePositiveMetric(summary.PriceToBookRatio);

    if (eps !== null && trailingPE !== null) {
        return {
            source: 'Reported EPS × trailing P/E',
            value: eps * trailingPE,
        };
    }

    if (bookValue !== null && priceToBook !== null) {
        return {
            source: 'Book value × price-to-book',
            value: bookValue * priceToBook,
        };
    }

    return {source: 'No reported reference value', value: null};
};

const getOutlookLabel = ({forwardEpsChange, forwardPE, trailingPE}) => {
    if (forwardPE === null && trailingPE === null) {
        return 'Needs earnings multiple data';
    }

    const multipleChange = forwardPE !== null && trailingPE !== null
        ? (forwardPE / trailingPE) - 1
        : null;

    if (forwardEpsChange !== null && forwardEpsChange <= -0.05) {
        return 'Forward earnings pressure';
    }

    if (forwardEpsChange !== null && forwardEpsChange >= 0.15 && multipleChange !== null && multipleChange <= 0) {
        return 'Growth with multiple support';
    }

    if (forwardEpsChange !== null && forwardEpsChange >= 0.05) {
        return 'Forward earnings growth';
    }

    if (multipleChange !== null && multipleChange <= -0.15) {
        return 'Lower multiple assumption';
    }

    return 'Steady earnings outlook';
};

export const buildEarningsOutlook = (summary = {}) => {
    const trailingEps = parsePositiveMetric(summary.EPS);
    const trailingPE = parsePositiveMetric(summary.PERatio);
    const forwardPE = parsePositiveMetric(summary.ForwardPE);
    const reference = getReferencePrice(summary);
    const forwardEps = reference.value !== null && forwardPE !== null
        ? reference.value / forwardPE
        : null;
    const forwardEpsChange = trailingEps !== null && forwardEps !== null
        ? (forwardEps / trailingEps) - 1
        : null;
    const multipleChange = trailingPE !== null && forwardPE !== null
        ? (forwardPE / trailingPE) - 1
        : null;

    return {
        forwardEps,
        forwardEpsChange,
        forwardPE,
        forwardYield: forwardPE === null ? null : 1 / forwardPE,
        hasData: [trailingEps, trailingPE, forwardPE].some((value) => value !== null),
        label: getOutlookLabel({forwardEpsChange, forwardPE, trailingPE}),
        multipleChange,
        reference,
        trailingEps,
        trailingPE,
        trailingYield: trailingPE === null ? null : 1 / trailingPE,
    };
};

const formatCurrency = (value) => value === null
    ? '-'
    : value.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2});

const formatPercent = (value) => value === null
    ? '-'
    : `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;

const formatRatio = (value) => value === null ? '-' : `${value.toFixed(1)}x`;

const StockEarningsOutlook = ({stockData}) => {
    const {summary} = stockData;
    const outlook = buildEarningsOutlook(summary);
    const labelTone = outlook.label === 'Forward earnings pressure'
        ? 'is-negative'
        : outlook.label === 'Needs earnings multiple data' ? 'is-neutral' : '';
    const metrics = [
        {
            detail: 'Reported trailing twelve-month EPS',
            label: 'Reported EPS',
            value: formatCurrency(outlook.trailingEps),
        },
        {
            detail: 'Derived from the shared reference value and forward P/E',
            label: 'Implied forward EPS',
            value: formatCurrency(outlook.forwardEps),
        },
        {
            detail: 'Forward EPS compared with reported EPS',
            label: 'Forward EPS change',
            tone: outlook.forwardEpsChange !== null && outlook.forwardEpsChange < 0 ? 'is-negative' : '',
            value: formatPercent(outlook.forwardEpsChange),
        },
        {
            detail: `Trailing ${formatRatio(outlook.trailingPE)} · Forward ${formatRatio(outlook.forwardPE)}`,
            label: 'Earnings yield',
            value: `${formatPercent(outlook.trailingYield)} / ${formatPercent(outlook.forwardYield)}`,
        },
    ];

    return (
        <section className="stock-earnings-outlook">
            <div className="stock-earnings-outlook__header">
                <div>
                    <h2>Earnings Multiple Outlook</h2>
                    <span>Compare reported trailing and forward earnings assumptions for {summary.Symbol}</span>
                </div>
                <strong className={labelTone}>{outlook.label}</strong>
            </div>

            {outlook.hasData ? (
                <>
                    <div className="stock-earnings-outlook__metrics">
                        {metrics.map((metric) => (
                            <article key={metric.label}>
                                <span>{metric.label}</span>
                                <strong className={metric.tone || ''}>{metric.value}</strong>
                                <small>{metric.detail}</small>
                            </article>
                        ))}
                    </div>

                    <div className="stock-earnings-outlook__reference">
                        <div>
                            <span>Reference value</span>
                            <strong>{formatCurrency(outlook.reference.value)}</strong>
                            <small>{outlook.reference.source}</small>
                        </div>
                        <div>
                            <span>Forward multiple shift</span>
                            <strong className={outlook.multipleChange !== null && outlook.multipleChange > 0 ? 'is-negative' : ''}>
                                {formatPercent(outlook.multipleChange)}
                            </strong>
                            <small>Forward P/E versus trailing P/E</small>
                        </div>
                    </div>
                </>
            ) : (
                <p className="stock-earnings-outlook__empty">
                    Reported EPS or trailing and forward P/E data are not available for this symbol.
                </p>
            )}

            <small className="stock-earnings-outlook__disclaimer">
                Forward EPS is inferred from the same reference value and forward P/E, so it is a comparison aid rather than an analyst estimate.
            </small>
        </section>
    );
};

export default StockEarningsOutlook;
