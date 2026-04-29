import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [songs, setSongs] = useState([]);
  const [keyboards, setKeyboards] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState({ approved: false, admin: false });
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({ 
    song_name: '', beat_name: '', keyboard_id: '', tempo: '', key: '', location: '', notes: '' 
  });

  useEffect(() => {
    const initialize = async () => {
      await checkUser();
      await fetchSongs();
      await fetchKeyboards();
    };
    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        await checkRole(session.user.id, session.user.email);
      } else {
        setUser(null);
        setRole({ approved: false, admin: false });
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      await checkRole(session.user.id, session.user.email);
    }
  }

  async function checkRole(userId, userEmail) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_approved, is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setRole({ approved: data.is_approved, admin: data.is_admin });
        if (data.is_admin) fetchAllProfiles();
      } else {
        await supabase.from('profiles').upsert({ id: userId, email: userEmail });
      }
    } catch (err) {
      console.error("Role check error:", err.message);
    }
  }

  async function fetchAllProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('email');
    setProfiles(data || []);
  }

  async function toggleStatus(pId, field, current) {
    await supabase.from('profiles').update({ [field]: !current }).eq('id', pId);
    fetchAllProfiles();
  }

  async function fetchSongs() {
    const { data } = await supabase
      .from('songs')
      .select(`
        *,
        styles (
          *,
          keyboards (model_name)
        )
      `)
      .order('song_name');
    setSongs(data || []);
  }

  async function fetchKeyboards() {
    const { data } = await supabase.from('keyboards').select('*');
    setKeyboards(data || []);
  }

  async function handleAuth(e) {
    e.preventDefault();
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Account request sent! Please wait for admin approval.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  }

  async function deleteEntry(table, id) {
    if (!role.approved) return;
    if (window.confirm("Are you sure you want to delete this?")) {
      await supabase.from(table).delete().eq('id', id);
      fetchSongs();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!role.approved) return alert("Your account is not yet approved for editing.");
    
    try {
      // 1. Upsert Song (uses UNIQUE constraint on song_name)
      const { data: songData, error: songErr } = await supabase
        .from('songs')
        .upsert({ song_name: formData.song_name }, { onConflict: 'song_name' })
        .select()
        .single();

      if (songErr) throw songErr;
    
      // 2. Insert Style
      const { error: styleErr } = await supabase.from('styles').insert([{
        song_id: songData.id,
        keyboard_id: formData.keyboard_id,
        beat_name: formData.beat_name,
        tempo: formData.tempo || null,
        musical_key: formData.key,
        keyboard_location: formData.location,
        notes: formData.notes
      }]);

      if (styleErr) throw styleErr;

      setFormData({ song_name: '', beat_name: '', keyboard_id: '', tempo: '', key: '', location: '', notes: '' });
      fetchSongs();
      alert("Settings saved!");
    } catch (err) {
      alert(err.message);
    }
  }

  const Badge = ({ text, color }) => (
    <span style={{ background: color, color: '#fff', padding: '3px 10px', borderRadius: '15px', fontSize: '0.75rem', marginLeft: '10px' }}>{text}</span>
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '850px', margin: '0 auto', color: '#333' }}>
      <style>{`
        @media print { .no-print { display: none !important; } }
        input, select, textarea { width: 100%; padding: 12px; margin: 5px 0; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-family: inherit; }
        button { cursor: pointer; border-radius: 6px; border: none; font-weight: 600; transition: opacity 0.2s; padding: 10px 15px; }
        button:hover { opacity: 0.9; }
        .card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: white; margin-bottom: 20px; }
        .card-header { background: #f8f9fa; padding: 10px 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>
          🎹 My Beat Library
          {user && (
            role.admin ? <Badge text="ADMIN" color="#d32f2f" /> : 
            role.approved ? <Badge text="APPROVED" color="#2e7d32" /> : 
            <Badge text="PENDING" color="#f57c00" />
          )}
        </h1>
        <div className="no-print">
          <button onClick={() => window.print()} style={{ background: '#eee', marginRight: '10px' }}>Print List</button>
          {user && <button onClick={() => supabase.auth.signOut()} style={{ background: '#f44336', color: 'white' }}>Logout</button>}
        </div>
      </div>

      {/* Admin Control */}
      {role.admin && (
        <div className="no-print" style={{ background: '#fff3e0', border: '1px solid #ffe0b2', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
          <h3 style={{ marginTop: 0 }}>👑 Admin Control Panel</h3>
          {profiles.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #ffcc80' }}>
              <span style={{ fontSize: '0.9rem' }}>{p.email}</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => toggleStatus(p.id, 'is_approved', p.is_approved)} style={{ fontSize: '0.7rem', background: p.is_approved ? '#fb8c00' : '#4caf50', color: 'white' }}>
                  {p.is_approved ? 'Revoke' : 'Approve'}
                </button>
                <button onClick={() => toggleStatus(p.id, 'is_admin', p.is_admin)} style={{ fontSize: '0.7rem', background: '#5d4037', color: 'white' }}>
                  {p.is_admin ? 'Remove Admin' : 'Make Admin'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Login Section */}
      {!user && (
        <div style={{ background: '#f5f5f5', padding: '25px', borderRadius: '10px', marginBottom: '30px', textAlign: 'center' }}>
          <h2 style={{ marginTop: 0 }}>{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
          <form onSubmit={handleAuth} style={{ maxWidth: '350px', margin: '0 auto', display: 'grid', gap: '10px' }}>
            <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
            <button type="submit" style={{ background: '#1a237e', color: 'white' }}>
              {authMode === 'login' ? 'Login' : 'Request Access'}
            </button>
          </form>
          <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ cursor: 'pointer', color: '#1a237e', marginTop: '15px', textDecoration: 'underline' }}>
            {authMode === 'login' ? "New? Create account" : "Have account? Login"}
          </p>
        </div>
      )}

      {/* Main Content */}
      {user && (
        <>
          <div className="no-print" style={{ marginBottom: '20px' }}>
            <input 
              placeholder="🔍 Search for a song title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: '1.1rem', border: '2px solid #1a237e' }}
            />
          </div>

          {role.approved && (
            <form onSubmit={handleSubmit} className="no-print" style={{ background: '#e8eaf6', padding: '20px', borderRadius: '8px', marginBottom: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <h3 style={{ gridColumn: '1 / -1', margin: 0 }}>Add New Beat Settings</h3>
              <input placeholder="Song Name" value={formData.song_name} onChange={e => setFormData({...formData, song_name: e.target.value})} required />
              <input placeholder="Beat Name (e.g. 8-Beat Modern)" value={formData.beat_name} onChange={e => setFormData({...formData, beat_name: e.target.value})} required />
              <select value={formData.keyboard_id} onChange={e => setFormData({...formData, keyboard_id: e.target.value})} required>
                <option value="">Select Keyboard</option>
                {keyboards.map(k => <option key={k.id} value={k.id}>{k.model_name}</option>)}
              </select>
              <input placeholder="Tempo (BPM)" type="number" value={formData.tempo} onChange={e => setFormData({...formData, tempo: e.target.value})} />
              <input placeholder="Key" value={formData.key} onChange={e => setFormData({...formData, key: e.target.value})} />
              <input placeholder="Location on Keyboard" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              <textarea placeholder="Notes (Fill levels, variations, etc.)" style={{ gridColumn: '1 / -1' }} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              <button type="submit" style={{ gridColumn: '1 / -1', background: '#2e7d32', color: 'white' }}>Save to Library</button>
            </form>
          )}

          <div style={{ display: 'grid', gap: '15px' }}>
            {songs
              .filter(s => s.song_name.toLowerCase().includes(search.toLowerCase()))
              .map(song => (
                <div key={song.id} className="card">
                  <div className="card-header">
                    <strong style={{ fontSize: '1.2rem' }}>{song.song_name}</strong>
                    {role.admin && <button onClick={() => deleteEntry('songs', song.id)} style={{ color: '#d32f2f', background: 'none' }}>Delete Song</button>}
                  </div>
                  <div style={{ padding: '15px' }}>
                    {song.styles?.length > 0 ? song.styles.map(style => (
                      <div key={style.id} style={{ marginBottom: '15px', borderBottom: '1px dotted #ccc', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold', color: '#1a237e' }}>{style.beat_name}</span>
                          <span style={{ fontSize: '0.8rem', color: '#666' }}>{style.keyboards?.model_name}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.85rem', marginTop: '5px' }}>
                          <div>⏱ {style.tempo || '--'} BPM</div>
                          <div>🎼 Key: {style.musical_key || '--'}</div>
                          <div>📍 {style.keyboard_location || '--'}</div>
                        </div>
                        {style.notes && <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#777', margin: '5px 0' }}>{style.notes}</p>}
                        {role.approved && <button onClick={() => deleteEntry('styles', style.id)} style={{ padding: 0, color: 'red', background: 'none', fontSize: '0.7rem' }}>Remove Style</button>}
                      </div>
                    )) : <p style={{ fontSize: '0.8rem', color: '#999' }}>No styles added yet.</p>}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
