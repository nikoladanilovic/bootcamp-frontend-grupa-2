import React, { useState } from 'react';
import axios from 'axios';

export default function UserAuthForm({ setUser, setError }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        // Login: Use the new login endpoint
        const response = await axios.post('https://localhost:7181/api/userscontroler/login', {
          email,
          password,
        });
        const user = response.data;
        setUser({ id: user.id, username: user.username });
        localStorage.setItem('user', JSON.stringify({ id: user.id, username: user.username }));
        alert('Login successful!');
      } else {
        // Registration: Send user data without id
        const userData = [{
          username,
          email,
          password,
        }];

        await axios.post('https://localhost:7181/api/userscontroler/create-user', userData);
        setUser({ username });
        localStorage.setItem('user', JSON.stringify({ username }));
        alert('Registration successful! You are now logged in.');
        setIsLogin(true); // Switch to login mode after registration
      }

      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.response) {
        if (error.response.status === 400) {
          setError('Invalid data. Username or email may already exist.');
        } else if (error.response.status === 401) {
          setError('Invalid email or password.');
        } else if (error.response.status === 404) {
          setError('Authentication endpoint not found. Please check the backend server.');
        } else {
          setError(isLogin ? 'Login failed. Please try again.' : 'Registration failed. Please try again.');
        }
      } else {
        setError('Network error. Please ensure the backend server is running.');
      }
    }
  };

  return (
    <div className="container m-5 p-4 rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <button
        type="button"
        className="mt-2 text-blue-600 underline"
        onClick={() => {
          setIsLogin(!isLogin);
          setError(null);
          setUsername('');
          setEmail('');
          setPassword('');
        }}
      >
        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
      </button>
    </div>
  );
}