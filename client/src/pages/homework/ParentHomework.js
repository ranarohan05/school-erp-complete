import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function ParentHomework() {
  const [homeworks, setHomeworks] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchHomework(); }, []);

  const fetchHomework = async () => {
    try {
      const { data } = await axios.get(`${API}/homework`);
      setHomeworks(data.homeworks);
    } catch { setError("Failed to load homework. Make sure your child is linked."); }
  };

  const isOverdue = (date) => new Date(date) < new Date();

  const filtered = homeworks.filter(hw => {
    if (filter === "active")  return !isOverdue(hw.dueDate);
    if (filter === "overdue") return isOverdue(hw.dueDate);
    return true;
  });

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <h2 style={s.title}>📚 Child's Homework</h2>
        <p style={s.sub}>Monitor your child's assignments</p>

        {error && <div style={s.error}>{error}</div>}

        {/* Summary */}
        <div style={s.statsRow}>
          {[
            { icon:"📝", label:"Total",   val: homeworks.length,                                        color:"#0891b2" },
            { icon:"⏳", label:"Active",  val: homeworks.filter(h => !isOverdue(h.dueDate)).length,     color:"#d97706" },
            { icon:"❌", label:"Overdue", val: homeworks.filter(h => isOverdue(h.dueDate)).length,      color:"#e53e3e" },
            { icon:"✅", label:"Submitted",val: homeworks.reduce((a,h) => a + (h.submissions?.length||0),0), color:"#059669" },
          ].map(s2 => (
            <div key={s2.label} style={{...s.stat, borderTop:`3px solid ${s2.color}`}}>
              <span style={s.statIcon}>{s2.icon}</span>
              <span style={s.statVal}>{s2.val}</span>
              <span style={s.statLabel}>{s2.label}</span>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={s.tabs}>
          {["all","active","overdue"].map(f => (
            <button key={f} style={{...s.tab, ...(filter===f?s.activeTab:{})}}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div style={s.empty}>No homework found.</div>
        ) : (
          <div style={s.list}>
            {filtered.map(hw => (
              <div key={hw._id} style={{...s.card, borderLeft:`4px solid ${isOverdue(hw.dueDate)?"#e53e3e":"#0891b2"}`}}>
                <div style={s.top}>
                  <div>
                    <div style={s.hwTitle}>{hw.title}</div>
                    <div style={s.meta}>
                      <span>📖 {hw.subject}</span>
                      <span>👨‍🏫 {hw.assignedBy?.name}</span>
                      <span>📅 Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                      <span>✅ {hw.submissions?.length || 0} students submitted</span>
                    </div>
                    <p style={s.desc}>{hw.description}</p>
                  </div>
                  <span style={{...s.badge, background:isOverdue(hw.dueDate)?"#fee2e2":"#ebf8ff",
                    color:isOverdue(hw.dueDate)?"#c53030":"#2b6cb0"}}>
                    {isOverdue(hw.dueDate) ? "Overdue" : "Active"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", background:"#f7fafc" },
  content: { maxWidth:"900px", margin:"0 auto", padding:"2rem" },
  title: { fontSize:"1.6rem", color:"#1a202c", margin:"0 0 0.25rem" },
  sub: { color:"#718096", marginBottom:"1.5rem" },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem", marginBottom:"1.5rem" },
  stat: { background:"#fff", borderRadius:"12px", padding:"1.2rem", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:"0.3rem" },
  statIcon: { fontSize:"1.5rem" },
  statVal: { fontSize:"1.8rem", fontWeight:"700", color:"#2d3748" },
  statLabel: { fontSize:"0.82rem", color:"#718096" },
  tabs: { display:"flex", gap:"0.75rem", marginBottom:"1.5rem" },
  tab: { padding:"0.5rem 1.1rem", border:"1.5px solid #e2e8f0", borderRadius:"20px", background:"#fff", cursor:"pointer", fontSize:"0.875rem", color:"#4a5568" },
  activeTab: { background:"#0891b2", color:"#fff", borderColor:"#0891b2" },
  list: { display:"flex", flexDirection:"column", gap:"1rem" },
  card: { background:"#fff", borderRadius:"12px", padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  top: { display:"flex", justifyContent:"space-between", gap:"1rem" },
  hwTitle: { fontWeight:"600", color:"#2d3748", fontSize:"1.05rem", marginBottom:"0.4rem" },
  meta: { display:"flex", gap:"1rem", flexWrap:"wrap", fontSize:"0.82rem", color:"#718096", marginBottom:"0.5rem" },
  desc: { color:"#4a5568", fontSize:"0.875rem", margin:0 },
  badge: { padding:"0.3rem 0.8rem", borderRadius:"20px", fontSize:"0.8rem", fontWeight:"600", whiteSpace:"nowrap", height:"fit-content" },
  empty: { textAlign:"center", color:"#a0aec0", padding:"3rem", background:"#fff", borderRadius:"12px" },
  error: { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
};
