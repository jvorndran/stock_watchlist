import React from 'react';
import '../style/stock-scorecard-style.css';

const parseMetric = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const clampScore = (value) => Math.min(100, Math.max(0, value));

const scoreHigherBetter = (value, weak, strong) => {
    const parsed = parseMetric(value);

    if (parsed === null) {
        return null;
    }

    return clampScore(((parsed - weak) / (strong - weak)) * 100);
};

const scoreLowerBetter = (value, strong, weak) => {
    const parsed = parseMetric(value);

    if (parsed === null || parsed <= 0) {
        return null;
    }

    return clampScore(100 - (((parsed - strong) / (weak - strong)) * 100));
};

const averageScores = (scores) => {
    const usableScores = scores.filter((score) => score !== null);

    if (usableScores.length === 0) {
        return null;
    }

    return usableScores.reduce((total, score) => total + score, 0) / usableScores.length;
};

const formatScore = (score) => score === null ? '-' : Math.round(score);

const formatPercent = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `${(parsed * 100).toFixed(1)}%`;
};

const formatRatio = (value) => {
    const parsed = parseMetric(value);
    return parsed === null ? '-' : `${parsed.toFixed(2)}x`;
};

const getTargetUpside = (summary) => {
    const target = parseMetric(summary.AnalystTargetPrice);
    const high = parseMetric(summary['52WeekHigh']);

    if (target === null || high === null || high <= 0) {
        return null;
    }

    return (target - high) / high;
};

const getScoreLabel = (score) => {
    if (score === null) {
        return 'Needs data';
    }

    if (score >= 75) {
        return 'Constructive';
    }

    if (score >= 55) {
        return 'Balanced';
    }

    if (score >= 40) {
        return 'Watch closely';
    }

    return 'Caution';
};

const StockScorecard = ({ stockData }) => {
    const { summary } = stockData;
    const targetUpside = getTargetUpside(summary);

    const scorecards = [
        {
            label: 'Valuation',
            score: averageScores([
                scoreLowerBetter(summary.ForwardPE, 12, 35),
                scoreLowerBetter(summary.PEGRatio, 1, 3),
                scoreLowerBetter(summary.PriceToSalesRatioTTM, 2, 12),
            ]),
            detail: `Forward PE ${formatRatio(summary.ForwardPE)} | PEG ${formatRatio(summary.PEGRatio)}`,
        },
        {
            label: 'Growth',
            score: averageScores([
                scoreHigherBetter(summary.QuarterlyRevenueGrowthYOY, -0.1, 0.25),
                scoreHigherBetter(summary.QuarterlyEarningsGrowthYOY, -0.1, 0.35),
            ]),
            detail: `Revenue ${formatPercent(summary.QuarterlyRevenueGrowthYOY)} | EPS ${formatPercent(summary.QuarterlyEarningsGrowthYOY)}`,
        },
        {
            label: 'Profitability',
            score: averageScores([
                scoreHigherBetter(summary.OperatingMarginTTM, 0, 0.35),
                scoreHigherBetter(summary.ProfitMargin, 0, 0.3),
                scoreHigherBetter(summary.ReturnOnAssetsTTM, 0, 0.15),
            ]),
            detail: `Operating margin ${formatPercent(summary.OperatingMarginTTM)} | ROA ${formatPercent(summary.ReturnOnAssetsTTM)}`,
        },
        {
            label: 'Risk And Target',
            score: averageScores([
                scoreLowerBetter(summary.Beta, 0.8, 1.8),
                scoreHigherBetter(targetUpside, -0.2, 0.25),
            ]),
            detail: `Beta ${formatRatio(summary.Beta)} | Target gap ${formatPercent(targetUpside)}`,
        },
    ];

    const overallScore = averageScores(scorecards.map((card) => card.score));

    return (
        <section className="stock-scorecard">
            <div className="stock-scorecard__header">
                <div>
                    <h2>Investment Scorecard</h2>
                    <span>{summary.Symbol}</span>
                </div>
                <div className="stock-scorecard__overall">
                    <strong>{formatScore(overallScore)}</strong>
                    <span>{getScoreLabel(overallScore)}</span>
                </div>
            </div>

            <div className="stock-scorecard__grid">
                {scorecards.map((card) => (
                    <article className="stock-scorecard__card" key={card.label}>
                        <div>
                            <span>{card.label}</span>
                            <strong>{formatScore(card.score)}</strong>
                        </div>
                        <div className="stock-scorecard__track">
                            <span style={{width: `${card.score === null ? 0 : card.score}%`}} />
                        </div>
                        <small>{card.detail}</small>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default StockScorecard;
