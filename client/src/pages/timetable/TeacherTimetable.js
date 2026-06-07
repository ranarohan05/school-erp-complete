import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = "http://localhost:5000/api";
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_SHORT = { Monday:"Mon", Tuesday:"Tue", Wednesday:"Wed", Thursday:"Thu", Friday:"Fri", Saturday:"Sat" };
const COLORS = ["#7c3aed","#0891b2","#059669","#d97706","#db2777","#e53e3e","#6366f1","#0d9488"];

export default function TeacherTimetable() {
  const [timetable, setTimetable]   = useState([]);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay()-1] || "Monday");
  const [view, setView]             = useState("weekly");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  // Form state
  const [showForm, setShowForm]     = useState(false);
  const [formDay, setFormDay]       = useState("Monday");
  const [formClass, setFormClass]   = useState("");
  const [formSession, setFormSession] = useState("2025-2026");
  const [periods, setPeriods]       = useState(defaultPeriods());
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState("");

  function defaultPeriods() {
    return Array.from({ length: 6 }, (_, i) => ({
      periodNumber: i + 1,
      startTime: "",
      endTime: "",
      subject: "",
      teacherName: "",
    }));
  }

  useEffect(() => { fetchMyTimetable(); }, []);

  const fetchMyTimetable = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API}/timetable/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimetable(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  const handlePeriodChange = (i, field, value) => {
    const updated = [...periods];
    updated[i][field] = value;
    setPeriods(updated);
  };

  const handleSave = async () => {
    if (!formClass) return setError("Please enter class name");
    setSaving(true); setMsg(""); setError("");
    try {
      const token = localStorage.getItem("token");
      const validPeriods = periods.filter(p => p.subject && p.startTime && p.endTime);
      await axios.post(`${API}/timetable`, {
        class: formClass, day: formDay, periods: validPeriods, session: formSession
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMsg("✅ Timetable saved!");
      setShowForm(false);
      fetchMyTimetable();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  // Build day map from teacher's timetable
  const dayMap = {};
  DAYS.forEach(d => { dayMap[d] = []; });
  timetable.forEach(tt => {
    tt.periods.forEach(p => {
      if (!dayMap[tt.day]) dayMap[tt.day] = [];
      dayMap[tt.day].push({ ...p, class: tt.class });
    });
  });

  const subjectColor = {};
  const allSubjects = [...new Set(timetable.flatMap(tt => tt.periods.map(p => p.subject)))];
  allSubjects.forEach((sub, i) => { subjectColor[sub] = COLORS[i % COLORS.length]; });

  const today = DAYS[new Date().getDay() - 1];

  return (
    <div style={{ minHeight:"100vh", background:"#f7fafc" }}>
      <Navbar />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h2 style={{ fontSize:"1.6rem", fontWeight:700, color:"#1a202c", margin:"0 0 0.25rem" }}>🗓️ My Timetable</h2>
            <p style={{ color:"#718096", margin:0 }}>View your schedule & add new slots</p>
          </div>
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
            {["weekly","daily"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding:"0.45rem 1.1rem", borderRadius:20, border:"1.5px solid #e2e8f0",
                background: view===v ? "#7c3aed" : "#fff",
                color: view===v ? "#fff" : "#4a5568",
                fontWeight:600, cursor:"pointer", fontSize:"0.85rem"
              }}>{v === "weekly" ? "📅 Weekly" : "📆 Daily"}</button>
            ))}
            <button onClick={() => { setShowForm(!showForm); setPeriods(defaultPeriods()); setMsg(""); setError(""); }} style={{
              padding:"0.45rem 1.1rem", borderRadius:20, border:"none",
              background:"#059669", color:"#fff", fontWeight:600, cursor:"pointer", fontSize:"0.85rem"
            }}>{showForm ? "✕ Cancel" : "+ Add Timetable"}</button>
          </div>
        </div>

        {msg   && <div style={s.success}>{msg}</div>}
        {error && <div style={s.errorBox}>{error}</div>}
        {loading && <p style={{ color:"#718096" }}>Loading...</p>}

        {/* Add Timetable Form */}
        {showForm && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>📝 Add / Update Timetable</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
              <div style={s.field}>
                <label style={s.label}>Class</label>
                <input style={s.input} placeholder="e.g. 10A" value={formClass} onChange={e => setFormClass(e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Day</label>
                <select style={s.input} value={formDay} onChange={e => setFormDay(e.target.value)}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Session</label>
                <input style={s.input} value={formSession} onChange={e => setFormSession(e.target.value)} />
              </div>
            </div>

            <h4 style={{ color:"#2d3748", marginBottom:"0.75rem", fontSize:"0.95rem" }}>📚 Periods</h4>
            {periods.map((p, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"40px 1fr 100px 100px 1fr", gap:"0.5rem", alignItems:"center", marginBottom:"0.5rem", background:"#f7fafc", padding:"0.6rem 0.75rem", borderRadius:8 }}>
                <span style={{ fontWeight:700, color:"#7c3aed", fontSize:"0.85rem" }}>P{p.periodNumber}</span>
                <input style={s.input} placeholder="Subject" value={p.subject} onChange={e => handlePeriodChange(i,"subject",e.target.value)} />
                <input style={s.input} type="time" value={p.startTime} onChange={e => handlePeriodChange(i,"startTime",e.target.value)} />
                <input style={s.input} type="time" value={p.endTime} onChange={e => handlePeriodChange(i,"endTime",e.target.value)} />
                <input style={s.input} placeholder="Teacher name" value={p.teacherName} onChange={e => handlePeriodChange(i,"teacherName",e.target.value)} />
              </div>
            ))}

            <button onClick={() => setPeriods([...periods, { periodNumber: periods.length+1, startTime:"", endTime:"", subject:"", teacherName:"" }])}
              style={{ ...s.outlineBtn, marginTop:"0.5rem", marginRight:"0.75rem" }}>+ Add Period</button>
            <button onClick={handleSave} disabled={saving}
              style={{ ...s.btn, marginTop:"0.75rem", opacity: saving?0.7:1 }}>
              {saving ? "Saving..." : "Save Timetable"}
            </button>
          </div>
        )}

        {/* Weekly View */}
        {!loading && view === "weekly" && (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"4px" }}>
              <thead>
                <tr>
                  <th style={s.th}>Period</th>
                  {DAYS.map(d => (
                    <th key={d} style={{ ...s.th, background: d===today?"#7c3aed":"#f7fafc", color: d===today?"#fff":"#4a5568" }}>
                      {DAY_SHORT[d]}{d===today?" 📍":""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5,6,7,8].map(p => (
                  <tr key={p}>
                    <td style={s.tdPeriod}>P{p}</td>
                    {DAYS.map(d => {
                      const period = dayMap[d].find(x => x.periodNumber === p);
                      return (
                        <td key={d} style={s.td}>
                          {period ? (
                            <div style={{ background:(subjectColor[period.subject]||"#7c3aed")+"18", borderLeft:`3px solid ${subjectColor[period.subject]||"#7c3aed"}`, borderRadius:6, padding:"0.4rem 0.6rem" }}>
                              <div style={{ fontWeight:700, fontSize:"0.8rem", color:subjectColor[period.subject]||"#7c3aed" }}>{period.subject}</div>
                              <div style={{ fontSize:"0.7rem", color:"#718096" }}>{period.startTime}–{period.endTime}</div>
                              <div style={{ fontSize:"0.7rem", color:"#a0aec0" }}>🏫 {period.class}</div>
                            </div>
                          ) : <span style={{ color:"#e2e8f0", fontSize:"0.8rem" }}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Daily View */}
        {!loading && view === "daily" && (
          <div>
            <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
              {DAYS.map(d => (
                <button key={d} onClick={() => setSelectedDay(d)} style={{
                  padding:"0.4rem 1rem", borderRadius:20, border:"1.5px solid #e2e8f0",
                  background: selectedDay===d?"#7c3aed": d===today?"#ede9fe":"#fff",
                  color: selectedDay===d?"#fff":"#4a5568",
                  fontWeight: selectedDay===d||d===today?700:400,
                  cursor:"pointer", fontSize:"0.85rem"
                }}>{DAY_SHORT[d]}</button>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {dayMap[selectedDay].length === 0 ? (
                <div style={{ background:"#fff", borderRadius:12, padding:"2rem", textAlign:"center", color:"#a0aec0", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
                  No classes scheduled for {selectedDay}
                </div>
              ) : (
                [...dayMap[selectedDay]].sort((a,b)=>a.periodNumber-b.periodNumber).map((p,i) => (
                  <div key={i} style={{ background:"#fff", borderRadius:12, padding:"1rem 1.5rem", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", display:"flex", alignItems:"center", gap:"1rem", borderLeft:`4px solid ${subjectColor[p.subject]||"#7c3aed"}` }}>
                    <div style={{ background:(subjectColor[p.subject]||"#7c3aed")+"22", color:subjectColor[p.subject]||"#7c3aed", borderRadius:10, padding:"0.5rem 0.8rem", fontWeight:700, fontSize:"0.9rem", minWidth:40, textAlign:"center" }}>P{p.periodNumber}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:"#2d3748", fontSize:"1rem" }}>{p.subject}</div>
                      <div style={{ fontSize:"0.85rem", color:"#718096" }}>⏰ {p.startTime} – {p.endTime}</div>
                      <div style={{ fontSize:"0.85rem", color:"#a0aec0" }}>🏫 Class {p.class}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        {allSubjects.length > 0 && (
          <div style={{ marginTop:"2rem", background:"#fff", borderRadius:12, padding:"1rem 1.5rem", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:"0.8rem", fontWeight:600, color:"#718096", marginBottom:"0.5rem" }}>SUBJECTS</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
              {allSubjects.map(sub => (
                <span key={sub} style={{ background:(subjectColor[sub]||"#7c3aed")+"22", color:subjectColor[sub]||"#7c3aed", borderRadius:20, padding:"0.25rem 0.75rem", fontSize:"0.8rem", fontWeight:600 }}>{sub}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  card: { background:"#fff", borderRadius:12, padding:"1.5rem", marginBottom:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle: { margin:"0 0 1.2rem", color:"#2d3748", fontSize:"1.05rem", fontWeight:600 },
  field: { display:"flex", flexDirection:"column", gap:"0.4rem" },
  label: { fontSize:"0.85rem", fontWeight:600, color:"#4a5568" },
  input: { padding:"0.55rem 0.8rem", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:"0.9rem", outline:"none", fontFamily:"inherit" },
  btn: { padding:"0.65rem 1.6rem", background:"#7c3aed", color:"#fff", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" },
  outlineBtn: { padding:"0.5rem 1.2rem", background:"#fff", color:"#7c3aed", border:"1.5px solid #7c3aed", borderRadius:8, fontWeight:600, cursor:"pointer" },
  success: { background:"#f0fff4", color:"#276749", padding:"0.75rem", borderRadius:8, marginBottom:"1rem" },
  errorBox: { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:8, marginBottom:"1rem" },
  th: { padding:"0.6rem 0.5rem", background:"#f7fafc", color:"#4a5568", fontWeight:600, fontSize:"0.8rem", borderRadius:6, textAlign:"center" },
  td: { padding:"0.3rem", verticalAlign:"top", minWidth:100 },
  tdPeriod: { padding:"0.4rem 0.6rem", fontWeight:700, color:"#718096", fontSize:"0.8rem", textAlign:"center", background:"#f7fafc", borderRadius:6 },
};