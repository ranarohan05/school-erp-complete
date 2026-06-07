import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = "http://localhost:5000/api";

export default function AdminHomework() {
  const [homeworks, setHomeworks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => { fetchHomework(); }, []);

  const fetchHomework = async () => {
    try {
      const { data } = await axios.get(`${API}/homework`);
      setHomeworks(data.homeworks);
    } catch { setError("Failed to load homework"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this homework?")) return;
    try {
      await axios.delete(`${API}/homework/${id}`);
      fetchHomework();
    } catch { setError("Delete failed"); }
  };

  const isOverdue = (date) => new Date(date) < new Date();
  const total      = homeworks.length;
  const active     = homeworks.filter(h => !isOverdue(h.dueDate)).length;
  const overdue    = homeworks.filter(h =>  isOverdue(h.dueDate)).length;
  const totalSubs  = homeworks.reduce((a, h) => a + (h.submissions?.length || 0), 0);

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <h2 style={s.title}>📚 Homework Overview</h2>
        <p style={s.sub}>All homework assigned across the school</p>

        {error && <div style={s.error}>{error}</div>}

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { icon:"📝", label:"Total Assignments", val:total,     color:"#7c3aed" },
            { icon:"⏳", label:"Active",             val:active,    color:"#d97706" },
            { icon:"❌", label:"Overdue",            val:overdue,   color:"#e53e3e" },
            { icon:"✅", label:"Total Submissions",  val:totalSubs, color:"#059669" },
          ].map(st => (
            <div key={st.label} style={{...s.stat, borderTop:`3px solid ${st.color}`}}>
              <span style={s.statIcon}>{st.icon}</span>
              <span style={s.statVal}>{st.val}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>📋 All Homework</h3>
          {homeworks.length === 0 ? (
            <div style={s.empty}>No homework has been assigned yet.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  {["Title","Subject","Class","Teacher","Due Date","Submissions","Status","Action"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {homeworks.map((hw, i) => (
                  <tr key={hw._id} style={{background: i%2===0?"#fff":"#f7fafc"}}>
                    <td style={{...s.td, fontWeight:"600"}}>{hw.title}</td>
                    <td style={s.td}>{hw.subject}</td>
                    <td style={s.td}>{hw.class}</td>
                    <td style={s.td}>{hw.assignedBy?.name || "—"}</td>
                    <td style={s.td}>{new Date(hw.dueDate).toLocaleDateString()}</td>
                    <td style={s.td}>{hw.submissions?.length || 0}</td>
                    <td style={s.td}>
                      <span style={{...s.badge, background:isOverdue(hw.dueDate)?"#fee2e2":"#d1fae5",
                        color:isOverdue(hw.dueDate)?"#c53030":"#276749"}}>
                        {isOverdue(hw.dueDate) ? "Overdue" : "Active"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button style={s.delBtn} onClick={() => handleDelete(hw._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", background:"#f7fafc" },
  content: { maxWidth:"1200px", margin:"0 auto", padding:"2rem" },
  title: { fontSize:"1.6rem", color:"#1a202c", margin:"0 0 0.25rem" },
  sub: { color:"#718096", marginBottom:"1.5rem" },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"1rem", marginBottom:"2rem" },
  stat: { background:"#fff", borderRadius:"12px", padding:"1.2rem", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:"0.3rem" },
  statIcon: { fontSize:"1.5rem" },
  statVal: { fontSize:"1.8rem", fontWeight:"700", color:"#2d3748" },
  statLabel: { fontSize:"0.82rem", color:"#718096" },
  card: { background:"#fff", borderRadius:"12px", padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", overflowX:"auto" },
  cardTitle: { margin:"0 0 1.2rem", color:"#2d3748", fontSize:"1.05rem", fontWeight:"600" },
  table: { width:"100%", borderCollapse:"collapse", minWidth:"700px" },
  thead: { background:"#f7fafc" },
  th: { padding:"0.75rem 1rem", textAlign:"left", fontSize:"0.82rem", fontWeight:"600", color:"#4a5568", borderBottom:"2px solid #e2e8f0", whiteSpace:"nowrap" },
  td: { padding:"0.75rem 1rem", fontSize:"0.875rem", color:"#2d3748", borderBottom:"1px solid #f0f0f0" },
  badge: { padding:"0.2rem 0.6rem", borderRadius:"20px", fontSize:"0.75rem", fontWeight:"600" },
  delBtn: { padding:"0.35rem 0.8rem", background:"#fff5f5", color:"#c53030", border:"1px solid #fed7d7", borderRadius:"6px", cursor:"pointer", fontWeight:"600", fontSize:"0.8rem" },
  empty: { color:"#a0aec0", textAlign:"center", padding:"2rem" },
  error: { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
};
