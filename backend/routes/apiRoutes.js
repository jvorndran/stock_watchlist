const express = require('express');
const router = express.Router();
const User = require("../models/User");
const StockPriceData = require("../models/StockPriceData");
const jwt = require("jsonwebtoken");

const serializeWatchlistNotes = (notes = []) => notes.reduce((serializedNotes, item) => {
    if (item?.ticker && item?.note) {
        serializedNotes[item.ticker] = item.note;
    }

    return serializedNotes;
}, {});

const serializeWatchlistTags = (tagGroups = []) => tagGroups.reduce((serializedTags, item) => {
    if (item?.ticker && Array.isArray(item?.tags) && item.tags.length > 0) {
        serializedTags[item.ticker] = item.tags;
    }

    return serializedTags;
}, {});

const serializeWatchlistTradePlans = (tradePlans = []) => tradePlans.reduce((serializedPlans, item) => {
    if (item?.ticker && item?.entry && item?.stop && item?.target) {
        serializedPlans[item.ticker] = {
            entry: item.entry,
            stop: item.stop,
            target: item.target
        };
    }

    return serializedPlans;
}, {});

const researchTagKeys = new Set(['core', 'swing', 'earnings', 'income']);
const validTickerPattern = /^[A-Z0-9.-]{1,12}$/;

const normalizeResearchSnapshot = (snapshot = {}) => {
    snapshot = snapshot && typeof snapshot === 'object' ? snapshot : {};
    const watchlist = Array.isArray(snapshot.watchlist) ? snapshot.watchlist : null;

    if (!watchlist || watchlist.length > 100) {
        return null;
    }

    const tickers = watchlist.map((ticker) => String(ticker || '').trim().toUpperCase());

    if (tickers.some((ticker) => !validTickerPattern.test(ticker)) || new Set(tickers).size !== tickers.length) {
        return null;
    }

    const tickerSet = new Set(tickers);
    const notes = snapshot.notes && typeof snapshot.notes === 'object' && !Array.isArray(snapshot.notes)
        ? snapshot.notes
        : {};
    const tags = snapshot.tags && typeof snapshot.tags === 'object' && !Array.isArray(snapshot.tags)
        ? snapshot.tags
        : {};
    const tradePlans = snapshot.tradePlans && typeof snapshot.tradePlans === 'object' && !Array.isArray(snapshot.tradePlans)
        ? snapshot.tradePlans
        : {};
    const normalizedNotes = [];
    const normalizedTags = [];
    const normalizedPlans = [];

    for (const [ticker, note] of Object.entries(notes)) {
        const normalizedTicker = String(ticker).trim().toUpperCase();
        const normalizedNote = typeof note === 'string' ? note.trim() : null;

        if (!tickerSet.has(normalizedTicker) || normalizedNote === null || normalizedNote.length > 500) {
            return null;
        }

        if (normalizedNote) {
            normalizedNotes.push({ticker: normalizedTicker, note: normalizedNote, updatedAt: new Date()});
        }
    }

    for (const [ticker, savedTags] of Object.entries(tags)) {
        const normalizedTicker = String(ticker).trim().toUpperCase();
        const normalizedTagsForTicker = Array.isArray(savedTags)
            ? [...new Set(savedTags.map((tag) => String(tag).trim().toLowerCase()))]
            : null;

        if (!tickerSet.has(normalizedTicker) || !normalizedTagsForTicker ||
            normalizedTagsForTicker.some((tag) => !researchTagKeys.has(tag))) {
            return null;
        }

        if (normalizedTagsForTicker.length > 0) {
            normalizedTags.push({ticker: normalizedTicker, tags: normalizedTagsForTicker, updatedAt: new Date()});
        }
    }

    for (const [ticker, plan] of Object.entries(tradePlans)) {
        const normalizedTicker = String(ticker).trim().toUpperCase();
        const entry = Number(plan?.entry);
        const stop = Number(plan?.stop);
        const target = Number(plan?.target);
        const isLongPlan = stop < entry && entry < target;
        const isShortPlan = target < entry && entry < stop;

        if (!tickerSet.has(normalizedTicker) || !Number.isFinite(entry) || !Number.isFinite(stop) || !Number.isFinite(target) ||
            entry <= 0 || stop <= 0 || target <= 0 || (!isLongPlan && !isShortPlan)) {
            return null;
        }

        normalizedPlans.push({ticker: normalizedTicker, entry, stop, target, updatedAt: new Date()});
    }

    return {watchlist: tickers, notes: normalizedNotes, tags: normalizedTags, tradePlans: normalizedPlans};
};

router.post('/signup', (req, res) => {
    const { name, username, password } = req.body;

    // Create a new user instance
    const newUser = new User({ name, username, password });

    // Save the user to the database
    newUser
        .save()
        .then(() => {
            res.status(200).json({ message: 'User registered successfully' });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while saving the user' });
        });
});


router.get('/indices', async (req, res) => {
    try{
        const symbols = ['QQQ', 'SPY', 'DIA', 'IWM']
        const data = await StockPriceData.find({symbol: { $in: symbols}})

        res.json(data)

    }catch (error){
        console.error("Error fetching price data", error)
        res.status(500).json({ error: 'Server error' })
    }

})


router.get('/watchlist', (req, res) => {

    try {
        const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header

        // Verify the JWT token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }


            const { username } = decodedToken.UserInfo;

            // Retrieve user's watchlist from the database
            const user = await User.findOne({ username });


            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Return the watchlist as the response

            res.status(200).json({
                watchlist: user.watchlist,
                notes: serializeWatchlistNotes(user.watchlistNotes),
                tags: serializeWatchlistTags(user.watchlistTags),
                tradePlans: serializeWatchlistTradePlans(user.watchlistTradePlans)
            });

        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }


});

router.post('/watchlist', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const stockTicker = req.body?.stockTicker?.trim().toUpperCase();

        if (!token) {
            return res.status(401).json({ message: 'Missing token' });
        }

        if (!stockTicker) {
            return res.status(400).json({ message: 'Stock ticker is required' });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            const { username } = decodedToken.UserInfo;

            const user = await User.findOneAndUpdate(
                { username },
                { $addToSet: { watchlist: stockTicker } },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({
                watchlist: user.watchlist,
                notes: serializeWatchlistNotes(user.watchlistNotes),
                tags: serializeWatchlistTags(user.watchlistTags)
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/watchlist/bulk', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const requestedTickers = Array.isArray(req.body?.stockTickers) ? req.body.stockTickers : [];
        const stockTickers = [...new Set(requestedTickers
            .map((ticker) => String(ticker).trim().toUpperCase())
            .filter(Boolean))];

        if (!token) {
            return res.status(401).json({ message: 'Missing token' });
        }

        if (stockTickers.length === 0) {
            return res.status(400).json({ message: 'At least one stock ticker is required' });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            const { username } = decodedToken.UserInfo;

            const user = await User.findOneAndUpdate(
                { username },
                { $addToSet: { watchlist: { $each: stockTickers } } },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ watchlist: user.watchlist, requestedTickers: stockTickers });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/watchlist/research-snapshot', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const snapshot = normalizeResearchSnapshot(req.body);

        if (!token) {
            return res.status(401).json({ message: 'Missing token' });
        }

        if (!snapshot) {
            return res.status(400).json({ message: 'Choose a valid watchlist research backup' });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            try {
                const { username } = decodedToken.UserInfo;
                const user = await User.findOne({ username });

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                user.watchlist = snapshot.watchlist;
                user.watchlistNotes = snapshot.notes;
                user.watchlistTags = snapshot.tags;
                user.watchlistTradePlans = snapshot.tradePlans;
                await user.save();

                res.status(200).json({
                    watchlist: user.watchlist,
                    notes: serializeWatchlistNotes(user.watchlistNotes),
                    tags: serializeWatchlistTags(user.watchlistTags),
                    tradePlans: serializeWatchlistTradePlans(user.watchlistTradePlans)
                });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/watchlist/order', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const requestedTickers = Array.isArray(req.body?.stockTickers) ? req.body.stockTickers : [];
        const stockTickers = requestedTickers.map((ticker) => String(ticker).trim().toUpperCase());

        if (!token) {
            return res.status(401).json({ message: 'Missing token' });
        }

        if (stockTickers.length === 0 || stockTickers.some((ticker) => !ticker)) {
            return res.status(400).json({ message: 'A complete watchlist order is required' });
        }

        if (new Set(stockTickers).size !== stockTickers.length) {
            return res.status(400).json({ message: 'Watchlist order cannot contain duplicate symbols' });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            try {
                const { username } = decodedToken.UserInfo;
                const user = await User.findOne({ username });

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                const currentTickers = user.watchlist.map((ticker) => String(ticker).trim().toUpperCase());
                const currentTickerSet = new Set(currentTickers);
                const hasSameSymbols = stockTickers.length === currentTickers.length &&
                    stockTickers.every((ticker) => currentTickerSet.has(ticker));

                if (!hasSameSymbols) {
                    return res.status(400).json({ message: 'Reordered watchlist must contain the same symbols' });
                }

                user.watchlist = stockTickers;
                await user.save();

                res.status(200).json({ watchlist: user.watchlist });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/watchlist/:stockTicker/note', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const stockTicker = String(req.params.stockTicker || '').trim().toUpperCase();
        const note = String(req.body?.note || '').trim();

        if (!token) {
            return res.status(401).json({ message: 'Missing token' });
        }

        if (!stockTicker) {
            return res.status(400).json({ message: 'Stock ticker is required' });
        }

        if (note.length > 500) {
            return res.status(400).json({ message: 'Watchlist notes are limited to 500 characters' });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            try {
                const { username } = decodedToken.UserInfo;
                const user = await User.findOne({ username });

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                if (!user.watchlist.includes(stockTicker)) {
                    return res.status(400).json({ message: 'Add the symbol to your watchlist before saving a note' });
                }

                const existingNote = user.watchlistNotes.find((item) => item.ticker === stockTicker);

                if (!note && existingNote) {
                    user.watchlistNotes.pull(existingNote._id);
                } else if (existingNote) {
                    existingNote.note = note;
                    existingNote.updatedAt = new Date();
                } else if (note) {
                    user.watchlistNotes.push({ ticker: stockTicker, note, updatedAt: new Date() });
                }

                await user.save();

                res.status(200).json({
                    watchlist: user.watchlist,
                    notes: serializeWatchlistNotes(user.watchlistNotes)
                });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/watchlist/:stockTicker/tags', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const stockTicker = String(req.params.stockTicker || '').trim().toUpperCase();
        const allowedTags = new Set(['core', 'swing', 'earnings', 'income']);
        const requestedTags = Array.isArray(req.body?.tags) ? req.body.tags : [];
        const tags = [...new Set(requestedTags.map((tag) => String(tag).trim().toLowerCase()))];

        if (!token) {
            return res.status(401).json({ message: 'Missing token' });
        }

        if (!stockTicker) {
            return res.status(400).json({ message: 'Stock ticker is required' });
        }

        if (tags.some((tag) => !allowedTags.has(tag))) {
            return res.status(400).json({ message: 'Research tags contain an unsupported value' });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            try {
                const { username } = decodedToken.UserInfo;
                const user = await User.findOne({ username });

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                if (!user.watchlist.includes(stockTicker)) {
                    return res.status(400).json({ message: 'Add the symbol to your watchlist before saving tags' });
                }

                const existingTags = user.watchlistTags.find((item) => item.ticker === stockTicker);

                if (tags.length === 0 && existingTags) {
                    user.watchlistTags.pull(existingTags._id);
                } else if (existingTags) {
                    existingTags.tags = tags;
                    existingTags.updatedAt = new Date();
                } else if (tags.length > 0) {
                    user.watchlistTags.push({ ticker: stockTicker, tags, updatedAt: new Date() });
                }

                await user.save();

                res.status(200).json({
                    watchlist: user.watchlist,
                    tags: serializeWatchlistTags(user.watchlistTags)
                });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/watchlist/:stockTicker/trade-plan', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const stockTicker = String(req.params.stockTicker || '').trim().toUpperCase();
        const requestedPlan = req.body?.plan;
        const shouldClearPlan = requestedPlan === null;
        const entry = Number(requestedPlan?.entry);
        const stop = Number(requestedPlan?.stop);
        const target = Number(requestedPlan?.target);
        const isLongPlan = stop < entry && entry < target;
        const isShortPlan = target < entry && entry < stop;

        if (!token) {
            return res.status(401).json({ message: 'Missing token' });
        }

        if (!stockTicker) {
            return res.status(400).json({ message: 'Stock ticker is required' });
        }

        if (!shouldClearPlan && (
            !Number.isFinite(entry) ||
            !Number.isFinite(stop) ||
            !Number.isFinite(target) ||
            entry <= 0 ||
            stop <= 0 ||
            target <= 0 ||
            (!isLongPlan && !isShortPlan)
        )) {
            return res.status(400).json({
                message: 'Trade plans require positive long or short entry, stop, and target levels'
            });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            try {
                const { username } = decodedToken.UserInfo;
                const user = await User.findOne({ username });

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                if (!user.watchlist.includes(stockTicker)) {
                    return res.status(400).json({ message: 'Add the symbol to your watchlist before saving a trade plan' });
                }

                const existingPlan = user.watchlistTradePlans.find((item) => item.ticker === stockTicker);

                if (shouldClearPlan && existingPlan) {
                    user.watchlistTradePlans.pull(existingPlan._id);
                } else if (existingPlan) {
                    existingPlan.entry = entry;
                    existingPlan.stop = stop;
                    existingPlan.target = target;
                    existingPlan.updatedAt = new Date();
                } else if (!shouldClearPlan) {
                    user.watchlistTradePlans.push({
                        ticker: stockTicker,
                        entry,
                        stop,
                        target,
                        updatedAt: new Date()
                    });
                }

                await user.save();

                res.status(200).json({
                    watchlist: user.watchlist,
                    tradePlans: serializeWatchlistTradePlans(user.watchlistTradePlans)
                });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/watchlist/:stockTicker', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Missing token' });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            const { username } = decodedToken.UserInfo;
            const stockTicker = String(req.params.stockTicker || '').trim().toUpperCase();

            const user = await User.findOneAndUpdate(
                { username },
                {
                    $pull: {
                        watchlist: stockTicker,
                        watchlistNotes: { ticker: stockTicker },
                        watchlistTags: { ticker: stockTicker },
                        watchlistTradePlans: { ticker: stockTicker }
                    }
                },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({
                watchlist: user.watchlist,
                notes: serializeWatchlistNotes(user.watchlistNotes),
                tags: serializeWatchlistTags(user.watchlistTags),
                tradePlans: serializeWatchlistTradePlans(user.watchlistTradePlans)
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
