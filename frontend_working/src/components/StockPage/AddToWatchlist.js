import React, { useState } from 'react';
import axios from 'axios';
import { CSSTransition } from 'react-transition-group';
import '../style/AddToWatchlistButton.css'
import '../../index.css'

const AddToWatchlist = ({stockTicker}) => {

    const [isClicked, setIsClicked] = useState(false);

    const handleAddToWatchlist = async () => {

        setIsClicked(true)

        try {
            // Send a POST request to backend
            await axios.post(
                'http://localhost:3500/watchlist',
                { stockTicker },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwt')}`, // Include the JWT from localStorage in the Authorization header
                    },
                }
            );
            // Handle the successful addition to the watchlist
            console.log('Stock added to watchlist!');

        } catch (error) {
            // Handle any errors that occur during the API call
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