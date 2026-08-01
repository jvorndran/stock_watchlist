import {summarizeTradePlanExposure} from './Watchlist';

describe('summarizeTradePlanExposure', () => {
    it('combines long and short plans into portfolio exposure totals', () => {
        const exposure = summarizeTradePlanExposure(['LONG', 'SHORT'], {
            LONG: {entry: 100, stop: 95, target: 110},
            SHORT: {entry: 50, stop: 55, target: 40},
        }, 100);

        expect(exposure).toMatchObject({
            longCapital: 2000,
            longPlans: 1,
            netDirectionalCapital: 1000,
            shortCapital: 1000,
            shortPlans: 1,
            totalCapital: 3000,
            totalReward: 400,
            totalRisk: 200,
            validPlans: 2,
            weightedRewardMultiple: 2,
        });
        expect(exposure.largestPosition).toEqual({symbol: 'LONG', capital: 2000});
        expect(exposure.largestPositionShare).toBeCloseTo(2 / 3);
        expect(exposure.longCapitalShare).toBeCloseTo(2 / 3);
    });

    it('counts invalid saved plans without including them in totals', () => {
        const exposure = summarizeTradePlanExposure(['GOOD', 'INVALID', 'EMPTY'], {
            GOOD: {entry: 25, stop: 20, target: 35},
            INVALID: {entry: 25, stop: 25, target: 35},
        }, 50);

        expect(exposure.invalidPlans).toBe(1);
        expect(exposure.validPlans).toBe(1);
        expect(exposure.totalCapital).toBe(250);
        expect(exposure.totalRisk).toBe(50);
        expect(exposure.totalReward).toBe(100);
    });

    it('returns an empty exposure summary when no visible plans are saved', () => {
        expect(summarizeTradePlanExposure(['AAPL'], {}, 100)).toMatchObject({
            largestPosition: null,
            netDirectionalCapital: 0,
            totalCapital: 0,
            totalReward: 0,
            totalRisk: 0,
            validPlans: 0,
            weightedRewardMultiple: 0,
        });
    });
});
