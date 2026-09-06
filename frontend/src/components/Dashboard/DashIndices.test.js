jest.mock('./FinancialChart', () => () => null);
jest.mock('axios', () => ({get: jest.fn()}));

import {buildIndexRelativeStrength} from './DashIndices';

const buildSeries = (start, end) => Array.from({length: 64}, (_, index) => ({
    close: start + ((end - start) * index / 63),
}));

describe('buildIndexRelativeStrength', () => {
    it('ranks indexes by comparable one-month returns and preserves longer-window history gaps', () => {
        const strength = buildIndexRelativeStrength([
            buildSeries(100, 120),
            buildSeries(100, 90),
            buildSeries(100, 105),
        ], ['Leader', 'Laggard', 'Middle']);

        expect(strength.leader).toMatchObject({name: 'Leader', oneMonth: expect.any(Number)});
        expect(strength.laggard).toMatchObject({name: 'Laggard', oneMonth: expect.any(Number)});
        expect(strength.rows).toEqual(expect.arrayContaining([
            expect.objectContaining({name: 'Leader', oneWeek: expect.any(Number), oneQuarter: expect.any(Number)}),
        ]));
        expect(strength.spread).toBeGreaterThan(0);
    });

    it('marks unavailable return windows as null when an index has too little history', () => {
        const strength = buildIndexRelativeStrength([[{close: 100}, {close: 101}]], ['New Index']);

        expect(strength).toMatchObject({leader: null, laggard: null, spread: null});
        expect(strength.rows[0]).toMatchObject({oneWeek: null, oneMonth: null, oneQuarter: null});
    });
});
