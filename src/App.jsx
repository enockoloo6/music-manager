import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const SUPER_ADMIN_EMAIL = 'enockoloo6@gmail.com';

// EMPTY_FORM uses 'location' which maps to keyboard_location in DB — no DB change needed
const EMPTY_FORM = {
  song_name: '', beat_name: '', keyboard_id: '',
  tempo: '', key: '', location: '', notes: ''
};

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
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // UI toggles
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ── Fetch public data on mount (no login needed) ────────────────────────
  useEffect(() => {
    fetchSongs();
    fetchKeyboards();
  }, []);

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadRole(session.user.id, session.user.email).finally(() => setAuthLoading(false));
      } else {
        setAuthLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadRole(session.user.id, session.user.email);
        setShowLoginForm(false);
      } else {
        setUser(null);
        setRole({ approved: false, admin: false });
        setShowAddForm(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadRole(userId, userEmail) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles').select('is_approved, is_admin').eq('id', userId).maybeSingle();
      if (error) throw error;
      if (profile) {
        const r = { approved: !!profile.is_approved, admin: !!profile.is_admin };
        setRole(r);
        if (r.admin) loadProfiles();
      } else {
        await supabase.from('profiles').insert({ id: userId, email: userEmail, is_approved: false, is_admin: false });
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
      else { alert('Account request sent! Wait for admin approval.'); setShowLoginForm(false); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  }

  async function claimAdminBootstrap() {
    if (!user) return;
    const { data: admins } = await supabase.from('profiles').select('id').eq('is_admin', true).limit(1);
    if (admins?.length > 0) { alert('An admin already exists. Ask them to approve you.'); return; }
    const { error } = await supabase.from('profiles').update({ is_approved: true, is_admin: true }).eq('id', user.id);
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

  // ── Add new beat ──────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.keyboard_id) return alert('Please select a keyboard.');
    setSaving(true);
    try {
      // upsert song by name — won't duplicate
      const { data: songData, error: songErr } = await supabase
        .from('songs')
        .upsert({ song_name: formData.song_name }, { onConflict: 'song_name' })
        .select().single();
      if (songErr) throw songErr;

      // 'location' in form → keyboard_location in DB (no DB change needed)
      const { error: styleErr } = await supabase.from('styles').insert([{
        song_id: songData.id,
        keyboard_id: formData.keyboard_id,
        beat_name: formData.beat_name,
        keyboard_location: formData.location,   // this IS the beat category (e.g. Ballad)
        tempo: formData.tempo || null,
        musical_key: formData.key,
        notes: formData.notes
      }]);
      if (styleErr) throw styleErr;

      setFormData(EMPTY_FORM);
      await fetchSongs();
      alert('✅ Beat saved!');
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Edit beat ─────────────────────────────────────────────────────────────
  function startEdit(style) {
    setEditingId(style.id);
    setEditData({
      beat_name: style.beat_name || '',
      keyboard_id: style.keyboard_id || '',
      location: style.keyboard_location || '',  // beat category/location field
      tempo: style.tempo || '',
      key: style.musical_key || '',
      notes: style.notes || ''
    });
  }

  function cancelEdit() { setEditingId(null); setEditData({}); }

  async function saveEdit(styleId) {
    if (!editData.keyboard_id) return alert('Please select a keyboard.');
    setSaving(true);
    try {
      const { error } = await supabase.from('styles').update({
        beat_name: editData.beat_name,
        keyboard_id: editData.keyboard_id,
        keyboard_location: editData.location,
        tempo: editData.tempo || null,
        musical_key: editData.key,
        notes: editData.notes
      }).eq('id', styleId);
      if (error) throw error;
      cancelEdit();
      await fetchSongs();
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const isSuperAdmin = (e) => e === SUPER_ADMIN_EMAIL;

  // Sorted unique song names for autocomplete datalist
  const songNameOptions = [...new Set(songs.map(s => s.song_name))].sort();

  const Badge = ({ text, color }) => (
    <span style={{ background: color, color: '#fff', padding: '2px 9px', borderRadius: '12px', fontSize: '0.72rem', marginLeft: '7px', fontWeight: 600 }}>
      {text}
    </span>
  );

  // Shared style for inline edit inputs
  const ei = {
    padding: '6px 8px', border: '1px solid #90caf9', borderRadius: '5px',
    fontSize: '0.85rem', background: '#f0f7ff', width: '100%', boxSizing: 'border-box', margin: 0
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#222', minHeight: '100vh', background: '#f0f2f7' }}>
      <style>{`
        @media print { .no-print { display: none !important; } }
        * { box-sizing: border-box; }
        input, select, textarea {
          width: 100%; padding: 9px 11px; border: 1px solid #cfd8e3;
          border-radius: 7px; font-family: inherit; font-size: 0.92rem;
          background: #fff; transition: border-color 0.15s;
        }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #1a237e; box-shadow: 0 0 0 2px rgba(26,35,126,0.1); }
        button { cursor: pointer; border-radius: 6px; border: none; font-weight: 600; transition: all 0.15s; }
        button:hover { opacity: 0.87; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        label { font-size: 0.76rem; font-weight: 700; color: #4a5568; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.03em; }
        .card { border: 1px solid #e2e8f0; border-radius: 11px; overflow: hidden; background: white; margin-bottom: 13px; box-shadow: 0 1px 5px rgba(0,0,0,0.07); }
        .card-header { background: linear-gradient(90deg,#1a237e 0%,#283593 100%); padding: 11px 16px; display: flex; justify-content: space-between; align-items: center; }
        .song-title { font-size: 1.08rem; font-weight: 800; color: #fff; letter-spacing: 0.01em; }
        .beat-count-badge { background: rgba(255,255,255,0.2); color: #fff; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
        .beat-row { padding: 11px 16px; border-bottom: 1px solid #f0f4f8; }
        .beat-row:last-child { border-bottom: none; }
        .beat-row:nth-child(even) { background: #f8fafc; }
        .panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 11px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(90deg,#0d1b6e 0%,#1a237e 100%)', padding: '12px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🎹</span>
          <span style={{ color: '#fff', fontWeight: '800', fontSize: '1.18rem', letterSpacing: '0.02em' }}>My Beat Library</span>
          {user && !authLoading && (
            role.admin   ? <Badge text="ADMIN"    color="#c62828" /> :
            role.approved? <Badge text="APPROVED" color="#2e7d32" /> :
                           <Badge text="PENDING"  color="#e65100" />
          )}
        </div>
        <div className="no-print" style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => window.print()}
            style={{ background: 'rgba(255,255,255,0.13)', color: '#fff', padding: '7px 13px', fontSize: '0.83rem', border: '1px solid rgba(255,255,255,0.25)' }}>
            🖨 Print
          </button>
          {user ? (
            <button onClick={() => supabase.auth.signOut()}
              style={{ background: '#c62828', color: 'white', padding: '7px 14px', fontSize: '0.83rem' }}>
              Logout
            </button>
          ) : (
            <button onClick={() => setShowLoginForm(v => !v)}
              style={{ background: showLoginForm ? '#455a64' : 'rgba(255,255,255,0.18)', color: '#fff', padding: '7px 14px', fontSize: '0.83rem', border: '1px solid rgba(255,255,255,0.3)' }}>
              {showLoginForm ? '✕ Close' : '🔐 Login'}
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '20px 16px' }}>

        {/* ── LOGIN FORM (toggled by navbar button) ───────────────────────── */}
        {!user && showLoginForm && (
          <div className="panel no-print" style={{ maxWidth: '370px', margin: '0 auto 20px', borderTop: '4px solid #1a237e' }}>
            <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: '1.05rem', color: '#1a237e' }}>
              {authMode === 'login' ? '🔐 Login' : '📝 Request Access'}
            </h2>
            <form onSubmit={handleAuth} style={{ display: 'grid', gap: '10px' }}>
              <div><label>Email</label><input type="email" placeholder="your@email.com" onChange={e => setEmail(e.target.value)} required /></div>
              <div><label>Password</label><input type="password" placeholder="••••••••" onChange={e => setPassword(e.target.value)} required /></div>
              <button type="submit" style={{ background: '#1a237e', color: 'white', padding: '10px', marginTop: '2px' }}>
                {authMode === 'login' ? 'Login' : 'Request Access'}
              </button>
            </form>
            <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              style={{ cursor: 'pointer', color: '#1a237e', marginTop: '12px', textDecoration: 'underline', fontSize: '0.86rem', textAlign: 'center' }}>
              {authMode === 'login' ? 'New user? Create account' : 'Have an account? Login'}
            </p>
          </div>
        )}

        {/* ── BOOTSTRAP BANNER ────────────────────────────────────────────── */}
        {user && !authLoading && !role.approved && !role.admin && (
          <div className="no-print" style={{ background: '#fff8e1', border: '2px dashed #ffa000', padding: '13px 18px', borderRadius: '9px', marginBottom: '16px' }}>
            <strong>⚠️ Your account is pending approval.</strong>
            <p style={{ margin: '5px 0 8px', fontSize: '0.87rem' }}>If you are the first user and no admin exists yet:</p>
            <button onClick={claimAdminBootstrap} style={{ background: '#ffa000', color: 'white', padding: '7px 16px', fontSize: '0.85rem' }}>
              🔑 Claim Admin Access
            </button>
          </div>
        )}

        {/* ── ADMIN PANEL ─────────────────────────────────────────────────── */}
        {role.admin && (
          <div className="panel no-print" style={{ borderLeft: '4px solid #c62828', marginBottom: '18px' }}>
            <h3 style={{ marginTop: 0, color: '#b71c1c', marginBottom: '6px' }}>👑 Admin Control Panel</h3>
            <p style={{ fontSize: '0.81rem', color: '#666', margin: '0 0 12px' }}>
              <strong>Approve</strong> — lets a user add/edit beats.&nbsp;&nbsp;
              <strong>Make Admin</strong> — grants full admin rights so they can also approve and promote others.
            </p>
            {profiles.length === 0 && <p style={{ color: '#aaa', fontSize: '0.88rem' }}>No user profiles found.</p>}
            {profiles.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #fbe9e7' }}>
                <div>
                  <span style={{ fontSize: '0.88rem' }}>{p.email}</span>
                  {isSuperAdmin(p.email)
                    ? <span style={{ marginLeft: 8, fontSize: '0.68rem', background: '#b71c1c', color: 'white', padding: '2px 7px', borderRadius: 10 }}>PROTECTED</span>
                    : <span style={{ marginLeft: 8, fontSize: '0.68rem', color: '#999' }}>{p.is_admin ? '• Admin' : p.is_approved ? '• Approved' : '• Pending'}</span>
                  }
                </div>
                {!isSuperAdmin(p.email) && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => toggleStatus(p.id, 'is_approved', p.is_approved)}
                      style={{ fontSize: '0.72rem', background: p.is_approved ? '#ef6c00' : '#2e7d32', color: 'white', padding: '4px 10px' }}>
                      {p.is_approved ? 'Revoke' : 'Approve'}
                    </button>
                    <button onClick={() => toggleStatus(p.id, 'is_admin', p.is_admin)}
                      style={{ fontSize: '0.72rem', background: p.is_admin ? '#455a64' : '#4527a0', color: 'white', padding: '4px 10px' }}>
                      {p.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── SEARCH ──────────────────────────────────────────────────────── */}
        <div className="no-print" style={{ marginBottom: '14px' }}>
          <input
            placeholder="🔍 Search songs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: '1rem', border: '2px solid #1a237e', padding: '10px 14px', borderRadius: '8px' }}
          />
        </div>

        {/* ── ADD BEAT TOGGLE BUTTON ───────────────────────────────────────── */}
        {role.approved && (
          <div className="no-print" style={{ marginBottom: '12px' }}>
            <button
              onClick={() => setShowAddForm(v => !v)}
              style={{ background: showAddForm ? '#455a64' : '#1a237e', color: 'white', padding: '9px 18px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span>{showAddForm ? '✕' : '➕'}</span>
              {showAddForm ? 'Close Form' : 'Add New Beat'}
            </button>
          </div>
        )}

        {/* ── ADD BEAT FORM ────────────────────────────────────────────────── */}
        {role.approved && showAddForm && (
          <form onSubmit={handleSubmit} className="panel no-print" style={{ marginBottom: '18px', borderTop: '4px solid #1a237e' }}>
            <h3 style={{ margin: '0 0 14px', color: '#1a237e', fontSize: '1rem' }}>➕ Add New Beat</h3>

            {/* Row 1: Song Name | Keyboard */}
            <div className="form-grid">
              <div>
                <label>Song Name *</label>
                <input
                  placeholder="Type or pick existing song…"
                  value={formData.song_name}
                  onChange={e => setFormData({ ...formData, song_name: e.target.value })}
                  list="song-datalist"
                  required
                />
                {/* datalist provides autocomplete for existing songs — no duplicates */}
                <datalist id="song-datalist">
                  {songNameOptions.map(n => <option key={n} value={n} />)}
                </datalist>
                <span style={{ fontSize: '0.71rem', color: '#94a3b8' }}>Existing songs appear as you type</span>
              </div>
              <div>
                <label>Keyboard *</label>
                <select value={formData.keyboard_id} onChange={e => setFormData({ ...formData, keyboard_id: e.target.value })} required>
                  <option value="">Select keyboard…</option>
                  {keyboards.map(k => <option key={k.id} value={k.id}>{k.model_name}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Beat Name | Beat Category (stored as keyboard_location in DB) */}
            <div className="form-grid" style={{ marginTop: '10px' }}>
              <div>
                <label>Beat Name *</label>
                <input
                  placeholder="e.g. 8-Beat Modern"
                  value={formData.beat_name}
                  onChange={e => setFormData({ ...formData, beat_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Beat Category / Location on Keyboard</label>
                <input
                  placeholder="e.g. Ballad, Country, Bank 3…"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
                <span style={{ fontSize: '0.71rem', color: '#94a3b8' }}>Where this beat is found on the keyboard</span>
              </div>
            </div>

            {/* Row 3: Tempo | Key */}
            <div className="form-grid" style={{ marginTop: '10px' }}>
              <div>
                <label>Tempo (BPM)</label>
                <input placeholder="e.g. 92" type="number" value={formData.tempo} onChange={e => setFormData({ ...formData, tempo: e.target.value })} />
              </div>
              <div>
                <label>Key</label>
                <input placeholder="e.g. G, Bb, F#" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} />
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginTop: '10px' }}>
              <label>Notes</label>
              <textarea
                placeholder="Fill levels, variations, intro tips…"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                style={{ minHeight: '68px', resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={saving}
              style={{ marginTop: '13px', width: '100%', background: '#1a237e', color: 'white', padding: '11px', fontSize: '0.97rem' }}>
              {saving ? '⏳ Saving…' : '💾 Save to Library'}
            </button>
          </form>
        )}

        {/* ── SONG LIST ────────────────────────────────────────────────────── */}
        <div>
          {songs.length === 0 && (
            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '30px' }}>No songs in the library yet.</p>
          )}
          {songs
            .filter(s => s.song_name.toLowerCase().includes(search.toLowerCase()))
            .map(song => (
              <div key={song.id} className="card">

                {/* Song header */}
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="song-title">{song.song_name}</span>
                    {song.styles?.length > 0 && (
                      <span className="beat-count-badge">
                        {song.styles.length} beat{song.styles.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {role.admin && (
                    <button onClick={() => deleteEntry('songs', song.id)}
                      style={{ color: '#ffcdd2', background: 'rgba(255,255,255,0.1)', fontSize: '0.74rem', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.2)' }}>
                      🗑 Delete
                    </button>
                  )}
                </div>

                {/* Beat rows */}
                <div>
                  {song.styles?.length > 0 ? song.styles.map((style, idx) => (
                    <div key={style.id} className="beat-row" style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>

                      {editingId === style.id ? (
                        /* ── EDIT MODE ─────────────────────────── */
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: '700', color: '#1a237e', marginBottom: '7px' }}>✏️ Editing beat</div>
                          <div className="edit-grid">
                            <div>
                              <label style={{ fontSize: '0.7rem' }}>Beat Name *</label>
                              <input style={ei} value={editData.beat_name} onChange={e => setEditData({ ...editData, beat_name: e.target.value })} />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem' }}>Beat Category / Location</label>
                              <input style={ei} placeholder="e.g. Ballad, Country…" value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })} />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem' }}>Keyboard *</label>
                              <select style={{ ...ei, padding: '6px 8px' }} value={editData.keyboard_id} onChange={e => setEditData({ ...editData, keyboard_id: e.target.value })}>
                                <option value="">Select…</option>
                                {keyboards.map(k => <option key={k.id} value={k.id}>{k.model_name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem' }}>Tempo (BPM)</label>
                              <input style={ei} type="number" value={editData.tempo} onChange={e => setEditData({ ...editData, tempo: e.target.value })} />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem' }}>Key</label>
                              <input style={ei} placeholder="e.g. G" value={editData.key} onChange={e => setEditData({ ...editData, key: e.target.value })} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                              <label style={{ fontSize: '0.7rem' }}>Notes</label>
                              <textarea style={{ ...ei, height: '56px', resize: 'vertical' }} value={editData.notes} onChange={e => setEditData({ ...editData, notes: e.target.value })} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '9px' }}>
                            <button onClick={() => saveEdit(style.id)} disabled={saving}
                              style={{ background: '#1a237e', color: 'white', fontSize: '0.8rem', padding: '6px 14px' }}>
                              {saving ? '⏳…' : '💾 Save'}
                            </button>
                            <button onClick={cancelEdit}
                              style={{ background: '#eef0f3', color: '#555', fontSize: '0.8rem', padding: '6px 14px' }}>
                              Cancel
                            </button>
                          </div>
                        </div>

                      ) : (
                        /* ── VIEW MODE ─────────────────────────── */
                        <div>
                          {/*
                            Beat name (found under Ballad)    ·····    PSR-S650
                            Beat name left, keyboard model far right — same line
                          */}
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                            {/* Left: beat name + soft "found under…" */}
                            <span style={{ fontWeight: '700', color: '#1a237e', fontSize: '0.97rem' }}>
                              🥁 {style.beat_name}
                              {style.keyboard_location && (
                                <span style={{ fontWeight: '400', color: '#94a3b8', fontSize: '0.8rem', marginLeft: '6px' }}>
                                  (found under <em>{style.keyboard_location}</em>)
                                </span>
                              )}
                            </span>
                            {/* Right: keyboard model */}
                            <span style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              🎹 {style.keyboards?.model_name || '--'}
                            </span>
                          </div>

                          {/* Tempo + Key */}
                          <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#555', marginTop: '5px' }}>
                            <span>⏱ <strong>{style.tempo || '--'}</strong> BPM</span>
                            <span>🎼 Key: <strong>{style.musical_key || '--'}</strong></span>
                          </div>

                          {/* Notes */}
                          {style.notes && (
                            <p style={{ fontSize: '0.79rem', fontStyle: 'italic', color: '#7a8899', margin: '6px 0 0', paddingTop: '5px', borderTop: '1px dashed #e8eef4' }}>
                              💬 {style.notes}
                            </p>
                          )}

                          {/* Edit / Remove */}
                          {role.approved && (
                            <div style={{ display: 'flex', gap: '7px', marginTop: '8px' }}>
                              <button onClick={() => startEdit(style)}
                                style={{ padding: '3px 10px', background: '#e8f0fe', color: '#1a237e', fontSize: '0.73rem', border: '1px solid #c5d0f5', borderRadius: '4px' }}>
                                ✏️ Edit
                              </button>
                              <button onClick={() => deleteEntry('styles', style.id)}
                                style={{ padding: '3px 10px', color: '#c62828', background: 'none', fontSize: '0.73rem', border: '1px solid #ffcdd2', borderRadius: '4px' }}>
                                🗑 Remove
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )) : (
                    <p style={{ fontSize: '0.82rem', color: '#b0bec5', padding: '12px 16px', margin: 0 }}>No beats added yet.</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;