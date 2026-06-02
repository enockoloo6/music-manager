import React, { useEffect, useState } from 'react';
import { deleteSongAudio, fetchSongAudio, uploadSongAudio } from '../services/songAudioService';

export default function AudioAttachments({ song, user, canManage }) {
 const [items,setItems]=useState([]);
 const [loading,setLoading]=useState(false);
 const [uploading,setUploading]=useState(false);

 async function load(){
  if(!song?.id) return;
  setLoading(true);
  try{ setItems(await fetchSongAudio(song.id)); }
  catch(err){ console.error(err); }
  finally{ setLoading(false); }
 }

 useEffect(()=>{ load(); },[song?.id]);

 async function handleUpload(e){
  const file=e.target.files?.[0];
  if(!file) return;
  setUploading(true);
  try{
   await uploadSongAudio({songId:song.id,file,userId:user?.id});
   await load();
  }catch(err){ alert(err.message); }
  finally{ setUploading(false); e.target.value=''; }
 }

 async function handleDelete(audio){
  if(!window.confirm('Delete audio attachment?')) return;
  await deleteSongAudio(audio);
  await load();
 }

 return <div className='audio-attachments'>
  <strong>🔊 Audio</strong>
  {canManage && <input type='file' accept='audio/*' onChange={handleUpload} disabled={uploading} />}
  {loading ? <div>Loading audio…</div> : items.map(a => <div key={a.id}>
   {a.signed_url && <audio controls src={a.signed_url} preload='none' />}
   <span>{a.file_name}</span>
   {canManage && <button onClick={()=>handleDelete(a)}>Delete</button>}
  </div>)}
 </div>;
}
