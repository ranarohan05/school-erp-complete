import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = "http://localhost:5000/api";

const gradeColor = (g) => {
  const map = { "A+":"#276749","A":"#276749","B+":"#2b6cb0","B":"#2b6cb0","C":"#d97706","D":"#c05621","F":"#c53030" };
  return map[g] || "#4a5568";
};

export default function ParentResults() {
  const [results, setResults]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API}/results/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(data.results || []);
    } catch {
      setError("Failed to load results.");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <h2 style={s.title}>📊 Child's Results</h2>
        <p style={s.sub}>Monitor your child's academic performance</p>

        {error && <div style={s.error}>{error}</div>}
        {loading && <p style={{ color:"#718096" }}>Loading...</p>}

        {/* Summary */}
        {results.length > 0 && (
          <div style={s.statsRow}>
            {[
              { icon:"📝", label:"Total Exams", val:results.length,                                                                  color:"#7c3aed" },
              { icon:"🏆", label:"Best Score",  val:`${Math.max(...results.map(r=>r.percentage))}%`,                                 color:"#059669" },
              { icon:"📊", label:"Latest Grade",val:results[0]?.overallGrade || "—",                                                 color:"#0891b2" },
              { icon:"✅", label:"Passed",       val:results.filter(r=>r.percentage>=40).length,                                     color:"#d97706" },
            ].map(st => (
              <div key={st.label} style={{...s.stat, borderTop:`3px solid ${st.color}`}}>
                <span style={s.statIcon}>{st.icon}</span>
                <span style={s.statVal}>{st.val}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 ? (
          <div style={s.empty}>No results available yet.</div>
        ) : (
          <div style={s.list}>
            {results.map(r => (
              <div key={r._id} style={s.card}>
                <div style={s.cardTop}>
                  <div>
                    <h3 style={s.examName}>{r.examName}</h3>
                    <div style={s.meta}>
                      <span>📅 {r.session}</span>
                      {r.class && <span>🏫 Class {r.class}</span>}
                      {r.uploadedBy?.name && <span>👨‍🏫 {r.uploadedBy.name}</span>}
                    </div>
                  </div>
                  <div style={s.gradeBox}>
                    <span style={{fontSize:"2rem", fontWeight:"800", color:gradeColor(r.overallGrade)}}>{r.overallGrade}</span>
                    <span style={{fontSize:"0.9rem", fontWeight:"600", color:r.percentage>=50?"#276749":"#c53030"}}>{r.percentage}%</span>
                  </div>
                </div>

                <div style={s.progressBg}>
                  <div style={{...s.progressFill, width:`${r.percentage}%`,
                    background:r.percentage>=75?"#38a169":r.percentage>=50?"#d97706":"#e53e3e"}} />
                </div>
                <p style={s.marksText}>{r.totalMarksObtained} / {r.totalMarks} marks</p>

                <button style={s.toggleBtn} onClick={() => setSelected(selected===r._id?null:r._id)}>
                  {selected===r._id ? "▲ Hide Details" : "▼ View Subject Details"}
                </button>

                {selected === r._id && (
                  <table style={{...s.table, marginTop:"1rem"}}>
                    <thead>
                      <tr style={s.thead}>
                        <th style={s.th}>Subject</th>
                        <th style={s.th}>Marks</th>
                        <th style={s.th}>Total</th>
                        <th style={s.th}>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.subjects.map((sub, i) => (
                        <tr key={i} style={{background:i%2===0?"#fff":"#f7fafc"}}>
                          <td style={s.td}>{sub.subject}</td>
                          <td style={s.td}>{sub.marksObtained}</td>
                          <td style={s.td}>{sub.totalMarks}</td>
                          <td style={s.td}><span style={{fontWeight:"700", color:gradeColor(sub.grade)}}>{sub.grade}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {r.remarks && <p style={s.remarks}>💬 {r.remarks}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight:"100vh", background:"#f7fafc" },
  content:     { maxWidth:"900px", margin:"0 auto", padding:"2rem" },
  title:       { fontSize:"1.6rem", color:"#1a202c", margin:"0 0 0.25rem" },
  sub:         { color:"#718096", marginBottom:"1.5rem" },
  statsRow:    { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem", marginBottom:"2rem" },
  stat:        { background:"#fff", borderRadius:"12px", padding:"1.2rem", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:"0.3rem" },
  statIcon:    { fontSize:"1.5rem" },
  statVal:     { fontSize:"1.8rem", fontWeight:"700", color:"#2d3748" },
  statLabel:   { fontSize:"0.82rem", color:"#718096" },
  list:        { display:"flex", flexDirection:"column", gap:"1.2rem" },
  card:        { background:"#fff", borderRadius:"12px", padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTop:     { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" },
  examName:    { margin:"0 0 0.4rem", color:"#2d3748", fontSize:"1.1rem" },
  meta:        { display:"flex", gap:"1rem", flexWrap:"wrap", fontSize:"0.82rem", color:"#718096" },
  gradeBox:    { display:"flex", flexDirection:"column", alignItems:"center" },
  progressBg:  { height:"8px", background:"#e2e8f0", borderRadius:"999px", overflow:"hidden", marginBottom:"0.4rem" },
  progressFill:{ height:"100%", borderRadius:"999px" },
  marksText:   { fontSize:"0.82rem", color:"#718096", margin:"0 0 1rem" },
  toggleBtn:   { background:"none", border:"1px solid #e2e8f0", borderRadius:"6px", padding:"0.4rem 1rem", cursor:"pointer", color:"#4a5568", fontSize:"0.85rem" },
  table:       { width:"100%", borderCollapse:"collapse" },
  thead:       { background:"#f7fafc" },
  th:          { padding:"0.6rem 0.9rem", textAlign:"left", fontSize:"0.82rem", fontWeight:"600", color:"#4a5568", borderBottom:"2px solid #e2e8f0" },
  td:          { padding:"0.6rem 0.9rem", fontSize:"0.875rem", color:"#2d3748", borderBottom:"1px solid #f0f0f0" },
  remarks:     { marginTop:"1rem", color:"#718096", fontSize:"0.875rem", fontStyle:"italic" },
  empty:       { textAlign:"center", color:"#a0aec0", padding:"3rem", background:"#fff", borderRadius:"12px" },
  error:       { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
};