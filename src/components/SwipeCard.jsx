import { useRef, useState, useEffect } from "react";

export default function SwipeCard({ photo, onJudge }) {
  const cardRef  = useRef(null);
  const stateRef = useRef({ startX:0,startY:0,curX:0,active:false,done:false,axisLocked:false,isHoriz:false });
  const [passOpacity, setPassOpacity] = useState(0);
  const [failOpacity, setFailOpacity] = useState(0);

  const start = (x, y) => {
    const s = stateRef.current;
    if (s.done) return;
    s.startX=x; s.startY=y; s.curX=0; s.active=true; s.axisLocked=false; s.isHoriz=false;
    cardRef.current.style.transition = "none";
  };
  const move = (x, y) => {
    const s = stateRef.current;
    if (!s.active || s.done) return;
    const dx = x-s.startX, dy = y-s.startY;
    if (!s.axisLocked) { s.axisLocked=true; s.isHoriz=Math.abs(dx)>=Math.abs(dy); }
    if (!s.isHoriz) { s.active=false; cardRef.current.style.transform=""; return; }
    s.curX = dx;
    cardRef.current.style.transform = `translateX(${dx}px) rotate(${dx*0.04}deg)`;
    const p = Math.min(Math.abs(dx)/80, 1);
    if (dx > 0) { setPassOpacity(p); setFailOpacity(0); }
    else        { setFailOpacity(p); setPassOpacity(0); }
  };
  const end = () => {
    const s = stateRef.current;
    if (!s.active || s.done) return;
    s.active = false;
    setPassOpacity(0); setFailOpacity(0);
    if (Math.abs(s.curX) >= 80) {
      s.done = true;
      const verdict = s.curX > 0 ? "pass" : "fail";
      const dir     = s.curX > 0 ? 1 : -1;
      cardRef.current.style.transition = "transform 0.38s ease, opacity 0.38s";
      cardRef.current.style.transform  = `translateX(${dir*window.innerWidth*1.4}px) rotate(${dir*25}deg)`;
      cardRef.current.style.opacity    = "0";
      setTimeout(() => onJudge(verdict), 350);
    } else {
      cardRef.current.style.transition = "transform 0.38s cubic-bezier(0.34,1.56,0.64,1)";
      cardRef.current.style.transform  = "translateX(0) rotate(0deg)";
    }
  };

  useEffect(() => {
    const onMove = e => move(e.clientX, e.clientY);
    const onUp   = () => { if (stateRef.current.active) end(); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => { window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); };
  }, []);

  return (
    <div ref={cardRef}
      style={{position:"absolute",inset:0,zIndex:10,background:"#fff9f4",
        borderRadius:24,overflow:"hidden",
        boxShadow:"0 10px 48px rgba(44,35,24,0.16)",
        cursor:"grab",willChange:"transform",touchAction:"pan-y"}}
      onMouseDown={e=>{start(e.clientX,e.clientY);e.preventDefault();}}
      onTouchStart={e=>start(e.touches[0].clientX,e.touches[0].clientY)}
      onTouchMove={e=>move(e.touches[0].clientX,e.touches[0].clientY)}
      onTouchEnd={end}>
      <div style={{position:"absolute",top:24,right:18,zIndex:20,background:"#6db87a",
        color:"white",fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:900,
        padding:"7px 18px",borderRadius:6,border:"3px solid white",
        opacity:passOpacity,pointerEvents:"none",transform:"rotate(12deg)",
        textTransform:"uppercase",letterSpacing:1}}>Spare 🐸</div>
      <div style={{position:"absolute",top:24,left:18,zIndex:20,background:"#e05c48",
        color:"white",fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:900,
        padding:"7px 18px",borderRadius:6,border:"3px solid white",
        opacity:failOpacity,pointerEvents:"none",transform:"rotate(-12deg)",
        textTransform:"uppercase",letterSpacing:1}}>Eat 👅</div>
      <div style={{width:"100%",height:"100%",background:"#ede5d8",display:"flex",
        alignItems:"center",justifyContent:"center",fontSize:72,
        pointerEvents:"none",position:"relative",overflow:"hidden"}}>
        {photo.photo_url
          ?<img src={photo.photo_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
          :<span>📸</span>}
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(to top,rgba(28,20,12,0.65) 0%,transparent 52%)",
          pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,
          padding:"20px 20px 16px",color:"white",pointerEvents:"none"}}>
          <div style={{fontSize:19,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>
            {photo.username}
          </div>
          <div style={{fontSize:12,opacity:.75,marginTop:2}}>{photo.time_ago}</div>
          {photo.caption&&<div style={{fontSize:13,opacity:.88,marginTop:8,lineHeight:1.5}}>{photo.caption}</div>}
        </div>
      </div>
    </div>
  );
}
