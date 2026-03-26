import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    totalCharities: 0,
    totalDraws: 0,
    totalWinners: 0,
    totalPrizePool: 0,
    totalDonations: 0,
  });
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winners, setWinners] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [drawLogic, setDrawLogic] = useState('random');
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    
    // Fetch users
    const { data: profiles } = await supabase.from('profiles').select('*');
    setUsers(profiles || []);
    
    // Fetch charities
    const { data: charitiesData } = await supabase.from('charities').select('*');
    setCharities(charitiesData || []);
    
    // Fetch draws
    const { data: drawsData } = await supabase.from('draws').select('*').order('draw_month', { ascending: false });
    setDraws(drawsData || []);
    
    // Fetch winners
    const { data: winnersData } = await supabase.from('winners').select('*');
    setWinners(winnersData || []);
    
    // Calculate stats
    const activeCount = profiles?.filter(p => p.subscription_status === 'active').length || 0;
    setStats({
      totalUsers: profiles?.length || 0,
      activeSubscribers: activeCount,
      totalCharities: charitiesData?.length || 0,
      totalDraws: drawsData?.length || 0,
      totalWinners: winnersData?.length || 0,
      totalPrizePool: activeCount * 10,
      totalDonations: activeCount * 2,
    });
    
    setLoading(false);
  };

  const addCharity = async () => {
    const name = prompt('Enter charity name:');
    const description = prompt('Enter charity description:');
    if (name && description) {
      const { error } = await supabase.from('charities').insert([{ name, description, featured: false }]);
      if (!error) {
        fetchAllData();
        alert('Charity added successfully!');
      }
    }
  };

  const deleteCharity = async (id) => {
    if (confirm('Are you sure you want to delete this charity?')) {
      const { error } = await supabase.from('charities').delete().eq('id', id);
      if (!error) {
        setCharities(charities.filter(c => c.id !== id));
        alert('Charity deleted successfully');
      }
    }
  };

  const toggleFeatured = async (id, currentFeatured) => {
    const { error } = await supabase
      .from('charities')
      .update({ featured: !currentFeatured })
      .eq('id', id);
    if (!error) {
      fetchAllData();
    }
  };

  const runDrawSimulation = async () => {
    setShowSimulation(true);
    setSimulationResult(null);
    
    // Get active users
    const activeUsers = users.filter(u => u.subscription_status === 'active');
    const totalSubscribers = activeUsers.length;
    const prizePool = totalSubscribers * 10;
    
    // Generate random numbers based on logic
    let winningNumbers;
    if (drawLogic === 'random') {
      winningNumbers = {
        five_match: Math.floor(Math.random() * 45) + 1,
        four_match: Array(4).fill().map(() => Math.floor(Math.random() * 45) + 1),
        three_match: Array(3).fill().map(() => Math.floor(Math.random() * 45) + 1)
      };
    } else {
      // Algorithmic based on most frequent scores
      const { data: scores } = await supabase.from('scores').select('score');
      const frequency = {};
      scores?.forEach(s => { frequency[s.score] = (frequency[s.score] || 0) + 1; });
      const sorted = Object.entries(frequency).sort((a,b) => b[1] - a[1]);
      winningNumbers = {
        five_match: parseInt(sorted[0]?.[0] || Math.floor(Math.random() * 45) + 1),
        four_match: sorted.slice(1,5).map(s => parseInt(s[0])),
        three_match: sorted.slice(5,8).map(s => parseInt(s[0]))
      };
    }
    
    setSimulationResult({
      winningNumbers,
      prizePool: {
        total: prizePool,
        fiveMatch: prizePool * 0.4,
        fourMatch: prizePool * 0.35,
        threeMatch: prizePool * 0.25
      },
      totalSubscribers
    });
  };

  const publishDraw = async () => {
    if (!simulationResult) {
      alert('Please run simulation first');
      return;
    }
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const { error } = await supabase.from('draws').insert([{
      draw_month: currentMonth,
      draw_type: drawLogic,
      winning_numbers: simulationResult.winningNumbers,
      is_published: true,
      published_at: new Date().toISOString()
    }]);
    
    if (!error) {
      alert('Draw published successfully!');
      fetchAllData();
      setShowSimulation(false);
      setSimulationResult(null);
    }
  };

  const verifyWinner = async (winnerId) => {
    const proof = prompt('Enter verification proof URL or notes:');
    if (proof) {
      const { error } = await supabase
        .from('winners')
        .update({ verification_status: 'verified', verification_proof_url: proof })
        .eq('id', winnerId);
      if (!error) {
        fetchAllData();
        alert('Winner verified!');
      }
    }
  };

  const markPaid = async (winnerId) => {
    if (confirm('Mark this winner as paid?')) {
      const { error } = await supabase
        .from('winners')
        .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', winnerId);
      if (!error) {
        fetchAllData();
        alert('Payment marked as completed!');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-circle"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>Manage users, charities, draws, and winners</p>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <StatCard icon="👥" title="Total Users" value={stats.totalUsers} color="#4299e1" />
          <StatCard icon="🏆" title="Active Subscribers" value={stats.activeSubscribers} color="#48bb78" />
          <StatCard icon="❤️" title="Charities" value={stats.totalCharities} color="#ed64a6" />
          <StatCard icon="🎲" title="Total Draws" value={stats.totalDraws} color="#9f7aea" />
          <StatCard icon="🏅" title="Total Winners" value={stats.totalWinners} color="#f6ad55" />
          <StatCard icon="💰" title="Prize Pool" value={`$${stats.totalPrizePool}`} color="#fc8181" />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}>
          {['overview', 'users', 'charities', 'draws', 'winners', 'reports'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                color: activeTab === tab ? '#ff6b6b' : '#718096',
                borderBottom: activeTab === tab ? '2px solid #ff6b6b' : 'none',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2>Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
              <div>
                <h3>Recent Activity</h3>
                <p>Total users registered: {stats.totalUsers}</p>
                <p>Active subscribers: {stats.activeSubscribers}</p>
                <p>Total donations to charity: ${stats.totalDonations}</p>
              </div>
              <div>
                <h3>Draw Statistics</h3>
                <p>Total draws completed: {stats.totalDraws}</p>
                <p>Total winners: {stats.totalWinners}</p>
                <p>Current prize pool: ${stats.totalPrizePool}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead style={{ background: '#f7fafc' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Joined</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Admin</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        background: user.subscription_status === 'active' ? '#c6f6d5' : '#fed7d7',
                        color: user.subscription_status === 'active' ? '#22543d' : '#9b2c2c',
                      }}>
                        {user.subscription_status || 'inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>{user.is_admin ? 'Yes' : 'No'}</td>
                    <td style={{ padding: '1rem' }}>
                      <button style={{ background: '#4299e1', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Charities Tab */}
        {activeTab === 'charities' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2>Charity Management</h2>
              <button onClick={addCharity} style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
              }}>
                ➕ Add Charity
              </button>
            </div>
            {charities.map(charity => (
              <div key={charity.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div style={{ flex: 1 }}>
                  <h3>{charity.name}</h3>
                  <p style={{ color: '#718096', fontSize: '14px' }}>{charity.description}</p>
                  {charity.featured && (
                    <span style={{ background: '#fef5e7', color: '#f6ad55', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => toggleFeatured(charity.id, charity.featured)} style={{
                    background: '#9f7aea',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}>
                    {charity.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button onClick={() => deleteCharity(charity.id)} style={{
                    background: '#fc8181',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Draws Tab */}
        {activeTab === 'draws' && (
          <div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2>Draw Configuration</h2>
              <div style={{ marginTop: '1rem' }}>
                <label>Draw Logic:</label>
                <select
                  value={drawLogic}
                  onChange={(e) => setDrawLogic(e.target.value)}
                  style={{
                    marginLeft: '1rem',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                >
                  <option value="random">Random Generation</option>
                  <option value="algorithmic">Algorithmic (Weighted by Scores)</option>
                </select>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button
                  onClick={runDrawSimulation}
                  style={{
                    background: '#4299e1',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  🎲 Run Simulation
                </button>
                {simulationResult && (
                  <button
                    onClick={publishDraw}
                    style={{
                      background: '#48bb78',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    📢 Publish Draw
                  </button>
                )}
              </div>
            </div>

            {showSimulation && simulationResult && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3>Simulation Results</h3>
                <p><strong>Total Active Subscribers:</strong> {simulationResult.totalSubscribers}</p>
                <p><strong>Total Prize Pool:</strong> ${simulationResult.prizePool.total}</p>
                <p><strong>Winning Numbers:</strong></p>
                <ul>
                  <li>5-Match: {simulationResult.winningNumbers.five_match}</li>
                  <li>4-Match: {simulationResult.winningNumbers.four_match?.join(', ')}</li>
                  <li>3-Match: {simulationResult.winningNumbers.three_match?.join(', ')}</li>
                </ul>
                <p><strong>Prize Distribution:</strong></p>
                <ul>
                  <li>5-Match Pool: ${simulationResult.prizePool.fiveMatch} (40%)</li>
                  <li>4-Match Pool: ${simulationResult.prizePool.fourMatch} (35%)</li>
                  <li>3-Match Pool: ${simulationResult.prizePool.threeMatch} (25%)</li>
                </ul>
              </div>
            )}

            <h3>Previous Draws</h3>
            {draws.map(draw => (
              <div key={draw.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{new Date(draw.draw_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
                    <p style={{ fontSize: '12px', color: '#718096' }}>Type: {draw.draw_type}</p>
                    {draw.winning_numbers && (
                      <p style={{ fontSize: '12px' }}>5-Match: {draw.winning_numbers.five_match}</p>
                    )}
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    background: draw.is_published ? '#c6f6d5' : '#fed7d7',
                    fontSize: '12px',
                  }}>
                    {draw.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Winners Tab */}
        {activeTab === 'winners' && (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead style={{ background: '#f7fafc' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Match Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Prize</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Verification</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Payment</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {winners.map(winner => {
                  const user = users.find(u => u.id === winner.user_id);
                  return (
                    <tr key={winner.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem' }}>{user?.email || winner.user_id} </td>
                      <td style={{ padding: '1rem' }}>{winner.match_type} Match</td>
                      <td style={{ padding: '1rem' }}>${winner.prize_amount}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          background: winner.verification_status === 'verified' ? '#c6f6d5' : '#fed7d7',
                          fontSize: '12px',
                        }}>
                          {winner.verification_status || 'pending'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          background: winner.payment_status === 'paid' ? '#c6f6d5' : '#fed7d7',
                          fontSize: '12px',
                        }}>
                          {winner.payment_status || 'pending'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {winner.verification_status !== 'verified' && (
                          <button onClick={() => verifyWinner(winner.id)} style={{
                            background: '#4299e1',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '0.5rem',
                            fontSize: '12px',
                          }}>
                            Verify
                          </button>
                        )}
                        {winner.verification_status === 'verified' && winner.payment_status !== 'paid' && (
                          <button onClick={() => markPaid(winner.id)} style={{
                            background: '#48bb78',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}>
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2>Reports & Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
              <div>
                <h3>User Statistics</h3>
                <p>Total Registered: {stats.totalUsers}</p>
                <p>Active Subscribers: {stats.activeSubscribers}</p>
                <p>Conversion Rate: {((stats.activeSubscribers / stats.totalUsers) * 100).toFixed(1)}%</p>
              </div>
              <div>
                <h3>Financial Summary</h3>
                <p>Total Prize Pool: ${stats.totalPrizePool}</p>
                <p>Total Donations: ${stats.totalDonations}</p>
                <p>Charities Supported: {stats.totalCharities}</p>
              </div>
              <div>
                <h3>Draw Statistics</h3>
                <p>Total Draws: {stats.totalDraws}</p>
                <p>Total Winners: {stats.totalWinners}</p>
                <p>Average Prize: ${stats.totalWinners ? (stats.totalPrizePool / stats.totalWinners).toFixed(2) : 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>{icon}</span>
        <h3 style={{ fontSize: '0.875rem', color: '#718096', margin: 0 }}>{title}</h3>
      </div>
      <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{value}</p>
    </div>
  );
}