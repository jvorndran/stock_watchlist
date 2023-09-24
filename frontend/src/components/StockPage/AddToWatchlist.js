import React, { useState } from 'react';
import axios from 'axios';
import '../style/add-to-watchlist-button-style.css'
import '../../index.css'

const AddToWatchlist = ({stockTicker}) => {

    const [isClicked, setIsClicked] = useState(false);

    const handleAddToWatchlist = async () => {

        setIsClicked(true)

        try {

            await axios.post(
                'http://localhost:3500/watchlist',
                { stockTicker },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
                    },
                }
            );

            console.log('Stock added to watchlist!');

        } catch (error) {

            console.error(error);
            setIsClicked(false)
        }
    };

    return (
        <button className={`watchlist-btn ${isClicked ? 'circle': ''}`} onClick={handleAddToWatchlist}>

            {isClicked ? (
                <span className="checkmark">✓</span>
            ) : (
                'Add to Watchlist'
            )}

        </button>
    );
}


export default AddToWatchlist;