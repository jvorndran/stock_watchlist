import React from 'react';
import '../style/stock-ownership-profile-style.css';

const parseMetric = (value) => {
    if (value === null || value === undefined || value === '' || value === 'None' || value === '-') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const normalizePercent = (value) => {
    const parsed = parseMetric(value);

    if (parsed === null) {
        return null;
    }

    return parsed > 1 ? parsed / 100 : parsed;
};

const formatPercent = (value) => value === null ? '-' : `${(value * 100).toFixed(1)}%`;

const formatCompactNumber = (value) => value === null ? '-' : new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    notation: 'compact',
}).format(value);

const getOwnershipLabel = ({floatRatio, insiderOwnership, institutionalOwnership}) => {
    if (floatRatio === null && insiderOwnership === null && institutionalOwnership === null) {
        return 'Needs ownership data';
    }

    if (insiderOwnership !== null && insiderOwnership >= 0.2) {
        return 'Insider-led ownership';
    }

    if (institutionalOwnership !== null && institutionalOwnership >= 0.75) {
        return 'Institutional concentration';
    }

    if (floatRatio !== null && floatRatio <= 0.35) {
        return 'Limited public float';
    }

    if (institutionalOwnership !== null && institutionalOwnership >= 0.5) {
        return 'Institutionally sponsored';
    }

    return 'Broad public ownership';
};

export const buildOwnershipProfile = (summary = {}) => {
    const sharesOutstanding = parseMetric(summary.SharesOutstanding);
    const sharesFloat = parseMetric(summary.SharesFloat);
    const insiderOwnership = normalizePercent(summary.PercentInsiders);
    const institutionalOwnership = normalizePercent(summary.PercentInstitutions);
    const floatRatio = sharesFloat !== null && sharesOutstanding !== null && sharesOutstanding > 0
        ? Math.min(1, sharesFloat / sharesOutstanding)
        : null;

    return {
        floatRatio,
        hasData: [sharesOutstanding, sharesFloat, insiderOwnership, institutionalOwnership]
            .some((value) => value !== null),
        insiderOwnership,
        institutionalOwnership,
        label: getOwnershipLabel({floatRatio, insiderOwnership, institutionalOwnership}),
        sharesFloat,
        sharesOutstanding,
    };
};

const StockOwnershipProfile = ({stockData}) => {
    const {summary} = stockData;
    const profile = buildOwnershipProfile(summary);
    const labelTone = profile.label === 'Needs ownership data'
        ? 'is-neutral'
        : profile.label === 'Institutional concentration' || profile.label === 'Limited public float'
            ? 'is-watch'
            : '';
    const floatWidth = profile.floatRatio === null ? 0 : profile.floatRatio * 100;
    const metrics = [
        {
            label: 'Institutional ownership',
            value: formatPercent(profile.institutionalOwnership),
            detail: 'Reported shares held by institutions',
        },
        {
            label: 'Insider ownership',
            value: formatPercent(profile.insiderOwnership),
            detail: 'Reported shares held by insiders',
        },
        {
            label: 'Public float',
            value: formatCompactNumber(profile.sharesFloat),
            detail: profile.floatRatio === null
                ? 'Float share of outstanding is unavailable'
                : `${formatPercent(profile.floatRatio)} of outstanding shares`,
        },
        {
            label: 'Shares outstanding',
            value: formatCompactNumber(profile.sharesOutstanding),
            detail: 'Total reported common shares',
        },
    ];

    return (
        <section className="stock-ownership-profile">
            <div className="stock-ownership-profile__header">
                <div>
                    <h2>Shareholder Structure</h2>
                    <span>Ownership alignment and public-float context for {summary.Symbol}</span>
                </div>
                <strong className={labelTone}>{profile.label}</strong>
            </div>

            {profile.hasData ? (
                <>
                    <div className="stock-ownership-profile__metrics">
                        {metrics.map((metric) => (
                            <article key={metric.label}>
                                <span>{metric.label}</span>
                                <strong>{metric.value}</strong>
                                <small>{metric.detail}</small>
                            </article>
                        ))}
                    </div>

                    {profile.floatRatio !== null && (
                        <div className="stock-ownership-profile__float">
                            <div>
                                <span>Public-float availability</span>
                                <strong>{formatPercent(profile.floatRatio)}</strong>
                            </div>
                            <div
                                aria-label={`Public float is ${formatPercent(profile.floatRatio)} of shares outstanding`}
                                className="stock-ownership-profile__track"
                                role="img">
                                <span style={{width: `${floatWidth}%`}} />
                            </div>
                            <small>A smaller float can make the share price more sensitive to changing demand.</small>
                        </div>
                    )}
                </>
            ) : (
                <p className="stock-ownership-profile__empty">
                    Ownership and public-float metrics are not available for this symbol.
                </p>
            )}

            <small className="stock-ownership-profile__disclaimer">
                Ownership fields are provider-reported snapshots and may be updated on different reporting schedules.
            </small>
        </section>
    );
};

export default StockOwnershipProfile;
