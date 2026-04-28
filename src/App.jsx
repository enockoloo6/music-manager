import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [songs, setSongs] = useState([]);
  const [keyboards, setKeyboards] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ song_name: '', beat_name: '', keyboard_id: '', tempo: '', key: '', location: '' });

  useEffect(() => {
    fetchSongs();
    fetchKeyboards();
  }, []);

  async function fetchKeyboards() {
    const { data } = await supabase.from('keyboards').select('*');
    setKeyboards(data);
  }

  async function fetchSongs() {
    const { data } = await supabase.from('songs').select(`*, styles(*, keyboards(*))`);
    setSongs(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // 1. Create or Find Song
    const { data: songData } = await supabase.from('songs').upsert({ song_name: formData.song_name }).select().single();
    
    // 2. Add Style
    await supabase.from('styles').insert([{
      song_id: songData.id,
      keyboard_id: formData.keyboard_id,
      beat_name: formData.beat_name,
      tempo: formData.tempo,
      musical_key: formData.key,
      keyboard_location: formData.location
    }]);
    
    setFormData({ song_name: '', beat_name: '', keyboard_id: '', tempo: '', key: '', location: '' });
    fetchSongs();
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🎹 My Beat Manager</h1>
      
      {/* Search Section */}
      <input 
        placeholder="Search for a song..." 
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
        style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
      />

      {/* Add New Entry Form */}
      <form onSubmit={handleSubmit} style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
        <h3>Add New Song/Beat</h3>
        <input placeholder="Song Name" value={formData.song_name} onChange={e => setFormData({...formData, song_name: e.target.value})} required />
        <input placeholder="Beat Name" value={formData.beat_name} onChange={e => setFormData({...formData, beat_name: e.target.value})} required />
        <select onChange={e => setFormData({...formData, keyboard_id: e.target.value})} required>
          <option value="">Select Keyboard</option>
          {keyboards.map(kb => <option key={kb.id} value={kb.id}>{kb.model_name}</option>)}
        </select>
        <input placeholder="Tempo" type="number" value={formData.tempo} onChange={e => setFormData({...formData, tempo: e.target.value})} />
        <input placeholder="Key (e.g. C Major)" value={formData.key} onChange={e => setFormData({...formData, key: e.target.value})} />
        <input placeholder="Menu Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
        <button type="submit">Save Beat</button>
      </form>

      {/* List Display */}
      <div style={{ marginTop: '20px' }}>
        {songs.filter(s => s.song_name.toLowerCase().includes(search)).map(song => (
          <div key={song.id} style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>
            <h2>{song.song_name}</h2>
            {song.styles.map(style => (
              <div key={style.id} style={{ marginLeft: '20px', color: '#555' }}>
                <strong>{style.keyboards.model_name}:</strong> {style.beat_name} | {style.tempo} BPM | Key: {style.musical_key}
                <p>📍 Find it at: {style.keyboard_location}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
