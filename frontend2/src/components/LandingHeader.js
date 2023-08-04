import './style/LandingHeaderStyle.css'

const LandingHeader = () => {

    const scrollTo = (name) => {
        const targetSection = document.getElementById(name);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return(

        <nav className="bg-transparent">
            <div className="py-4 grid justify-center">

                <div className="name items-start justify-items-start">
                        <h1 style={{fontFamily: "Bradley Hand ITC" }} className="font-bold">Jacob Vorndran</h1>
                </div>


                <div className="flex items-center justify-end justify-self-end nav gap-5">

                    <div>
                        <button
                            onClick={() => scrollTo('aboutMe')}
                            className="bg-blue-500 hover:bg-blue-700 text font-bold rounded-full py-2 px-4">
                            About Me
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={() => scrollTo('skillsSection')}
                            className="bg-blue-500 hover:bg-blue-700 text font-bold rounded-full py-2 px-4"
                        >
                            Skills
                        </button>
                    </div>
                    <div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text font-bold rounded-full py-2 px-4">
                            Resume
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={() => scrollTo('projects')}
                            className="bg-blue-500 hover:bg-blue-700 text font-bold rounded-full py-2 px-4"
                        >
                            Projects
                        </button>
                    </div>
                    <div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text font-bold rounded-full py-2 px-4"
                        >
                            Contact
                        </button>
                    </div>

                </div>

                <div className="links flex items-center justify-end gap-6">
                    <img src="/img/icons/github.svg" alt="github" width="50vw" height="50vh" />
                    <img src="/img/icons/linkedin.svg" alt="linkedin" width="50vw" height="50vh" />
                </div>

            </div>

        </nav>


        )

}


export default LandingHeader