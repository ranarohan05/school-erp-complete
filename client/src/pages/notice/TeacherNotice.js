import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = "http://localhost:5000/api";

const PRIORITY_STYLE = {
  normal:    { bg:"#ebf8ff", color:"#2b6cb0", label:"Normal" },
  important: { bg:"#fffbeb", color:"#92400e", label:"Important" },
  urgent:    { bg:"#fff5f5", color:"#c53030", label:"Urgent" },
};

export default function TeacherNotice() {
  const [notices, setNotices]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [msg, setMsg]               = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({ title:"", message:"", targetType:"all", targetClass:"", priority:"normal" });

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API}/notices/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(data.notices);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!form.title || !form.message) return setError("Title and message required");
    if (form.targetType === "class" && !form.targetClass) return setError("Please enter class name");
    setSaving(true); setMsg(""); setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/notices`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg("✅ Notice sent successfully!");
      setForm({ title:"", message:"", targetType:"all", targetClass:"", priority:"normal" });
      setShowForm(false);
      fetchNotices();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotices();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f7fafc" }}>
      <Navbar />
      <div style={{ maxWidth:900, margin:"0 auto", padding:"2rem" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h2 style={{ fontSize:"1.6rem", fontWeight:700, color:"#1a202c", margin:"0 0 0.25rem" }}>🔔 Send Notice</h2>
            <p style={{ color:"#718096", margin:0 }}>{notices.length} notices sent</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(""); setMsg(""); }}
            style={{ padding:"0.55rem 1.2rem", background: showForm?"#e53e3e":"#7c3aed", color:"#fff", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" }}>
            {showForm ? "✕ Cancel" : "+ New Notice"}
          </button>
        </div>

        {msg   && <div style={s.success}>{msg}</div>}
        {error && <div style={s.errorBox}>{error}</div>}

        {/* Form */}
        {showForm && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>📢 Create New Notice</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div style={s.field}>
                <label style={s.label}>Title</label>
                <input style={s.input} placeholder="e.g. Exam Schedule Update" value={form.title}
                  onChange={e => setForm({...form, title:e.target.value})} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Message</label>
                <textarea style={{...s.input, minHeight:100, resize:"vertical"}} placeholder="Write your notice here..."
                  value={form.message} onChange={e => setForm({...form, message:e.target.value})} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"1rem" }}>
                <div style={s.field}>
                  <label style={s.label}>Send To</label>
                  <select style={s.input} value={form.targetType} onChange={e => setForm({...form, targetType:e.target.value})}>
                    <option value="all">All Students</option>
                    <option value="class">Specific Class</option>
                  </select>
                </div>
                {form.targetType === "class" && (
                  <div style={s.field}>
                    <label style={s.label}>Class Name</label>
                    <input style={s.input} placeholder="e.g. 10A" value={form.targetClass}
                      onChange={e => setForm({...form, targetClass:e.target.value})} />
                  </div>
                )}
                <div style={s.field}>
                  <label style={s.label}>Priority</label>
                  <select style={s.input} value={form.priority} onChange={e => setForm({...form, priority:e.target.value})}>
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSend} disabled={saving}
                style={{ ...s.btn, opacity:saving?0.7:1, alignSelf:"flex-start" }}>
                {saving ? "Sending..." : "📢 Send Notice"}
              </button>
            </div>
          </div>
        )}

        {/* Notices List */}
        {loading ? <p style={{ color:"#718096" }}>Loading...</p> : (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {notices.length === 0 ? (
              <div style={{ ...s.card, textAlign:"center", color:"#a0aec0", padding:"3rem" }}>No notices sent yet.</div>
            ) : notices.map(n => {
              const p = PRIORITY_STYLE[n.priority] || PRIORITY_STYLE.normal;
              return (
                <div key={n._id} style={{ ...s.card, borderLeft:`4px solid ${p.color}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.4rem", flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, fontSize:"1rem", color:"#1a202c" }}>{n.title}</span>
                        <span style={{ background:p.bg, color:p.color, borderRadius:20, padding:"0.15rem 0.6rem", fontSize:"0.75rem", fontWeight:600 }}>{p.label}</span>
                        <span style={{ background: n.targetType==="all"?"#f0fff4":"#ede9fe", color: n.targetType==="all"?"#276749":"#7c3aed", borderRadius:20, padding:"0.15rem 0.6rem", fontSize:"0.75rem", fontWeight:600 }}>
                          {n.targetType === "all" ? "📣 All Students" : `🏫 Class ${n.targetClass}`}
                        </span>
                      </div>
                      <p style={{ color:"#4a5568", margin:"0 0 0.5rem", fontSize:"0.9rem", lineHeight:1.6 }}>{n.message}</p>
                      <div style={{ fontSize:"0.8rem", color:"#a0aec0" }}>
                        By <b>{n.createdByName}</b> ({n.createdByRole}) · {new Date(n.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(n._id)}
                      style={{ background:"#fff5f5", color:"#c53030", border:"1px solid #feb2b2", borderRadius:6, padding:"0.3rem 0.7rem", cursor:"pointer", fontSize:"0.8rem", fontWeight:600, flexShrink:0 }}>
                      🗑 Delete
                    </button>
                  </div>
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
  card:      { background:"#fff", borderRadius:12, padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle: { margin:"0 0 1.2rem", color:"#2d3748", fontSize:"1.05rem", fontWeight:600 },
  field:     { display:"flex", flexDirection:"column", gap:"0.4rem" },
  label:     { fontSize:"0.85rem", fontWeight:600, color:"#4a5568" },
  input:     { padding:"0.6rem 0.9rem", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:"0.9rem", outline:"none", fontFamily:"inherit" },
  btn:       { padding:"0.65rem 1.6rem", background:"#7c3aed", color:"#fff", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" },
  success:   { background:"#f0fff4", color:"#276749", padding:"0.75rem", borderRadius:8, marginBottom:"1rem" },
  errorBox:  { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:8, marginBottom:"1rem" },
};