import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function FriendsTab({ user, profile }) {
  const [friends, setFriends]           = useState([]);
  const [pending, setPending]           = useState([]);
  const [searchId, setSearchId]         = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching]       = useState(false);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(true);

  useEffect(() => { loadFriends(); }, []);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("friendships")
        .select("*, requester:requester_id(username, player_id), receiver:receiver_id(username, player_id)")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

      const accepted = (data||[]).filter(f => f.status === "accepted");
      const incoming = (data||[]).filter(f => f.status === "pending" && f.receiver_id === user.id);

      setFriends(accepted.map(f => ({
        id: f.id,
        username: f.requester_id === user.id ? f.receiver?.username : f.requester?.username,
        playerId: f.requester_id === user.id ? f.receiver?.player_id : f.requester?.player_id,
        friendshipId: f.id,
      })));
      setPending(incoming.map(f => ({
        id: f.id,
        username: f.requester?.username,
        playerId: f.requester?.player_id,
        requesterId: f.requester_id,
      })));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearching(true); setError(""); setSearchResult(null);
    const tag = searchId.trim().toUpperCase();
    try {
      const { data } = await supabase
        .from("profiles").select("id, username, player_id")
        .eq("player_id", tag.startsWith("#") ? tag : "#" + tag)
        .single();
      if (!data) { setError("No player found with that ID"); }
      else if (data.id === user.id) { setError("That's you!"); }
      else { setSearchResult(data); }
    } catch(e) { setError("No player found with that ID"); }
    setSearching(false);
  };

  const handleAddFriend = async (receiverId) => {
    try {
      await supabase.from("friendships").insert({
        requester_id: user.id,
        receiver_id: receiverId,
        status: "pending",
      });
      setSearchResult(null); setSearchId("");
      alert("Friend request sent! 🐸");
    } catch(e) {
      setError("Already sent a request to this person");
    }
  };

  const handleAccept = async (friendshipId) => {
    await supabase.from("friendships")
      .update({ status: "accepted" }).eq("id", friendshipId);
    loadFriends();
  };

  const handleRemove = async (friendshipId) => {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    loadFriends();
  };

  return (
    <div style={{flex:1,overflowY:"auto",padding:"14px 14px 90px",
      display:"flex",flexDirection:"column",gap:16,minHeight:0}}>

      {/* Your player ID */}
      <div style={{background:"#fff9f4",borderRadius:16,padding:"16px 18px",
        boxShadow:"0 2px 12px rgba(44,35,24,0.06)"}}>
        <div style={{fontSize:11,fontWeight:600,letterSpacing:"1.5px",
          textTransform:"uppercase",color:"#2c2318",marginBottom:8}}>your player id</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,
            fontWeight:900,color:"#4a9457",letterSpacing:2}}>
            {profile?.player_id || "loading…"}
          </div>
          <div style={{fontSize:12,color:"#8a7260",maxWidth:100,textAlign:"right",lineHeight:1.4}}>
            share this with friends
          </div>
        </div>
        <div style={{marginTop:4,fontSize:12,color:"#8a7260"}}>
          your name: {profile?.username}
        </div>
      </div>

      {/* Add friend */}
      <div style={{background:"#fff9f4",borderRadius:16,padding:"16px 18px",
        boxShadow:"0 2px 12px rgba(44,35,24,0.06)"}}>
        <div style={{fontSize:11,fontWeight:600,letterSpacing:"1.5px",
          textTransform:"uppercase",color:"#2c2318",marginBottom:10}}>add a friend</div>
        <div style={{display:"flex",gap:8}}>
          <input value={searchId}
            onChange={e=>{setSearchId(e.target.value);setError("");setSearchResult(null);}}
            onKeyDown={e=>e.key==="Enter"&&handleSearch()}
            placeholder="enter player ID e.g. #A3F92K"
            style={{flex:1,background:"#faf7f2",border:"1.5px solid #ede5d8",
              borderRadius:12,padding:"11px 14px",fontSize:14,color:"#2c2318",
              outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
          <button onClick={handleSearch} disabled={searching}
            style={{background:"#2c2318",color:"white",border:"none",borderRadius:12,
              padding:"11px 18px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            {searching?"…":"find"}
          </button>
        </div>
        {error && <div style={{fontSize:12,color:"#e05c48",marginTop:8}}>{error}</div>}
        {searchResult && (
          <div style={{marginTop:10,display:"flex",alignItems:"center",
            justifyContent:"space-between",background:"#faf7f2",
            borderRadius:12,padding:"12px 14px"}}>
            <div>
              <div style={{fontWeight:500,color:"#2c2318"}}>🐸 {searchResult.username}</div>
              <div style={{fontSize:11,color:"#8a7260",marginTop:2}}>{searchResult.player_id}</div>
            </div>
            <button onClick={()=>handleAddFriend(searchResult.id)}
              style={{background:"#6db87a",color:"white",border:"none",borderRadius:100,
                padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              add
            </button>
          </div>
        )}
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div style={{background:"#fff9f4",borderRadius:16,padding:"16px 18px",
          boxShadow:"0 2px 12px rgba(44,35,24,0.06)"}}>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:"1.5px",
            textTransform:"uppercase",color:"#2c2318",marginBottom:10}}>
            friend requests ({pending.length})
          </div>
          {pending.map(p => (
            <div key={p.id} style={{display:"flex",alignItems:"center",
              justifyContent:"space-between",padding:"10px 0",
              borderBottom:"1px solid #ede5d8"}}>
              <div>
                <div style={{fontWeight:500,color:"#2c2318"}}>🐸 {p.username}</div>
                <div style={{fontSize:11,color:"#8a7260",marginTop:2}}>{p.playerId}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>handleAccept(p.id)}
                  style={{background:"#6db87a",color:"white",border:"none",
                    borderRadius:100,padding:"7px 14px",fontSize:12,
                    fontWeight:600,cursor:"pointer"}}>accept</button>
                <button onClick={()=>handleRemove(p.id)}
                  style={{background:"#ede5d8",color:"#8a7260",border:"none",
                    borderRadius:100,padding:"7px 14px",fontSize:12,
                    fontWeight:600,cursor:"pointer"}}>decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends list */}
      <div style={{background:"#fff9f4",borderRadius:16,padding:"16px 18px",
        boxShadow:"0 2px 12px rgba(44,35,24,0.06)"}}>
        <div style={{fontSize:11,fontWeight:600,letterSpacing:"1.5px",
          textTransform:"uppercase",color:"#2c2318",marginBottom:10}}>
          friends ({friends.length})
        </div>
        {loading ? (
          <div style={{fontSize:13,color:"#8a7260"}}>loading…</div>
        ) : friends.length === 0 ? (
          <div style={{fontSize:13,color:"#8a7260",lineHeight:1.6}}>
            No friends yet!<br/>
            Share your player ID so they can find you.
          </div>
        ) : (
          friends.map(f => (
            <div key={f.id} style={{display:"flex",alignItems:"center",
              justifyContent:"space-between",padding:"10px 0",
              borderBottom:"1px solid #ede5d8"}}>
              <div>
                <div style={{fontWeight:500,color:"#2c2318"}}>🐸 {f.username}</div>
                <div style={{fontSize:11,color:"#8a7260",marginTop:2}}>{f.playerId}</div>
              </div>
              <button onClick={()=>handleRemove(f.friendshipId)}
                style={{background:"none",border:"none",fontSize:12,
                  color:"#d4c4b0",cursor:"pointer"}}>remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
