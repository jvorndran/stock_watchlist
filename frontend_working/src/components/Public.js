import React from 'react';
import {Link} from 'react-router-dom';
import '../index.css';

const Public = () => {


    return (
        <section className="public" style={sectionStyle}>
            <header style={headerStyle}>
                <h1 className="text-6xl text-center mt-8 text-black-steel font-extrabold">
                    Welcome to <span className="nowrap">Stock Watchlist</span>
                </h1>
            </header>
            <footer className="flex justify-center mt-8 items-end space-x-8">

                <Link
                    to="/login"
                    className="rounded-3xl px-5 py-2 m-1 overflow-hidden relative group cursor-pointer border-2 font-medium border-black-steel text-indigo-600 text-white"
                >
                     <span
                         className="absolute w-64 h-0 transition-all duration-300 origin-center rotate-45 -translate-x-20 bg-black-steel top-1/2 group-hover:h-64 group-hover:-translate-y-32 ease"></span>
                    <span
                        className="relative text-black-steel font-semibold transition duration-300 group-hover:text-white ease">Login</span>
                </Link>
                <Link
                    to="/signup"
                    className="rounded-3xl px-5 py-2 m-1 overflow-hidden relative group cursor-pointer border-2 font-medium border-black-steel text-indigo-600 text-white"
                >
                    <span
                        className="absolute w-64 h-0 transition-all duration-300 origin-center rotate-45 -translate-x-20 bg-black-steel top-1/2 group-hover:h-64 group-hover:-translate-y-32 ease"></span>
                    <span
                        className="relative text-black-steel font-semibold transition duration-300 group-hover:text-white ease">Sign Up</span>
                </Link>
            </footer>
        </section>
    );
};


const headerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '40%',
    width: '100%',
}

const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100vh',
    padding: '20px',
};




export default Public
