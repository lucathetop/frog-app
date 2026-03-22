import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function YouTab({ user, profile, onProfileUpdate }) {
  const [photos, setPhotos]         = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName]       = useState("");
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    supabase.from("photos").select("*")
      .eq("user_id", user.id)
      .order("posted_at", { ascending: false })
      .limit(9)
      .then(({ data }) => setPhotos(data||[]));
  }, [user.id]);

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("profiles")
      .update({ username: newName.trim() })
      .eq("id", user.id);
    if (error) {
      alert("Couldn't save name: " + error.message);
    } else {
      setEditingName(false);
      if (onProfileUpdate) onProfileUpdate();
    }
    setSaving(false);
  };

  const total  = profile?.total_photos || 0;
  const spared = profile?.spared || 0;
  const eaten  = profile?.eaten  || 0;
  const rate   = total > 0 ? Math.round((spared/total)*100) : 0;
  const joined = profile?.joined_at ? new Date(profile.joined_at) : new Date();
  const days   = Math.floor((Date.now()-joined.getTime())/86400000);

  return (
    <div style={{flex:1,overflowY:"auto",padding:"14px 14px 90px",
      display:"flex",flexDirection:"column",gap:16,minHeight:0}}>

      {/* Profile */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",
        padding:"20px 0 8px",gap:4}}>
        <div style={{fontSize:52,animation:"bob 4s ease-in-out infinite"}}>🐸</div>

        {editingName ? (
          <div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
            <input
              value={newName}
              onChange={e=>setNewName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleSaveName()}
              placeholder="new name"
              autoFocus
              style={{background:"#faf7f2",border:"1.5px solid #6db87a",borderRadius:12,
                padding:"8px 14px",fontSize:16,color:"#2c2318",outline:"none",
                fontFamily:"'DM Sans',sans-serif",width:160,textAlign:"center"}}/>
            <button onClick={handleSaveName} disabled={saving}
              style={{background:"#6db87a",color:"white",border:"none",borderRadius:100,
                padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              {saving?"…":"save"}
            </button>
            <button onClick={()=>setEditingName(false)}
              style={{background:"#ede5d8",color:"#8a7260",border:"none",borderRadius:100,
                padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              cancel
            </button>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,
              fontWeight:700,color:"#4a9457"}}>
              {profile?.username}
            </div>
            <button onClick={()=>{setNewName(profile?.username||"");setEditingName(true);}}
              style={{background:"none",border:"none",cursor:"pointer",
                fontSize:14,color:"#d4c4b0",padding:0}}>
              ✏️
            </button>
          </div>
        )}

        <div style={{fontSize:12,color:"#4a9457",fontWeight:500,opacity:.8}}>
          member for {days} day{days!==1?"s":""}
        </div>
        <div style={{fontSize:11,color:"#8a7260",marginTop:2}}>
          player id: {profile?.player_id}
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {num:profile?.streak||0,icon:"🔥",label:"day streak",bg:"#fff9f4"},
          {num:total,icon:"📸",label:"photos posted",bg:"#fff9f4"},
          {num:spared,icon:"🐸",label:"spared",bg:"#eaf5ec",col:"#4a9457"},
          {num:eaten,icon:"👅",label:"eaten",bg:"#fcecea",col:"#e05c48"},
        ].map(s=>(
          <div key={s.label} style={{background:s.bg,borderRadius:18,padding:"18px 16px",
            display:"flex",flexDirection:"column",alignItems:"center",gap:2,
            boxShadow:"0 2px 12px rgba(44,35,24,0.06)"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,
              fontWeight:900,lineHeight:1,color:"#2c2318"}}>{s.num}</div>
            <div style={{fontSize:20,margin:"2px 0"}}>{s.icon}</div>
            <div style={{fontSize:11,fontWeight:700,color:s.col||"#2c2318",
              textTransform:"uppercase",letterSpacing:1}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Survival bar */}
      <div style={{background:"#fff9f4",borderRadius:16,padding:"16px 18px",
        boxShadow:"0 2px 12px rgba(44,35,24,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,
          fontWeight:600,color:"#2c2318",marginBottom:10}}>
          <span>survival rate</span>
          <span style={{color:"#4a9457"}}>{rate}%</span>
        </div>
        <div style={{height:10,background:"#ede5d8",borderRadius:100,overflow:"hidden"}}>
          <div style={{height:"100%",background:"linear-gradient(to right,#4a9457,#6db87a)",
            borderRadius:100,width:`${rate}%`,transition:"width 0.8s"}}/>
        </div>
      </div>

      {/* Photo archive */}
      {photos.length>0&&(<>
        <div style={{fontSize:11,fontWeight:600,letterSpacing:"1.5px",
          textTransform:"uppercase",color:"#2c2318"}}>your photos</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3}}>
          {photos.map(p=>(
            <div key={p.id} style={{aspectRatio:1,background:"#ede5d8",
              borderRadius:10,overflow:"hidden",position:"relative"}}>
              {p.photo_url
                ?<img src={p.photo_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:28}}>📸</div>}
              <div style={{position:"absolute",bottom:4,right:4,
                background:"rgba(255,255,255,0.88)",borderRadius:6,padding:"2px 6px",
                fontSize:11,fontWeight:600,
                color:(p.spares||0)>=(p.eats||0)?"#4a9457":"#e05c48"}}>
                {(p.spares||0)+(p.eats||0)>0?`${p.spares||0}🐸 ${p.eats||0}👅`:"⏳"}
              </div>
            </div>
          ))}
        </div>
      </>)}

      <button onClick={()=>supabase.auth.signOut()}
        style={{background:"none",border:"1.5px solid #ede5d8",borderRadius:12,
          padding:12,fontSize:13,fontWeight:500,color:"#8a7260",cursor:"pointer",
          marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>sign out</button>
    </div>
  );
}
