import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function StudentTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API}/auth/teachers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Teachers:", res.data);

      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <h2 style={{ textAlign: "center", marginTop: "40px" }}>
          Loading Teachers...
        </h2>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div
        style={{
          maxWidth: "1100px",
          margin: "30px auto",
          padding: "20px",
        }}
      >
        <h2>👨‍🏫 My Teachers</h2>

        {teachers.length === 0 ? (
          <p>No teachers found.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: "20px",
            }}
          >
            {teachers.map((teacher) => (
              <div
                key={teacher._id}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <img
  src={
    teacher.profilePic && teacher.profilePic.trim() !== ""
      ? teacher.profilePic
      : `https://ui-avatars.com/api/?name=${teacher.name}&background=0D8ABC&color=fff`
  }
  alt={teacher.name}
  style={{
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
  }}
/>

                  <div>
                    <h3>{teacher.name}</h3>

                    <p>
                      📚 {teacher.subject || "N/A"}
                    </p>

                    <p>
                      📧 {teacher.email}
                    </p>

                    <p>
                      📞 {teacher.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}