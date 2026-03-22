import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import SwipeCard from "./SwipeCard";
import JudgmentPopup from "./JudgmentPopup";

function timeAgo(ts) {
  const ms = Date.now() - new Date(ts).getTime();
  const m = Math.floor(ms/60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h} hr${h>1?"s":""} ago`;
  return `${Math.floor(h/24)} day${Math.floor(h/24)>1?"s":""} ago`;
}

export default function FrogMode({ user, profile }) {
  const [photos, setPhotos]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cardKey, setCardKey]   = useState(0);
  const [judgment, setJudgment] = useState(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const { data: friendships } = await supabase
        .from("friendships")
        .select("requester_id, receiver_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

      const friendIds = (friendships||[]).map(f =>
        f.requester_id === user.id ? f.receiver_id : f.requester_id
      );

      if (friendIds.length === 0) { setPhotos([]); setLoading(false); return; }

      const cutoff = new Date(Date.now() - 48*60*60*1000).toISOString();
      const { data: allPhotos } = await supabase
        .from("photos").select("*")
        .in("user_id", friendIds)
        .gte("posted_at", cutoff)
        .order("posted_at", { ascending: false });

      const { data: myJudgments } = await supabase
        .from("judgments").select("photo_id").eq("judged_by", user.id);

      const judgedIds = new Set((myJudgments||[]).map(j=>j.photo_id));
      const unjudged = (allPhotos||[])
        .filter(p=>!judgedIds.has(p.id))
        .map(p=>({...p, time_ago: timeAgo(p.posted_at)}));

      setPhotos(unjudged);
    } catch(e) { console.error(e); }
    setLoading(false);
  }, [user.id]);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const handleJudge = async (verdict) => {
    const photo = photos[0];
    if (!photo) return;
    try {
      await supabase.from("judgments").insert({
        judged_by: user.id, photo_id: photo.id, verdict,
      });
      await supabase.rpc("increment_vote", {
        photo_id: photo.id,
        vote_type: verdict,
        owner_id: photo.user_id,
      });
    } catch(e) { console.error(e); }
    setJudgment({ verdict, uname: photo.username, photoUrl: photo.photo_url });
  };

  const handleDone = () => {
    setJudgment(null);
    setPhotos(prev=>prev.slice(1));
    setCardKey(k=>k+1);
  };

  return (
    <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",
      alignItems:"center",padding:"12px 16px 0",
      paddingBottom:"calc(80px + 12px)",minHeight:0,background:"#1a3d22"}}>
      <div style={{textAlign:"center",flexShrink:0,marginBottom:10}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,
          letterSpacing:"-0.5px",color:"#ffffff"}}>
          fr<span style={{color:"#7dcf8b"}}>o</span>g mode
        </div>
        <div style={{display:"inline-block",marginTop:5,
          background:"rgba(255,255,255,0.15)",borderRadius:100,
          padding:"4px 14px",fontSize:12,fontWeight:700,color:"#ffffff"}}>
          {loading?"loading…":photos.length>0?`${photos.length} left to judge`:"all done!"}
        </div>
      </div>
      <div style={{position:"relative",width:"100%",maxWidth:360,flex:1,
        minHeight:0,maxHeight:"100%",display:"flex",alignItems:"center",
        justifyContent:"center",marginBottom:10,overflow:"hidden"}}>
        {loading?(
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:14}}>loading photos…</div>
        ):photos.length===0?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",
            gap:8,textAlign:"center"}}>
            <div style={{fontSize:64,animation:"bob 3s ease-in-out infinite"}}>🐸</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,
              fontWeight:900,color:"#ffffff"}}>All caught up</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.7)",lineHeight:1.7}}>
              Add friends to start judging<br/>their daily photos.
            </div>
            <button onClick={loadPhotos} style={{marginTop:8,
              background:"rgba(255,255,255,0.15)",border:"none",borderRadius:100,
              padding:"10px 24px",fontSize:13,fontWeight:600,color:"white",cursor:"pointer"}}>
              ↺ refresh
            </button>
          </div>
        ):(
          <SwipeCard key={cardKey} photo={photos[0]} onJudge={handleJudge}/>
        )}
      </div>
      {photos.length>0&&!loading&&(
        <div style={{display:"flex",justifyContent:"space-between",width:"100%",
          maxWidth:360,padding:"0 4px",flexShrink:0}}>
          <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.7)"}}>← eat it</div>
          <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.7)"}}>spare it →</div>
        </div>
      )}
      {judgment&&(
        <JudgmentPopup verdict={judgment.verdict} uname={judgment.uname}
          photoUrl={judgment.photoUrl} onDone={handleDone}/>
      )}
    </div>
  );
}
