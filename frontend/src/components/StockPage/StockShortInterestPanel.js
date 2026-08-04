import React from 'react';
import '../style/stock-short-interest-panel-style.css';

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '' || value === 'None' || value === '-') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const normalizePercent = (value) => {
    const parsed = parseMetric(value);

    if (parsed === null || parsed < 0) {
        return null;
    }

    return parsed > 1 ? parsed / 100 : parsed;
};

const formatPercent = (value) => {
    if (value === null) {
        return '-';
    }

    return `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
};

const formatCompactNumber = (value) => {
    if (value === null) {
        return '-';
    }

    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 1,
        notation: 'compact',
    }).format(value);
};

const getShortInterestLabel = ({shortPercentFloat, shortPercentOutstanding, shortRatio}) => {
    const crowding = Math.max(shortPercentFloat || 0, shortPercentOutstanding || 0);

    if (shortPercentFloat === null && shortPercentOutstanding === null && shortRatio === null) {
        return 'Needs short-interest data';
    }

    if (crowding >= 0.2) {
        return 'Crowded bearish positioning';
    }

    if (crowding >= 0.1) {
        return 'Elevated short interest';
    }

    if (shortRatio !== null && shortRatio >= 5) {
        return 'Slow-to-cover short interest';
    }

    if (crowding >= 0.04) {
        return 'Moderate short interest';
    }

    return 'Limited short interest';
};

export const buildShortInterestProfile = (summary = {}) => {
    const sharesShort = parseMetric(summary.SharesShort);
    const sharesShortPriorMonth = parseMetric(summary.SharesShortPriorMonth);
    const shortPercentFloat = normalizePercent(summary.ShortPercentFloat);
    const shortPercentOutstanding = normalizePercent(summary.ShortPercentOutstanding);
    const shortRatio = parseMetric(summary.ShortRatio);
    const shortChange = sharesShort !== null && sharesShortPriorMonth !== null && sharesShortPriorMonth > 0
        ? (sharesShort - sharesShortPriorMonth) / sharesShortPriorMonth
        : null;
    const crowding = Math.max(shortPercentFloat || 0, shortPercentOutstanding || 0);

    return {
        crowding,
        hasData: [sharesShort, sharesShortPriorMonth, shortPercentFloat, shortPercentOutstanding, shortRatio]
            .some((value) => value !== null),
        label: getShortInterestLabel({shortPercentFloat, shortPercentOutstanding, shortRatio}),
        sharesShort,
        sharesShortPriorMonth,
        shortChange,
        shortPercentFloat,
        shortPercentOutstanding,
        shortRatio,
    };
};

const StockShortInterestPanel = ({stockData}) => {
    const {summary} = stockData;
    const profile = buildShortInterestProfile(summary);
    const changeTone = profile.shortChange === null ? '' : profile.shortChange > 0 ? 'is-bearish' : 'is-bullish';
    const labelTone = profile.crowding >= 0.1 ? 'is-bearish' : profile.hasData ? 'is-neutral' : '';
    const gaugeWidth = Math.min(100, profile.crowding * 100);
    const metrics = [
        {
            label: 'Short Float',
            value: formatPercent(profile.shortPercentFloat),
            detail: 'Float currently sold short',
        },
        {
            label: 'Short Outstanding',
            value: formatPercent(profile.shortPercentOutstanding),
            detail: 'Shares outstanding sold short',
        },
        {
            label: 'Days To Cover',
            value: profile.shortRatio === null ? '-' : `${profile.shortRatio.toFixed(1)} days`,
            detail: 'Reported short ratio',
        },
        {
            label: 'Short Shares',
            value: formatCompactNumber(profile.sharesShort),
            detail: profile.shortChange === null
                ? 'Prior-month comparison unavailable'
                : `${formatPercent(profile.shortChange)} versus prior month`,
            tone: changeTone,
        },
    ];

    return (
        <section className="stock-short-interest-panel">
            <div className="stock-short-interest-panel__header">
                <div>
                    <h2>Short Interest Positioning</h2>
                    <span>Bearish positioning and covering pressure for {summary.Symbol}</span>
                </div>
                <strong className={labelTone}>{profile.label}</strong>
            </div>

            {profile.hasData ? (
                <>
                    <div className="stock-short-interest-panel__metrics">
                        {metrics.map((metric) => (
                            <article key={metric.label}>
                                <span>{metric.label}</span>
                                <strong className={metric.tone || ''}>{metric.value}</strong>
                                <small>{metric.detail}</small>
                            </article>
                        ))}
                    </div>

                    <div className="stock-short-interest-panel__gauge">
                        <div>
                            <span>Short-interest crowding</span>
                            <strong>{formatPercent(profile.crowding)}</strong>
                        </div>
                        <div
                            aria-label={`Short-interest crowding ${formatPercent(profile.crowding)}`}
                            className="stock-short-interest-panel__track"
                            role="img">
                            <span style={{width: `${gaugeWidth}%`}} />
                        </div>
                        <small>
                            {profile.sharesShortPriorMonth === null
                                ? 'Prior-month short-share data is unavailable.'
                                : `${formatCompactNumber(profile.sharesShortPriorMonth)} shares were reported short in the prior month.`}
                        </small>
                    </div>
                </>
            ) : (
                <p className="stock-short-interest-panel__empty">
                    Short-interest metrics are not available for this symbol.
                </p>
            )}

            <small className="stock-short-interest-panel__disclaimer">
                Short interest is reported periodically and can change before the next published update.
            </small>
        </section>
    );
};

export default StockShortInterestPanel;
