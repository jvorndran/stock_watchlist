import React from 'react';
import '../style/stock-analyst-consensus-style.css';

const ratingDefinitions = [
    {key: 'strongBuy', field: 'AnalystRatingStrongBuy', label: 'Strong Buy', tone: 'strong-buy', weight: 2},
    {key: 'buy', field: 'AnalystRatingBuy', label: 'Buy', tone: 'buy', weight: 1},
    {key: 'hold', field: 'AnalystRatingHold', label: 'Hold', tone: 'hold', weight: 0},
    {key: 'sell', field: 'AnalystRatingSell', label: 'Sell', tone: 'sell', weight: -1},
    {key: 'strongSell', field: 'AnalystRatingStrongSell', label: 'Strong Sell', tone: 'strong-sell', weight: -2},
];

const parseCount = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
};

const getConsensusLabel = (score) => {
    if (score >= 1.25) {
        return 'Strong Buy';
    }

    if (score >= 0.35) {
        return 'Buy';
    }

    if (score > -0.35) {
        return 'Hold';
    }

    if (score > -1.25) {
        return 'Sell';
    }

    return 'Strong Sell';
};

export const buildAnalystConsensus = (summary = {}) => {
    const ratings = ratingDefinitions.map((definition) => ({
        ...definition,
        count: parseCount(summary[definition.field]),
    }));
    const total = ratings.reduce((sum, rating) => sum + rating.count, 0);

    if (total === 0) {
        return null;
    }

    const bullish = ratings
        .filter((rating) => rating.weight > 0)
        .reduce((sum, rating) => sum + rating.count, 0);
    const bearish = ratings
        .filter((rating) => rating.weight < 0)
        .reduce((sum, rating) => sum + rating.count, 0);
    const score = ratings.reduce((sum, rating) => sum + (rating.count * rating.weight), 0) / total;

    return {
        bearish,
        bearishPercent: (bearish / total) * 100,
        bullish,
        bullishPercent: (bullish / total) * 100,
        label: getConsensusLabel(score),
        ratings: ratings.map((rating) => ({
            ...rating,
            percent: (rating.count / total) * 100,
        })),
        score,
        total,
    };
};

const formatPercent = (value) => `${value.toFixed(0)}%`;

const StockAnalystConsensus = ({stockData}) => {
    const {summary} = stockData;
    const consensus = buildAnalystConsensus(summary);

    return (
        <section className="stock-analyst-consensus">
            <div className="stock-analyst-consensus__header">
                <div>
                    <h2>Analyst Consensus</h2>
                    <span>Recommendation mix reported for {summary.Symbol}</span>
                </div>
                {consensus && <strong>{consensus.label}</strong>}
            </div>

            {consensus ? (
                <>
                    <div className="stock-analyst-consensus__metrics">
                        <article>
                            <span>Analyst Coverage</span>
                            <strong>{consensus.total}</strong>
                            <small>Total published ratings</small>
                        </article>
                        <article className="is-bullish">
                            <span>Bullish Ratings</span>
                            <strong>{formatPercent(consensus.bullishPercent)}</strong>
                            <small>{consensus.bullish} buy or strong-buy ratings</small>
                        </article>
                        <article className="is-bearish">
                            <span>Bearish Ratings</span>
                            <strong>{formatPercent(consensus.bearishPercent)}</strong>
                            <small>{consensus.bearish} sell or strong-sell ratings</small>
                        </article>
                        <article>
                            <span>Weighted Score</span>
                            <strong>{consensus.score > 0 ? '+' : ''}{consensus.score.toFixed(2)}</strong>
                            <small>Scale from -2 to +2</small>
                        </article>
                    </div>

                    <div
                        aria-label={`Analyst rating distribution: ${consensus.ratings.map((rating) => `${rating.label} ${rating.count}`).join(', ')}`}
                        className="stock-analyst-consensus__bar"
                        role="img">
                        {consensus.ratings.filter((rating) => rating.count > 0).map((rating) => (
                            <span
                                className={`stock-analyst-consensus__segment stock-analyst-consensus__segment--${rating.tone}`}
                                key={rating.key}
                                style={{width: `${rating.percent}%`}}
                                title={`${rating.label}: ${rating.count}`}
                            />
                        ))}
                    </div>

                    <div className="stock-analyst-consensus__breakdown">
                        {consensus.ratings.map((rating) => (
                            <div key={rating.key}>
                                <span className={`stock-analyst-consensus__dot stock-analyst-consensus__dot--${rating.tone}`} />
                                <span>{rating.label}</span>
                                <strong>{rating.count}</strong>
                                <small>{formatPercent(rating.percent)}</small>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <p className="stock-analyst-consensus__empty">
                    Analyst recommendation counts are not available for this symbol.
                </p>
            )}

            <small className="stock-analyst-consensus__disclaimer">
                Consensus summarizes reported analyst ratings and is not an investment recommendation.
            </small>
        </section>
    );
};

export default StockAnalystConsensus;
