import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function DrawParticipation() {
  const [draws, setDraws] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: drawsData } = await supabase
      .from('draws')
      .select('*')
      .order('draw_month', { ascending: false });
    
    const { data: entriesData } = await supabase
      .from('draw_entries')
      .select('*')
      .eq('user_id', user?.id);
    
    setDraws(drawsData || []);
    setEntries(entriesData || []);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Draw Participation</h1>
        
        {draws.map(draw => {
          const hasEntered = entries.some(e => e.draw_id === draw.id);
          return (
            <div key={draw.id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{new Date(draw.draw_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  <p>Draw Type: {draw.draw_type}</p>
                  {draw.is_published && draw.winning_numbers && (
                    <p>Winning Number: {draw.winning_numbers.five_match}</p>
                  )}
                </div>
                <div>
                  {hasEntered ? (
                    <span style={{ color: '#48bb78' }}>✓ Entered</span>
                  ) : draw.is_published ? (
                    <span style={{ color: '#a0aec0' }}>Draw Completed</span>
                  ) : (
                    <button style={{
                      background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}>
                      Enter Draw
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}