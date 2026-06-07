import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const roleColors = {
  admin: "#7c3aed",
  teacher: "#0891b2",
  student: "#059669",
  parent: "#d97706",
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{ ...styles.nav, borderBottom: `3px solid ${roleColors[user?.role] || "#4f46e5"}` }}>
      <div style={styles.left}>
        <span style={styles.logo}>🏫 School ERP</span>
        <span style={{ ...styles.badge, background: roleColors[user?.role] || "#4f46e5" }}>
          {user?.role?.toUpperCase()}
        </span>
      </div>
      <div style={styles.right}>
        <span style={styles.name}>👤 {user?.name}</span>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.75rem 2rem", background:"#fff", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" },
  left: { display:"flex", alignItems:"center", gap:"1rem" },
  logo: { fontSize:"1.2rem", fontWeight:"700", color:"#1a202c" },
  badge: { color:"#fff", padding:"0.2rem 0.7rem", borderRadius:"20px", fontSize:"0.75rem", fontWeight:"600" },
  right: { display:"flex", alignItems:"center", gap:"1rem" },
  name: { color:"#4a5568", fontSize:"0.95rem" },
  logoutBtn: { padding:"0.4rem 1rem", background:"#fee2e2", color:"#c53030", border:"none", borderRadius:"6px", cursor:"pointer", fontWeight:"600" },
};

export default Navbar;
