import {buildInvestmentScorecards, buildWeightedScorecard} from './StockScorecard';

const summary = {
    AnalystTargetPrice: '130',
    Beta: '0.9',
    ForwardPE: '30',
    PEGRatio: '2.5',
    PriceToSalesRatioTTM: '10',
    ProfitMargin: '0.18',
    QuarterlyEarningsGrowthYOY: '0.28',
    QuarterlyRevenueGrowthYOY: '0.18',
    ReturnOnAssetsTTM: '0.1',
    OperatingMarginTTM: '0.24',
    '52WeekHigh': '110',
};

describe('StockScorecard lenses', () => {
    it('weights growth differently from value while retaining all available categories', () => {
        const cards = buildInvestmentScorecards(summary);
        const valueScore = buildWeightedScorecard(cards, {
            Valuation: 1.75,
            Growth: 0.75,
            Profitability: 1,
            'Risk And Target': 1,
        });
        const growthScore = buildWeightedScorecard(cards, {
            Valuation: 0.75,
            Growth: 1.75,
            Profitability: 1.25,
            'Risk And Target': 1,
        });

        expect(cards).toHaveLength(4);
        expect(growthScore).toBeGreaterThan(valueScore);
    });

    it('ignores unavailable categories instead of diluting a selected lens', () => {
        const score = buildWeightedScorecard([
            {label: 'Valuation', score: 80},
            {label: 'Growth', score: null},
        ], {Valuation: 2, Growth: 5});

        expect(score).toBe(80);
    });
});
