import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const API = "http://localhost:5000/api";

export default function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API}/attendance/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setRecords(res.data.records);
        setSubjectStats(res.data.subjectStats);
      })
      .catch(err => {
        setError("Failed to load attendance: " + (err.response?.data?.message || err.message));
      });
  }, []);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthRecords = records.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  });
  const dateStatusMap = {};
  monthRecords.forEach(r => {
    const day = new Date(r.date).getDate();
    dateStatusMap[day] = r.status;
  });

  const statusColor = { present: "#22c55e", absent: "#ef4444", late: "#f59e0b" };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7fafc" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        <h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1a202c" }}>
          📅 My Attendance
        </h2>

        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #feb2b2", color: "#c53030", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        {subjectStats.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {subjectStats.map(s => (
              <div key={s.subject} style={{ background: "#fff", borderRadius: 12, padding: "1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: "#2d3748" }}>{s.subject}</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: s.percentage >= 75 ? "#22c55e" : "#ef4444" }}>
                  {s.percentage}%
                </div>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>{s.present}/{s.total} classes</div>
                <div style={{ marginTop: 8, height: 6, borderRadius: 99, background: "#f0f0f0" }}>
                  <div style={{ width: `${s.percentage}%`, height: "100%", borderRadius: 99, background: s.percentage >= 75 ? "#22c55e" : "#ef4444" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          !error && (
            <div style={{ background: "#fff", borderRadius: 12, padding: "1rem", marginBottom: "2rem", color: "#718096", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
              No attendance records found yet.
            </div>
          )
        )}

        <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <button onClick={prevMonth} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "0.3rem 0.8rem", cursor: "pointer" }}>◀</button>
            <strong style={{ color: "#2d3748" }}>{MONTHS[viewMonth]} {viewYear}</strong>
            <button onClick={nextMonth} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "0.3rem 0.8rem", cursor: "pointer" }}>▶</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center" }}>
            {DAYS.map(d => (
              <div key={d} style={{ fontWeight: 600, fontSize: "0.75rem", color: "#888", paddingBottom: 4 }}>{d}</div>
            ))}
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const status = dateStatusMap[day];
              return (
                <div key={day} style={{
                  padding: "0.4rem 0", borderRadius: 8, fontSize: "0.85rem",
                  fontWeight: status ? 600 : 400,
                  background: status ? statusColor[status] + "22" : "transparent",
                  color: status ? statusColor[status] : "#333",
                  border: status ? `1px solid ${statusColor[status]}44` : "1px solid transparent",
                }}>
                  {day}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: "0.8rem" }}>
            {Object.entries(statusColor).map(([s, c]) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}