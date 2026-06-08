import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function StudentHomework() {
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState([]);
  const [note, setNote] = useState({});
  const [msgs, setMsgs] = useState({});
  const [loading, setLoading] = useState({});
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => { fetchHomework(); }, []);

  const fetchHomework = async () => {
    try {
      const { data } = await axios.get(`${API}/homework`);
      setHomeworks(data.homeworks);
    } catch { setError("Failed to load homework"); }
  };

  const handleSubmit = async (hwId) => {
    setLoading({ ...loading, [hwId]: true });
    setMsgs({ ...msgs, [hwId]: "" });
    try {
      const { data } = await axios.post(`${API}/homework/${hwId}/submit`, { note: note[hwId] || "" });
      setMsgs({ ...msgs, [hwId]: data.message });
      fetchHomework();
    } catch (err) {
      setMsgs({ ...msgs, [hwId]: err.response?.data?.message || "Failed to submit" });
    } finally {
      setLoading({ ...loading, [hwId]: false });
    }
  };

  const isSubmitted = (hw) =>
    hw.submissions?.some(s => s.student === user._id || s.student?._id === user._id);

  const isOverdue = (date) => new Date(date) < new Date();

  const filtered = homeworks.filter(hw => {
    if (filter === "submitted") return isSubmitted(hw);
    if (filter === "pending") return !isSubmitted(hw) && !isOverdue(hw.dueDate);
    if (filter === "overdue") return isOverdue(hw.dueDate) && !isSubmitted(hw);
    return true;
  });

  const counts = {
    all: homeworks.length,
    pending: homeworks.filter(h => !isSubmitted(h) && !isOverdue(h.dueDate)).length,
    submitted: homeworks.filter(h => isSubmitted(h)).length,
    overdue: homeworks.filter(h => isOverdue(h.dueDate) && !isSubmitted(h)).length,
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <h2 style={s.title}>📚 My Homework</h2>
        <p style={s.sub}>View and submit your assignments</p>

        {error && <div style={s.error}>{error}</div>}

        {/* Filter tabs */}
        <div style={s.tabs}>
          {[
            { key:"all",       label:`All (${counts.all})` },
            { key:"pending",   label:`Pending (${counts.pending})`,   color:"#d97706" },
            { key:"submitted", label:`Submitted (${counts.submitted})`, color:"#059669" },
            { key:"overdue",   label:`Overdue (${counts.overdue})`,   color:"#e53e3e" },
          ].map(t => (
            <button key={t.key} style={{...s.tab, ...(filter===t.key ? s.activeTab : {})}}
              onClick={() => setFilter(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Homework cards */}
        {filtered.length === 0 ? (
          <div style={s.empty}>No homework in this category 🎉</div>
        ) : (
          <div style={s.list}>
            {filtered.map(hw => {
              const submitted = isSubmitted(hw);
              const overdue = isOverdue(hw.dueDate);
              return (
                <div key={hw._id} style={{...s.card, borderLeft:`4px solid ${submitted?"#059669":overdue?"#e53e3e":"#d97706"}`}}>
                  <div style={s.cardTop}>
                    <div>
                      <div style={s.hwTitle}>{hw.title}</div>
                      <div style={s.hwMeta}>
                        <span>📖 {hw.subject}</span>
                        <span>👨‍🏫 {hw.assignedBy?.name}</span>
                        <span>📅 Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                      </div>
                      <p style={s.hwDesc}>{hw.description}</p>
                    </div>
                    <span style={{...s.badge,
                      background: submitted?"#d1fae5":overdue?"#fee2e2":"#fef3c7",
                      color: submitted?"#276749":overdue?"#c53030":"#92400e"}}>
                      {submitted ? "✅ Submitted" : overdue ? "❌ Overdue" : "⏳ Pending"}
                    </span>
                  </div>

                  {/* Submit section */}
                  {!submitted && (
                    <div style={s.submitSection}>
                      <textarea style={s.noteInput} placeholder="Add a note (optional)..."
                        value={note[hw._id] || ""}
                        onChange={e => setNote({...note, [hw._id]: e.target.value})} />
                      <button style={{...s.submitBtn, opacity:loading[hw._id]?0.7:1}}
                        onClick={() => handleSubmit(hw._id)}
                        disabled={loading[hw._id] || overdue}>
                        {loading[hw._id] ? "Submitting..." : overdue ? "Due date passed" : "Submit Homework"}
                      </button>
                    </div>
                  )}
                  {msgs[hw._id] && (
                    <div style={{...s.msg, color: msgs[hw._id].includes("time")?"#276749":"#c53030"}}>
                      {msgs[hw._id]}
                    </div>
                  )}
                </div>
              );
            })}
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
  tabs: { display:"flex", gap:"0.75rem", marginBottom:"1.5rem", flexWrap:"wrap" },
  tab: { padding:"0.5rem 1.1rem", border:"1.5px solid #e2e8f0", borderRadius:"20px", background:"#fff", cursor:"pointer", fontSize:"0.875rem", color:"#4a5568" },
  activeTab: { background:"#0891b2", color:"#fff", borderColor:"#0891b2" },
  list: { display:"flex", flexDirection:"column", gap:"1.2rem" },
  card: { background:"#fff", borderRadius:"12px", padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTop: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem", marginBottom:"1rem" },
  hwTitle: { fontWeight:"600", color:"#2d3748", fontSize:"1.05rem", marginBottom:"0.4rem" },
  hwMeta: { display:"flex", gap:"1rem", flexWrap:"wrap", fontSize:"0.82rem", color:"#718096", marginBottom:"0.5rem" },
  hwDesc: { color:"#4a5568", fontSize:"0.875rem", margin:0 },
  badge: { padding:"0.3rem 0.8rem", borderRadius:"20px", fontSize:"0.8rem", fontWeight:"600", whiteSpace:"nowrap" },
  submitSection: { borderTop:"1px solid #f0f0f0", paddingTop:"1rem", display:"flex", gap:"0.75rem", alignItems:"flex-start" },
  noteInput: { flex:1, padding:"0.6rem 0.9rem", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"0.875rem", outline:"none", fontFamily:"inherit", resize:"none", height:"60px" },
  submitBtn: { padding:"0.6rem 1.3rem", background:"#059669", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"600", cursor:"pointer", whiteSpace:"nowrap" },
  msg: { marginTop:"0.75rem", fontSize:"0.875rem", fontWeight:"600" },
  empty: { textAlign:"center", color:"#a0aec0", padding:"3rem", background:"#fff", borderRadius:"12px", fontSize:"1rem" },
  error: { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
};
