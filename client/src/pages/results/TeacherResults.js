import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const SUBJECTS = ["Mathematics", "Science", "English", "Hindi", "Social Studies", "Computer"];

const gradeColor = (g) => {
  const map = { "A+":"#276749","A":"#276749","B+":"#2b6cb0","B":"#2b6cb0","C":"#d97706","D":"#c05621","F":"#c53030" };
  return map[g] || "#4a5568";
};

export default function TeacherResults() {
  const [students, setStudents]   = useState([]);
  const [results, setResults]     = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [form, setForm]           = useState({ studentId:"", class:"", examName:"", examType:"midterm", session:"2025-2026", remarks:"" });
  const [subjects, setSubjects]   = useState(SUBJECTS.map(s => ({ subject:s, marksObtained:"", totalMarks:"100" })));
  const [msg, setMsg]             = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [tab, setTab]             = useState("upload");

  useEffect(() => { fetchStudents(); fetchResults(); }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API}/auth/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(data.students);
    } catch {}
  };

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem("token");
      const q = filterClass ? `?class=${filterClass}` : "";
      const { data } = await axios.get(`${API}/results${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(data.results);
    } catch {}
  };

  // Auto-fill class when student selected
  const handleStudentChange = (e) => {
    const selectedId = e.target.value;
    const selectedStudent = students.find(st => st._id === selectedId);
    setForm({ ...form, studentId: selectedId, class: selectedStudent?.class || "" });
  };

  const handleSubjectChange = (i, field, value) => {
    const updated = [...subjects];
    updated[i][field] = value;
    setSubjects(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const validSubjects = subjects.filter(s => s.marksObtained !== "");
      if (validSubjects.length === 0) return setError("Please enter marks for at least one subject");
      await axios.post(`${API}/results`, { ...form, subjects: validSubjects }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg("✅ Result uploaded successfully!");
      setForm({ studentId:"", class:"", examName:"", examType:"midterm", session:"2025-2026", remarks:"" });
      setSubjects(SUBJECTS.map(s => ({ subject:s, marksObtained:"", totalMarks:"100" })));
      fetchResults();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload result");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <div style={s.header}>
          <div>
            <h2 style={s.title}>📊 Results & Marks</h2>
            <p style={s.sub}>Upload and manage student results</p>
          </div>
        </div>

        {msg   && <div style={s.success}>{msg}</div>}
        {error && <div style={s.error}>{error}</div>}

        <div style={s.tabs}>
          {["upload","results"].map(t => (
            <button key={t} style={{...s.tab, ...(tab===t?s.activeTab:{})}}
              onClick={() => { setTab(t); if(t==="results") fetchResults(); }}>
              {t === "upload" ? "📝 Upload Result" : "📋 View All Results"}
            </button>
          ))}
        </div>

        {/* Upload Form */}
        {tab === "upload" && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>📝 Upload Student Result</h3>
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>Select Student</label>
                  <select style={s.input} value={form.studentId} onChange={handleStudentChange} required>
                    <option value="">-- Select Student --</option>
                    {students.map(st => (
                      <option key={st._id} value={st._id}>
                        {st.name} {st.rollNumber ? `(${st.rollNumber})` : ""} — Class {st.class || "N/A"}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Class</label>
                  <input style={s.input} placeholder="e.g. 10A (auto-filled)" value={form.class}
                    onChange={e => setForm({...form, class: e.target.value})} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Exam Name</label>
                  <input style={s.input} placeholder="e.g. Mid Term Exam" value={form.examName}
                    onChange={e => setForm({...form, examName:e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Exam Type</label>
                  <select style={s.input} value={form.examType} onChange={e => setForm({...form, examType:e.target.value})}>
                    <option value="midterm">Mid Term</option>
                    <option value="final">Final Exam</option>
                    <option value="unit">Unit Test</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Session</label>
                  <input style={s.input} placeholder="e.g. 2025-2026" value={form.session}
                    onChange={e => setForm({...form, session:e.target.value})} required />
                </div>
              </div>

              <div style={s.subjectsBox}>
                <h4 style={s.subTitle}>📚 Enter Subject Marks</h4>
                <div style={s.subGrid}>
                  {subjects.map((sub, i) => (
                    <div key={i} style={s.subRow}>
                      <span style={s.subName}>{sub.subject}</span>
                      <div style={s.subInputs}>
                        <input style={{...s.input, width:"80px", textAlign:"center"}}
                          type="number" min="0" max="100" placeholder="Marks"
                          value={sub.marksObtained}
                          onChange={e => handleSubjectChange(i, "marksObtained", e.target.value)} />
                        <span style={s.outOf}>/ </span>
                        <input style={{...s.input, width:"70px", textAlign:"center"}}
                          type="number" value={sub.totalMarks}
                          onChange={e => handleSubjectChange(i, "totalMarks", e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Remarks (optional)</label>
                <input style={s.input} placeholder="e.g. Good performance" value={form.remarks}
                  onChange={e => setForm({...form, remarks:e.target.value})} />
              </div>

              <button style={{...s.btn, opacity:loading?0.7:1}} type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload Result"}
              </button>
            </form>
          </div>
        )}

        {/* Results List */}
        {tab === "results" && (
          <div style={s.card}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.2rem"}}>
              <h3 style={{...s.cardTitle, margin:0}}>📋 All Results ({results.length})</h3>
              <input style={{...s.input, width:"160px"}} placeholder="Filter by class..."
                value={filterClass} onChange={e => { setFilterClass(e.target.value); fetchResults(); }} />
            </div>
            {results.length === 0 ? (
              <div style={s.empty}>No results uploaded yet.</div>
            ) : (
              <div style={s.list}>
                {results.map(r => (
                  <div key={r._id} style={s.resultCard}>
                    <div style={s.resultTop}>
                      <div>
                        <span style={s.studentName}>{r.student?.name}</span>
                        <span style={s.rollNo}> — Roll: {r.student?.rollNumber || "N/A"} | Class: {r.class || "N/A"}</span>
                      </div>
                      <span style={{...s.gradeBadge, color: gradeColor(r.overallGrade)}}>{r.overallGrade}</span>
                    </div>
                    <div style={s.resultMeta}>
                      <span>📝 {r.examName}</span>
                      <span>📅 {r.session}</span>
                      <span>📊 {r.totalMarksObtained}/{r.totalMarks}</span>
                      <span style={{fontWeight:"600", color: r.percentage>=50?"#276749":"#c53030"}}>{r.percentage}%</span>
                    </div>
                    <div style={s.subjectTags}>
                      {r.subjects.map((sub, i) => (
                        <span key={i} style={s.subTag}>
                          {sub.subject}: <b>{sub.marksObtained}/{sub.totalMarks}</b>
                          <span style={{color: gradeColor(sub.grade), marginLeft:"4px"}}>({sub.grade})</span>
                        </span>
                      ))}
                    </div>
                    {r.remarks && <p style={s.remarks}>💬 {r.remarks}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", background:"#f7fafc" },
  content: { maxWidth:"1100px", margin:"0 auto", padding:"2rem" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.5rem" },
  title: { fontSize:"1.6rem", color:"#1a202c", margin:"0 0 0.25rem" },
  sub: { color:"#718096", margin:0 },
  tabs: { display:"flex", gap:"0.75rem", marginBottom:"1.5rem" },
  tab: { padding:"0.5rem 1.2rem", border:"1.5px solid #e2e8f0", borderRadius:"20px", background:"#fff", cursor:"pointer", fontSize:"0.875rem", color:"#4a5568" },
  activeTab: { background:"#7c3aed", color:"#fff", borderColor:"#7c3aed" },
  card: { background:"#fff", borderRadius:"12px", padding:"1.5rem", marginBottom:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle: { margin:"0 0 1.2rem", color:"#2d3748", fontSize:"1.05rem", fontWeight:"600" },
  form: { display:"flex", flexDirection:"column", gap:"1.2rem" },
  grid2: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"1rem" },
  field: { display:"flex", flexDirection:"column", gap:"0.4rem" },
  label: { fontSize:"0.85rem", fontWeight:"600", color:"#4a5568" },
  input: { padding:"0.65rem 0.9rem", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"0.95rem", outline:"none", fontFamily:"inherit" },
  btn: { padding:"0.7rem 1.8rem", background:"#7c3aed", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"600", cursor:"pointer", alignSelf:"flex-start" },
  subjectsBox: { background:"#f7fafc", borderRadius:"10px", padding:"1.2rem" },
  subTitle: { margin:"0 0 1rem", color:"#2d3748", fontSize:"0.95rem" },
  subGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"0.75rem" },
  subRow: { display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fff", padding:"0.6rem 1rem", borderRadius:"8px", border:"1px solid #e2e8f0" },
  subName: { fontWeight:"600", color:"#4a5568", fontSize:"0.875rem" },
  subInputs: { display:"flex", alignItems:"center", gap:"0.4rem" },
  outOf: { color:"#a0aec0" },
  success: { background:"#f0fff4", color:"#276749", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
  error: { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
  list: { display:"flex", flexDirection:"column", gap:"1rem" },
  resultCard: { border:"1.5px solid #e2e8f0", borderRadius:"10px", padding:"1.2rem" },
  resultTop: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" },
  studentName: { fontWeight:"700", color:"#2d3748", fontSize:"1rem" },
  rollNo: { color:"#718096", fontSize:"0.85rem" },
  gradeBadge: { fontSize:"1.5rem", fontWeight:"700", padding:"0.3rem 0.8rem", borderRadius:"8px", background:"#f7fafc" },
  resultMeta: { display:"flex", gap:"1.2rem", flexWrap:"wrap", fontSize:"0.82rem", color:"#718096", marginBottom:"0.75rem" },
  subjectTags: { display:"flex", flexWrap:"wrap", gap:"0.5rem", marginBottom:"0.5rem" },
  subTag: { background:"#f7fafc", border:"1px solid #e2e8f0", borderRadius:"6px", padding:"0.25rem 0.6rem", fontSize:"0.8rem", color:"#4a5568" },
  remarks: { color:"#718096", fontSize:"0.85rem", margin:"0.5rem 0 0", fontStyle:"italic" },
  empty: { color:"#a0aec0", textAlign:"center", padding:"2rem" },
};