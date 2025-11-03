import axios from 'axios';
import React, { useState } from 'react';
import { URL } from '../utils/helper';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const LogIn = () => {
    
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    };

    const validatePassword = (password) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/.test(password);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error[name]) {
            setError(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newError = {};
        if (!validateEmail(formData.email)) {
            newError.email = "Please enter a valid email address";
        }
        if (!validatePassword(formData.password)) {
            newError.password = "Password must be 8-16 characters with uppercase, lowercase, number and special character";
        }

        if (Object.keys(newError).length !== 0) {
            setError(newError);
            return;
        }

        setLoading(true);
        try {
            const result = await axios.post(
                `${URL}user/login`,
                { email: formData.email, password: formData.password },
                { withCredentials: true }
            );
            toast.success("Login successful!");
            navigate('/dashboard');
        } catch (err) {
            const apiError = err.response?.data?.message || "Login failed. Please try again.";
            toast.error(apiError,{
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col justify-center items-center min-h-screen bg-gray-50'>
            <div className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
                <h1 className='text-2xl font-bold text-center mb-6'>Log In</h1>
                
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                            Email
                        </label>
                        <input
                            id='email'
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            className='border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            required
                        />
                        {error.email && <p className='text-red-500 text-sm mt-1'>{error.email}</p>}
                    </div>

                    <div>
                        <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
                            Password
                        </label>
                        <input
                            id='password'
                            type='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            className='border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            required
                        />
                        {error.password && <p className='text-red-500 text-sm mt-1'>{error.password}</p>}
                    </div>

                    <button
                        type='submit'
                        className='w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className='mt-4 text-center text-sm'>
                    <a href='/forgot-password' className='text-blue-500 hover:underline'>
                        Forgot Password?
                    </a>
                </div>
                
                <div className='mt-2 text-center text-sm text-gray-600'>
                    Don't have an account?{' '}
                    <Link to='/sign-up' className='text-blue-500 hover:underline'>
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LogIn;