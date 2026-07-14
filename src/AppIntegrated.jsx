import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';

import AppFooter from './components/AppFooter';
import CategoryFilters from './components/CategoryFilters';
import LibraryStats from './components/LibraryStats';
import LyricsEditor from './components/LyricsEditor';
import LyricsMode from './components/LyricsMode';
import OfflineBanner from './components/OfflineBanner';
import RecentAdditions from './components/RecentAdditions';
import SearchBar from './components/SearchBar';
import SettingsPage from './components/SettingsPage';
import SongCard from './components/SongCard';
import VersionBadge from './components/VersionBadge';

import useOnlineStatus from './hooks/useOnlineStatus';
import { songMatchesSearch, updateSongLyrics } from './services/songLyricsService';

import './styles/appFooter.css';
import './styles/categoryFilters.css';
import './styles/lyricsEditor.css';
import './styles/lyricsMode.css';
import './styles/offlineBanner.css';
import './styles/searchBar.css';
import './styles/songCard.css';
import './styles/audioAttachments.css';

const SUPER_ADMIN_EMAIL = 'enockoloo6@gmail.com';

const EMPTY_FORM = {
  song_name: '',
  lyrics: '',
  includeBeat: false,
  beat_name: '',
  keyboard_id: '',
  tempo: '',
  key: '',
  location: '',
  notes: ''
};

function AppIntegrated() {
  const [songs, setSongs] = useState([]);
  const [keyboards, setKeyboards] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeView, setActiveView] = useState('library');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState({ approved: false, admin: false });
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [defaultKeyboardId, setDefaultKeyboardId] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [lyricsSong, setLyricsSong] = useState(null);
  const [editingLyricsSong, setEditingLyricsSong] = useState(null);

  const isOnline = useOnlineStatus();

  useEffect(() => {
    fetchSongs();
    fetchKeyboards();
  }, []);

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
        setActiveView('library');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadRole(userId, userEmail) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_approved, is_admin, default_keyboard_id')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        const nextRole = {
          approved: Boolean(profile.is_approved),
          admin: Boolean(profile.is_admin)
        };

        setRole(nextRole);
        if (nextRole.admin) loadProfiles();

        if (profile.default_keyboard_id) {
          const keyboardId = String(profile.default_keyboard_id);
          setDefaultKeyboardId(keyboardId);
          setFormData(current => ({ ...current, keyboard_id: keyboardId }));
        }
      } else {
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

  async function toggleStatus(profileId, field, current) {
    const target = profiles.find(profile => profile.id === profileId);
    if (!target || target.email === SUPER_ADMIN_EMAIL) return;

    const newApproved = field === 'is_approved' ? !current : Boolean(target.is_approved);
    const newAdmin = field === 'is_admin' ? !current : Boolean(target.is_admin);

    const { error } = await supabase.rpc('admin_update_profile', {
      target_id: profileId,
      new_is_approved: newApproved,
      new_is_admin: newAdmin
    });

    if (error) {
      alert('Update failed: ' + error.message);
      return;
    }

    loadProfiles();
  }

  async function fetchSongs() {
    const { data, error } = await supabase
      .from('songs')
      .select('*, styles (*, keyboards (model_name))')
      .order('song_name');

    if (error) {
      console.error('fetchSongs error:', error.message);
      return;
    }

    setSongs(data || []);
  }

  async function fetchKeyboards() {
    const { data, error } = await supabase
      .from('keyboards')
      .select('*')
      .order('model_name');

    if (error) {
      console.error('fetchKeyboards error:', error.message);
      return;
    }

    setKeyboards(data || []);
  }

  async function handleAuth(e) {
    e.preventDefault();

    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else {
        alert('Account request sent! Wait for admin approval.');
        setShowLoginForm(false);
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  }

  async function claimAdminBootstrap() {
    if (!user) return;

    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1);

    if (admins?.length > 0) {
      alert('An admin already exists. Ask them to approve you.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true, is_admin: true })
      .eq('id', user.id);

    if (error) {
      alert('Error: ' + error.message);
      return;
    }

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

    const songName = formData.song_name.trim();
    const lyrics = formData.lyrics.trim();
    const beatName = formData.beat_name.trim();
    const beatDetailsProvided = formData.includeBeat || Boolean(
      beatName
      || formData.keyboard_id
      || formData.tempo
      || formData.key.trim()
      || formData.location.trim()
      || formData.notes.trim()
    );

    if (!songName) {
      alert('Please enter a song name.');
      return;
    }

    if (beatDetailsProvided && !beatName) {
      alert('Please enter a beat name, or turn off optional piano settings.');
      return;
    }

    setSaving(true);

    try {
      const songPayload = {
        song_name: songName
      };

      if (lyrics) {
        songPayload.lyrics = lyrics;
      }

      const { data: songData, error: songErr } = await supabase
        .from('songs')
        .upsert(songPayload, { onConflict: 'song_name' })
        .select()
        .single();

      if (songErr) throw songErr;

      if (beatDetailsProvided) {
        const { error: styleErr } = await supabase.from('styles').insert([{
          song_id: songData.id,
          keyboard_id: formData.keyboard_id || null,
          beat_name: beatName,
          keyboard_location: formData.location.trim() || null,
          tempo: formData.tempo || null,
          musical_key: formData.key.trim() || null,
          notes: formData.notes.trim() || null
        }]);

        if (styleErr) throw styleErr;
      }

      setFormData({ ...EMPTY_FORM, keyboard_id: defaultKeyboardId });
      await fetchSongs();
      alert(beatDetailsProvided ? '✅ Song and beat saved!' : '✅ Song saved!');
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(style) {
    setEditingId(style.id);
    setEditData({
      beat_name: style.beat_name || '',
      keyboard_id: style.keyboard_id || '',
      location: style.keyboard_location || '',
      tempo: style.tempo || '',
      key: style.musical_key || '',
      notes: style.notes || ''
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  async function saveEdit(styleId) {
    if (!editData.keyboard_id) {
      alert('Please select a keyboard.');
      return;
    }

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

  async function saveLyrics(song, lyrics) {
    if (!role.approved) return;

    setSaving(true);

    try {
      await updateSongLyrics(song.id, lyrics);
      setEditingLyricsSong(null);
      await fetchSongs();
    } catch (err) {
      alert('Lyrics update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateDefaultKeyboard(nextKeyboardId) {
    setDefaultKeyboardId(nextKeyboardId);
    setFormData(current => ({ ...current, keyboard_id: nextKeyboardId }));

    if (user) {
      await supabase
        .from('profiles')
        .update({ default_keyboard_id: nextKeyboardId || null })
        .eq('id', user.id);
    }
  }

  function openLibraryView() {
    setActiveView('library');
  }

  function openSettingsView() {
    setShowAddForm(false);
    setEditingLyricsSong(null);
    setActiveView('settings');
  }

  const songNameOptions = useMemo(
    () => [...new Set(songs.map(song => song.song_name))].sort(),
    [songs]
  );

  const categories = useMemo(() => {
    const categoryNames = songs
      .flatMap(song => song.styles || [])
      .map(style => style.keyboard_location?.trim())
      .filter(Boolean);

    return ['All', ...new Set(categoryNames)].sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });
  }, [songs]);

  const filteredSongs = useMemo(
    () => songs.filter(song => {
      const matchesSearch = songMatchesSearch(song, search);
      const matchesCategory = selectedCategory === 'All'
        || (song.styles || []).some(style => style.keyboard_location === selectedCategory);

      return matchesSearch && matchesCategory;
    }),
    [songs, search, selectedCategory]
  );

  const recentAdditions = useMemo(() => (
    songs
      .flatMap(song => (song.styles || []).map(style => ({
        id: style.id,
        songName: song.song_name,
        beatName: style.beat_name,
        category: style.keyboard_location,
        keyboardName: style.keyboards?.model_name,
        createdAt: style.created_at
      })))
      .filter(item => item.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  ), [songs]);

  const isSuperAdmin = emailAddress => emailAddress === SUPER_ADMIN_EMAIL;

  const Badge = ({ text, color }) => (
    <span style={{ background: color, color: '#fff', padding: '2px 9px', borderRadius: '12px', fontSize: '0.72rem', marginLeft: '7px', fontWeight: 600 }}>
      {text}
    </span>
  );

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
        .panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 11px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .recent-additions { background: #fff; border: 1px solid #e2e8f0; border-radius: 11px; padding: 10px 14px; margin: 0 0 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        .recent-additions__toggle { width: 100%; display: flex; align-items: center; gap: 8px; background: transparent; color: #1a237e; padding: 2px 0; text-align: left; }
        .recent-additions__title { font-size: 0.98rem; font-weight: 800; flex: 1; }
        .recent-additions__chevron { color: #64748b; font-size: 0.9rem; }
        .recent-additions__item { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-top: 1px solid #f1f5f9; }
        .recent-additions__item strong { color: #1a237e; font-size: 0.9rem; }
        .recent-additions__date { color: #94a3b8; font-size: 0.74rem; white-space: nowrap; }
        .library-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 0 0 14px; }
        .library-stats__item { background: #fff; border: 1px solid #e2e8f0; border-radius: 11px; padding: 12px 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 8px; }
        .library-stats__icon { grid-row: span 2; font-size: 1.2rem; }
        .library-stats__value { color: #1a237e; font-weight: 900; font-size: 1.08rem; line-height: 1; }
        .library-stats__label { color: #64748b; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
        @media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } .recent-additions__item { flex-direction: column; gap: 3px; } .library-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div style={{ background: 'linear-gradient(90deg,#0d1b6e 0%,#1a237e 100%)', padding: '12px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.5rem' }}>🎹</span>
          <span style={{ color: '#fff', fontWeight: '800', fontSize: '1.18rem', letterSpacing: '0.02em' }}>My Beat Library</span>
          <VersionBadge />
          {user && !authLoading && (
            role.admin ? <Badge text="ADMIN" color="#c62828" /> :
            role.approved ? <Badge text="APPROVED" color="#2e7d32" /> :
            <Badge text="PENDING" color="#e65100" />
          )}
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => window.print()} style={{ background: 'rgba(255,255,255,0.13)', color: '#fff', padding: '7px 13px', fontSize: '0.83rem', border: '1px solid rgba(255,255,255,0.25)' }}>
            🖨 Print
          </button>
          {user ? (
            <button onClick={() => supabase.auth.signOut()} style={{ background: '#c62828', color: 'white', padding: '7px 14px', fontSize: '0.83rem' }}>
              Logout
            </button>
          ) : (
            <button onClick={() => setShowLoginForm(value => !value)} style={{ background: showLoginForm ? '#455a64' : 'rgba(255,255,255,0.18)', color: '#fff', padding: '7px 14px', fontSize: '0.83rem', border: '1px solid rgba(255,255,255,0.3)' }}>
              {showLoginForm ? '✕ Close' : '🔐 Login'}
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px' }}>
        <OfflineBanner visible={!isOnline} />

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
            <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ cursor: 'pointer', color: '#1a237e', marginTop: '12px', textDecoration: 'underline', fontSize: '0.86rem', textAlign: 'center' }}>
              {authMode === 'login' ? 'New user? Create account' : 'Have an account? Login'}
            </p>
          </div>
        )}

        {user && !authLoading && !role.approved && !role.admin && (
          <div className="no-print" style={{ background: '#fff8e1', border: '2px dashed #ffa000', padding: '13px 18px', borderRadius: '9px', marginBottom: '16px' }}>
            <strong>⚠️ Your account is pending approval.</strong>
            <p style={{ margin: '5px 0 8px', fontSize: '0.87rem' }}>If you are the first user and no admin exists yet:</p>
            <button onClick={claimAdminBootstrap} style={{ background: '#ffa000', color: 'white', padding: '7px 16px', fontSize: '0.85rem' }}>
              🔑 Claim Admin Access
            </button>
          </div>
        )}

        {role.admin && (
          <div className="panel no-print" style={{ borderLeft: '4px solid #c62828', marginBottom: '18px' }}>
            <h3 style={{ marginTop: 0, color: '#b71c1c', marginBottom: '6px' }}>👑 Admin Control Panel</h3>
            <p style={{ fontSize: '0.81rem', color: '#666', margin: '0 0 12px' }}>
              <strong>Approve</strong> — lets a user add/edit beats. <strong>Make Admin</strong> — grants full admin rights.
            </p>
            {profiles.length === 0 && <p style={{ color: '#aaa', fontSize: '0.88rem' }}>No user profiles found.</p>}
            {profiles.map(profile => (
              <div key={profile.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #fbe9e7', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '0.88rem' }}>{profile.email}</span>
                  {isSuperAdmin(profile.email)
                    ? <span style={{ marginLeft: 8, fontSize: '0.68rem', background: '#b71c1c', color: 'white', padding: '2px 7px', borderRadius: 10 }}>PROTECTED</span>
                    : <span style={{ marginLeft: 8, fontSize: '0.68rem', color: '#999' }}>{profile.is_admin ? '• Admin' : profile.is_approved ? '• Approved' : '• Pending'}</span>
                  }
                </div>
                {!isSuperAdmin(profile.email) && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => toggleStatus(profile.id, 'is_approved', profile.is_approved)} style={{ fontSize: '0.72rem', background: profile.is_approved ? '#ef6c00' : '#2e7d32', color: 'white', padding: '4px 10px' }}>
                      {profile.is_approved ? 'Revoke' : 'Approve'}
                    </button>
                    <button onClick={() => toggleStatus(profile.id, 'is_admin', profile.is_admin)} style={{ fontSize: '0.72rem', background: profile.is_admin ? '#455a64' : '#4527a0', color: 'white', padding: '4px 10px' }}>
                      {profile.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {role.approved && (
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={openLibraryView}
              style={{ background: activeView === 'library' ? '#1a237e' : '#fff', color: activeView === 'library' ? '#fff' : '#1a237e', border: '1px solid #cfd8e3', padding: '9px 14px', fontSize: '0.9rem' }}
            >
              Library
            </button>

            <button
              type="button"
              onClick={openSettingsView}
              style={{ background: activeView === 'settings' ? '#1a237e' : '#fff', color: activeView === 'settings' ? '#fff' : '#1a237e', border: '1px solid #cfd8e3', padding: '9px 14px', fontSize: '0.9rem' }}
            >
              Settings
            </button>

            {activeView === 'library' && (
              <button onClick={() => { setShowAddForm(value => !value); if (!showAddForm) setFormData(current => ({ ...current, keyboard_id: defaultKeyboardId || current.keyboard_id })); }} style={{ background: showAddForm ? '#455a64' : '#1a237e', color: 'white', padding: '9px 18px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span>{showAddForm ? '✕' : '➕'}</span>
                {showAddForm ? 'Close Form' : 'Add Song'}
              </button>
            )}
          </div>
        )}

        {activeView === 'library' && (
          <>
            <SearchBar value={search} onChange={setSearch} resultCount={filteredSongs.length} totalCount={songs.length} />
            <CategoryFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
            <RecentAdditions items={recentAdditions} />
            <LibraryStats songs={songs} keyboards={keyboards} />
          </>
        )}

        {role.approved && activeView === 'settings' && (
          <SettingsPage
            defaultKeyboardId={defaultKeyboardId}
            keyboards={keyboards}
            onDefaultKeyboardChange={updateDefaultKeyboard}
          />
        )}

        {role.approved && activeView === 'library' && showAddForm && (
          <form onSubmit={handleSubmit} className="panel no-print" style={{ marginBottom: '18px', borderTop: '4px solid #1a237e' }}>
            <h3 style={{ margin: '0 0 14px', color: '#1a237e', fontSize: '1rem' }}>➕ Add Song</h3>

            <div>
              <label>Song Name *</label>
              <input placeholder="Type or pick existing song…" value={formData.song_name} onChange={e => setFormData({ ...formData, song_name: e.target.value })} list="song-datalist" required />
              <datalist id="song-datalist">
                {songNameOptions.map(name => <option key={name} value={name} />)}
              </datalist>
              <span style={{ fontSize: '0.71rem', color: '#94a3b8' }}>Existing songs appear as you type</span>
            </div>

            <div style={{ marginTop: '10px' }}>
              <label>Lyrics</label>
              <textarea placeholder="Paste lyrics here…" value={formData.lyrics} onChange={e => setFormData({ ...formData, lyrics: e.target.value })} style={{ minHeight: '130px', resize: 'vertical' }} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '13px', textTransform: 'none', letterSpacing: 0, fontSize: '0.85rem', color: '#1a237e', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.includeBeat}
                onChange={e => setFormData({
                  ...formData,
                  includeBeat: e.target.checked,
                  keyboard_id: e.target.checked ? (formData.keyboard_id || defaultKeyboardId) : formData.keyboard_id
                })}
                style={{ width: 'auto' }}
              />
              Add optional piano settings now
            </label>

            {formData.includeBeat && (
              <>
                <div className="form-grid" style={{ marginTop: '10px' }}>
                  <div>
                    <label>Beat Name *</label>
                    <input placeholder="e.g. 8-Beat Modern" value={formData.beat_name} onChange={e => setFormData({ ...formData, beat_name: e.target.value })} required={formData.includeBeat} />
                  </div>
                  <div>
                    <label>Keyboard</label>
                    <select value={formData.keyboard_id} onChange={e => setFormData({ ...formData, keyboard_id: e.target.value })}>
                      <option value="">Select keyboard…</option>
                      {keyboards.map(keyboard => <option key={keyboard.id} value={keyboard.id}>{keyboard.model_name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: '10px' }}>
                  <div>
                    <label>Beat Category</label>
                    <input placeholder="e.g. Ballad, Country, Bank 3…" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                  <div>
                    <label>Tempo (BPM)</label>
                    <input placeholder="e.g. 92" type="number" value={formData.tempo} onChange={e => setFormData({ ...formData, tempo: e.target.value })} />
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: '10px' }}>
                  <div>
                    <label>Key</label>
                    <input placeholder="e.g. G, Bb, F#" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} />
                  </div>
                  <div>
                    <label>Beat Notes</label>
                    <input placeholder="Fill levels, variations, intro tips…" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={saving} style={{ marginTop: '13px', width: '100%', background: '#1a237e', color: 'white', padding: '11px', fontSize: '0.97rem' }}>
              {saving ? '⏳ Saving…' : '💾 Save Song'}
            </button>
          </form>
        )}

        {activeView === 'library' && editingLyricsSong && (
          <div className="panel" style={{ borderTop: '4px solid #1a237e' }}>
            <LyricsEditor song={editingLyricsSong} saving={saving} onCancel={() => setEditingLyricsSong(null)} onSave={saveLyrics} />
          </div>
        )}

        {activeView === 'library' && (
        <div>
          {songs.length === 0 && (
            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '30px' }}>No songs in the library yet.</p>
          )}

          {filteredSongs.map(song => (
            <SongCard
              key={song.id}
              song={song}
              role={role}
              editingId={editingId}
              editData={editData}
              keyboards={keyboards}
              saving={saving}
              onDeleteSong={id => deleteEntry('songs', id)}
              onDeleteBeat={id => deleteEntry('styles', id)}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onSaveEdit={saveEdit}
              onEditDataChange={setEditData}
              onEditLyrics={setEditingLyricsSong}
              onOpenLyrics={setLyricsSong}
              user={user}
              canManageAudio={role?.approved}
            />
          ))}
        </div>
        )}

        <AppFooter />
      </div>

      {lyricsSong && <LyricsMode song={lyricsSong} onClose={() => setLyricsSong(null)} />}
    </div>
  );
}

export default AppIntegrated;
