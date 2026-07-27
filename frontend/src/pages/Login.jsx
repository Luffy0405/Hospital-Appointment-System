import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(email, password);
      if (data.role === 'doctor') navigate('/doctor');
      else if (data.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-clinical-900 mb-6">Log in</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-clinical-100 rounded-lg p-6 space-y-4">
        {error && <p className="text-alert-500 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-clinical-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-clinical-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinical-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-clinical-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-clinical-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinical-400"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-clinical-600 hover:bg-clinical-700 text-white py-2.5 rounded-md font-medium disabled:opacity-60"
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="text-sm text-clinical-600 mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-clinical-700 font-medium underline">
          Sign up
        </Link>
      </p>
      <div className="mt-6 text-xs text-clinical-500 bg-clinical-100 rounded-md p-3">
        Demo logins (after running the seed script): patient@example.com,
        rahul.mehta@example.com, admin@example.com — password: password123
      </div>
    </div>
  );
};

export default Login;
