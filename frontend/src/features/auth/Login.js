import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../index.css'
import StyledFormButton from "../../components/StyledFormButton";

const inputTailwindStyle = "w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"

const Login = () => {

    const navigate = useNavigate()

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const exampleAccountSignIn = async (e) => {
        e.preventDefault();

        const exampleUsername = 'example'
        const examplePassword = 'password'

        try {

            axios.defaults.withCredentials = true;

            const response = await axios.post('http://localhost:3500/auth', { username: exampleUsername, password: examplePassword });

            // Extract the JWT token from the response
            const token = response.data.accessToken;

            // Store the JWT token in localStorage
            localStorage.setItem('jwt', token);

            navigate('/dash');

        } catch (error) {
            console.error(error);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            // Enable sending and receiving cookies
            axios.defaults.withCredentials = true;

            // Send the login credentials to the server
            const response = await axios.post('http://localhost:3500/auth', { username, password });

            // Reset the form
            setUsername('');
            setPassword('');

            // Extract the JWT token from the response
            const token = response.data.accessToken;

            // Store the JWT token in localStorage
            localStorage.setItem('jwt', token);

            navigate('/dash');

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Sign in to your account
                        </h1>
                        <form className="space-y-4" onSubmit={handleSubmit}>
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
                                    className={inputTailwindStyle} />
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
                                    className={inputTailwindStyle} />
                            </div>

                            <div className="flex justify-center">

                                <StyledFormButton type="submit" text="Login" onClickFunction={handleSubmit} />
                                <StyledFormButton type="submit" text="Example Account" onClickFunction={exampleAccountSignIn} />

                            </div>



                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Don’t have an account yet?{' '}
                                <a
                                    href="/signup"
                                    className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                                >
                                    Sign up
                                </a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>

    );
};



export default Login;
