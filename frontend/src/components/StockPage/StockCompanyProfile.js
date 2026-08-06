import React, {useState} from 'react';
import '../style/stock-company-profile-style.css';

const cleanText = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    const text = String(value).trim();
    return text && text.toLowerCase() !== 'none' && text.toLowerCase() !== 'n/a' ? text : '';
};

const normalizeWebsite = (value) => {
    const text = cleanText(value);

    if (!text) {
        return '';
    }

    try {
        const url = new URL(text.startsWith('http') ? text : `https://${text}`);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (error) {
        return '';
    }
};

export const buildCompanyProfile = (summary = {}) => {
    const fields = [
        {label: 'Asset type', value: cleanText(summary.AssetType)},
        {label: 'Exchange', value: cleanText(summary.Exchange)},
        {label: 'Country', value: cleanText(summary.Country)},
        {label: 'Currency', value: cleanText(summary.Currency)},
        {label: 'Fiscal year-end', value: cleanText(summary.FiscalYearEnd)},
        {label: 'Latest reported quarter', value: cleanText(summary.LatestQuarter)},
    ];

    return {
        description: cleanText(summary.Description),
        fields,
        officialSite: normalizeWebsite(summary.OfficialSite),
        availableFields: fields.filter((field) => field.value).length,
    };
};

const StockCompanyProfile = ({stockData}) => {
    const {summary} = stockData;
    const profile = buildCompanyProfile(summary);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const descriptionLimit = 360;
    const hasLongDescription = profile.description.length > descriptionLimit;
    const visibleDescription = isDescriptionExpanded || !hasLongDescription
        ? profile.description
        : `${profile.description.slice(0, descriptionLimit).trim()}…`;

    return (
        <section className="stock-company-profile">
            <div className="stock-company-profile__header">
                <div>
                    <h2>Company Profile</h2>
                    <span>Business context and reporting cadence for {summary.Symbol}</span>
                </div>
                <strong>{profile.availableFields} of {profile.fields.length} profile fields</strong>
            </div>

            {profile.description ? (
                <div className="stock-company-profile__description">
                    <p>{visibleDescription}</p>
                    {hasLongDescription && (
                        <button onClick={() => setIsDescriptionExpanded((expanded) => !expanded)} type="button">
                            {isDescriptionExpanded ? 'Show less' : 'Read business description'}
                        </button>
                    )}
                </div>
            ) : (
                <p className="stock-company-profile__empty">A business description is not available for this symbol.</p>
            )}

            <div className="stock-company-profile__grid">
                {profile.fields.map((field) => (
                    <article data-available={Boolean(field.value)} key={field.label}>
                        <span>{field.label}</span>
                        <strong>{field.value || 'Not available'}</strong>
                    </article>
                ))}
            </div>

            <div className="stock-company-profile__footer">
                {profile.officialSite ? (
                    <a href={profile.officialSite} rel="noopener noreferrer" target="_blank">Visit official company site</a>
                ) : (
                    <span>Official company site is not available in the quote profile.</span>
                )}
                <small>Profile information is supplied with the market-data overview.</small>
            </div>
        </section>
    );
};

export default StockCompanyProfile;
