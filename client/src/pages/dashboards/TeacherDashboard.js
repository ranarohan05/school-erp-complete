import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

const Card = ({ icon, title, desc, color, onClick, ready }) => (
  <div
    onClick={onClick}
    style={{
      ...s.card,
      borderTop: `4px solid ${color}`,
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

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <Navbar />

      <div style={s.content}>
        <h2 style={s.welcome}>
          Good day, {user?.name}! 📚
        </h2>

        <p style={s.sub}>
          Teacher Dashboard — {new Date().toDateString()}
        </p>

        <div style={s.statsRow}>
          {[
            { icon: "🎓", label: "My Students", val: "42" },
            { icon: "📝", label: "Assignments", val: "8" },
            { icon: "✅", label: "Submitted", val: "35" },
            { icon: "📅", label: "Classes Today", val: "4" },
          ].map((st) => (
            <div key={st.label} style={s.stat}>
              <span style={s.statIcon}>{st.icon}</span>
              <span style={s.statVal}>{st.val}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>

        <h3 style={s.secTitle}>Your Modules</h3>

        <div style={s.grid}>
          <Card
            icon="📝"
            title="Assign Homework"
            desc="Create and assign homework to your class"
            color="#0891b2"
            ready={true}
            onClick={() => navigate("/teacher/homework")}
          />

          <Card
            icon="📊"
            title="Upload Results"
            desc="Enter marks and grades for students"
            color="#7c3aed"
            ready={true}
            onClick={() => navigate("/teacher/results")}
          />

          <Card
            icon="✅"
            title="Mark Attendance"
            desc="Record daily student attendance"
            color="#059669"
            ready={true}
            onClick={() => navigate("/teacher/attendance")}
          />

          <Card
  icon="🗓️"
  title="Manage Timetable"
  desc="Create and manage class timetable"
  color="#d97706"
  ready={true}
  onClick={() => navigate("/teacher/timetable")}
/>

          <Card
  icon="👤"
  title="Student Profiles"
  desc="View and manage student information"
  color="#db2777"
  ready={true}
  onClick={() => navigate("/teacher/students")}
/>

          <Card icon="🔔" title="Send Notice" desc="Send notifications to students or parents" color="#e53e3e" ready={true} onClick={() => navigate("/teacher/notice")} />
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
    marginBottom: "2rem",
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
    transition: "0.2s",
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