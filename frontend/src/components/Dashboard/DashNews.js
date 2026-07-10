import React, {useEffect, useMemo, useState} from 'react';
import {FaArrowDown, FaArrowUp} from 'react-icons/fa'
import {NewsItem} from "./NewsItem";
import '../style/dash-news-style.css';

const DashNews = ({newsData}) => {

    const [showAdditionalNews, setShowAdditionalNews] = useState(false)
    const [firstNewsData, setFirstNewsData] = useState([]);
    const [additionalNewsData, setAdditionalNewsData] = useState([]);
    const [newsSearch, setNewsSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const normalizedNewsData = useMemo(() => (
        Array.isArray(newsData) ? newsData : []
    ), [newsData]);

    const categoryOptions = useMemo(() => [...new Set(normalizedNewsData
        .map((item) => item.category)
        .filter(Boolean))].sort(), [normalizedNewsData]);

    const filteredNewsData = useMemo(() => {
        const normalizedSearch = newsSearch.trim().toLowerCase();

        return normalizedNewsData.filter((item) => {
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            const searchableText = [
                item.title,
                item.summary,
                item.authors,
                item.category,
            ].filter(Boolean).join(' ').toLowerCase();

            return matchesCategory && (
                normalizedSearch.length === 0 || searchableText.includes(normalizedSearch)
            );
        });
    }, [normalizedNewsData, newsSearch, categoryFilter]);

    useEffect(() => {
        setFirstNewsData(filteredNewsData.slice(0, 4));
        setAdditionalNewsData(filteredNewsData.slice(4, 10));
        setShowAdditionalNews(false);
    }, [filteredNewsData]);

    const showMoreNews = () => {
        setShowAdditionalNews(true)
    }

    const showLessNews = () => {
        setShowAdditionalNews(false)
    }




    return (

        <section className="text-center md:text-left mt-5">

            <div className="dashboard-news-filter">
                <div>
                    <h2>Market News</h2>
                    <span>{filteredNewsData.length} of {normalizedNewsData.length} stories shown</span>
                </div>

                <label>
                    <span>Search</span>
                    <input
                        onChange={(event) => setNewsSearch(event.target.value)}
                        placeholder="Ticker, theme, source"
                        type="search"
                        value={newsSearch}
                    />
                </label>

                <label>
                    <span>Category</span>
                    <select
                        onChange={(event) => setCategoryFilter(event.target.value)}
                        value={categoryFilter}>
                        <option value="all">All Categories</option>
                        {categoryOptions.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </label>
            </div>

            {firstNewsData && firstNewsData.length > 0 ? (
                firstNewsData.map((item, index) => (

                    <NewsItem newsDataItem={item} key={index} />

                ))
            ) : (
                <p className='dashboard-news-empty'>
                    {normalizedNewsData.length > 0 ? 'No market news matches those filters.' : 'Loading...'}
                </p>
            )}

            {additionalNewsData && additionalNewsData.length > 0 && showAdditionalNews && (
                additionalNewsData.map((item, index) =>(

                    <NewsItem newsDataItem={item} key={index + 4} />

                    ))

            )}

            {additionalNewsData.length > 0 && (
            <div className='flex justify-center items-center mb-2'>
                {showAdditionalNews ? (
                    <button onClick={showLessNews} className='text-white'><FaArrowUp /></button>
                ): (
                    <button onClick={showMoreNews} className='text-white'><FaArrowDown /></button>
                )}
            </div>
            )}
        </section>


    );
};


export default React.memo(DashNews)
