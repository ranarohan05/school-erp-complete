import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const BADGES = ["🏆","🥇","🥈","🥉","⭐","🎖️","🎓","💡"];
const TYPES  = ["academic","sports","cultural","other"];
const TYPE_COLOR = { academic:"#7c3aed", sports:"#059669", cultural:"#d97706", other:"#0891b2" };

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [students, setStudents]         = useState([]);
  const [teachers, setTeachers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [msg, setMsg]                   = useState("");
  const [showForm, setShowForm]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [filterRole, setFilterRole]     = useState("all");
  const [filterType, setFilterType]     = useState("all");
  const [form, setForm] = useState({
    title:"", description:"", type:"academic", badge:"🏆",
    awardedTo:"", awardedToRole:"student", date:"", session:"2025-2026"
  });

  useEffect(() => { fetchAll(); fetchUsers(); }, []);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API}/achievements/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAchievements(data.achievements);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const [s, t] = await Promise.all([
        axios.get(`${API}/auth/students`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/auth/teachers`,  { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStudents(s.data.students);
      setTeachers(t.data.teachers);
    } catch {}
  };

  const handleSave = async () => {
    if (!form.title || !form.awardedTo) return setError("Title and recipient required");
    setSaving(true); setMsg(""); setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/achievements`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg("✅ Achievement awarded!");
      setForm({ title:"", description:"", type:"academic", badge:"🏆", awardedTo:"", awardedToRole:"student", date:"", session:"2025-2026" });
      setShowForm(false);
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this achievement?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/achievements/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || err.message); }
  };

  const recipients = form.awardedToRole === "student" ? students : teachers;
  const filtered = achievements.filter(a => {
    const matchRole = filterRole === "all" || a.awardedToRole === filterRole;
    const matchType = filterType === "all" || a.type === filterType;
    return matchRole && matchType;
  });

  return (
    <div style={{ minHeight:"100vh", background:"#f7fafc" }}>
      <Navbar />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem" }}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>🏆 Achievements</h2>
            <p style={s.sub}>Award and manage student & teacher achievements</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(""); setMsg(""); }}
            style={s.addBtn}>{showForm ? "✕ Cancel" : "+ Award Achievement"}</button>
        </div>

        {msg   && <div style={s.success}>{msg}</div>}
        {error && <div style={s.errorBox}>{error}</div>}

        {/* Form */}
        {showForm && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>🎖️ Award New Achievement</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1rem" }}>
              <div style={s.field}>
                <label style={s.label}>Title</label>
                <input style={s.input} placeholder="e.g. Best Student of Month" value={form.title}
                  onChange={e => setForm({...form, title:e.target.value})} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Award To</label>
                <select style={s.input} value={form.awardedToRole}
                  onChange={e => setForm({...form, awardedToRole:e.target.value, awardedTo:""})}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Select {form.awardedToRole === "student" ? "Student" : "Teacher"}</label>
                <select style={s.input} value={form.awardedTo}
                  onChange={e => setForm({...form, awardedTo:e.target.value})}>
                  <option value="">-- Select --</option>
                  {recipients.map(r => (
                    <option key={r._id} value={r._id}>{r.name} {r.class ? `(Class ${r.class})` : r.subject ? `(${r.subject})` : ""}</option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Type</label>
                <select style={s.input} value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
                  {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Badge</label>
                <select style={s.input} value={form.badge} onChange={e => setForm({...form, badge:e.target.value})}>
                  {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Date</label>
                <input style={s.input} type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Session</label>
                <input style={s.input} value={form.session} onChange={e => setForm({...form, session:e.target.value})} />
              </div>
              <div style={{ ...s.field, gridColumn:"1/-1" }}>
                <label style={s.label}>Description (optional)</label>
                <input style={s.input} placeholder="e.g. For outstanding performance in Mathematics" value={form.description}
                  onChange={e => setForm({...form, description:e.target.value})} />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              style={{ ...s.addBtn, marginTop:"1.2rem", opacity:saving?0.7:1 }}>
              {saving ? "Saving..." : "🏆 Award Achievement"}
            </button>
          </div>
        )}

        {/* Filters */}
        <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
          {["all","student","teacher"].map(r => (
            <button key={r} onClick={() => setFilterRole(r)} style={{
              padding:"0.4rem 1rem", borderRadius:20, border:"1.5px solid #e2e8f0", cursor:"pointer", fontSize:"0.85rem", fontWeight:600,
              background: filterRole===r?"#7c3aed":"#fff", color: filterRole===r?"#fff":"#4a5568"
            }}>{r === "all" ? "All" : r.charAt(0).toUpperCase()+r.slice(1)+"s"}</button>
          ))}
          <span style={{ color:"#e2e8f0" }}>|</span>
          {["all",...TYPES].map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{
              padding:"0.4rem 1rem", borderRadius:20, border:"1.5px solid #e2e8f0", cursor:"pointer", fontSize:"0.85rem", fontWeight:600,
              background: filterType===t ? (TYPE_COLOR[t]||"#7c3aed") : "#fff",
              color: filterType===t ? "#fff" : "#4a5568"
            }}>{t === "all" ? "All Types" : t.charAt(0).toUpperCase()+t.slice(1)}</button>
          ))}
        </div>

        {/* Achievements Grid */}
        {loading ? <p style={{ color:"#718096" }}>Loading...</p> : (
          filtered.length === 0 ? (
            <div style={{ ...s.card, textAlign:"center", color:"#a0aec0", padding:"3rem" }}>
              No achievements found. Click "+ Award Achievement" to start!
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" }}>
              {filtered.map(a => (
                <div key={a._id} style={{ ...s.card, borderTop:`4px solid ${TYPE_COLOR[a.type]||"#7c3aed"}`, padding:"1.2rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ fontSize:"2.5rem" }}>{a.badge}</div>
                    <button onClick={() => handleDelete(a._id)}
                      style={{ background:"#fff5f5", color:"#c53030", border:"1px solid #feb2b2", borderRadius:6, padding:"0.2rem 0.5rem", cursor:"pointer", fontSize:"0.8rem" }}>
                      🗑
                    </button>
                  </div>
                  <div style={{ fontWeight:700, fontSize:"1rem", color:"#1a202c", margin:"0.5rem 0 0.25rem" }}>{a.title}</div>
                  {a.description && <p style={{ color:"#718096", fontSize:"0.85rem", margin:"0 0 0.5rem" }}>{a.description}</p>}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", marginBottom:"0.5rem" }}>
                    <span style={{ background:TYPE_COLOR[a.type]+"18", color:TYPE_COLOR[a.type], borderRadius:20, padding:"0.15rem 0.6rem", fontSize:"0.75rem", fontWeight:600 }}>
                      {a.type.charAt(0).toUpperCase()+a.type.slice(1)}
                    </span>
                    <span style={{ background: a.awardedToRole==="student"?"#d1fae5":"#ede9fe", color: a.awardedToRole==="student"?"#059669":"#7c3aed", borderRadius:20, padding:"0.15rem 0.6rem", fontSize:"0.75rem", fontWeight:600 }}>
                      {a.awardedToRole === "student" ? "🎓" : "👨‍🏫"} {a.awardedToName}
                    </span>
                  </div>
                  <div style={{ fontSize:"0.8rem", color:"#a0aec0" }}>
                    📅 {new Date(a.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })} · {a.session}
                  </div>
                  <div style={{ fontSize:"0.8rem", color:"#a0aec0" }}>By {a.awardedByName}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

const s = {
  header:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" },
  title:     { fontSize:"1.6rem", fontWeight:700, color:"#1a202c", margin:"0 0 0.25rem" },
  sub:       { color:"#718096", margin:0 },
  card:      { background:"#fff", borderRadius:12, padding:"1.5rem", marginBottom:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle: { margin:"0 0 1.2rem", color:"#2d3748", fontSize:"1.05rem", fontWeight:600 },
  field:     { display:"flex", flexDirection:"column", gap:"0.4rem" },
  label:     { fontSize:"0.85rem", fontWeight:600, color:"#4a5568" },
  input:     { padding:"0.55rem 0.8rem", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:"0.9rem", outline:"none", fontFamily:"inherit" },
  addBtn:    { padding:"0.55rem 1.2rem", background:"#f59e0b", color:"#fff", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" },
  success:   { background:"#f0fff4", color:"#276749", padding:"0.75rem", borderRadius:8, marginBottom:"1rem" },
  errorBox:  { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:8, marginBottom:"1rem" },
};