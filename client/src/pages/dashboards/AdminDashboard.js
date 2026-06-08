import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ ...s.statCard, borderTop: `4px solid ${color}` }}>
    <div style={s.statIcon}>{icon}</div>
    <div style={s.statValue}>{value}</div>
    <div style={s.statLabel}>{label}</div>
  </div>
);

const EMPTY_FORM = { name:"", email:"", password:"", role:"student", phone:"", subject:"", employeeId:"", rollNumber:"", class:"" };

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState(EMPTY_FORM);
  const [msg, setMsg]         = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault(); setMsg(""); setError(""); setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`${API}/auth/admin/create-user`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg(`✅ ${data.message}`);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally { setLoading(false); }
  };

  const actions = [
    { icon:"🎓", label:"Manage Students", color:"#059669", path:"/admin/students",    ready:true  },
    { icon:"📝", label:"View Results",    color:"#7c3aed", path:"/admin/results",     ready:true  },
    { icon:"💰", label:"Fee Management",  color:"#d97706", path:"/admin/fee",         ready:true  },
    { icon:"📚", label:"Homework",        color:"#0891b2", path:"/admin/homework",    ready:true  },
    { icon:"🗓️", label:"Timetable",       color:"#db2777", path:"/admin/timetable",  ready:true },
    { icon:"🏆", label:"Achievements",    color:"#f59e0b", path:"/admin/achievements",ready:true },
  ];

  const isTeacher = form.role === "teacher";
  const isStudent = form.role === "student";

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <h2 style={s.welcome}>Welcome back, {user?.name}! 👋</h2>
        <p style={s.date}>Admin Control Panel — {new Date().toDateString()}</p>

        <div style={s.statsGrid}>
          <StatCard icon="👨‍🏫" label="Teachers" value="12"  color="#0891b2" />
          <StatCard icon="🎓"  label="Students" value="248" color="#059669" />
          <StatCard icon="👨‍👩‍👧" label="Parents"  value="190" color="#d97706" />
          <StatCard icon="💰"  label="Fees Due" value="₹24K" color="#e53e3e" />
        </div>

        <div style={s.section}>
          <h3 style={s.sectionTitle}>📋 Quick Actions</h3>
          <div style={s.actionsGrid}>
            {actions.map(a => (
              <div key={a.label}
                style={{...s.actionCard, borderLeft:`4px solid ${a.color}`, cursor:a.ready?"pointer":"default", opacity:a.ready?1:0.7}}
                onClick={() => a.ready && navigate(a.path)}>
                <span style={s.actionIcon}>{a.icon}</span>
                <span style={s.actionLabel}>{a.label}</span>
                {a.ready
                  ? <span style={{fontSize:"0.75rem", color:"#059669", fontWeight:"600"}}>Open →</span>
                  : <span style={s.comingSoon}>Coming soon</span>}
              </div>
            ))}
          </div>
        </div>

        <div style={s.section}>
          <h3 style={s.sectionTitle}>➕ Create New User</h3>
          {msg   && <div style={s.success}>{msg}</div>}
          {error && <div style={s.error}>{error}</div>}
          <form onSubmit={handleCreate} style={s.form}>
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Full Name</label>
                <input style={s.input} placeholder="Full name" value={form.name}
                  onChange={e => setForm({...form, name:e.target.value})} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input style={s.input} type="email" placeholder="Email" value={form.email}
                  onChange={e => setForm({...form, email:e.target.value})} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password</label>
                <input style={s.input} type="password" placeholder="Password" value={form.password}
                  onChange={e => setForm({...form, password:e.target.value})} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Role</label>
                <select style={s.input} value={form.role}
                  onChange={e => setForm({...EMPTY_FORM, role:e.target.value})}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Phone</label>
                <input style={s.input} placeholder="Phone (optional)" value={form.phone}
                  onChange={e => setForm({...form, phone:e.target.value})} />
              </div>
              {isTeacher && <>
                <div style={s.field}>
                  <label style={s.label}>Subject</label>
                  <input style={s.input} placeholder="e.g. Mathematics" value={form.subject}
                    onChange={e => setForm({...form, subject:e.target.value})} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Employee ID</label>
                  <input style={s.input} placeholder="e.g. EMP001" value={form.employeeId}
                    onChange={e => setForm({...form, employeeId:e.target.value})} />
                </div>
              </>}
              {isStudent && <>
                <div style={s.field}>
                  <label style={s.label}>Class</label>
                  <input style={s.input} placeholder="e.g. 10A" value={form.class}
                    onChange={e => setForm({...form, class:e.target.value})} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Roll Number</label>
                  <input style={s.input} placeholder="e.g. 42" value={form.rollNumber}
                    onChange={e => setForm({...form, rollNumber:e.target.value})} />
                </div>
              </>}
            </div>
            <button style={{...s.btn, opacity:loading?0.7:1}} type="submit" disabled={loading}>
              {loading ? "Creating..." : `Create ${form.role.charAt(0).toUpperCase()+form.role.slice(1)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:{ minHeight:"100vh", background:"#f7fafc" },
  content:{ maxWidth:"1100px", margin:"0 auto", padding:"2rem" },
  welcome:{ fontSize:"1.6rem", color:"#1a202c", margin:"0 0 0.25rem" },
  date:{ color:"#718096", marginBottom:"2rem" },
  statsGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1.5rem", marginBottom:"2rem" },
  statCard:{ background:"#fff", borderRadius:"12px", padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", textAlign:"center" },
  statIcon:{ fontSize:"2rem", marginBottom:"0.5rem" },
  statValue:{ fontSize:"2rem", fontWeight:"700", color:"#2d3748" },
  statLabel:{ color:"#718096", fontSize:"0.9rem" },
  section:{ background:"#fff", borderRadius:"12px", padding:"1.5rem", marginBottom:"2rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  sectionTitle:{ fontSize:"1.1rem", fontWeight:"600", color:"#2d3748", marginTop:0, marginBottom:"1.2rem" },
  actionsGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"1rem" },
  actionCard:{ display:"flex", flexDirection:"column", gap:"0.3rem", padding:"1rem", borderRadius:"8px", background:"#f7fafc" },
  actionIcon:{ fontSize:"1.5rem" },
  actionLabel:{ fontWeight:"600", color:"#2d3748", fontSize:"0.95rem" },
  comingSoon:{ fontSize:"0.75rem", color:"#a0aec0" },
  form:{ display:"flex", flexDirection:"column", gap:"1rem" },
  formGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1rem" },
  field:{ display:"flex", flexDirection:"column", gap:"0.4rem" },
  label:{ fontSize:"0.85rem", fontWeight:"600", color:"#4a5568" },
  input:{ padding:"0.65rem 0.9rem", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"0.95rem", outline:"none" },
  btn:{ padding:"0.75rem 2rem", background:"#7c3aed", color:"#fff", border:"none", borderRadius:"8px", fontSize:"1rem", fontWeight:"600", cursor:"pointer", alignSelf:"flex-start" },
  success:{ background:"#f0fff4", color:"#276749", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
  error:{ background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
};