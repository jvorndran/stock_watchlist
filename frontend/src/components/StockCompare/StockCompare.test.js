import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {MemoryRouter} from 'react-router-dom';
import StockCompare, {buildComparisonCsv, buildComparisonScorecard, parseSymbolEntry} from './StockCompare';

describe('StockCompare', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        window.history.replaceState({}, '', '/');
    });

    it('normalizes, deduplicates, and limits ticker entries', () => {
        expect(parseSymbolEntry(' aapl, msft;AAPL googl nvda tsla '))
            .toEqual(['AAPL', 'MSFT', 'GOOGL', 'NVDA']);
    });

    it('ranks loaded companies with the selected research lens', () => {
        const scorecard = buildComparisonScorecard([
            {
                Symbol: 'VALUE',
                ForwardPE: '14',
                PERatio: '16',
                ProfitMargin: '0.12',
                QuarterlyEarningsGrowthYOY: '0.05',
                QuarterlyRevenueGrowthYOY: '0.04',
            },
            {
                Symbol: 'GROWTH',
                ForwardPE: '35',
                PERatio: '45',
                ProfitMargin: '0.3',
                QuarterlyEarningsGrowthYOY: '0.35',
                QuarterlyRevenueGrowthYOY: '0.4',
            },
        ], 'growth');

        expect(scorecard[0]).toMatchObject({
            availableMetrics: 3,
            score: 100,
            summary: {Symbol: 'GROWTH'},
        });
        expect(scorecard[1].summary.Symbol).toBe('VALUE');
    });

    it('exports each displayed metric as portable CSV rows', () => {
        const csv = buildComparisonCsv([{
            Symbol: 'ACME',
            Name: 'Acme, Inc.',
            ForwardPE: '19.5',
            DividendYield: '0.02',
        }]);

        expect(csv).toContain('"Ticker","Company","Market Cap"');
        expect(csv).toContain('"ACME","Acme, Inc."');
        expect(csv).toContain('"19.5"');
        expect(csv).toContain('"0.02"');
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
