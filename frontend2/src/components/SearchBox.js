import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import './style/searchBoxStyle.css';
import '../index.css'




const SearchBox = ({ suggestions }) => {

    const [inputValue, setInputValue] = useState("");
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const navigate = useNavigate();
    const suggestionsContainerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsContainerRef.current &&
                !suggestionsContainerRef.current.contains(event.target)
            ) {
                setFilteredSuggestions([]);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };

    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        const filtered = suggestions.filter((suggestion) =>
            suggestion[0].toLowerCase().startsWith(value.toLowerCase()) ||
            suggestion[1].toLowerCase().startsWith(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
    };

    const handleClick = (value) => {
        setInputValue(value);
        setFilteredSuggestions([]);
    };

    const handleKeyDown = (e) => {
        if (e.keyCode === 40) {
            // Down arrow key
            setActiveSuggestion((prev) =>
                prev < filteredSuggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.keyCode === 38) {
            // Up arrow key
            setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.keyCode === 13) {
            // Enter key
            if (activeSuggestion !== -1) {
                setInputValue(filteredSuggestions[activeSuggestion]);
                setFilteredSuggestions([]);
                redirectToTicker(filteredSuggestions[activeSuggestion]);
            } else {
                redirectToTicker(inputValue);
            }
        }
    };

    const redirectToTicker = (ticker) => {
        navigate(`/dash/${ticker}`);
    };

    const renderSuggestions = () => {
        if (filteredSuggestions.length === 0) {
            return null;
        }

        return (
            <div className='suggestions-container' ref={suggestionsContainerRef}>
                <ul id="suggestions-list" className='suggestionList'>
                    {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                        <li
                            key={suggestion[0]}
                            className='suggestionListItem'
                            onClick={() => handleClick(suggestion)}
                        >
                            <span className="ticker">{suggestion[1]}</span>
                            <span className="name"><b>{suggestion[0]}</b></span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (

        <div className='z-50 search-box-container'>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className='search-input-style'
            />
            <button
                onClick={() => redirectToTicker(String(inputValue).trim().split(',')[0])}
                className="search-box-button align-middle px-5 mx-1 mb-1 overflow-hidden relative group cursor-pointer font-medium"
            >
                <span className="absolute w-64 h-0 transition-all duration-300 origin-center rotate-45 -translate-x-20 bg-blue-400 top-1/2 group-hover:h-64 group-hover:-translate-y-32 ease"></span>
                <span className="relative bg-blue-400 font-semibold transition duration-300 group-hover:text-white ease">
          <FaSearch />
        </span>
            </button>
            {renderSuggestions()}
        </div>

    );
};


export default SearchBox;