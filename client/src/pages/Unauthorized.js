import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.code}>403</h1>
        <h2 style={styles.title}>Access Denied 🚫</h2>
        <p style={styles.msg}>You don't have permission to view this page.</p>
        <button style={styles.btn} onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f7fafc" },
  card: { textAlign:"center", padding:"3rem" },
  code: { fontSize:"5rem", color:"#e53e3e", margin:0 },
  title: { fontSize:"1.8rem", color:"#2d3748" },
  msg: { color:"#718096", marginBottom:"2rem" },
  btn: { padding:"0.75rem 2rem", background:"#4f46e5", color:"#fff", border:"none", borderRadius:"8px", fontSize:"1rem", cursor:"pointer" },
};
