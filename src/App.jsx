import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const SUPER_ADMIN_EMAIL = 'enockoloo6@gmail.com';

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
  // Start false — only show loading spinner after we know user is logged in
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    song_name: '', beat_name: '', keyboard_id: '', tempo: '', key: '', location: '', notes: ''
  });

  // Songs and keyboards load immediately for everyone — no auth needed
  useEffect(() => {
    fetchSongs();
    fetchKeyboards();
  }, []);

  // Auth state handled separately so a role-load failure never blocks the song list
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadRole(session.user.id, session.user.email).finally(() => setAuthLoading(false));
      } else {
        setAuthLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadRole(session.user.id, session.user.email);
      } else {
        setUser(null);
        setRole({ approved: false, admin: false });
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  async function loadRole(userId, userEmail) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_approved, is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        const r = { approved: !!profile.is_approved, admin: !!profile.is_admin };
        setRole(r);
        if (r.admin) loadProfiles();
      } else {
        // First time — create a pending profile
        await supabase.from('profiles').insert({
          id: userId,
          email: userEmail,
          is_approved: false,
          is_admin: false
        });
        setRole({ approved: false, admin: false });
      }
    } catch (err) {
      console.error('loadRole error:', err.message);
      setRole({ approved: false, admin: false });
    }
  }

  async function loadProfiles() {
    const { data } = await supabase.rpc('get_all_profiles');
    setProfiles(data || []);
  }

  async function toggleStatus(pId, field, current) {
    // Block any change to the super admin's approved/admin status
    const target = profiles.find(p => p.id === pId);
    if (target?.email === SUPER_ADMIN_EMAIL) return;
    await supabase.from('profiles').update({ [field]: !current }).eq('id', pId);
    loadProfiles();
  }

  async function fetchSongs() {
    const { data } = await supabase
      .from('songs')
      .select(`*, styles (*, keyboards (model_name))`)
      .order('song_name');
    setSongs(data || []);
  }

  async function fetchKeyboards() {
    const { data } = await supabase.from('keyboards').select('*').order('model_name');
    setKeyboards(data || []);
  }

  async function handleAuth(e) {
    e.preventDefault();
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('Account request sent! Please wait for admin approval.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  }

  async function claimAdminBootstrap() {
    if (!user) return;
    const { data: admins } = await supabase
      .from('profiles').select('id').eq('is_admin', true).limit(1);

    if (admins && admins.length > 0) {
      alert('An admin already exists. Ask them to approve you.');
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true, is_admin: true })
      .eq('id', user.id);

    if (error) { alert('Error: ' + error.message); return; }
    setRole({ approved: true, admin: true });
    loadProfiles();
    alert('✅ You are now admin!');
  }

  async function deleteEntry(table, id) {
    if (!role.approved) return;
    if (window.confirm('Are you sure you want to delete this?')) {
      await supabase.from(table).delete().eq('id', id);
      fetchSongs();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!role.approved) return alert('Your account is not yet approved for editing.');
    if (!formData.keyboard_id) return alert('Please select a keyboard.');

    setSaving(true);
    try {
      const { data: songData, error: songErr } = await supabase
        .from('songs')
        .upsert({ song_name: formData.song_name }, { onConflict: 'song_name' })
        .select()
        .single();
      if (songErr) throw songErr;

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
      await fetchSongs();
      alert('✅ Settings saved!');
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const Badge = ({ text, color }) => (
    <span style={{ background: color, color: '#fff', padding: '3px 10px', borderRadius: '15px', fontSize: '0.75rem', marginLeft: '10px' }}>
      {text}
    </span>
  );

  const isSuperAdmin = (profileEmail) => profileEmail === SUPER_ADMIN_EMAIL;

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '850px', margin: '0 auto', color: '#333' }}>
      <style>{`
        @media print { .no-print { display: none !important; } }
        input, select, textarea { width: 100%; padding: 12px; margin: 5px 0; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-family: inherit; font-size: 1rem; }
        button { cursor: pointer; border-radius: 6px; border: none; font-weight: 600; transition: opacity 0.2s; padding: 10px 15px; }
        button:hover { opacity: 0.85; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: white; margin-bottom: 20px; }
        .card-header { background: #f8f9fa; padding: 10px 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>
          🎹 My Beat Library
          {user && !authLoading && (
            role.admin ? <Badge text="ADMIN" color="#d32f2f" /> :
            role.approved ? <Badge text="APPROVED" color="#2e7d32" /> :
            <Badge text="PENDING" color="#f57c00" />
          )}
        </h1>
        <div className="no-print" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => window.print()} style={{ background: '#eee' }}>Print List</button>
          {user
            ? <button onClick={() => supabase.auth.signOut()} style={{ background: '#f44336', color: 'white' }}>Logout</button>
            : <button onClick={() => setAuthMode('login')} style={{ background: '#1a237e', color: 'white' }}>Login</button>
          }
        </div>
      </div>

      {/* Login / Signup */}
      {!user && (
        <div className="no-print" style={{ background: '#f5f5f5', padding: '25px', borderRadius: '10px', marginBottom: '30px', textAlign: 'center' }}>
          <h2 style={{ marginTop: 0 }}>{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
          <form onSubmit={handleAuth} style={{ maxWidth: '350px', margin: '0 auto', display: 'grid', gap: '10px' }}>
            <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
            <button type="submit" style={{ background: '#1a237e', color: 'white' }}>
              {authMode === 'login' ? 'Login' : 'Request Access'}
            </button>
          </form>
          <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            style={{ cursor: 'pointer', color: '#1a237e', marginTop: '15px', textDecoration: 'underline' }}>
            {authMode === 'login' ? 'New? Create account' : 'Have account? Login'}
          </p>
        </div>
      )}

      {/* Bootstrap Banner */}
      {user && !authLoading && !role.approved && !role.admin && (
        <div className="no-print" style={{ background: '#fff8e1', border: '2px dashed #ffa000', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>⚠️ Your account is pending approval.</strong>
          <p style={{ margin: '8px 0 4px', fontSize: '0.9rem' }}>
            If you are the first user and no admin exists yet:
          </p>
          <button onClick={claimAdminBootstrap} style={{ background: '#ffa000', color: 'white' }}>
            🔑 Claim Admin Access
          </button>
        </div>
      )}

      {/* Admin Panel */}
      {role.admin && (
        <div className="no-print" style={{ background: '#fff3e0', border: '1px solid #ffe0b2', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
          <h3 style={{ marginTop: 0 }}>👑 Admin Control Panel</h3>
          {profiles.length === 0 && <p style={{ color: '#999', fontSize: '0.9rem' }}>No profiles found.</p>}
          {profiles.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #ffcc80' }}>
              <span style={{ fontSize: '0.9rem' }}>
                {p.email}
                {isSuperAdmin(p.email) && (
                  <span style={{ marginLeft: 8, fontSize: '0.7rem', background: '#b71c1c', color: 'white', padding: '2px 7px', borderRadius: 10 }}>
                    PROTECTED
                  </span>
                )}
              </span>
              {!isSuperAdmin(p.email) && (
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => toggleStatus(p.id, 'is_approved', p.is_approved)}
                    style={{ fontSize: '0.75rem', background: p.is_approved ? '#fb8c00' : '#4caf50', color: 'white' }}>
                    {p.is_approved ? 'Revoke' : 'Approve'}
                  </button>
                  <button onClick={() => toggleStatus(p.id, 'is_admin', p.is_admin)}
                    style={{ fontSize: '0.75rem', background: '#5d4037', color: 'white' }}>
                    {p.is_admin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search — visible to everyone */}
      <div className="no-print" style={{ marginBottom: '20px' }}>
        <input
          placeholder="🔍 Search for a song title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: '1.1rem', border: '2px solid #1a237e' }}
        />
      </div>

      {/* Add Beat Form — approved users only */}
      {role.approved && (
        <form onSubmit={handleSubmit} className="no-print" style={{ background: '#e8eaf6', padding: '20px', borderRadius: '8px', marginBottom: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <h3 style={{ gridColumn: '1 / -1', margin: 0 }}>➕ Add New Beat Settings</h3>
          <input placeholder="Song Name *" value={formData.song_name} onChange={e => setFormData({ ...formData, song_name: e.target.value })} required />
          <input placeholder="Beat Name (e.g. 8-Beat Modern) *" value={formData.beat_name} onChange={e => setFormData({ ...formData, beat_name: e.target.value })} required />
          <select value={formData.keyboard_id} onChange={e => setFormData({ ...formData, keyboard_id: e.target.value })} required>
            <option value="">Select Keyboard *</option>
            {keyboards.map(k => <option key={k.id} value={k.id}>{k.model_name}</option>)}
          </select>
          <input placeholder="Tempo (BPM)" type="number" value={formData.tempo} onChange={e => setFormData({ ...formData, tempo: e.target.value })} />
          <input placeholder="Key" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} />
          <input placeholder="Location on Keyboard" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
          <textarea placeholder="Notes (Fill levels, variations, etc.)" style={{ gridColumn: '1 / -1' }} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
          <button type="submit" disabled={saving} style={{ gridColumn: '1 / -1', background: '#2e7d32', color: 'white' }}>
            {saving ? '⏳ Saving...' : 'Save to Library'}
          </button>
        </form>
      )}

      {/* Song List — visible to everyone */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {songs.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center' }}>No songs in the library yet.</p>
        )}
        {songs
          .filter(s => s.song_name.toLowerCase().includes(search.toLowerCase()))
          .map(song => (
            <div key={song.id} className="card">
              {/* Song Header */}
              <div className="card-header">
                <div>
                  <strong style={{ fontSize: '1.2rem' }}>{song.song_name}</strong>
                  {song.styles?.length > 0 && (
                    <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#888' }}>
                      {song.styles.length} beat{song.styles.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {role.admin && (
                  <button onClick={() => deleteEntry('songs', song.id)} style={{ color: '#d32f2f', background: 'none' }}>
                    🗑 Delete Song
                  </button>
                )}
              </div>

              {/* Beat list */}
              <div style={{ padding: '0' }}>
                {song.styles?.length > 0 ? song.styles.map((style, idx) => (
                  <div key={style.id} style={{
                    padding: '12px 15px',
                    borderBottom: idx < song.styles.length - 1 ? '1px solid #eee' : 'none',
                    background: idx % 2 === 0 ? '#fff' : '#fafafa'
                  }}>

                    {/* Row 1: Beat name + Location pill side by side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{
                        fontWeight: 'bold', color: '#1a237e', fontSize: '1rem'
                      }}>
                        🥁 {style.beat_name}
                      </span>
                      {style.keyboard_location && (
                        <span style={{
                          background: '#e3f2fd', color: '#1565c0',
                          padding: '2px 10px', borderRadius: '20px',
                          fontSize: '0.78rem', fontWeight: '600',
                          border: '1px solid #90caf9'
                        }}>
                          📍 {style.keyboard_location}
                        </span>
                      )}
                    </div>

                    {/* Row 2: Keyboard model */}
                    <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '5px' }}>
                      🎹 {style.keyboards?.model_name || '--'}
                    </div>

                    {/* Row 3: Tempo + Key */}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#555' }}>
                      <span>⏱ <strong>{style.tempo || '--'}</strong> BPM</span>
                      <span>🎼 Key: <strong>{style.musical_key || '--'}</strong></span>
                    </div>

                    {/* Notes */}
                    {style.notes && (
                      <p style={{
                        fontSize: '0.8rem', fontStyle: 'italic', color: '#777',
                        margin: '6px 0 0', paddingTop: '5px',
                        borderTop: '1px dashed #eee'
                      }}>
                        💬 {style.notes}
                      </p>
                    )}

                    {/* Remove button */}
                    {role.approved && (
                      <button onClick={() => deleteEntry('styles', style.id)}
                        style={{ marginTop: '6px', padding: '2px 8px', color: '#c62828', background: 'none', fontSize: '0.72rem', border: '1px solid #ef9a9a', borderRadius: '4px' }}>
                        Remove Beat
                      </button>
                    )}
                  </div>
                )) : (
                  <p style={{ fontSize: '0.8rem', color: '#999', padding: '12px 15px', margin: 0 }}>No beats added yet.</p>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
