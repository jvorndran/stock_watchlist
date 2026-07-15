import React, {useEffect, useMemo, useState} from 'react';
import '../style/stock-news-explorer-style.css';

const getSource = (item) => item.source || item.source_domain || 'Unknown source';
const getAuthors = (item) => Array.isArray(item.authors)
    ? item.authors
    : item.authors ? [item.authors] : [];
const getTopics = (item) => Array.isArray(item.topics)
    ? item.topics.map((topic) => topic.topic).filter(Boolean)
    : [];

const getSentiment = (item) => {
    const label = String(item.overall_sentiment_label || '').toLowerCase();

    if (label.includes('bullish') || label.includes('positive')) {
        return 'positive';
    }

    if (label.includes('bearish') || label.includes('negative')) {
        return 'negative';
    }

    return 'neutral';
};

const formatPublishedDate = (value) => {
    const match = String(value || '').match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);

    if (!match) {
        return 'Publication time unavailable';
    }

    const publishedDate = new Date(Date.UTC(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4]),
        Number(match[5])
    ));

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    }).format(publishedDate);
};

const StockNews = ({ stockData }) => {
    const newsItems = useMemo(() => stockData.news?.feed || [], [stockData.news]);
    const [searchText, setSearchText] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [sentimentFilter, setSentimentFilter] = useState('all');
    const [visibleCount, setVisibleCount] = useState(5);

    const sourceOptions = useMemo(() => (
        [...new Set(newsItems.map(getSource))].sort((first, second) => first.localeCompare(second))
    ), [newsItems]);

    const filteredNewsItems = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();

        return newsItems.filter((item) => {
            const matchesSource = sourceFilter === 'all' || getSource(item) === sourceFilter;
            const matchesSentiment = sentimentFilter === 'all' || getSentiment(item) === sentimentFilter;
            const searchableText = [
                item.title,
                item.summary,
                getSource(item),
                ...getAuthors(item),
                ...getTopics(item)
            ].filter(Boolean).join(' ').toLowerCase();

            return matchesSource && matchesSentiment && (
                normalizedSearch.length === 0 || searchableText.includes(normalizedSearch)
            );
        });
    }, [newsItems, searchText, sentimentFilter, sourceFilter]);

    useEffect(() => {
        setVisibleCount(5);
    }, [searchText, sentimentFilter, sourceFilter]);

    const visibleNewsItems = filteredNewsItems.slice(0, visibleCount);

    return (
        <section className="stock-news-explorer">
            <div className="stock-news-explorer__header">
                <div>
                    <h2>Stock News Explorer</h2>
                    <span>{filteredNewsItems.length} of {newsItems.length} articles match</span>
                </div>
                <button
                    onClick={() => {
                        setSearchText('');
                        setSourceFilter('all');
                        setSentimentFilter('all');
                    }}
                    type="button">
                    Clear Filters
                </button>
            </div>

            <div className="stock-news-explorer__controls">
                <label>
                    <span>Search Articles</span>
                    <input
                        onChange={(event) => setSearchText(event.target.value)}
                        placeholder="Headline, topic, or author"
                        type="search"
                        value={searchText}
                    />
                </label>
                <label>
                    <span>Source</span>
                    <select onChange={(event) => setSourceFilter(event.target.value)} value={sourceFilter}>
                        <option value="all">All Sources</option>
                        {sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}
                    </select>
                </label>
                <label>
                    <span>Sentiment</span>
                    <select onChange={(event) => setSentimentFilter(event.target.value)} value={sentimentFilter}>
                        <option value="all">All Sentiment</option>
                        <option value="positive">Positive / Bullish</option>
                        <option value="neutral">Neutral</option>
                        <option value="negative">Negative / Bearish</option>
                    </select>
                </label>
            </div>

            {visibleNewsItems.length > 0 ? (
                <div className="stock-news-explorer__results">
                    {visibleNewsItems.map((item, index) => {
                        const sentiment = getSentiment(item);

                        return (
                            <article
                                className={`stock-news-card ${item.banner_image ? '' : 'stock-news-card--text-only'}`}
                                key={item.url || `${item.title}-${index}`}>
                                {item.banner_image && (
                                    <a className="stock-news-card__image" href={item.url} target="_blank" rel="noopener noreferrer">
                                        <img src={item.banner_image} alt=""/>
                                    </a>
                                )}
                                <div className="stock-news-card__body">
                                    <div className="stock-news-card__meta">
                                        <span>{getSource(item)}</span>
                                        <span className={`stock-news-card__sentiment stock-news-card__sentiment--${sentiment}`}>
                                            {item.overall_sentiment_label || 'Neutral'}
                                        </span>
                                    </div>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                        <h3>{item.title}</h3>
                                    </a>
                                    <p>{item.summary}</p>
                                    <small>
                                        {formatPublishedDate(item.time_published)}
                                        {getAuthors(item).length ? ` · ${getAuthors(item).join(', ')}` : ''}
                                    </small>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <p className="stock-news-explorer__empty">
                    {newsItems.length ? 'No articles match these news filters.' : 'No recent stock news is available.'}
                </p>
            )}

            {filteredNewsItems.length > 5 && (
                <div className="stock-news-explorer__pagination">
                    {visibleCount < filteredNewsItems.length && (
                        <button onClick={() => setVisibleCount((count) => count + 5)} type="button">Show More</button>
                    )}
                    {visibleCount > 5 && (
                        <button onClick={() => setVisibleCount(5)} type="button">Show First 5</button>
                    )}
                </div>
            )}
        </section>
    );
};

export default StockNews;
