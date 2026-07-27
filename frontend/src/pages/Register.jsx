import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient',
    specialty: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await register(form);
      navigate(data.role === 'doctor' ? '/doctor' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-clinical-900 mb-6">Create an account</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-clinical-100 rounded-lg p-6 space-y-4">
        {error && <p className="text-alert-500 text-sm">{error}</p>}

        <div className="flex gap-2">
          {['patient', 'doctor'].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setForm({ ...form, role: r })}
              className={`flex-1 py-2 rounded-md text-sm font-medium border ${
                form.role === r
                  ? 'bg-clinical-600 text-white border-clinical-600'
                  : 'border-clinical-200 text-clinical-700'
              }`}
            >
              {r === 'patient' ? "I'm a patient" : "I'm a doctor"}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-clinical-700 mb-1">Full name</label>
          <input
            required
            value={form.name}
            onChange={update('name')}
            className="w-full border border-clinical-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinical-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-clinical-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            className="w-full border border-clinical-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinical-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-clinical-700 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update('password')}
            className="w-full border border-clinical-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinical-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-clinical-700 mb-1">Phone</label>
          <input
            value={form.phone}
            onChange={update('phone')}
            className="w-full border border-clinical-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinical-400"
          />
        </div>

        {form.role === 'doctor' && (
          <>
            <div>
              <label className="block text-sm font-medium text-clinical-700 mb-1">Specialty</label>
              <input
                required
                placeholder="e.g. Cardiology"
                value={form.specialty}
                onChange={update('specialty')}
                className="w-full border border-clinical-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinical-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-clinical-700 mb-1">Department</label>
              <input
                required
                placeholder="e.g. Cardiology"
                value={form.department}
                onChange={update('department')}
                className="w-full border border-clinical-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinical-400"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-clinical-600 hover:bg-clinical-700 text-white py-2.5 rounded-md font-medium disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p className="text-sm text-clinical-600 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-clinical-700 font-medium underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Register;
