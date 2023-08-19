import React, { useEffect }from "react";
import '../index.css';
import ProjectDisplay from "./ProjectDisplay";
import './style/landing-page-style.css';
import TechButton from "./TechButton";
import LandingHeader from "./LandingHeader";

const LandingPage = () => {


    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                } else {
                    entry.target.classList.remove("show");
                }
            });
        });

        const hiddenElements = document.querySelectorAll(".hidden");
        hiddenElements.forEach((el) => observer.observe(el));


        return () => {
            hiddenElements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    return(
        <div>

            <LandingHeader />

            <section className="public section" style={sectionStyle}>
                <header style={headerStyle}>
                    <h1 className="text-6xl text-center mt-8 text-black-steel font-extrabold" >
                        Jacob Vorndran
                    </h1>
                </header>

                <div className="mt-4">
                    <TechButton />
                </div>


                {/*<h4 className="text-4xl text-center mt-8 text-black-steel"><img src="/img/icons/github.svg" alt="git" /> Github</h4>*/}
            </section>


            <section id="aboutMe" className="section" >

                <div className="flex justify-center text-4xl mb-3">
                    About Me
                </div>

                <div className="flex justify-center text-lg mb-28 text-gray-600 ">
                    - Jake V -
                </div>

                <div className="gap-20 justify-center items-center mx-36" id="aboutMeDiv">



                    <div className="flex justify-center">

                        <img src="/img/icons/react.svg" alt="picture" width="30%" height="50%" />

                    </div>

                    <div className="w-10/12">

                        <div className="flex basis-1 mb-6 justify-center gap-20 accomplish-grid">
                            <div className="drop-shadow-lg">
                                dsadsdsd
                            </div>
                            <div className="drop-shadow-lg">
                                dsadsdsd
                            </div>
                            <div className="drop-shadow-lg">
                                dsadsdsd
                            </div>
                        </div>

                        <p>
                            I am currently getting my BS in Computer Science from the University of North Florida. My most impressive
                            skills are in web development, both backend and frontend. I also have above average skills in both Java and
                            C. Everything I wrote in college was written in these two languages.  I fell in love with coding making python
                            scripts for financial market research and eventually moved onto web development.
                        </p>
                    </div>

                </div>
            </section>


            <section style={itemStyle} className="skillsSection" id="skillsSection" >

                <div className="skillsGrid">

                    <div className="col-span-3 text-4xl flex justify-center bg-transparent">
                        Skills
                    </div>


                    <div className="max-w-sm rounded-xl shadow-lg bg-gray-100 skills-grid-item">
                            <div className="flex justify-center items-center my-4">
                                <img src="/img/icons/web-development.svg" alt="frontend" width="50%" height="40%" />
                            </div>
                            <hr />
                            <div className="px-6 py-4">
                                <div className="font-bold text-xl mb-2">Frontend</div>
                                    <div className="frontendSkills text-sm font-light text-gray-700 text-base">
                                        <div><img src="/img/icons/javascript.svg" />Javascript</div>
                                        <div><img src="/img/icons/react.svg" />React</div>
                                        <div><img src="/img/icons/css.svg" />CSS</div>
                                        <div><img src="/img/icons/html5.svg" />HTML</div>
                                        <div><img src="/img/icons/tailwind-css.svg" />Tailwind</div>
                                    </div>
                            </div>


                    </div>

                    <div className="max-w-sm rounded shadow-lg bg-gray-100 skills-grid-item">
                        <div className="flex justify-center items-center my-4">
                            <img src="/img/icons/database.svg" alt="frontend" width="50%" height="40%" />
                        </div>
                        <hr />
                        <div className="px-6 py-4">
                            <div className="font-bold text-xl mb-2">Backend</div>
                            <div className="frontendSkills text-sm font-light text-gray-700 text-base">
                                <div><img src="/img/icons/python.svg" />Python</div>
                                <div><img src="/img/icons/java.svg" />Java</div>
                                <div><img src="/img/icons/php.svg" />PHP</div>
                                <div><img src="/img/icons/nodejs.svg" />Node js</div>
                                <div><img src="/img/icons/express.svg" />Express</div>
                                <div><img src="/img/icons/flask.svg" />Flask</div>
                                <div><img src="/img/icons/mongodb.svg" />MongoDB</div>
                                <div><img src="/img/icons/mysql.svg" />MySQL</div>
                            </div>
                        </div>

                    </div>

                    <div className="max-w-sm rounded shadow-lg bg-gray-100 skills-grid-item">
                        <div className="flex justify-center items-center my-4">
                            <img src="/img/icons/cloud-storage.svg" alt="frontend" width="50%" height="40%" />
                        </div>
                        <hr />
                        <div className="px-6 py-4">
                            <div className="font-bold text-xl mb-2">Other</div>
                            <div className="frontendSkills text-sm font-light text-gray-700 text-base">
                                <div><img src="/img/icons/github.svg" />Github</div>
                                <div><img src="/img/icons/git.svg" />Git</div>
                            </div>
                        </div>

                    </div>

                </div>

            </section>


            <section style={itemStyle} className="hidden section" id="projects">

                <ProjectDisplay tech={['/img/icons/flask.svg', '/img/icons/javascript.svg', '/img/icons/sqlite.svg']}

                                image="/img/projects/project1.png"

                                description="
                                This is my first project. It is a stock screener for a library of stock indicators
                                called DeMark indicators. These indicators work very well but access to them is limited to
                                3 platforms which all cost over $1000 a month, so I decided to implement them myself. They are used
                                by most of the biggest hedge funds and are mostly a secret to people outside of that world, considering the steep paywall.
                                This screener scans 7,000 stocks all around the world and calculates the value for 12 of the indicators.
                                If you want to know more about the indicators there is an explanation for the indicators under the chart.
                                Also, you can click on any stock you want and open up a page with a chart of the stock and a large array of
                                key statistics. It is built with flask, vanilla js, and sqlite.
                                "
                                title="DeMark Indicator Stock Screener"
                />

            </section>

            <section style={itemStyle} className="hidden section">

                <ProjectDisplay tech={['/img/icons/react.svg', '/img/icons/express.svg', '/img/icons/nodejs.svg',
                                        '/img/icons/mongodb.svg', '/img/icons/tailwind-css.svg']}

                                image="/img/projects/project2.png"

                                title="Stock Watchlist"

                                description="
                                This website allows a user to create a account and make a stock watchlist. When logging in
                                you are directed to a dashboard. The user can then search any stock and will be brought to
                                a page where they can look at the stocks chart, recent news, and 15 key statistics. The user
                                can then add that stock to their watchlist. When returning to the dashboard the user will
                                see that stock in the tape under the header. The news feed on the dashboard will now
                                also show news for that user's watchlist. It is built with the MERN stack (MongoDB, Express
                                , React, and Node). Authentication and authorization is done via JSON Web Token. Data is provided
                                by the free API AlphaVantage. It is limited to 5 calls per minute in the free tier so please only add
                                one stock per minute as loading a stock's page takes 3 calls.
                                "

                />


            </section>

            <section>

            </section>

        </div>

    )

}


const headerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'end',
    height: '20%',
    width: '100vw',
}

const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifySelf: 'center',
    height: '100vh',
    width: '95vw',
};
const itemStyle = {
    display: 'grid',
    placeItems: 'center',
    minHeight: '100vh',
    marginLeft: '5vw',
    marginRight: '5vw'
};
export default LandingPage;

