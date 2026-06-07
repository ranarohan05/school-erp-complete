import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API   = "http://localhost:5000/api";
const DAYS  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const COLORS = ["#7c3aed","#0891b2","#059669","#d97706","#db2777","#e53e3e","#6366f1","#0d9488"];

function defaultPeriods() {
  return Array.from({ length: 6 }, (_, i) => ({
    periodNumber: i+1, startTime:"", endTime:"", subject:"", teacherName:"",
  }));
}

export default function AdminTimetable() {
  const [timetables, setTimetables]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [msg, setMsg]                 = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [filterClass, setFilterClass] = useState("");
  const [formClass, setFormClass]     = useState("");
  const [formDay, setFormDay]         = useState("Monday");
  const [formSession, setFormSession] = useState("2025-2026");
  const [periods, setPeriods]         = useState(defaultPeriods());

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API}/timetable/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimetables(data.data);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  const handlePeriodChange = (i, field, val) => {
    const u = [...periods]; u[i][field] = val; setPeriods(u);
  };

  const handleSave = async () => {
    if (!formClass.trim()) return setError("Class name required");
    setSaving(true); setMsg(""); setError("");
    try {
      const token = localStorage.getItem("token");
      const validPeriods = periods.filter(p => p.subject && p.startTime && p.endTime);
      if (validPeriods.length === 0) return setError("Add at least one complete period");
      await axios.post(`${API}/timetable`, {
        class: formClass, day: formDay, periods: validPeriods, session: formSession
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMsg("✅ Timetable saved!");
      setShowForm(false); setFormClass(""); setPeriods(defaultPeriods());
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this timetable entry?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/timetable/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || err.message); }
  };

  const classes = [...new Set(timetables.map(t => t.class))].sort();
  const filtered = filterClass ? timetables.filter(t => t.class === filterClass) : timetables;
  const grouped  = {};
  filtered.forEach(tt => {
    if (!grouped[tt.class]) grouped[tt.class] = {};
    grouped[tt.class][tt.day] = tt;
  });

  const subjectColor = {};
  const allSubjects = [...new Set(timetables.flatMap(t => t.periods.map(p => p.subject)))];
  allSubjects.forEach((sub, i) => { subjectColor[sub] = COLORS[i % COLORS.length]; });

  return (
    <div style={{ minHeight:"100vh", background:"#f7fafc" }}>
      <Navbar />
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"2rem" }}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>🗓️ Timetable Management</h2>
            <p style={s.sub}>Create and manage class timetables</p>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap", alignItems:"center" }}>
            <select style={s.input} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => { setShowForm(!showForm); setError(""); setMsg(""); setPeriods(defaultPeriods()); }}
              style={s.addBtn}>{showForm ? "✕ Cancel" : "+ New Timetable"}</button>
          </div>
        </div>

        {msg   && <div style={s.success}>{msg}</div>}
        {error && <div style={s.errorBox}>{error}</div>}

        {/* Form */}
        {showForm && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>📝 Add / Update Timetable</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
              <div style={s.field}><label style={s.label}>Class</label>
                <input style={s.input} placeholder="e.g. 10A" value={formClass} onChange={e => setFormClass(e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Day</label>
                <select style={s.input} value={formDay} onChange={e => setFormDay(e.target.value)}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select></div>
              <div style={s.field}><label style={s.label}>Session</label>
                <input style={s.input} value={formSession} onChange={e => setFormSession(e.target.value)} /></div>
            </div>

            <h4 style={{ color:"#2d3748", marginBottom:"0.75rem", fontSize:"0.95rem" }}>📚 Periods</h4>
            <div style={{ overflowX:"auto" }}>
              {periods.map((p, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"40px 1fr 110px 110px 1fr 36px", gap:"0.5rem", alignItems:"center", marginBottom:"0.5rem", background:"#f7fafc", padding:"0.6rem 0.75rem", borderRadius:8 }}>
                  <span style={{ fontWeight:700, color:"#7c3aed", fontSize:"0.85rem" }}>P{p.periodNumber}</span>
                  <input style={s.input} placeholder="Subject" value={p.subject} onChange={e => handlePeriodChange(i,"subject",e.target.value)} />
                  <input style={s.input} type="time" value={p.startTime} onChange={e => handlePeriodChange(i,"startTime",e.target.value)} />
                  <input style={s.input} type="time" value={p.endTime} onChange={e => handlePeriodChange(i,"endTime",e.target.value)} />
                  <input style={s.input} placeholder="Teacher name" value={p.teacherName} onChange={e => handlePeriodChange(i,"teacherName",e.target.value)} />
                  <button onClick={() => setPeriods(periods.filter((_,j) => j!==i))}
                    style={{ background:"#fff5f5", color:"#c53030", border:"none", borderRadius:6, cursor:"pointer", padding:"0.3rem 0.5rem" }}>✕</button>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.75rem", flexWrap:"wrap" }}>
              <button onClick={() => setPeriods([...periods, { periodNumber:periods.length+1, startTime:"", endTime:"", subject:"", teacherName:"" }])}
                style={s.outlineBtn}>+ Add Period</button>
              <button onClick={handleSave} disabled={saving}
                style={{ ...s.addBtn, opacity:saving?0.7:1 }}>{saving?"Saving...":"Save Timetable"}</button>
            </div>
          </div>
        )}

        {/* Timetable List */}
        {loading ? <p style={{ color:"#718096" }}>Loading...</p> :
          Object.keys(grouped).length === 0 ? (
            <div style={{ ...s.card, textAlign:"center", color:"#a0aec0", padding:"3rem" }}>
              No timetables yet. Click "+ New Timetable" to start.
            </div>
          ) : Object.entries(grouped).map(([cls, days]) => (
            <div key={cls} style={s.card}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem", flexWrap:"wrap", gap:"0.5rem" }}>
                <h3 style={{ ...s.cardTitle, margin:0 }}>🏫 Class {cls}</h3>
                <span style={{ fontSize:"0.8rem", color:"#718096" }}>{Object.keys(days).length} days scheduled</span>
              </div>
              {DAYS.filter(d => days[d]).map(d => (
                <div key={d} style={{ background:"#f7fafc", borderRadius:10, padding:"1rem", marginBottom:"0.75rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                    <span style={{ fontWeight:700, color:"#2d3748" }}>{d}</span>
                    <button onClick={() => handleDelete(days[d]._id)}
                      style={{ background:"#fff5f5", color:"#c53030", border:"1px solid #feb2b2", borderRadius:6, padding:"0.2rem 0.6rem", cursor:"pointer", fontSize:"0.8rem" }}>
                      🗑 Delete
                    </button>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
                    {[...days[d].periods].sort((a,b)=>a.periodNumber-b.periodNumber).map((p,i) => (
                      <div key={i} style={{ background:"#fff", border:`1.5px solid ${subjectColor[p.subject]||"#e2e8f0"}`, borderRadius:8, padding:"0.4rem 0.8rem", fontSize:"0.8rem" }}>
                        <span style={{ fontWeight:700, color:"#718096" }}>P{p.periodNumber} </span>
                        <span style={{ fontWeight:700, color:subjectColor[p.subject]||"#2d3748" }}>{p.subject}</span>
                        <span style={{ color:"#a0aec0" }}> {p.startTime}–{p.endTime}</span>
                        {p.teacherName && <span style={{ color:"#a0aec0" }}> | {p.teacherName}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        }
      </div>
    </div>
  );
}

const s = {
  header:     { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" },
  title:      { fontSize:"1.6rem", fontWeight:700, color:"#1a202c", margin:"0 0 0.25rem" },
  sub:        { color:"#718096", margin:0 },
  card:       { background:"#fff", borderRadius:12, padding:"1.5rem", marginBottom:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle:  { margin:"0 0 1.2rem", color:"#2d3748", fontSize:"1.05rem", fontWeight:600 },
  field:      { display:"flex", flexDirection:"column", gap:"0.4rem" },
  label:      { fontSize:"0.85rem", fontWeight:600, color:"#4a5568" },
  input:      { padding:"0.55rem 0.8rem", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:"0.9rem", outline:"none", fontFamily:"inherit" },
  addBtn:     { padding:"0.55rem 1.2rem", background:"#7c3aed", color:"#fff", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" },
  outlineBtn: { padding:"0.5rem 1.2rem", background:"#fff", color:"#7c3aed", border:"1.5px solid #7c3aed", borderRadius:8, fontWeight:600, cursor:"pointer" },
  success:    { background:"#f0fff4", color:"#276749", padding:"0.75rem", borderRadius:8, marginBottom:"1rem" },
  errorBox:   { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:8, marginBottom:"1rem" },
};