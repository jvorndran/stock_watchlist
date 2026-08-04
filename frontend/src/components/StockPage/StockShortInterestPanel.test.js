import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockShortInterestPanel, {buildShortInterestProfile} from './StockShortInterestPanel';

const stockData = {
    summary: {
        SharesShort: '11000000',
        SharesShortPriorMonth: '10000000',
        ShortPercentFloat: '0.12',
        ShortPercentOutstanding: '0.10',
        ShortRatio: '5.4',
        Symbol: 'TEST',
    },
};

describe('StockShortInterestPanel', () => {
    it('derives crowding and month-over-month short-share changes', () => {
        const profile = buildShortInterestProfile(stockData.summary);

        expect(profile).toMatchObject({
            crowding: 0.12,
            label: 'Elevated short interest',
            shortPercentFloat: 0.12,
            shortPercentOutstanding: 0.1,
            shortRatio: 5.4,
        });
        expect(profile.shortChange).toBeCloseTo(0.1);
    });

    it('accepts whole-number percentage values from data providers', () => {
        expect(buildShortInterestProfile({ShortPercentFloat: '12'}).shortPercentFloat).toBeCloseTo(0.12);
    });

    it('treats reported zero short interest as limited rather than missing', () => {
        expect(buildShortInterestProfile({ShortPercentFloat: '0'}).label).toBe('Limited short interest');
    });

    it('renders short-interest metrics and the crowding gauge', () => {
        render(<StockShortInterestPanel stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Short Interest Positioning'})).toBeInTheDocument();
        expect(screen.getByText('Elevated short interest')).toBeInTheDocument();
        expect(screen.getAllByText('+12.0%')).toHaveLength(2);
        expect(screen.getByText('+10.0% versus prior month')).toBeInTheDocument();
        expect(screen.getByRole('img', {name: 'Short-interest crowding +12.0%'})).toBeInTheDocument();
    });

    it('shows an empty state when short-interest fields are missing', () => {
        render(<StockShortInterestPanel stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/short-interest metrics are not available/i)).toBeInTheDocument();
    });
});
