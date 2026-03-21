import { useState } from "react";
import { supabase } from "../supabase";

export default function UploadModal({ user, profile, onClose, onPosted }) {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [caption, setCaption]     = useState("");
  const [uploading, setUploading] = useState(false);
  const [visible, setVisible]     = useState(true);

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handlePost = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("photos").insert({
        user_id:   user.id,
        username:  profile?.username || user.email.split("@")[0],
        photo_url: publicUrl,
        caption:   caption.trim(),
        spares:    0,
        eats:      0,
      });
      if (dbErr) throw dbErr;
      const lastPosted = profile?.last_posted ? new Date(profile.last_posted).getTime() : 0;
      const now        = Date.now();
      const streak     = lastPosted && (now-lastPosted) < 86400000*1.5
        ? (profile?.streak||0)+1 : 1;
      await supabase.from("profiles").update({
        total_photos: (profile?.total_photos||0)+1,
        streak,
        last_posted: new Date().toISOString(),
      }).eq("id", user.id);
      onPosted();
    } catch(e) {
      console.error(e);
      alert("Upload failed: " + e.message);
    }
    setUploading(false);
  };

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  return (
    <div style={{position:"fixed",inset:0,zIndex:150,display:"flex",
      alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(44,35,24,0.38)",
        backdropFilter:"blur(4px)"}} onClick={handleClose}/>
      <div style={{position:"relative",zIndex:1,background:"#fff9f4",
        borderRadius:"28px 28px 0 0",padding:"24px 22px 48px",
        width:"100%",maxWidth:480,display:"flex",flexDirection:"column",gap:14,
        transform:visible?"translateY(0)":"translateY(100%)",
        transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{width:40,height:4,background:"#d4c4b0",borderRadius:2,
          alignSelf:"center",marginBottom:4}}/>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,
          fontWeight:700,color:"#2c2318"}}>Today's photo 🐸</div>
        {!preview?(
          <label style={{border:"2px dashed #d4c4b0",borderRadius:16,padding:28,
            textAlign:"center",cursor:"pointer",background:"#faf7f2",display:"block"}}>
            <input type="file" accept="image/*" capture="environment"
              onChange={handleFile} style={{display:"none"}}/>
            <div style={{fontSize:34,marginBottom:8}}>📷</div>
            <div style={{fontSize:13,color:"#8a7260"}}>tap to take a photo</div>
          </label>
        ):(
          <img src={preview} style={{width:"100%",height:220,objectFit:"cover",borderRadius:14}} alt="preview"/>
        )}
        <textarea value={caption} onChange={e=>setCaption(e.target.value)}
          placeholder="add a caption…" rows={2}
          style={{background:"#faf7f2",border:"1.5px solid #ede5d8",borderRadius:12,
            padding:"12px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:14,
            color:"#2c2318",width:"100%",resize:"none",outline:"none",lineHeight:1.5}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleClose} disabled={uploading}
            style={{flex:1,background:"#ede5d8",border:"none",borderRadius:12,
              fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,
              color:"#8a7260",padding:14,cursor:"pointer"}}>cancel</button>
          <button onClick={handlePost} disabled={!file||uploading}
            style={{flex:2,background:(file&&!uploading)?"#6db87a":"#d4c4b0",
              border:"none",borderRadius:12,fontFamily:"'DM Sans',sans-serif",
              fontSize:14,fontWeight:500,color:"white",padding:14,
              cursor:(file&&!uploading)?"pointer":"not-allowed",transition:"background 0.2s"}}>
            {uploading?"uploading…":"post it 🐸"}
          </button>
        </div>
      </div>
    </div>
  );
}
