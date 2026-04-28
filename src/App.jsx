import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [songs, setSongs] = useState([]);
  const [keyboards, setKeyboards] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ 
    song_name: '', beat_name: '', keyboard_id: '', tempo: '', key: '', location: '', notes: '' 
  });

  useEffect(() => {
    fetchSongs();
    fetchKeyboards();
  }, []);

  async function fetchKeyboards() {
    const { data } = await supabase.from('keyboards').select('*');
    setKeyboards(data);
  }

  async function fetchSongs() {
    const { data } = await supabase.from('songs').select(`*, styles(*, keyboards(*))`).order('song_name', { ascending: true });
    setSongs(data);
  }

  async function deleteStyle(id) {
    if (window.confirm("Delete this specific beat setting?")) {
      await supabase.from('styles').delete().eq('id', id);
      fetchSongs();
    }
  }

  async function deleteSong(id) {
    if (window.confirm("Delete this song and ALL associated beats?")) {
      await supabase.from('songs').delete().eq('id', id);
      fetchSongs();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { data: songData } = await supabase.from('songs').upsert({ song_name: formData.song_name }).select().single();
    
    await supabase.from('styles').insert([{
      song_id: songData.id,
      keyboard_id: formData.keyboard_id,
      beat_name: formData.beat_name,
      tempo: formData.tempo,
      musical_key: formData.key,
      keyboard_location: formData.location,
      notes: formData.notes
    }]);
    
    setFormData({ song_name: '', beat_name: '', keyboard_id: '', tempo: '', key: '', location: '', notes: '' });
    fetchSongs();
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { font-size: 11pt; background: white; }
            .song-card { border: 1px solid #eee !important; page-break-inside: avoid; margin-bottom: 20px; }
            .style-entry { background: #fafafa !important; border: 1px solid #ddd !important; }
          }
        `}
      </style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🎹 My Beat Manager</h1>
        <button onClick={() => window.print()} className="no-print" style={{ padding: '8px 15px', cursor: 'pointer', background: '#555', color: '#fff', border: 'none', borderRadius: '4px' }}>
          🖨️ Print Library
        </button>
      </div>
      
      <div className="no-print">
        <input 
          placeholder="🔍 Search for a song..." 
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
          style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />

        <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
          <h3 style={{marginTop: 0}}>Add New Entry</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <input placeholder="Song Name" value={formData.song_name} onChange={e => setFormData({...formData, song_name: e.target.value})} required />
            <input placeholder="Beat Name (e.g. 70sChartHit)" value={formData.beat_name} onChange={e => setFormData({...formData, beat_name: e.target.value})} required />
            <select onChange={e => setFormData({...formData, keyboard_id: e.target.value})} required value={formData.keyboard_id}>
              <option value="">Select Keyboard</option>
              {keyboards.map(kb => <option key={kb.id} value={kb.id}>{kb.model_name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input placeholder="Tempo" type="number" style={{flex: 1}} value={formData.tempo} onChange={e => setFormData({...formData, tempo: e.target.value})} />
              <input placeholder="Key" style={{flex: 1}} value={formData.key} onChange={e => setFormData({...formData, key: e.target.value})} />
            </div>
            <input placeholder="Menu Location (e.g. Expansion > Page 1)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            <textarea placeholder="Performance Notes (e.g. Use Var C for Chorus)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit'}} />
            <button type="submit" style={{ padding: '12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save to Library</button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '30px' }}>
        {songs.filter(s => s.song_name.toLowerCase().includes(search)).map(song => (
          <div key={song.id} className="song-card" style={{ background: '#fff', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#333' }}>{song.song_name}</h2>
              <button onClick={() => deleteSong(song.id)} className="no-print" style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '0.8rem' }}>Delete Song</button>
            </div>
            
            {song.styles.map(style => (
              <div key={style.id} className="style-entry" style={{ marginLeft: '10px', marginTop: '12px', padding: '12px', background: '#f1f1f1', borderRadius: '6px', position: 'relative', border: '1px solid transparent' }}>
                <button onClick={() => deleteStyle(style.id)} className="no-print" style={{ position: 'absolute', right: '10px', top: '10px', border: 'none', background: 'none', color: '#999', cursor: 'pointer' }}>✕</button>
                <div style={{fontWeight: 'bold', color: '#1a237e', marginBottom: '4px'}}>{style.keyboards.model_name}</div>
                <div style={{fontSize: '1.1rem', marginBottom: '4px'}}><strong>{style.beat_name}</strong></div>
                <div style={{ fontSize: '0.9rem', color: '#444' }}>
                  ⏱ {style.tempo} BPM | 🎹 Key: {style.musical_key} | 📍 {style.keyboard_location}
                </div>
                {style.notes && (
                  <div style={{ marginTop: '8px', padding: '8px', background: '#fff', borderRadius: '4px', fontSize: '0.85rem', borderLeft: '3px solid #2e7d32', fontStyle: 'italic' }}>
                    {style.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
