import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = "http://localhost:5000/api";

export default function StudentTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      console.log("USER DATA:", user);

      if (!user) {
        setError("User not found. Please login again.");
        return;
      }

      if (!user.class || user.class.trim() === "") {
        setError("No class assigned to this student.");
        return;
      }

      console.log("CLASS:", user.class);

      const res = await axios.get(
        `${API}/timetable/class/${user.class}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("TIMETABLE API:", res.data);

      const data = res.data?.data || [];

      setTimetable(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Timetable Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load timetable"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <h2 style={styles.heading}>📅 Class Timetable</h2>

        {loading && (
          <div style={styles.infoBox}>
            Loading timetable...
          </div>
        )}

        {!loading && error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          timetable.length === 0 && (
            <div style={styles.infoBox}>
              No timetable assigned yet.
            </div>
          )}

        {!loading &&
          !error &&
          timetable.length > 0 &&
          timetable.map((day) => (
            <div
              key={day._id}
              style={styles.dayCard}
            >
              <h3 style={styles.dayTitle}>
                {day.day}
              </h3>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Period</th>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Subject</th>
                    <th style={styles.th}>Teacher</th>
                  </tr>
                </thead>

                <tbody>
                  {day.periods?.map((period, index) => (
                    <tr key={index}>
                      <td style={styles.td}>
                        {period.periodNumber}
                      </td>

                      <td style={styles.td}>
                        {period.startTime} - {period.endTime}
                      </td>

                      <td style={styles.td}>
                        {period.subject}
                      </td>

                      <td style={styles.td}>
                        {period.teacherName || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f7fafc",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2rem",
  },

  heading: {
    marginBottom: "1.5rem",
    color: "#1a202c",
  },

  dayCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },

  dayTitle: {
    marginBottom: "15px",
    color: "#2d3748",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#edf2f7",
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #e2e8f0",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
  },

  infoBox: {
    background: "#edf2f7",
    color: "#4a5568",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
  },

  errorBox: {
    background: "#fff5f5",
    color: "#c53030",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
  },
};