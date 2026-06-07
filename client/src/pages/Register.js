import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_ROUTES = { teacher:"/teacher/dashboard", student:"/student/dashboard", parent:"/parent/dashboard" };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"student", phone:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(ROLE_ROUTES[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo}>🏫</h1>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.sub}>Join School ERP System</p>
        </div>
        {error && <div style={styles.error}>⚠️ {error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} type="text" placeholder="Your full name"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} type="email" placeholder="you@school.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select style={styles.input} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Phone (optional)</label>
            <input style={styles.input} type="text" placeholder="Your phone number"
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register →"}
          </button>
        </form>
        <p style={styles.footer}>Already have an account? <Link to="/login" style={styles.link}>Sign in</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding:"2rem 0" },
  card: { background:"#fff", padding:"2.5rem", borderRadius:"16px", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", width:"100%", maxWidth:"420px" },
  header: { textAlign:"center", marginBottom:"2rem" },
  logo: { fontSize:"3rem", margin:0 },
  title: { margin:"0.5rem 0 0.25rem", fontSize:"1.5rem", color:"#1a202c" },
  sub: { color:"#718096", margin:0 },
  form: { display:"flex", flexDirection:"column", gap:"1rem" },
  field: { display:"flex", flexDirection:"column", gap:"0.4rem" },
  label: { fontSize:"0.875rem", fontWeight:"600", color:"#4a5568" },
  input: { padding:"0.75rem 1rem", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"1rem", outline:"none" },
  btn: { padding:"0.85rem", background:"linear-gradient(135deg, #667eea, #764ba2)", color:"#fff", border:"none", borderRadius:"8px", fontSize:"1rem", fontWeight:"600", cursor:"pointer" },
  error: { background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem", fontSize:"0.9rem" },
  footer: { textAlign:"center", marginTop:"1.5rem", color:"#718096", fontSize:"0.9rem" },
  link: { color:"#667eea", fontWeight:"600" },
};
