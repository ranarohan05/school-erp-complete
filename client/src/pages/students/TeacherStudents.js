import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const SUBJECT_COLORS = {
  "Mathematics": "#7c3aed", "Math": "#7c3aed",
  "Science": "#0891b2", "Physics": "#0891b2", "Chemistry": "#0891b2",
  "English": "#059669",
  "Hindi": "#d97706",
  "Social Studies": "#db2777", "History": "#db2777", "Geography": "#db2777",
  "Computer": "#6366f1",
  "PE": "#e53e3e", "Physical Education": "#e53e3e",
  "Biology": "#0d9488",
};

const getColor = (subject) => {
  if (!subject) return "#7c3aed";
  const key = Object.keys(SUBJECT_COLORS).find(k => subject.toLowerCase().includes(k.toLowerCase()));
  return key ? SUBJECT_COLORS[key] : "#7c3aed";
};

export default function StudentTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API}/auth/teachers`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { setTeachers(res.data.teachers); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || err.message); setLoading(false); });
  }, []);

  const filtered = teachers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f7fafc" }}>
      <Navbar />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h2 style={{ fontSize:"1.6rem", fontWeight:700, color:"#1a202c", margin:"0 0 0.25rem" }}>👨‍🏫 My Teachers</h2>
            <p style={{ color:"#718096", margin:0 }}>{teachers.length} teachers</p>
          </div>
          <input
            placeholder="🔍 Search by name or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding:"0.55rem 1rem", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:"0.9rem", outline:"none", width:260 }}
          />
        </div>

        {error && <div style={{ background:"#fff5f5", border:"1px solid #feb2b2", color:"#c53030", borderRadius:8, padding:"0.75rem 1rem", marginBottom:"1.5rem" }}>{error}</div>}
        {loading && <p style={{ color:"#718096" }}>Loading teachers...</p>}

        {/* Teacher Cards Grid */}
        {!loading && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:"1.2rem" }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn:"1/-1", background:"#fff", borderRadius:12, padding:"3rem", textAlign:"center", color:"#a0aec0" }}>
                No teachers found.
              </div>
            ) : filtered.map(t => {
              const color = getColor(t.subject);
              return (
                <div key={t._id}
                  onClick={() => setSelected(t)}
                  style={{ background:"#fff", borderRadius:14, padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.07)", cursor:"pointer", transition:"transform 0.15s, box-shadow 0.15s", borderTop:`4px solid ${color}` }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.07)"; }}
                >
                  {/* Avatar */}
                  <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1rem" }}>
                    {t.profilePic ? (
                      <img src={t.profilePic} alt={t.name} style={{ width:56, height:56, borderRadius:"50%", objectFit:"cover", border:`2px solid ${color}` }} />
                    ) : (
                      <div style={{ width:56, height:56, borderRadius:"50%", background:color+"22", color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", fontWeight:700, border:`2px solid ${color}`, flexShrink:0 }}>
                        {t.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight:700, color:"#1a202c", fontSize:"1rem" }}>{t.name}</div>
                      <div style={{ background:color+"18", color, borderRadius:20, padding:"0.15rem 0.6rem", fontSize:"0.75rem", fontWeight:600, display:"inline-block", marginTop:3 }}>
                        {t.subject || "Teacher"}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.85rem", color:"#718096" }}>
                      <span>📧</span>
                      <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.email}</span>
                    </div>
                    {t.phone && (
                      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.85rem", color:"#718096" }}>
                        <span>📞</span><span>{t.phone}</span>
                      </div>
                    )}
                    {t.employeeId && (
                      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.85rem", color:"#718096" }}>
                        <span>🪪</span><span>ID: {t.employeeId}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop:"1rem", fontSize:"0.8rem", color:color, fontWeight:600 }}>View Profile →</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem" }}
          onClick={() => setSelected(null)}>
          <div style={{ background:"#fff", borderRadius:16, padding:"2rem", maxWidth:420, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
              {selected.profilePic ? (
                <img src={selected.profilePic} alt={selected.name} style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:`3px solid ${getColor(selected.subject)}`, marginBottom:"0.75rem" }} />
              ) : (
                <div style={{ width:80, height:80, borderRadius:"50%", background:getColor(selected.subject)+"22", color:getColor(selected.subject), display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", fontWeight:700, border:`3px solid ${getColor(selected.subject)}`, margin:"0 auto 0.75rem" }}>
                  {selected.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 style={{ fontSize:"1.3rem", fontWeight:700, color:"#1a202c", margin:"0 0 0.3rem" }}>{selected.name}</h3>
              <span style={{ background:getColor(selected.subject)+"18", color:getColor(selected.subject), borderRadius:20, padding:"0.2rem 0.8rem", fontSize:"0.85rem", fontWeight:600 }}>
                {selected.subject || "Teacher"}
              </span>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {[
                { icon:"📧", label:"Email",       value: selected.email },
                { icon:"📞", label:"Phone",       value: selected.phone || "Not provided" },
                { icon:"🪪", label:"Employee ID", value: selected.employeeId || "N/A" },
              ].map(item => (
                <div key={item.label} style={{ display:"flex", alignItems:"center", gap:"0.75rem", background:"#f7fafc", borderRadius:8, padding:"0.6rem 0.9rem" }}>
                  <span style={{ fontSize:"1.1rem" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize:"0.75rem", color:"#a0aec0", fontWeight:600 }}>{item.label}</div>
                    <div style={{ fontSize:"0.9rem", color:"#2d3748", fontWeight:500 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setSelected(null)}
              style={{ marginTop:"1.5rem", width:"100%", padding:"0.7rem", background:"#f7fafc", color:"#4a5568", border:"1.5px solid #e2e8f0", borderRadius:10, fontWeight:600, cursor:"pointer", fontSize:"0.95rem" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}