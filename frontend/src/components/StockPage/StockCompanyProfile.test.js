import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockCompanyProfile, {buildCompanyProfile} from './StockCompanyProfile';

const stockData = {
    summary: {
        Symbol: 'TEST',
        AssetType: 'Common Stock',
        Exchange: 'NASDAQ',
        Country: 'USA',
        Currency: 'USD',
        FiscalYearEnd: 'December',
        LatestQuarter: '2026-06-30',
        OfficialSite: 'example.com',
        Description: 'A research-driven company with a long description '.repeat(12),
    },
};

describe('StockCompanyProfile', () => {
    it('normalizes profile data and a secure official website link', () => {
        expect(buildCompanyProfile(stockData.summary)).toMatchObject({
            availableFields: 6,
            officialSite: 'https://example.com/',
        });
    });

    it('renders reporting context and expands a long business description', () => {
        render(<StockCompanyProfile stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Company Profile'})).toBeInTheDocument();
        expect(screen.getByText('Latest reported quarter')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'Visit official company site'})).toHaveAttribute('href', 'https://example.com/');
        expect(screen.getByRole('button', {name: 'Read business description'})).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: 'Read business description'}));

        expect(screen.getByRole('button', {name: 'Show less'})).toBeInTheDocument();
    });

    it('shows unavailable profile fields without creating a website link', () => {
        render(<StockCompanyProfile stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/business description is not available/i)).toBeInTheDocument();
        expect(screen.getByText(/official company site is not available/i)).toBeInTheDocument();
    });
});
