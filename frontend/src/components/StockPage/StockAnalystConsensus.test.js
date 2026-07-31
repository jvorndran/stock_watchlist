import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockAnalystConsensus, {buildAnalystConsensus} from './StockAnalystConsensus';

const stockData = {
    summary: {
        Symbol: 'TEST',
        AnalystRatingStrongBuy: '8',
        AnalystRatingBuy: '6',
        AnalystRatingHold: '4',
        AnalystRatingSell: '1',
        AnalystRatingStrongSell: '1',
    },
};

describe('StockAnalystConsensus', () => {
    it('builds weighted consensus metrics from the rating counts', () => {
        expect(buildAnalystConsensus(stockData.summary)).toMatchObject({
            bearish: 2,
            bearishPercent: 10,
            bullish: 14,
            bullishPercent: 70,
            label: 'Buy',
            score: 0.95,
            total: 20,
        });
    });

    it('renders coverage and the full rating distribution', () => {
        render(<StockAnalystConsensus stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Analyst Consensus'})).toBeInTheDocument();
        expect(screen.getByText('70%')).toBeInTheDocument();
        expect(screen.getByText('10%')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAccessibleName(
            'Analyst rating distribution: Strong Buy 8, Buy 6, Hold 4, Sell 1, Strong Sell 1'
        );
    });

    it('shows an empty state when rating coverage is unavailable', () => {
        render(<StockAnalystConsensus stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/recommendation counts are not available/i)).toBeInTheDocument();
    });
});
