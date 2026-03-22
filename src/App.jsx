import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import AuthScreen  from "./components/AuthScreen";
import FrogMode    from "./components/FrogMode";
import YouTab      from "./components/YouTab";
import FriendsTab  from "./components/FriendsTab";
import UploadModal from "./components/UploadModal";

export default function App() {
  const [user, setUser]       = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [tab, setTab]         = useState("frog");
  const [showUpload, setShowUpload] = useState(false);
  const [pending, setPending] = useState(0);
  const [friendRequests, setFriendRequests] = useState(0);
  const [toast, setToast]     = useState(null);
  const [frogKey, setFrogKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) loadProfile(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) loadProfile(session.user);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (u) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", u.id).single();
    if (data) setProfile(data);
    else {
      const username = u.user_metadata?.username || u.email?.split("@")[0] || "frogger";
      const { data: created } = await supabase.from("profiles")
        .insert({ id: u.id, username }).select().single();
      if (created) setProfile(created);
    }
  };

  useEffect(() => {
    if (!user) return;
    const count = async () => {
      try {
        const { data: friendships } = await supabase
          .from("friendships")
          .select("requester_id, receiver_id")
          .eq("status", "accepted")
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

        const friendIds = (friendships||[]).map(f =>
          f.requester_id === user.id ? f.receiver_id : f.requester_id
        );

        if (!friendIds.length) { setPending(0); return; }

        const cutoff = new Date(Date.now()-48*60*60*1000).toISOString();
        const { data: photos } = await supabase.from("photos").select("id")
          .in("user_id", friendIds).gte("posted_at", cutoff);
        if (!photos?.length) { setPending(0); return; }
        const { data: judged } = await supabase.from("judgments")
          .select("photo_id").eq("judged_by", user.id);
        const judgedSet = new Set((judged||[]).map(j=>j.photo_id));
        setPending(photos.filter(p=>!judgedSet.has(p.id)).length);

        const { data: requests } = await supabase
          .from("friendships").select("id")
          .eq("receiver_id", user.id).eq("status", "pending");
        setFriendRequests((requests||[]).length);
      } catch(e) { console.error(e); }
    };
    count();
  }, [user, frogKey]);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null),3000); };

  const handlePosted = () => {
    setShowUpload(false);
    showToast("Posted! 🐸 friends will judge it soon");
    if (user) loadProfile(user);
    setFrogKey(k=>k+1);
    setTab("you");
  };

  if (user === undefined) return (
    <div style={{height:"100dvh",display:"flex",alignItems:"center",
      justifyContent:"center",background:"#fff9f4"}}>
      <svg style={{animation:"bob 1.5s ease-in-out infinite",width:80,height:80}}
        viewBox="0 0 140 140" fill="none">
        <ellipse cx="70" cy="90" rx="44" ry="36" fill="#6db87a"/>
        <ellipse cx="70" cy="65" rx="40" ry="34" fill="#7dcf8b"/>
        <circle cx="48" cy="50" r="17" fill="#4a9457"/><circle cx="92" cy="50" r="17" fill="#4a9457"/>
        <circle cx="48" cy="50" r="12" fill="white"/><circle cx="92" cy="50" r="12" fill="white"/>
        <circle cx="50" cy="50" r="7" fill="#2c2318"/><circle cx="94" cy="50" r="7" fill="#2c2318"/>
      </svg>
      <style>{`@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  );

  if (!user) return <AuthScreen/>;

  return (
    <div style={{height:"100dvh",maxHeight:"100dvh",display:"flex",flexDirection:"column",
      overflow:"hidden",background:"#faf7f2",fontFamily:"'DM Sans',sans-serif",color:"#2c2318"}}>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"16px 20px 12px",background:"#fff9f4",
        borderBottom:"1px solid #ede5d8",flexShrink:0}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,
          letterSpacing:-1,color:"#2c2318"}}>
          fr<span style={{color:"#4a9457"}}>o</span>g
        </div>
        <div style={{background:"#eaf5ec",borderRadius:100,padding:"6px 14px",
          fontSize:13,fontWeight:600,color:"#4a9457"}}>
          🔥 {profile?.streak||0} day streak
        </div>
      </div>

      <div style={{flex:1,minHeight:0,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {tab==="frog"    && <FrogMode key={frogKey} user={user} profile={profile}/>}
        {tab==="friends" && <FriendsTab user={user} profile={profile}/>}
        {tab==="you"     && <YouTab user={user} profile={profile} onProfileUpdate={()=>loadProfile(user)}/>}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,
        background:"rgba(250,247,242,0.96)",borderTop:"1px solid #ede5d8",
        display:"flex",padding:"8px 0 24px",backdropFilter:"blur(12px)",zIndex:100}}>
        {[
          {id:"frog",    label:"frog",    icon:"🐸",      badge:pending>0},
          {id:"friends", label:"friends", icon:"friends", badge:friendRequests>0},
          {id:"post",    label:"post",    icon:"📷",      isPost:true},
          {id:"you",     label:"you",     icon:"👤"},
        ].map(item => (
          <button key={item.id}
            onClick={()=>item.isPost?setShowUpload(true):setTab(item.id)}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,
              background:"none",border:"none",cursor:"pointer",padding:"8px 4px",
              color:tab===item.id?"#4a9457":"#8a7260",
              fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600}}>
            {item.isPost ? (
              <div style={{width:50,height:50,background:"#6db87a",borderRadius:"50%",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,
                boxShadow:"0 4px 18px rgba(109,184,122,0.4)",
                border:"3px solid #faf7f2",marginTop:-10}}>📷</div>
            ) : item.icon === "friends" ? (
              <div style={{position:"relative"}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="7" r="4" fill={tab==="friends"?"#4a9457":"#8a7260"}/>
                  <path d="M2 21v-1a7 7 0 0 1 7-7h0" stroke={tab==="friends"?"#4a9457":"#8a7260"}
                    strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="17" cy="9" r="3" fill={tab==="friends"?"#4a9457":"#8a7260"}/>
                  <path d="M22 21v-1a5 5 0 0 0-5-5h0" stroke={tab==="friends"?"#4a9457":"#8a7260"}
                    strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {item.badge&&(
                  <div style={{position:"absolute",top:-2,right:-2,width:8,height:8,
                    background:"#e05c48",borderRadius:"50%",border:"1.5px solid #faf7f2"}}/>
                )}
              </div>
            ) : (
              <div style={{position:"relative"}}>
                <span style={{fontSize:22,lineHeight:1}}>{item.icon}</span>
                {item.badge&&(
                  <div style={{position:"absolute",top:-2,right:-2,width:8,height:8,
                    background:"#e05c48",borderRadius:"50%",border:"1.5px solid #faf7f2"}}/>
                )}
              </div>
            )}
            <span style={{marginTop:item.isPost?4:0}}>{item.label}</span>
          </button>
        ))}
      </div>

      {showUpload&&(
        <UploadModal user={user} profile={profile}
          onClose={()=>setShowUpload(false)} onPosted={handlePosted}/>
      )}

      {toast&&(
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",
          background:"#2c2318",color:"#faf7f2",padding:"11px 24px",borderRadius:100,
          fontSize:13,fontWeight:500,zIndex:300,whiteSpace:"nowrap",
          boxShadow:"0 4px 20px rgba(44,35,24,0.2)",
          animation:"slideDown 0.35s cubic-bezier(0.34,1.56,0.64,1)"}}>
          {toast}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        @keyframes bob{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-12px) rotate(1.5deg)}}
        @keyframes fbounce{0%,100%{transform:translateY(0)}35%{transform:translateY(-12px)}65%{transform:translateY(-6px)}}
        @keyframes fmunch{0%,100%{transform:scaleY(1)}25%{transform:scaleY(0.88)}55%{transform:scaleY(1.06)}}
        @keyframes tongOut{0%{transform:translateX(-50%) scaleY(0);opacity:0}15%{transform:translateX(-50%) scaleY(1);opacity:1}45%{transform:translateX(-50%) scaleY(1.7) translateY(10px)}75%{transform:translateX(-50%) scaleY(1) translateY(0)}100%{transform:translateX(-50%) scaleY(0);opacity:0}}
        @keyframes mEat{0%{transform:translateX(-50%) scale(1) translateY(0);opacity:1}40%{transform:translateX(-50%) scale(0.65) translateY(22px);opacity:.7}100%{transform:translateX(-50%) scale(0) translateY(65px);opacity:0}}
        @keyframes mSave{0%{transform:translateX(-50%) scale(1) translateY(0);opacity:1}40%{transform:translateX(-50%) scale(1.15) translateY(-22px) rotate(-5deg)}100%{transform:translateX(-50%) scale(0.8) translateY(-52px);opacity:0}}
        @keyframes slideDown{from{transform:translateX(-50%) translateY(-20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
        input::placeholder,textarea::placeholder{color:#d4c4b0;}
        input:focus,textarea:focus{border-color:#6db87a!important;}
        ::-webkit-scrollbar{display:none;}
      `}</style>
    </div>
  );
}
