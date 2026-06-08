import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const EMPTY_FORM = { name:"", email:"", password:"", class:"", rollNumber:"", phone:"" };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [msg, setMsg]           = useState("");
  const [search, setSearch]     = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API}/auth/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(data.students);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditId(null); setForm(EMPTY_FORM);
    setMsg(""); setError(""); setShowForm(true);
  };

  const openEdit = (s) => {
    setEditId(s._id);
    setForm({ name:s.name, email:s.email, password:"", class:s.class||"", rollNumber:s.rollNumber||"", phone:s.phone||"" });
    setMsg(""); setError(""); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return setError("Name and email required");
    if (!editId && !form.password) return setError("Password required for new student");
    setSaving(true); setMsg(""); setError("");
    try {
      const token = localStorage.getItem("token");
      if (editId) {
        await axios.put(`${API}/auth/students/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMsg("✅ Student updated!");
      } else {
        await axios.post(`${API}/auth/admin/create-user`, { ...form, role:"student" }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMsg("✅ Student added!");
      }
      setShowForm(false);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/auth/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg("✅ Student deleted!");
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const classes = [...new Set(students.map(s => s.class).filter(Boolean))].sort();
  const filtered = students.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNumber||"").toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass ? s.class === filterClass : true;
    return matchSearch && matchClass;
  });

  return (
    <div style={{ minHeight:"100vh", background:"#f7fafc" }}>
      <Navbar />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h2 style={{ fontSize:"1.6rem", fontWeight:700, color:"#1a202c", margin:"0 0 0.25rem" }}>🎓 Manage Students</h2>
            <p style={{ color:"#718096", margin:0 }}>{students.length} students total</p>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
            <input placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)}
              style={s.input} />
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={s.input}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={openAdd} style={s.addBtn}>+ Add Student</button>
          </div>
        </div>

        {msg   && <div style={s.success}>{msg}</div>}
        {error && <div style={s.errorBox}>{error}</div>}

        {/* Modal Form */}
        {showForm && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <h3 style={{ margin:"0 0 1.2rem", color:"#1a202c" }}>{editId ? "✏️ Edit Student" : "➕ Add Student"}</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                {[
                  { label:"Full Name",   key:"name",       type:"text",     ph:"Rohan Rana" },
                  { label:"Email",       key:"email",      type:"email",    ph:"student@email.com" },
                  { label:"Password",    key:"password",   type:"password", ph: editId?"Leave blank to keep":"Set password" },
                  { label:"Class",       key:"class",      type:"text",     ph:"e.g. 10A" },
                  { label:"Roll Number", key:"rollNumber", type:"text",     ph:"e.g. 42" },
                  { label:"Phone",       key:"phone",      type:"text",     ph:"e.g. 9876543210" },
                ].map(f => (
                  <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                    <label style={s.label}>{f.label}</label>
                    <input style={s.input} type={f.type} placeholder={f.ph}
                      value={form[f.key]} onChange={e => setForm({...form, [f.key]:e.target.value})} />
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem" }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ ...s.addBtn, opacity:saving?0.7:1 }}>{saving?"Saving...": editId?"Update":"Add Student"}</button>
                <button onClick={() => { setShowForm(false); setError(""); }}
                  style={s.cancelBtn}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
          {[
            { label:"Total Students", value:students.length, color:"#059669" },
            { label:"Classes",        value:classes.length,  color:"#7c3aed" },
            { label:"Showing",        value:filtered.length, color:"#0891b2" },
          ].map(st => (
            <div key={st.label} style={{ background:"#fff", borderRadius:10, padding:"1rem", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", borderTop:`3px solid ${st.color}` }}>
              <div style={{ fontSize:"1.8rem", fontWeight:700, color:st.color }}>{st.value}</div>
              <div style={{ fontSize:"0.8rem", color:"#718096" }}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? <p style={{ color:"#718096" }}>Loading...</p> : (
          <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#f7fafc" }}>
                  {["#","Name","Email","Class","Roll No","Phone","Actions"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:"center", padding:"2rem", color:"#a0aec0" }}>No students found</td></tr>
                ) : filtered.map((st, i) => (
                  <tr key={st._id} style={{ borderBottom:"1px solid #f0f0f0" }}>
                    <td style={s.td}>{i+1}</td>
                    <td style={{ ...s.td, fontWeight:600, color:"#2d3748" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"#d1fae5", color:"#059669", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.85rem", flexShrink:0 }}>
                          {st.name?.charAt(0).toUpperCase()}
                        </div>
                        {st.name}
                      </div>
                    </td>
                    <td style={{ ...s.td, color:"#718096" }}>{st.email}</td>
                    <td style={s.td}>
                      {st.class
                        ? <span style={{ background:"#d1fae5", color:"#059669", borderRadius:20, padding:"0.2rem 0.6rem", fontSize:"0.8rem", fontWeight:600 }}>{st.class}</span>
                        : <span style={{ color:"#a0aec0" }}>—</span>}
                    </td>
                    <td style={{ ...s.td, color:"#718096" }}>{st.rollNumber||"—"}</td>
                    <td style={{ ...s.td, color:"#718096" }}>{st.phone||"—"}</td>
                    <td style={s.td}>
                      <div style={{ display:"flex", gap:"0.4rem" }}>
                        <button onClick={() => openEdit(st)}
                          style={{ padding:"0.3rem 0.7rem", background:"#ebf8ff", color:"#2b6cb0", border:"1px solid #bee3f8", borderRadius:6, cursor:"pointer", fontSize:"0.8rem", fontWeight:600 }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(st._id, st.name)}
                          style={{ padding:"0.3rem 0.7rem", background:"#fff5f5", color:"#c53030", border:"1px solid #feb2b2", borderRadius:6, cursor:"pointer", fontSize:"0.8rem", fontWeight:600 }}>
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  input:      { padding:"0.55rem 0.9rem", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:"0.9rem", outline:"none", fontFamily:"inherit" },
  addBtn:     { padding:"0.55rem 1.2rem", background:"#059669", color:"#fff", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" },
  cancelBtn:  { padding:"0.55rem 1.2rem", background:"#fff", color:"#4a5568", border:"1.5px solid #e2e8f0", borderRadius:8, fontWeight:600, cursor:"pointer" },
  success:    { background:"#f0fff4", color:"#276749", padding:"0.75rem", borderRadius:8, marginBottom:"1rem" },
  errorBox:   { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:8, marginBottom:"1rem" },
  overlay:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
  modal:      { background:"#fff", borderRadius:16, padding:"2rem", width:"100%", maxWidth:600, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" },
  label:      { fontSize:"0.85rem", fontWeight:600, color:"#4a5568" },
  th:         { padding:"0.85rem 1rem", textAlign:"left", fontSize:"0.8rem", fontWeight:700, color:"#718096", borderBottom:"1.5px solid #e2e8f0", textTransform:"uppercase" },
  td:         { padding:"0.85rem 1rem", fontSize:"0.9rem", color:"#4a5568" },
};