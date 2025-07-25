import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="main-navigation">
      <div className="nav-brand">
        <Link to="/">FreelancerIN</Link>
      </div>
      
      <div className="nav-links">
        {currentUser ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/add-job">Add Job</Link>
            <Link to="/jobs">My Jobs</Link>
            <button onClick={logout} className="nav-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;