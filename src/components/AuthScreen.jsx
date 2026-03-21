import { useState } from "react";
import { supabase } from "../supabase";
import FrogSVG from "./FrogSVG";

export default function AuthScreen() {
  const [mode, setMode]         = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [confirm, setConfirm]   = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        if (!username.trim()) { setError("Username is required"); setLoading(false); return; }
        const { error: e } = await supabase.auth.signUp({
          email, password,
          options: { data: { username: username.trim().toLowerCase() } }
        });
        if (e) throw e;
        setConfirm(true);
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
      }
    } catch (e) {
      const msg = e.message?.includes("Invalid login") ? "Wrong email or password"
        : e.message?.includes("already registered") ? "Email already in use"
        : e.message?.includes("Password should") ? "Password must be 6+ characters"
        : e.message;
      setError(msg);
    }
    setLoading(false);
  };

  if (confirm) return (
    <div style={S.page}>
      <FrogSVG size={100} animate />
      <div style={S.title}>fr<span style={{color:"#6db87a"}}>o</span>g</div>
      <div style={{marginTop:24,textAlign:"center",padding:"0 32px"}}>
        <div style={{fontSize:40,marginBottom:12}}>📬</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#2c2318"}}>
          Check your email
        </div>
        <div style={{marginTop:8,fontSize:14,color:"#8a7260",lineHeight:1.7}}>
          We sent a confirmation link to <strong>{email}</strong>.<br/>
          Click it then come back and sign in.
        </div>
        <button onClick={()=>{setConfirm(false);setMode("login");}} style={{...S.btn,marginTop:28}}>
          go to sign in
        </button>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <FrogSVG size={100} animate />
      <div style={S.title}>fr<span style={{color:"#6db87a"}}>o</span>g</div>
      <div style={S.sub}>one photo a day.<br/>your friends decide if it lives.</div>
      <div style={S.card}>
        {mode === "signup" && (
          <input style={S.input} placeholder="username"
            value={username} onChange={e=>setUsername(e.target.value)}/>
        )}
        <input style={S.input} placeholder="email" type="email"
          value={email} onChange={e=>setEmail(e.target.value)}/>
        <input style={S.input} placeholder="password" type="password"
          value={password} onChange={e=>setPassword(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
        {error && <div style={S.error}>{error}</div>}
        <button style={{...S.btn,opacity:loading?0.6:1}}
          onClick={handleSubmit} disabled={loading}>
          {loading?"…":mode==="signup"?"create account":"sign in"}
        </button>
        <div style={S.switchRow}>
          {mode==="login"?(
            <><span style={{color:"#8a7260"}}>no account? </span>
            <button style={S.link} onClick={()=>{setMode("signup");setError("");}}>sign up</button></>
          ):(
            <><span style={{color:"#8a7260"}}>have an account? </span>
            <button style={S.link} onClick={()=>{setMode("login");setError("");}}>sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}

const S = {
  page:{height:"100dvh",background:"#fff9f4",display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",padding:"32px 24px",fontFamily:"'DM Sans',sans-serif"},
  title:{fontFamily:"'Playfair Display',serif",fontSize:72,fontWeight:900,
    lineHeight:1,letterSpacing:-3,color:"#2c2318",marginTop:16},
  sub:{marginTop:10,fontSize:15,color:"#8a7260",lineHeight:1.8,textAlign:"center"},
  card:{marginTop:36,width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:12},
  input:{background:"#faf7f2",border:"1.5px solid #ede5d8",borderRadius:14,
    padding:"14px 18px",fontSize:15,color:"#2c2318",outline:"none",
    fontFamily:"'DM Sans',sans-serif",width:"100%"},
  error:{fontSize:12,color:"#e05c48",textAlign:"center"},
  btn:{background:"#2c2318",color:"#faf7f2",border:"none",fontFamily:"'DM Sans',sans-serif",
    fontSize:15,fontWeight:500,padding:16,borderRadius:100,cursor:"pointer",
    boxShadow:"0 6px 28px rgba(44,35,24,0.22)"},
  switchRow:{textAlign:"center",fontSize:13},
  link:{background:"none",border:"none",color:"#4a9457",fontWeight:600,
    fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:0},
};
