import React, { useState } from 'react';
import './style/TechButtonStyle.css';
import '../index.css'
const TechButton = () => {
    const [showGrid, setShowGrid] = useState(false);

    const handleClick = () => {
        setShowGrid(!showGrid);
    };

    return (
        <div className="grid justify-center align-middle">

                <button onClick={handleClick} className="text-xl">Tech</button>

                <div className={`grid-container ${showGrid ? 'show' : ''}`}>
                    <div className="grid-item"><img src="/img/icons/java.svg" alt="Java" /> </div>
                    <div className="grid-item"><img src="/img/icons/python.svg" alt="Java" /></div>
                    <div className="grid-item"><img src="/img/icons/javascript.svg" alt="Java" /></div>
                    <div className="grid-item"><img src="/img/icons/php.svg" alt="Java" /></div>
                    <div className="grid-item"><img src="/img/icons/html5.svg" alt="Java" /></div>
                    <div className="grid-item"><img src="/img/icons/nodejs.svg" alt="Java" /></div>
                    <div className="grid-item"><img src="/img/icons/mysql.svg" alt="Java" /></div>
                    <div className="grid-item"><img src="/img/icons/sqlite.svg" alt="Java" /></div>
                    <div className="grid-item"><img src="/img/icons/mongodb.svg" alt="Java" /></div>
                    <div className="grid-item"><img src="/img/icons/react.svg" alt="Java" /></div>
                    <div className="grid-item"><img src="/img/icons/flask.svg" alt="Java" /></div>
                    <div className="grid-item"><img src="/img/icons/express.svg" alt="Java" /></div>
                    <div className="grid-item"><img src="/img/icons/tailwind-css.svg" alt="Java" /></div>
                </div>
        </div>
    );
};

export default TechButton;