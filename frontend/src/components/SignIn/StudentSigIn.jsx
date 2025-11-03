import { useState, useRef } from 'react';
import axios from 'axios';
import { URL } from '../utils/helper';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const StudentSignIn = ({role}) => {
  const user =( role==="user"?"student":role);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef();
  const navigate = useNavigate();

  async function submitData(event) {
    event.preventDefault();
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is not valid';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password)
    ) {
      newErrors.password = 'Password must be 8-15 characters with uppercase, lowercase, number, and special character';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        await axios.post(URL + `${user}/signup`, {
          firstName,
          lastName,
          email,
          password,
        });
        toast.success('Registered Successfully! 🎉');
        navigate('/login');
      } catch (err) {
        console.log(err)
        const errorMessage = err?.response?.data?.message || 'Registration failed';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  }

  function emailDebouncing(event) {
    const value = event.target.value;
    setEmail(value);
    setErrors(prev => ({ ...prev, email: undefined })); //previos ga vunna email erros ni clear chey
    
    clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(async () => {
      if (value.trim()) {
        try {
        const result =   await axios.get(URL + `user/email-exist?email=${value}`,{ withCredentials: true });
        console.log(result)
        } catch (err) {
          console.log(err)
          setErrors(prev => ({ ...prev, email: err.response?.data?.message }));
        }
      }
    }, 500);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
         { user.charAt(0).toUpperCase() + user.slice(1)} Sign Up
        </h2>

        <form onSubmit={submitData} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              className="border border-gray-300 rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={e => setFirstName(e.target.value)}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              className="border border-gray-300 rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={e => setLastName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              className="border border-gray-300 rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={emailDebouncing}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              className="border border-gray-300 rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={e => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/log-in" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentSignIn;