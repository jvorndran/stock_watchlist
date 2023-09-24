import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../index.css';

const Signup = () => {

    const navigate = useNavigate()

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            // Send the form data to the server
            await axios.post('http://localhost:3500/api/signup', { name, username, password });

            // Reset the form
            setName('');
            setUsername('');
            setPassword('');

            navigate('/dash');

        } catch (error) {
            console.error(error);
        }
    };

    return (

        <section>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0" >
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Sign up for an account
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Name:
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={handleNameChange}
                                    required
                                    className="w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Username:
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    required
                                    className="w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Password:
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>


                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="align-middle rounded-3xl px-5 py-2 m-1 overflow-hidden relative group cursor-pointer border-2 font-medium border-black-steel text-indigo-600 text-white"
                                >
                                <span
                                    className="absolute w-64 h-0 transition-all duration-300 origin-center rotate-45 -translate-x-20 bg-black-steel top-1/2 group-hover:h-64 group-hover:-translate-y-32 ease"></span>
                                    <span className="relative text-black-steel font-semibold transition duration-300 group-hover:text-white ease">Sign Up</span>
                                </button>
                            </div>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Already have an account?{' '}
                                <a
                                    href="/"
                                    className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                                >
                                    Login
                                </a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>


    );
};


export default Signup;
