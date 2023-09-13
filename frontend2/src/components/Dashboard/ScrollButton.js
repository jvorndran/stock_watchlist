import React, { useState, useEffect } from 'react';

const ScrollButton = ({}) => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > (window.innerHeight * 0.5)) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleClick = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    };

    return (
        <>
            <button id="scrollButton" onClick={handleClick}>
                Scroll Down
            </button>
        </>
    );
};

export default ScrollButton;