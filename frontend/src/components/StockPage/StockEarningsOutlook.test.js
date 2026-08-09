import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import StockEarningsOutlook, {buildEarningsOutlook} from './StockEarningsOutlook';

const stockData = {
    summary: {
        EPS: '5',
        ForwardPE: '16.7',
        PERatio: '20',
        Symbol: 'TEST',
    },
};

describe('StockEarningsOutlook', () => {
    it('derives forward EPS, earnings yields, and the multiple shift from reported valuation data', () => {
        const outlook = buildEarningsOutlook(stockData.summary);

        expect(outlook).toMatchObject({
            label: 'Growth with multiple support',
            reference: {value: 100},
            trailingEps: 5,
            trailingPE: 20,
            forwardPE: 16.7,
        });
        expect(outlook.forwardEps).toBeCloseTo(5.988, 3);
        expect(outlook.forwardEpsChange).toBeCloseTo(0.1976, 3);
        expect(outlook.forwardYield).toBeCloseTo(1 / 16.7, 3);
    });

    it('renders the reported and implied earnings comparison', () => {
        render(<StockEarningsOutlook stockData={stockData} />);

        expect(screen.getByRole('heading', {name: 'Earnings Multiple Outlook'})).toBeInTheDocument();
        expect(screen.getByText('Growth with multiple support')).toBeInTheDocument();
        expect(screen.getByText('$5.99')).toBeInTheDocument();
        expect(screen.getByText('+19.8%')).toBeInTheDocument();
        expect(screen.getByText('Reference value')).toBeInTheDocument();
    });

    it('shows an unavailable-data state without reported earnings multiples', () => {
        render(<StockEarningsOutlook stockData={{summary: {Symbol: 'EMPTY'}}} />);

        expect(screen.getByText(/reported EPS or trailing and forward P\/E data are not available/i)).toBeInTheDocument();
    });
});
