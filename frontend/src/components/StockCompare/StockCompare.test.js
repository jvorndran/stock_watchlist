import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {MemoryRouter} from 'react-router-dom';
import StockCompare, {parseSymbolEntry} from './StockCompare';

describe('StockCompare', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        window.history.replaceState({}, '', '/');
    });

    it('normalizes, deduplicates, and limits ticker entries', () => {
        expect(parseSymbolEntry(' aapl, msft;AAPL googl nvda tsla '))
            .toEqual(['AAPL', 'MSFT', 'GOOGL', 'NVDA']);
    });

    it('loads shared symbols into the comparison table', async () => {
        window.history.replaceState({}, '', '/dash/compare?symbols=AAPL,MSFT');
        jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
            const symbol = url.split('/').pop();

            return {
                ok: true,
                json: async () => ({
                    summary: {
                        Symbol: symbol,
                        Name: `${symbol} Company`,
                        MarketCapitalization: symbol === 'AAPL' ? '3000000000000' : '2800000000000',
                        ForwardPE: symbol === 'AAPL' ? '28' : '30',
                        QuarterlyRevenueGrowthYOY: symbol === 'AAPL' ? '0.1' : '0.08',
                    },
                }),
            };
        });

        render(
            <MemoryRouter>
                <StockCompare />
            </MemoryRouter>
        );

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
        expect(await screen.findByText('AAPL Company')).toBeInTheDocument();
        expect(screen.getByText('MSFT Company')).toBeInTheDocument();
        expect(screen.getByText('Revenue Growth Leader')).toBeInTheDocument();
    });
});
