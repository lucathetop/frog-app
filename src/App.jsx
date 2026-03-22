import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function LeaderboardTab({ user }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_weekly_leaderboard");
        if (error) throw error;
        setLeaders(data || []);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{flex:1,overflowY:"auto",padding:"14px 14px 90px",
      display:"flex",flexDirection:"column",gap:16,minHeight:0}}>

      <div style={{textAlign:"center",padding:"8px 0"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,
          fontWeight:900,color:"#2c2318"}}>
          weekly leaderboard
        </div>
        <div style={{fontSize:12,color:"#8a7260",marginTop:4}}>
          most photos spared this week 🐸
        </div>
        <div style={{fontSize:11,color:"#d4c4b0",marginTop:2}}>
          resets every sunday
        </div>
      </div>

      {loading ? (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",
          padding:40,fontSize:40,animation:"bob 2s ease-in-out infinite"}}>🐸</div>
      ) : leaders.length === 0 ? (
        <div style={{background:"#fff9f4",borderRadius:20,padding:"32px 24px",
          textAlign:"center",boxShadow:"0 2px 12px rgba(44,35,24,0.06)"}}>
          <div style={{fontSize:48,marginBottom:12}}>🐸</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,
            fontWeight:700,color:"#2c2318"}}>No data yet</div>
          <div style={{fontSize:13,color:"#8a7260",marginTop:6,lineHeight:1.6}}>
            Post photos and get your friends<br/>to judge them to appear here!
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {leaders.length >= 3 && (
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",
              gap:8,padding:"8px 0 16px"}}>
              {/* 2nd place */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flex:1}}>
                <div style={{fontSize:28}}>🥈</div>
                <div style={{background:"#fff9f4",borderRadius:16,padding:"12px 8px",
                  width:"100%",textAlign:"center",
                  boxShadow:"0 2px 12px rgba(44,35,24,0.06)",
                  height:100,display:"flex",flexDirection:"column",
                  alignItems:"center",justifyContent:"center",gap:4}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#2c2318",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                    maxWidth:"100%",padding:"0 4px"}}>
                    {leaders[1]?.username}
                  </div>
                  <div style={{fontSize:20,fontWeight:900,
                    fontFamily:"'Playfair Display',serif",color:"#4a9457"}}>
                    {leaders[1]?.total_spared}
                  </div>
                  <div style={{fontSize:10,color:"#8a7260"}}>spared</div>
                </div>
              </div>
              {/* 1st place */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flex:1}}>
                <div style={{fontSize:36}}>🥇</div>
                <div style={{background:"#eaf5ec",borderRadius:16,padding:"12px 8px",
                  width:"100%",textAlign:"center",
                  boxShadow:"0 4px 20px rgba(109,184,122,0.2)",
                  height:120,display:"flex",flexDirection:"column",
                  alignItems:"center",justifyContent:"center",gap:4,
                  border:"2px solid #6db87a"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#2c2318",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                    maxWidth:"100%",padding:"0 4px"}}>
                    {leaders[0]?.username}
                  </div>
                  <div style={{fontSize:24,fontWeight:900,
                    fontFamily:"'Playfair Display',serif",color:"#4a9457"}}>
                    {leaders[0]?.total_spared}
                  </div>
                  <div style={{fontSize:10,color:"#4a9457",fontWeight:600}}>spared</div>
                </div>
              </div>
              {/* 3rd place */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flex:1}}>
                <div style={{fontSize:24}}>🥉</div>
                <div style={{background:"#fff9f4",borderRadius:16,padding:"12px 8px",
                  width:"100%",textAlign:"center",
                  boxShadow:"0 2px 12px rgba(44,35,24,0.06)",
                  height:90,display:"flex",flexDirection:"column",
                  alignItems:"center",justifyContent:"center",gap:4}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#2c2318",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                    maxWidth:"100%",padding:"0 4px"}}>
                    {leaders[2]?.username}
                  </div>
                  <div style={{fontSize:18,fontWeight:900,
                    fontFamily:"'Playfair Display',serif",color:"#4a9457"}}>
                    {leaders[2]?.total_spared}
                  </div>
                  <div style={{fontSize:10,color:"#8a7260"}}>spared</div>
                </div>
              </div>
            </div>
          )}

          {/* Rest of leaderboard */}
          <div style={{background:"#fff9f4",borderRadius:20,overflow:"hidden",
            boxShadow:"0 2px 12px rgba(44,35,24,0.06)"}}>
            {leaders.map((p, i) => (
              <div key={p.player_id} style={{
                display:"flex",alignItems:"center",gap:12,
                padding:"14px 16px",
                borderBottom: i < leaders.length-1 ? "1px solid #ede5d8" : "none",
                background: p.username === user?.user_metadata?.username ||
                  p.player_id === user?.player_id ? "#eaf5ec" : "transparent"
              }}>
                <div style={{fontSize:20,width:28,textAlign:"center",flexShrink:0}}>
                  {i < 3 ? medals[i] : <span style={{fontSize:13,fontWeight:700,
                    color:"#8a7260"}}>#{i+1}</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:"#2c2318",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {p.username}
                  </div>
                  <div style={{fontSize:11,color:"#8a7260",marginTop:1}}>
                    {p.player_id}
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:18,fontWeight:900,
                    fontFamily:"'Playfair Display',serif",color:"#4a9457"}}>
                    {p.total_spared}
                  </div>
                  <div style={{fontSize:10,color:"#8a7260"}}>
                    {p.total_eaten} eaten
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
