import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

const Card = ({ icon, title, desc, color, onClick }) => (
  <div onClick={onClick} style={{ ...s.card, borderLeft:`4px solid ${color}`, cursor:"pointer" }}
    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.12)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)"; }}>
    <div style={s.cardIcon}>{icon}</div>
    <h4 style={s.cardTitle}>{title}</h4>
    <p style={s.cardDesc}>{desc}</p>
    <span style={{ fontSize:"0.75rem", color:"#059669", fontWeight:600 }}>Open →</span>
  </div>
);

export default function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <h2 style={s.welcome}>Welcome, {user?.name}! 👨‍👩‍👧</h2>
        <p style={s.sub}>Parent Dashboard — {new Date().toDateString()}</p>

        <div style={s.alert}>
          <span>⚠️</span>
          <span>Reminder: Check your child's latest results and fee status regularly.</span>
        </div>

        <div style={s.statsRow}>
          {[
            { icon:"🎓", label:"Child",      val:"1"   },
            { icon:"✅", label:"Attendance", val:"90%" },
            { icon:"🏆", label:"Last Grade", val:"B+"  },
            { icon:"💰", label:"Fee Due",    val:"₹4K" },
          ].map(st => (
            <div key={st.label} style={s.stat}>
              <span style={s.statIcon}>{st.icon}</span>
              <span style={s.statVal}>{st.val}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>

        <h3 style={s.secTitle}>Monitor Your Child</h3>
        <div style={s.grid}>
          <Card icon="📊" title="View Results"   desc="Check marks and grade reports"         color="#7c3aed" onClick={() => navigate("/parent/results")} />
          <Card icon="💰" title="Fee Status"     desc="View and track outstanding fees"        color="#059669" onClick={() => navigate("/parent/fee")} />
          <Card icon="📅" title="Attendance"     desc="Track daily attendance record"          color="#d97706" onClick={() => navigate("/parent/attendance")} />
          <Card icon="📝" title="Homework"       desc="Check assigned homework"                color="#0891b2" onClick={() => navigate("/parent/homework")} />
          <Card icon="👨‍🏫" title="Teachers"      desc="View child's teacher profiles"          color="#db2777" onClick={() => navigate("/parent/teachers")} />
          <Card icon="🔔" title="Notices"        desc="School notices and updates"             color="#e53e3e" onClick={() => navigate("/parent/notices")} />
        </div>
      </div>
    </div>
  );
}

const s = {
  page:      { minHeight:"100vh", background:"#f7fafc" },
  content:   { maxWidth:"1100px", margin:"0 auto", padding:"2rem" },
  welcome:   { fontSize:"1.6rem", color:"#1a202c", margin:"0 0 0.25rem" },
  sub:       { color:"#718096", marginBottom:"1.5rem" },
  alert:     { background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:8, padding:"0.9rem 1.2rem", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"0.75rem", color:"#92400e", fontSize:"0.9rem" },
  statsRow:  { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem", marginBottom:"2rem" },
  stat:      { background:"#fff", borderRadius:12, padding:"1.2rem", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:"0.3rem" },
  statIcon:  { fontSize:"1.8rem" },
  statVal:   { fontSize:"1.8rem", fontWeight:700, color:"#2d3748" },
  statLabel: { fontSize:"0.85rem", color:"#718096" },
  secTitle:  { fontSize:"1.1rem", fontWeight:600, color:"#2d3748", marginBottom:"1rem" },
  grid:      { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1.2rem" },
  card:      { background:"#fff", borderRadius:12, padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", transition:"transform 0.15s, box-shadow 0.15s" },
  cardIcon:  { fontSize:"2rem", marginBottom:"0.75rem" },
  cardTitle: { margin:"0 0 0.4rem", color:"#2d3748", fontSize:"1rem", fontWeight:600 },
  cardDesc:  { color:"#718096", fontSize:"0.875rem", margin:"0 0 0.75rem" },
};