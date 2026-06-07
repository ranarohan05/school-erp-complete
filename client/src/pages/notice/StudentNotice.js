import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = "http://localhost:5000/api";

const PRIORITY_STYLE = {
  normal:    { bg:"#ebf8ff", color:"#2b6cb0", label:"Normal",    border:"#bee3f8" },
  important: { bg:"#fffbeb", color:"#92400e", label:"Important", border:"#fcd34d" },
  urgent:    { bg:"#fff5f5", color:"#c53030", label:"Urgent",    border:"#feb2b2" },
};

export default function StudentNotice() {
  const [notices, setNotices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("all"); // all | normal | important | urgent

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API}/notices/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { setNotices(res.data.notices); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || err.message); setLoading(false); });
  }, []);

  const filtered = filter === "all" ? notices : notices.filter(n => n.priority === filter);

  return (
    <div style={{ minHeight:"100vh", background:"#f7fafc" }}>
      <Navbar />
      <div style={{ maxWidth:900, margin:"0 auto", padding:"2rem" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h2 style={{ fontSize:"1.6rem", fontWeight:700, color:"#1a202c", margin:"0 0 0.25rem" }}>🔔 Notices</h2>
            <p style={{ color:"#718096", margin:0 }}>{notices.length} notices for you</p>
          </div>
          {/* Filter buttons */}
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
            {["all","normal","important","urgent"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:"0.35rem 0.9rem", borderRadius:20, border:"1.5px solid #e2e8f0", cursor:"pointer", fontSize:"0.8rem", fontWeight:600,
                background: filter===f ? "#7c3aed" : "#fff",
                color:      filter===f ? "#fff"    : "#4a5568",
              }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
        </div>

        {error && <div style={{ background:"#fff5f5", border:"1px solid #feb2b2", color:"#c53030", borderRadius:8, padding:"0.75rem 1rem", marginBottom:"1.5rem" }}>{error}</div>}
        {loading && <p style={{ color:"#718096" }}>Loading notices...</p>}

        {!loading && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {filtered.length === 0 ? (
              <div style={{ background:"#fff", borderRadius:12, padding:"3rem", textAlign:"center", color:"#a0aec0", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                No notices found.
              </div>
            ) : filtered.map(n => {
              const p = PRIORITY_STYLE[n.priority] || PRIORITY_STYLE.normal;
              return (
                <div key={n._id} style={{ background:"#fff", borderRadius:12, padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", borderLeft:`4px solid ${p.color}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.5rem", flexWrap:"wrap" }}>
                    <span style={{ fontWeight:700, fontSize:"1rem", color:"#1a202c" }}>{n.title}</span>
                    <span style={{ background:p.bg, color:p.color, borderRadius:20, padding:"0.15rem 0.6rem", fontSize:"0.75rem", fontWeight:600 }}>{p.label}</span>
                    <span style={{ background: n.targetType==="all"?"#f0fff4":"#ede9fe", color: n.targetType==="all"?"#276749":"#7c3aed", borderRadius:20, padding:"0.15rem 0.6rem", fontSize:"0.75rem", fontWeight:600 }}>
                      {n.targetType === "all" ? "📣 All Students" : `🏫 Class ${n.targetClass}`}
                    </span>
                  </div>
                  <p style={{ color:"#4a5568", margin:"0 0 0.75rem", fontSize:"0.95rem", lineHeight:1.7 }}>{n.message}</p>
                  <div style={{ fontSize:"0.8rem", color:"#a0aec0" }}>
                    📌 By <b>{n.createdByName}</b> · {new Date(n.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}