import React from 'react';

const StockNews = ({ stockData }) => {

    const newsData = stockData.news

    const newsItems = newsData.feed ? newsData.feed.slice(0, 5) : [];

    return (

        <section className="text-center md:text-left mt-10">


            {newsItems && newsItems.length > 0 ? (
                newsItems.map((item, index) => (
                    <div className="mb-6 flex flex-wrap p-0" key={index}>
                        <div className="mb-6 w-full shrink-0 grow-0 basis-auto px-3 md:mb-0 md:w-3/12 content-center">
                            <div
                                className="relative mb-6 overflow-hidden rounded-lg bg-cover bg-no-repeat shadow-lg dark:shadow-black/20 content-center"
                                data-te-ripple-color="light"
                            >
                                <img src={item.banner_image} className="w-full" alt="Article Banner"/>
                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                    <div
                                        className="absolute top-0 right-0 bottom-0 left-0 h-full w-full overflow-hidden bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-100 bg-[hsla(0,0%,98.4%,.15)]"></div>
                                </a>
                            </div>
                        </div>

                        <div
                            className="mb-6 w-full shrink-0 grow-0 basis-auto px-3 md:mb-0 md:w-9/12">
                            <h5 className="mb-3 text-lg font-bold text-white">{item.title}</h5>
                            <div
                                className="mb-3 flex items-center justify-center text-sm font-medium text-danger dark:text-danger-500 md:justify-start ">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth="2"
                                     className="mr-2 h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25"/>
                                </svg>
                                {item.category}
                            </div>
                            <p className="mb-6 dark:text-neutral-300 text-gray-300">
                                <small>
                                    Published by {item.authors}
                                </small>
                            </p>
                            <p className="text-gray-300 dark:text-neutral-300">{item.summary}</p>

                        </div>

                        <hr className="border-white my-6 w-full"/>

                    </div>


                ))
            ) : (
                <p>Loading...</p>
            )}

        </section>

    );
};

export default StockNews;
