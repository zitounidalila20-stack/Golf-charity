import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, checkIsAdmin } from '../lib/supabase';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        const admin = await checkIsAdmin(currentUser.id);
        setIsAdmin(admin);
      }
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        const admin = await checkIsAdmin(currentUser.id);
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    navigate('/');
  };

  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <Link to="/" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textDecoration: 'none',
        }}>
          ⛳ Golf Charity
        </Link>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>

        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }} className="nav-links">
          <Link to="/" style={{ textDecoration: 'none', color: '#4a5568' }}>Home</Link>
          <Link to="/charities" style={{ textDecoration: 'none', color: '#4a5568' }}>Charities</Link>
          <Link to="/how-it-works" style={{ textDecoration: 'none', color: '#4a5568' }}>How It Works</Link>
          <Link to="/pricing" style={{ textDecoration: 'none', color: '#4a5568' }}>Pricing</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" style={{ textDecoration: 'none', color: '#4a5568' }}>Dashboard</Link>
              {isAdmin && (
                <Link to="/admin" style={{
                  background: '#ff6b6b',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}>
                  Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                cursor: 'pointer',
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                textDecoration: 'none',
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                background: 'transparent',
                color: '#ff6b6b',
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                textDecoration: 'none',
                border: '2px solid #ff6b6b',
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          .nav-links {
            display: ${isMenuOpen ? 'flex' : 'none'} !important;
            flex-direction: column !important;
            width: 100% !important;
            margin-top: 1rem !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </nav>
  );
}