import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import '../styles/Navigation.css';

const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">FreelancerIN</Link>
        
        {currentUser && (
          <>
            <button 
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            
            <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
              <NavLink 
                to="/dashboard" 
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              
              <NavLink 
                to="/add-job" 
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Add Job
              </NavLink>
              
              <NavLink 
                to="/jobs" 
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                My Jobs
              </NavLink>
              
              <button 
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }} 
                className="nav-logout"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;