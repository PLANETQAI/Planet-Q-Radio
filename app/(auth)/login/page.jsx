'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../../../context/UserContext'; // Adjusted path
import api from '../../../lib/api'; // Adjusted path

export default function AuthForm() {
  const router = useRouter();
  const { login, fetchUserCredits } = useUser(); // Get login and fetchUserCredits functions from context

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length > 0) validatePassword(newPassword);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (!validatePassword(password)) return;
    setIsLoading(true);

    try {
      // The endpoint for getting a token might be different, e.g., /auth/login
      // Assuming it returns a token and user object: { token, user }
      const response = await api.post('/api/auth/token', {
        email,
        password,
      });

      console.log("The Authentication response is ", response);

      const { token } = response.data; // Only get token from this response
      console.log("The token is ", token);

      if (!token) {
          throw new Error("Authentication failed: No token received");
      }

      // Temporarily set the token in localStorage so the api client can use it for the next call
      localStorage.setItem('token', token); // Direct localStorage set for immediate use

      // Now fetch user data using the obtained token
      const userResponse = await api.get('/api/user/me');
      const fetchedUser = userResponse.data;
      console.log("The fetched user is ", fetchedUser);

      // Call the login function from the context with both fetched user and token
      // The login function will overwrite the localStorage.setItem done above, which is fine.
      login(fetchedUser, token);

      // Fetch user credits after successful login
      await fetchUserCredits();

      toast.success('Login successful!');
      
      // Redirect to the /productions page as requested
      router.push('/productions');
      
      console.log('Successfully logged in and redirected.');

    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <ToastContainer autoClose={1500} draggable closeOnClick />
      <div className="h-screen w-screen flex justify-center items-center">
        <form className="space-y-6 w-full max-w-sm" onSubmit={submitHandler}>
          <h2 className="text-2xl font-bold text-center text-gray-300">Sign in to your account</h2>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-2 block w-full rounded-md px-2 py-1.5 bg-white text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className={`mt-2 block w-full rounded-md px-2 py-1.5 bg-white ${passwordError ? 'ring-red-500' : ''}`}
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
