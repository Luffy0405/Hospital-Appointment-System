import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath =
    user?.role === 'doctor' ? '/doctor' : user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <nav className="bg-clinical-800 text-clinical-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          MediCare
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/doctors" className="hover:text-clinical-200">
            Find a Doctor
          </Link>
          {user ? (
            <>
              <Link to={dashboardPath} className="hover:text-clinical-200">
                Dashboard
              </Link>
              <span className="text-clinical-300">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="bg-clinical-600 hover:bg-clinical-500 px-3 py-1.5 rounded-md"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-clinical-200">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-clinical-600 hover:bg-clinical-500 px-3 py-1.5 rounded-md"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
