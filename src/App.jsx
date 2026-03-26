import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase, checkIsAdmin } from './lib/supabase';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/Dashboard';
import DrawParticipation from './pages/user/DrawParticipation';
import './styles/charity-cards.css';

// Home Page Component
function HomePage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const { data } = await supabase
        .from('charities')
        .select('*')
        .order('featured', { ascending: false });
      setCharities(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: '50px', padding: '8px 20px', marginBottom: '20px' }}>
            <span>✨ Making Golf Matter</span>
          </div>
          <h1>
            Turn Your Game Into<br />
            <span style={{ background: 'linear-gradient(135deg, #ffd89b 0%, #c7e9fb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Life-Changing Impact
            </span>
          </h1>
          <p>
            Every swing helps a cause. Every score enters you to win.<br />
            Golf with purpose, win with impact.
          </p>
          <div className="hero-buttons">
            <a href="/pricing" className="btn-primary">Start Your Journey →</a>
            <a href="/how-it-works" className="btn-secondary">How It Works</a>
          </div>
        </div>
      </div>

      {/* Charities Section */}
      <div className="charities-container">
        <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '40px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '15px', color: '#2d3748' }}>
            Choose Your <span style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Impact</span>
          </h2>
          <p style={{ fontSize: '18px', color: '#718096', maxWidth: '600px', margin: '0 auto' }}>
            Support a cause you care about. 10% of your subscription goes directly to your chosen charity.
          </p>
        </div>

        {loading ? (
          <div className="spinner">
            <div className="spinner-circle"></div>
            <p style={{ marginTop: '20px', color: '#718096' }}>Loading charities...</p>
          </div>
        ) : (
          <div className="charities-grid">
            {charities.map((charity, index) => (
              <CharityCard key={charity.id} charity={charity} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-value">$2.3M+</div>
            <div className="stat-label">Charity Impact</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">$50K+</div>
            <div className="stat-label">Monthly Prizes</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">5,000+</div>
            <div className="stat-label">Active Golfers</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">45+</div>
            <div className="stat-label">Charity Partners</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <h3 style={{ fontSize: '32px', marginBottom: '15px', color: '#2d3748' }}>
          Ready to Make a Difference?
        </h3>
        <p style={{ fontSize: '18px', marginBottom: '30px', color: '#718096' }}>
          Join thousands of golfers who are changing lives with every swing.
        </p>
        <a href="/register" className="cta-button">
          Subscribe Now →
        </a>
      </div>
    </div>
  );
}

// Charity Card Component
function CharityCard({ charity, index }) {
  const gradients = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5', 'gradient-6'];
  const gradientClass = gradients[index % gradients.length];

  return (
    <div className="charity-card">
      <div className={`card-header ${gradientClass}`}>
        {charity.featured && (
          <div className="featured-badge">
            ⭐ Featured
          </div>
        )}
      </div>
      
      <div className="card-content">
        <h3 className="charity-name">{charity.name}</h3>
        <p className="charity-description">
          {charity.description}
        </p>
        
        <div className="stats-row">
          <div className="stat-item">🌍 Global Impact</div>
          <div className="stat-item">✅ Verified</div>
        </div>
        
        <div className="impact-section">
          <div className="impact-header">
            <span>Monthly Impact Goal</span>
            <span className="impact-percentage">78%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '78%' }}></div>
          </div>
        </div>
        
        <button className="select-button" onClick={() => alert('Please login to select this charity')}>
          Select This Charity
        </button>
      </div>
    </div>
  );
}

// How It Works Page
function HowItWorks() {
  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>How It Works</h1>
        <div style={{ display: 'grid', gap: '2rem' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>1️⃣</div>
            <h3>Subscribe Monthly or Yearly</h3>
            <p>Choose a plan that fits your needs. 10% goes to charity automatically.</p>
          </div>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>2️⃣</div>
            <h3>Enter Your Golf Scores</h3>
            <p>Track your Stableford scores (1-45) and see your progress over time.</p>
          </div>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>3️⃣</div>
            <h3>Participate in Monthly Draws</h3>
            <p>Every active subscriber is automatically entered into our monthly prize draws.</p>
          </div>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>4️⃣</div>
            <h3>Win & Make Impact</h3>
            <p>Win prizes while supporting causes you care about. Golf with purpose!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pricing Page
function Pricing() {
  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem' }}>Simple, Transparent Pricing</h1>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '3rem' }}>Choose the plan that works for you</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Monthly</h2>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>$19.99<span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/month</span></div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
              <li style={{ padding: '0.5rem 0' }}>✓ Score tracking</li>
              <li style={{ padding: '0.5rem 0' }}>✓ Monthly draw entry</li>
              <li style={{ padding: '0.5rem 0' }}>✓ 10% charity contribution</li>
              <li style={{ padding: '0.5rem 0' }}>✓ Full dashboard access</li>
            </ul>
            <a href="/register" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)', color: 'white', padding: '0.75rem 2rem', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>
              Get Started
            </a>
          </div>
          
          <div style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: 'white', transform: 'scale(1.05)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '20px', background: '#ffd700', color: '#333', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>BEST VALUE</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Yearly</h2>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>$199.99<span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/year</span></div>
            <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '14px' }}>Save $39.89</div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
              <li style={{ padding: '0.5rem 0' }}>✓ All monthly features</li>
              <li style={{ padding: '0.5rem 0' }}>✓ 2 months free</li>
              <li style={{ padding: '0.5rem 0' }}>✓ Priority support</li>
              <li style={{ padding: '0.5rem 0' }}>✓ Early draw access</li>
            </ul>
            <a href="/register" style={{ display: 'inline-block', background: 'white', color: '#ff6b6b', padding: '0.75rem 2rem', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Charities Page
function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharities = async () => {
      const { data } = await supabase.from('charities').select('*');
      setCharities(data || []);
      setLoading(false);
    };
    fetchCharities();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc', padding: '4rem 2rem' }}>
      <div className="charities-container">
        <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>Our Charity Partners</h1>
        {loading ? (
          <div className="spinner"><div className="spinner-circle"></div></div>
        ) : (
          <div className="charities-grid">
            {charities.map((charity, index) => (
              <CharityCard key={charity.id} charity={charity} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="spinner"><div className="spinner-circle"></div></div>;
  return user ? children : <Navigate to="/login" />;
}

// Admin Route Component - Uses is_admin column
function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Check if user is admin
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.is_admin === true);
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-circle"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2>Access Denied</h2>
          <p style={{ color: '#718096', marginTop: '10px' }}>
            You don't have permission to access the admin panel.
          </p>
          <a href="/dashboard" style={{ display: 'inline-block', marginTop: '20px', color: '#ff6b6b' }}>
            Go to Dashboard →
          </a>
        </div>
      </div>
    );
  }
  
  return children;
}

// Main App Component with ALL Routes
function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/charities" element={<CharitiesPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected User Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/draws" element={
          <ProtectedRoute>
            <DrawParticipation />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </ProtectedRoute>
        } />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;