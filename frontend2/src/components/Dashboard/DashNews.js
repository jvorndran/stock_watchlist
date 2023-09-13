import React, {useEffect, useState} from 'react';
import {FaArrowDown, FaArrowUp} from 'react-icons/fa'
import {NewsItem} from "./NewsItem";

const DashNews = ({newsData}) => {

    const [showAdditionalNews, setShowAdditionalNews] = useState(false)
    const [firstNewsData, setFirstNewsData] = useState([]);
    const [additionalNewsData, setAdditionalNewsData] = useState([]);

    useEffect(() => {
        if (newsData.length > 0) {
            setFirstNewsData(newsData.slice(0, 4));
            setAdditionalNewsData(newsData.slice(4, 10));
        }
    }, [newsData]);

    const showMoreNews = () => {
        setShowAdditionalNews(true)
    }

    const showLessNews = () => {
        setShowAdditionalNews(false)
    }




    return (

        <section className="text-center md:text-left mt-5">

            {firstNewsData && firstNewsData.length > 0 ? (
                firstNewsData.map((item, index) => (

                    <NewsItem newsDataItem={item} key={index} />

                ))
            ) : (
                <p className='text-4xl text-white'>Loading...</p>
            )}

            {additionalNewsData && additionalNewsData.length > 0 && showAdditionalNews && (
                additionalNewsData.map((item, index) =>(

                    <NewsItem newsDataItem={item} key={index + 4} />

                    ))

            )}

            <div className='flex justify-center items-center mb-2'>
                {showAdditionalNews ? (
                    <button onClick={showLessNews} className='text-white'><FaArrowUp /></button>
                ): (
                    <button onClick={showMoreNews} className='text-white'><FaArrowDown /></button>
                )}
            </div>
        </section>


    );
};


export default React.memo(DashNews)