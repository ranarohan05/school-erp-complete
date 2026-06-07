import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

const Card = ({ icon, title, desc, color, onClick, ready }) => (
  <div
    onClick={onClick}
    style={{
      ...s.card,
      borderLeft: `4px solid ${color}`,
      cursor: ready ? "pointer" : "default",
      opacity: ready ? 1 : 0.7,
    }}
  >
    <div style={s.cardIcon}>{icon}</div>
    <h4 style={s.cardTitle}>{title}</h4>
    <p style={s.cardDesc}>{desc}</p>

    {ready ? (
      <span
        style={{
          ...s.tag,
          background: "#d1fae5",
          color: "#276749",
        }}
      >
        Open →
      </span>
    ) : (
      <span
        style={{
          ...s.tag,
          background: "#f7fafc",
          color: "#a0aec0",
        }}
      >
        Coming soon
      </span>
    )}
  </div>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <Navbar />

      <div style={s.content}>
        <h2 style={s.welcome}>
          Hello, {user?.name}! 🎓
        </h2>

        <p style={s.sub}>
          Student Dashboard — {new Date().toDateString()}
        </p>

        <div style={s.notice}>
          <span>📢</span>
          <span>
            Notice: Annual exam schedule has been uploaded.
          </span>
        </div>

        <div style={s.statsRow}>
          {[
            { icon: "📚", label: "Subjects", val: "6" },
            { icon: "📝", label: "Homework Due", val: "3" },
            { icon: "✅", label: "Attendance", val: "92%" },
            { icon: "🏆", label: "Last Result", val: "A+" },
          ].map((st) => (
            <div key={st.label} style={s.stat}>
              <span style={s.statIcon}>{st.icon}</span>
              <span style={s.statVal}>{st.val}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>

        <h3 style={s.secTitle}>My Modules</h3>

        <div style={s.grid}>
          <Card
            icon="📊"
            title="My Results"
            desc="View your marks and grade reports"
            color="#7c3aed"
            ready={true}
            onClick={() => navigate("/student/results")}
          />

          <Card
            icon="📝"
            title="Homework"
            desc="View and submit assigned homework"
            color="#0891b2"
            ready={true}
            onClick={() => navigate("/student/homework")}
          />

          <Card
            icon="💰"
            title="Fee Status"
            desc="Check your fee payment status"
            color="#059669"
            ready={true}
            onClick={() => navigate("/student/fee")}
          />

          {/* Attendance Active */}
          <Card
            icon="📅"
            title="Attendance"
            desc="View your attendance record"
            color="#d97706"
            ready={true}
            onClick={() => navigate("/student/attendance")}
          />

          <Card
            icon="🗓️"
            title="Timetable"
            desc="View your class schedule"
            color="#db2777"
            ready={true}
            onClick={() => navigate("/student/timetable")}
          />

          <Card
  icon="👨‍🏫"
  title="My Teachers"
  desc="View teacher profiles and subjects"
  color="#e53e3e"
  ready={true}
  onClick={() => navigate("/student/teachers")}
/>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#f7fafc",
  },

  content: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2rem",
  },

  welcome: {
    fontSize: "1.6rem",
    color: "#1a202c",
    margin: "0 0 0.25rem",
  },

  sub: {
    color: "#718096",
    marginBottom: "1.5rem",
  },

  notice: {
    background: "#ebf8ff",
    border: "1px solid #bee3f8",
    borderRadius: "8px",
    padding: "0.9rem 1.2rem",
    marginBottom: "1.5rem",
    display: "flex",
    gap: "0.75rem",
    color: "#2b6cb0",
    fontSize: "0.9rem",
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },

  stat: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.2rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },

  statIcon: {
    fontSize: "1.8rem",
  },

  statVal: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#2d3748",
  },

  statLabel: {
    fontSize: "0.85rem",
    color: "#718096",
  },

  secTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "1rem",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
    gap: "1.2rem",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },

  cardIcon: {
    fontSize: "2rem",
    marginBottom: "0.75rem",
  },

  cardTitle: {
    margin: "0 0 0.4rem",
    color: "#2d3748",
    fontSize: "1rem",
  },

  cardDesc: {
    color: "#718096",
    fontSize: "0.875rem",
    margin: "0 0 0.75rem",
  },

  tag: {
    fontSize: "0.75rem",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontWeight: "600",
  },
};