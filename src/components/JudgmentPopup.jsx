import { useState, useEffect } from "react";

export default function JudgmentPopup({ verdict, uname, photoUrl, onDone }) {
  const [visible, setVisible]         = useState(false);
  const [bounce, setBounce]           = useState(false);
  const [munch, setMunch]             = useState(false);
  const [shootTongue, setShootTongue] = useState(false);
  const [miniAnim, setMiniAnim]       = useState("");

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    if (verdict === "fail") {
      setTimeout(() => { setShootTongue(true); setMunch(true); }, 160);
      setTimeout(() => setMiniAnim("eaten"), 290);
    } else {
      setTimeout(() => setBounce(true), 100);
      setTimeout(() => setMiniAnim("saved"), 180);
    }
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 260); }, 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",
      alignItems:"center",justifyContent:"center",
      background:"rgba(44,35,24,0.55)",backdropFilter:"blur(8px)",
      opacity:visible?1:0,transition:"opacity 0.25s ease"}}>
      <div style={{background:"#fff9f4",borderRadius:28,padding:"32px 28px 36px",
        width:"calc(100% - 48px)",maxWidth:340,
        display:"flex",flexDirection:"column",alignItems:"center",gap:16,
        boxShadow:"0 20px 60px rgba(44,35,24,0.25)",
        transform:visible?"scale(1)":"scale(0.92)",
        transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{fontSize:11,fontWeight:500,color:"#8a7260",
          letterSpacing:"1.2px",textTransform:"uppercase"}}>
          the frog has spoken
        </div>
        <div style={{position:"relative",width:160,height:180,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg style={{width:140,height:140,
            animation:bounce?"fbounce 0.5s ease":munch?"fmunch 0.5s ease 0.2s":"none"}}
            viewBox="0 0 140 140" fill="none">
            <ellipse cx="70" cy="90" rx="44" ry="36" fill="#6db87a"/>
            <ellipse cx="70" cy="65" rx="40" ry="34" fill="#7dcf8b"/>
            <circle cx="48" cy="50" r="17" fill="#4a9457"/><circle cx="92" cy="50" r="17" fill="#4a9457"/>
            <circle cx="48" cy="50" r="12" fill="white"/><circle cx="92" cy="50" r="12" fill="white"/>
            <circle cx="50" cy="50" r="7" fill="#2c2318"/><circle cx="94" cy="50" r="7" fill="#2c2318"/>
            <circle cx="52" cy="47" r="2.5" fill="white"/><circle cx="96" cy="47" r="2.5" fill="white"/>
            <path d="M52 78 Q70 92 88 78" stroke="#4a9457" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <ellipse cx="64" cy="68" rx="3" ry="2" fill="#4a9457"/>
            <ellipse cx="76" cy="68" rx="3" ry="2" fill="#4a9457"/>
            <ellipse cx="70" cy="104" rx="26" ry="16" fill="#9de3a8" opacity="0.4"/>
            <ellipse cx="32" cy="116" rx="16" ry="9" fill="#6db87a"/>
            <ellipse cx="108" cy="116" rx="16" ry="9" fill="#6db87a"/>
          </svg>
          {shootTongue&&(
            <div style={{position:"absolute",bottom:8,left:"50%",
              transform:"translateX(-50%)",width:14,height:60,
              background:"linear-gradient(to bottom,#e8608a,#c43060)",
              borderRadius:"0 0 7px 7px",animation:"tongOut 0.7s ease forwards"}}/>
          )}
          <div style={{position:"absolute",bottom:-16,left:"50%",
            transform:"translateX(-50%)",width:68,height:68,
            background:"#ede5d8",borderRadius:10,border:"2.5px solid white",
            boxShadow:"0 4px 14px rgba(44,35,24,0.14)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:26,overflow:"hidden",
            animation:miniAnim==="eaten"?"mEat 0.72s ease forwards 0.22s"
              :miniAnim==="saved"?"mSave 0.72s ease forwards 0.14s":"none"}}>
            {photoUrl?<img src={photoUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:"📸"}
          </div>
        </div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:900,
          color:verdict==="pass"?"#4a9457":"#e05c48",marginTop:20,textAlign:"center",lineHeight:1}}>
          {verdict==="pass"?"Spared!":"Consumed."}
        </div>
        <div style={{fontSize:14,color:"#2c2318",textAlign:"center",maxWidth:260,lineHeight:1.65}}>
          {verdict==="pass"?`${uname}'s photo lives on.`:`${uname}'s photo never stood a chance.`}
        </div>
      </div>
    </div>
  );
}
