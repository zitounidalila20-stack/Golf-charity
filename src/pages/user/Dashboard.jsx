import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [charity, setCharity] = useState(null);
  const [winnings, setWinnings] = useState([]);
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newScore, setNewScore] = useState({ score: '', score_date: '' });
  const [editingScore, setEditingScore] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    
    // Get current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    
    if (currentUser) {
      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      setProfile(profileData);
      
      // Get scores (latest 5)
      const { data: scoresData } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('score_date', { ascending: false })
        .limit(5);
      setScores(scoresData || []);
      
      // Get selected charity
      const { data: charityData } = await supabase
        .from('user_charities')
        .select('charity:charities(*), contribution_percentage')
        .eq('user_id', currentUser.id)
        .single();
      setCharity(charityData);
      
      // Get winnings
      const { data: winningsData } = await supabase
        .from('winners')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      setWinnings(winningsData || []);
      
      // Get upcoming draws
      const { data: drawsData } = await supabase
        .from('draws')
        .select('*')
        .eq('is_published', true)
        .order('draw_month', { ascending: false })
        .limit(3);
      setDraws(drawsData || []);
    }
    
    setLoading(false);
  };

  const addScore = async (e) => {
    e.preventDefault();
    if (!newScore.score || !newScore.score_date) return;
    
    const scoreNum = parseInt(newScore.score);
    if (scoreNum < 1 || scoreNum > 45) {
      alert('Score must be between 1 and 45');
      return;
    }
    
    const { error } = await supabase
      .from('scores')
      .insert([{
        user_id: user.id,
        score: scoreNum,
        score_date: newScore.score_date
      }]);
    
    if (!error) {
      setNewScore({ score: '', score_date: '' });
      fetchUserData();
      alert('Score added successfully!');
    } else {
      alert('Error adding score: ' + error.message);
    }
  };

  const updateScore = async (id, score, score_date) => {
    const { error } = await supabase
      .from('scores')
      .update({ score, score_date })
      .eq('id', id);
    
    if (!error) {
      setEditingScore(null);
      fetchUserData();
      alert('Score updated successfully!');
    }
  };

  const deleteScore = async (id) => {
    if (confirm('Are you sure you want to delete this score?')) {
      const { error } = await supabase
        .from('scores')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchUserData();
        alert('Score deleted successfully!');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const calculateDaysUntilRenewal = () => {
    if (!profile?.subscription_end_date) return null;
    const end = new Date(profile.subscription_end_date);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const totalWinnings = winnings.reduce((sum, w) => sum + w.prize_amount, 0);
  const pendingWinnings = winnings.filter(w => w.payment_status === 'pending').reduce((sum, w) => sum + w.prize_amount, 0);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-circle"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p style={{ color: '#718096' }}>Track your scores, support charities, and win prizes!</p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <StatCard 
            icon="🏆" 
            title="Subscription Status" 
            value={profile?.subscription_status === 'active' ? 'Active' : 'Inactive'}
            subtext={profile?.subscription_end_date ? `Renews in ${calculateDaysUntilRenewal()} days` : ''}
            color="#48bb78"
          />
          <StatCard 
            icon="❤️" 
            title="Your Charity" 
            value={charity?.charity?.name || 'Not selected'}
            subtext={`${charity?.contribution_percentage || 10}% contribution`}
            color="#ed64a6"
          />
          <StatCard 
            icon="⭐" 
            title="Recent Scores" 
            value={`${scores.length}/5`}
            subtext={scores[0] ? `Latest: ${scores[0].score} pts` : 'No scores yet'}
            color="#4299e1"
          />
          <StatCard 
            icon="💰" 
            title="Total Winnings" 
            value={`$${totalWinnings}`}
            subtext={`Pending: $${pendingWinnings}`}
            color="#f6ad55"
          />
        </div>

        {/* Score Entry Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Enter Your Latest Score</h2>
          <form onSubmit={addScore} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="number"
              placeholder="Score (1-45)"
              value={newScore.score}
              onChange={(e) => setNewScore({ ...newScore, score: e.target.value })}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
              min="1"
              max="45"
              required
            />
            <input
              type="date"
              value={newScore.score_date}
              onChange={(e) => setNewScore({ ...newScore, score_date: e.target.value })}
              style={{
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
              required
            />
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Add Score
            </button>
          </form>
          <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '0.5rem' }}>
            Keep your latest 5 scores. New scores automatically replace the oldest.
          </p>
        </div>

        {/* Score History */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Score History</h2>
          {scores.length === 0 ? (
            <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>No scores yet. Add your first score above!</p>
          ) : (
            <div>
              {scores.map(score => (
                <div key={score.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #e2e8f0',
                }}>
                  {editingScore === score.id ? (
                    <EditScoreForm
                      score={score}
                      onSave={(s, d) => updateScore(score.id, s, d)}
                      onCancel={() => setEditingScore(null)}
                    />
                  ) : (
                    <>
                      <div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ff6b6b' }}>{score.score}</span>
                        <span style={{ marginLeft: '1rem', color: '#718096' }}>{formatDate(score.score_date)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setEditingScore(score.id)} style={{ color: '#4299e1', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => deleteScore(score.id)} style={{ color: '#fc8181', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Draws */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Upcoming Draws</h2>
          {draws.length === 0 ? (
            <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>No upcoming draws. Check back soon!</p>
          ) : (
            draws.map(draw => (
              <div key={draw.id} style={{
                padding: '1rem',
                background: '#f7fafc',
                borderRadius: '8px',
                marginBottom: '0.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{new Date(draw.draw_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
                    <p style={{ fontSize: '12px', color: '#718096' }}>Draw Type: {draw.draw_type}</p>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: draw.is_published ? '#c6f6d5' : '#fed7d7',
                    borderRadius: '20px',
                    fontSize: '12px',
                  }}>
                    {draw.is_published ? 'Completed' : 'Upcoming'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Winnings */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Winnings</h2>
          {winnings.length === 0 ? (
            <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>No winnings yet. Participate in draws to win!</p>
          ) : (
            winnings.map(win => (
              <div key={win.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f7fafc',
                borderRadius: '8px',
                marginBottom: '0.5rem',
              }}>
                <div>
                  <strong>{win.match_type} Match</strong>
                  <p style={{ fontSize: '12px', color: '#718096' }}>${win.prize_amount}</p>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '12px',
                  background: win.payment_status === 'paid' ? '#c6f6d5' : '#fed7d7',
                  color: win.payment_status === 'paid' ? '#22543d' : '#9b2c2c',
                }}>
                  {win.payment_status === 'paid' ? 'Paid' : 'Pending Verification'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtext, color }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>{icon}</span>
        <h3 style={{ fontSize: '0.875rem', color: '#718096', margin: 0 }}>{title}</h3>
      </div>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{value}</p>
      {subtext && <p style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{subtext}</p>}
    </div>
  );
}

function EditScoreForm({ score, onSave, onCancel }) {
  const [newScore, setNewScore] = useState(score.score);
  const [newDate, setNewDate] = useState(score.score_date);

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
      <input
        type="number"
        value={newScore}
        onChange={(e) => setNewScore(e.target.value)}
        style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', width: '80px' }}
        min="1"
        max="45"
      />
      <input
        type="date"
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
        style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
      />
      <button onClick={() => onSave(parseInt(newScore), newDate)} style={{ padding: '0.5rem 1rem', background: '#48bb78', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
      <button onClick={onCancel} style={{ padding: '0.5rem 1rem', background: '#a0aec0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
    </div>
  );
}