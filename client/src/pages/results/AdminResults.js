import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = "http://localhost:5000/api";
const gradeColor = (g) => {
  const map = { "A+":"#276749","A":"#276749","B+":"#2b6cb0","B":"#2b6cb0","C":"#d97706","D":"#c05621","F":"#c53030" };
  return map[g] || "#4a5568";
};

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSession, setFilterSession] = useState("");

  useEffect(() => { fetchResults(); }, [filterClass, filterSession]);

  const fetchResults = async () => {
    try {
      let q = [];
      if (filterClass)   q.push(`class=${filterClass}`);
      if (filterSession) q.push(`session=${filterSession}`);
      const { data } = await axios.get(`${API}/results${q.length?`?${q.join("&")}`:""}`);
      setResults(data.results);
    } catch { setError("Failed to load results"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this result?")) return;
    try {
      await axios.delete(`${API}/results/${id}`);
      fetchResults();
    } catch { setError("Delete failed"); }
  };

  const avg = results.length > 0
    ? (results.reduce((a, r) => a + r.percentage, 0) / results.length).toFixed(1)
    : 0;

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <h2 style={s.title}>📊 Results Overview</h2>
        <p style={s.sub}>All student results across the school</p>

        {error && <div style={s.error}>{error}</div>}

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { icon:"📝", label:"Total Results",  val: results.length,                                    color:"#7c3aed" },
            { icon:"📊", label:"Avg Percentage", val: `${avg}%`,                                         color:"#0891b2" },
            { icon:"✅", label:"Passed",         val: results.filter(r=>r.percentage>=40).length,        color:"#059669" },
            { icon:"❌", label:"Failed",         val: results.filter(r=>r.percentage<40).length,         color:"#e53e3e" },
          ].map(st => (
            <div key={st.label} style={{...s.stat, borderTop:`3px solid ${st.color}`}}>
              <span style={s.statIcon}>{st.icon}</span>
              <span style={s.statVal}>{st.val}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={s.filters}>
          <input style={s.filterInput} placeholder="Filter by class (e.g. 10-A)"
            value={filterClass} onChange={e => setFilterClass(e.target.value)} />
          <input style={s.filterInput} placeholder="Filter by session (e.g. 2025-2026)"
            value={filterSession} onChange={e => setFilterSession(e.target.value)} />
          <button style={s.clearBtn} onClick={() => { setFilterClass(""); setFilterSession(""); }}>
            Clear Filters
          </button>
        </div>

        {/* Table */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>📋 All Results ({results.length})</h3>
          {results.length === 0 ? (
            <div style={s.empty}>No results found.</div>
          ) : (
            <div style={{overflowX:"auto"}}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    {["Student","Roll No","Class","Exam","Session","Marks","Percentage","Grade","Uploaded By","Action"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r._id} style={{background:i%2===0?"#fff":"#f7fafc"}}>
                      <td style={{...s.td, fontWeight:"600"}}>{r.student?.name || "—"}</td>
                      <td style={s.td}>{r.student?.rollNumber || "—"}</td>
                      <td style={s.td}>{r.class}</td>
                      <td style={s.td}>{r.examName}</td>
                      <td style={s.td}>{r.session}</td>
                      <td style={s.td}>{r.totalMarksObtained}/{r.totalMarks}</td>
                      <td style={s.td}>
                        <span style={{fontWeight:"600", color:r.percentage>=50?"#276749":"#c53030"}}>
                          {r.percentage}%
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{fontWeight:"700", color:gradeColor(r.overallGrade)}}>
                          {r.overallGrade}
                        </span>
                      </td>
                      <td style={s.td}>{r.uploadedBy?.name || "—"}</td>
                      <td style={s.td}>
                        <button style={s.delBtn} onClick={() => handleDelete(r._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
  statsRow: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"1rem", marginBottom:"1.5rem" },
  stat: { background:"#fff", borderRadius:"12px", padding:"1.2rem", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:"0.3rem" },
  statIcon: { fontSize:"1.5rem" },
  statVal: { fontSize:"1.8rem", fontWeight:"700", color:"#2d3748" },
  statLabel: { fontSize:"0.82rem", color:"#718096" },
  filters: { display:"flex", gap:"0.75rem", marginBottom:"1.5rem", flexWrap:"wrap" },
  filterInput: { padding:"0.6rem 1rem", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"0.9rem", outline:"none" },
  clearBtn: { padding:"0.6rem 1rem", background:"#f7fafc", border:"1.5px solid #e2e8f0", borderRadius:"8px", cursor:"pointer", color:"#4a5568" },
  card: { background:"#fff", borderRadius:"12px", padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle: { margin:"0 0 1.2rem", color:"#2d3748", fontSize:"1.05rem", fontWeight:"600" },
  table: { width:"100%", borderCollapse:"collapse", minWidth:"900px" },
  thead: { background:"#f7fafc" },
  th: { padding:"0.75rem 1rem", textAlign:"left", fontSize:"0.82rem", fontWeight:"600", color:"#4a5568", borderBottom:"2px solid #e2e8f0", whiteSpace:"nowrap" },
  td: { padding:"0.75rem 1rem", fontSize:"0.875rem", color:"#2d3748", borderBottom:"1px solid #f0f0f0" },
  delBtn: { padding:"0.35rem 0.8rem", background:"#fff5f5", color:"#c53030", border:"1px solid #fed7d7", borderRadius:"6px", cursor:"pointer", fontWeight:"600", fontSize:"0.8rem" },
  empty: { color:"#a0aec0", textAlign:"center", padding:"2rem" },
  error: { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
};
