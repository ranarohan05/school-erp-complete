import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const SUBJECTS = ["Math", "Science", "English", "History", "Geography", "PE"];
const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function TeacherAttendance() {
  const [subject, setSubject]     = useState(SUBJECTS[0]);
  const [date, setDate]           = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents]   = useState([]);
  const [statuses, setStatuses]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    axios.get(`${API}/auth/students`)
      .then(res => {
        setStudents(res.data.students);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load students: " + (err.response?.data?.message || err.message));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setSubmitted(false);
    setStatuses({});
  }, [subject, date]);

  const handleSubmit = async () => {
    if (students.length === 0) return;
    try {
      const records = students.map(s => ({
        student: s._id,
        subject,
        date,
        status: statuses[s._id] || "absent",
      }));
      await axios.post(`${API}/attendance/mark`, { records });
      setSubmitted(true);
    } catch (err) {
      setError("Failed to save: " + (err.response?.data?.message || err.message));
    }
  };

  const statusColor = { present: "#22c55e", absent: "#ef4444", late: "#f59e0b" };

  return (
    <div style={{ minHeight: "100vh", background: "#f7fafc" }}>
      <Navbar />
      <div style={{ maxWidth: 750, margin: "0 auto", padding: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", color: "#1a202c" }}>✅ Mark Attendance</h2>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid #ddd", fontSize: "0.95rem" }}>
            {SUBJECTS.map(sub => <option key={sub}>{sub}</option>)}
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid #ddd", fontSize: "0.95rem" }} />
        </div>

        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #feb2b2", color: "#c53030", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {loading && <p style={{ color: "#718096" }}>Loading students...</p>}
        {!loading && students.length === 0 && !error && (
          <p style={{ color: "#718096" }}>No students found in the system.</p>
        )}

        {students.map(st => (
          <div key={st._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#fff", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <span style={{ fontWeight: 600, color: "#2d3748" }}>{st.name}</span>
              {st.rollNumber && <span style={{ fontSize: "0.85rem", color: "#718096" }}> — Roll {st.rollNumber}</span>}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["present", "absent", "late"].map(status => (
                <button key={status}
                  onClick={() => setStatuses(prev => ({ ...prev, [st._id]: status }))}
                  style={{ padding: "0.3rem 0.8rem", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.85rem",
                    background: statuses[st._id] === status ? statusColor[status] : "#f0f0f0",
                    color: statuses[st._id] === status ? "#fff" : "#555" }}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}

        {!loading && students.length > 0 && (
          <button onClick={handleSubmit}
            style={{ marginTop: "1.5rem", padding: "0.75rem 2rem", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: "1rem" }}>
            Submit Attendance
          </button>
        )}

        {submitted && (
          <p style={{ color: "#22c55e", marginTop: "1rem", fontWeight: 600 }}>✅ Attendance saved successfully!</p>
        )}
      </div>
    </div>
  );
}