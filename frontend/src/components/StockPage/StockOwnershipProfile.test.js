import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockOwnershipProfile, {buildOwnershipProfile} from './StockOwnershipProfile';

const stockData = {
    summary: {
        PercentInsiders: '12',
        PercentInstitutions: '0.78',
        SharesFloat: '350000000',
        SharesOutstanding: '500000000',
        Symbol: 'OWNR',
    },
};

describe('StockOwnershipProfile', () => {
    it('derives public-float availability and normalizes provider percentage formats', () => {
        const profile = buildOwnershipProfile(stockData.summary);

        expect(profile.floatRatio).toBeCloseTo(0.7);
        expect(profile.insiderOwnership).toBeCloseTo(0.12);
        expect(profile.institutionalOwnership).toBeCloseTo(0.78);
        expect(profile.label).toBe('Institutional concentration');
    });

    it('prioritizes substantial insider ownership in the profile label', () => {
        expect(buildOwnershipProfile({PercentInsiders: '25', PercentInstitutions: '90'}).label)
            .toBe('Insider-led ownership');
    });

    it('renders ownership metrics and the public-float gauge', () => {
        render(<StockOwnershipProfile stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Shareholder Structure'})).toBeInTheDocument();
        expect(screen.getByText('Institutional concentration')).toBeInTheDocument();
        expect(screen.getByText('70.0% of outstanding shares')).toBeInTheDocument();
        expect(screen.getByRole('img', {name: 'Public float is 70.0% of shares outstanding'})).toBeInTheDocument();
    });

    it('shows an empty state without ownership fields', () => {
        render(<StockOwnershipProfile stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/ownership and public-float metrics are not available/i)).toBeInTheDocument();
    });
});
