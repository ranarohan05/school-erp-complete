import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = "http://localhost:5000/api";

export default function TeacherHomework() {
  const [homeworks, setHomeworks] = useState([]);
  const [form, setForm] = useState({ title:"", description:"", subject:"", class:"", dueDate:"" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchHomework(); }, []);

  const fetchHomework = async () => {
    try {
      const { data } = await axios.get(`${API}/homework`);
      setHomeworks(data.homeworks);
    } catch (err) {
      setError("Failed to load homework");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      await axios.post(`${API}/homework`, form);
      setMsg("✅ Homework assigned successfully!");
      setForm({ title:"", description:"", subject:"", class:"", dueDate:"" });
      setShowForm(false);
      fetchHomework();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign homework");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this homework?")) return;
    try {
      await axios.delete(`${API}/homework/${id}`);
      fetchHomework();
    } catch { setError("Failed to delete"); }
  };

  const viewSubmissions = async (hw) => {
    setSelected(hw);
    try {
      const { data } = await axios.get(`${API}/homework/${hw._id}/submissions`);
      setSubmissions(data.homework.submissions);
    } catch { setError("Failed to load submissions"); }
  };

  const isOverdue = (date) => new Date(date) < new Date();

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <div style={s.header}>
          <div>
            <h2 style={s.title}>📚 Homework Management</h2>
            <p style={s.sub}>Assign and track student homework</p>
          </div>
          <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ Assign Homework"}
          </button>
        </div>

        {msg   && <div style={s.success}>{msg}</div>}
        {error && <div style={s.error}>{error}</div>}

        {/* Assign Form */}
        {showForm && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>📝 New Homework</h3>
            <form onSubmit={handleCreate} style={s.form}>
              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>Title</label>
                  <input style={s.input} placeholder="e.g. Chapter 5 Exercise" value={form.title}
                    onChange={e => setForm({...form, title:e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Subject</label>
                  <input style={s.input} placeholder="e.g. Mathematics" value={form.subject}
                    onChange={e => setForm({...form, subject:e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Class</label>
                  <input style={s.input} placeholder="e.g. 10-A" value={form.class}
                    onChange={e => setForm({...form, class:e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Due Date</label>
                  <input style={s.input} type="date" value={form.dueDate}
                    onChange={e => setForm({...form, dueDate:e.target.value})} required />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Description / Instructions</label>
                <textarea style={{...s.input, height:"80px", resize:"vertical"}}
                  placeholder="Write homework instructions..." value={form.description}
                  onChange={e => setForm({...form, description:e.target.value})} required />
              </div>
              <button style={{...s.btn, opacity:loading?0.7:1}} type="submit" disabled={loading}>
                {loading ? "Assigning..." : "Assign Homework"}
              </button>
            </form>
          </div>
        )}

        {/* Homework List */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>📋 Assigned Homework ({homeworks.length})</h3>
          {homeworks.length === 0 ? (
            <div style={s.empty}>No homework assigned yet. Click "+ Assign Homework" to start.</div>
          ) : (
            <div style={s.list}>
              {homeworks.map(hw => (
                <div key={hw._id} style={s.hwItem}>
                  <div style={s.hwLeft}>
                    <div style={s.hwTop}>
                      <span style={s.hwTitle}>{hw.title}</span>
                      <span style={{...s.badge, background: isOverdue(hw.dueDate)?"#fee2e2":"#d1fae5",
                        color: isOverdue(hw.dueDate)?"#c53030":"#276749"}}>
                        {isOverdue(hw.dueDate) ? "Overdue" : "Active"}
                      </span>
                    </div>
                    <div style={s.hwMeta}>
                      <span>📖 {hw.subject}</span>
                      <span>🏫 Class {hw.class}</span>
                      <span>📅 Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                      <span>✅ {hw.submissions?.length || 0} submitted</span>
                    </div>
                    <p style={s.hwDesc}>{hw.description}</p>
                  </div>
                  <div style={s.hwActions}>
                    <button style={s.viewBtn} onClick={() => viewSubmissions(hw)}>View Submissions</button>
                    <button style={s.delBtn} onClick={() => handleDelete(hw._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submissions Modal */}
        {selected && (
          <div style={s.card}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem"}}>
              <h3 style={s.cardTitle}>✅ Submissions — {selected.title}</h3>
              <button style={s.closeBtn} onClick={() => { setSelected(null); setSubmissions([]); }}>✕ Close</button>
            </div>
            {submissions.length === 0 ? (
              <div style={s.empty}>No submissions yet.</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Student Name</th>
                    <th style={s.th}>Roll No</th>
                    <th style={s.th}>Submitted At</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, i) => (
                    <tr key={i} style={{background: i%2===0?"#fff":"#f7fafc"}}>
                      <td style={s.td}>{sub.student?.name || "—"}</td>
                      <td style={s.td}>{sub.student?.rollNumber || "—"}</td>
                      <td style={s.td}>{new Date(sub.submittedAt).toLocaleString()}</td>
                      <td style={s.td}>
                        <span style={{...s.badge, background: sub.status==="late"?"#fee2e2":"#d1fae5",
                          color: sub.status==="late"?"#c53030":"#276749"}}>
                          {sub.status === "late" ? "Late" : "On Time"}
                        </span>
                      </td>
                      <td style={s.td}>{sub.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  addBtn: { padding:"0.65rem 1.4rem", background:"#0891b2", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"600", cursor:"pointer", fontSize:"0.95rem" },
  card: { background:"#fff", borderRadius:"12px", padding:"1.5rem", marginBottom:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle: { margin:"0 0 1.2rem", color:"#2d3748", fontSize:"1.05rem", fontWeight:"600" },
  form: { display:"flex", flexDirection:"column", gap:"1rem" },
  grid2: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1rem" },
  field: { display:"flex", flexDirection:"column", gap:"0.4rem" },
  label: { fontSize:"0.85rem", fontWeight:"600", color:"#4a5568" },
  input: { padding:"0.65rem 0.9rem", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"0.95rem", outline:"none", fontFamily:"inherit" },
  btn: { padding:"0.7rem 1.8rem", background:"#0891b2", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"600", cursor:"pointer", alignSelf:"flex-start" },
  success: { background:"#f0fff4", color:"#276749", padding:"0.75rem 1rem", borderRadius:"8px", marginBottom:"1rem" },
  error: { background:"#fff5f5", color:"#c53030", padding:"0.75rem 1rem", borderRadius:"8px", marginBottom:"1rem" },
  list: { display:"flex", flexDirection:"column", gap:"1rem" },
  hwItem: { border:"1.5px solid #e2e8f0", borderRadius:"10px", padding:"1.2rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem" },
  hwLeft: { flex:1 },
  hwTop: { display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.5rem" },
  hwTitle: { fontWeight:"600", color:"#2d3748", fontSize:"1rem" },
  badge: { padding:"0.2rem 0.6rem", borderRadius:"20px", fontSize:"0.75rem", fontWeight:"600" },
  hwMeta: { display:"flex", gap:"1.2rem", flexWrap:"wrap", fontSize:"0.82rem", color:"#718096", marginBottom:"0.5rem" },
  hwDesc: { color:"#4a5568", fontSize:"0.875rem", margin:0 },
  hwActions: { display:"flex", flexDirection:"column", gap:"0.5rem" },
  viewBtn: { padding:"0.45rem 1rem", background:"#ebf8ff", color:"#2b6cb0", border:"1px solid #bee3f8", borderRadius:"6px", cursor:"pointer", fontWeight:"600", fontSize:"0.85rem", whiteSpace:"nowrap" },
  delBtn: { padding:"0.45rem 1rem", background:"#fff5f5", color:"#c53030", border:"1px solid #fed7d7", borderRadius:"6px", cursor:"pointer", fontWeight:"600", fontSize:"0.85rem" },
  empty: { color:"#a0aec0", textAlign:"center", padding:"2rem", fontSize:"0.95rem" },
  table: { width:"100%", borderCollapse:"collapse" },
  thead: { background:"#f7fafc" },
  th: { padding:"0.75rem 1rem", textAlign:"left", fontSize:"0.85rem", fontWeight:"600", color:"#4a5568", borderBottom:"2px solid #e2e8f0" },
  td: { padding:"0.75rem 1rem", fontSize:"0.875rem", color:"#2d3748", borderBottom:"1px solid #f0f0f0" },
  closeBtn: { padding:"0.4rem 0.9rem", background:"#f7fafc", border:"1px solid #e2e8f0", borderRadius:"6px", cursor:"pointer", color:"#4a5568" },
};
