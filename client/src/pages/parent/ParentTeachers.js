import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = "http://localhost:5000/api";
const COLORS = ["#7c3aed","#0891b2","#059669","#d97706","#db2777","#e53e3e"];
const getColor = (subject) => {
  if (!subject) return "#7c3aed";
  const map = { math:"#7c3aed", science:"#0891b2", english:"#059669", hindi:"#d97706", social:"#db2777", computer:"#6366f1", pe:"#e53e3e" };
  const key = Object.keys(map).find(k => subject.toLowerCase().includes(k));
  return key ? map[key] : COLORS[subject.charCodeAt(0) % COLORS.length];
};

export default function ParentTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API}/auth/teachers`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setTeachers(res.data.teachers); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || err.message); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#f7fafc" }}>
      <Navbar />
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"2rem" }}>
        <h2 style={{ fontSize:"1.6rem", fontWeight:700, color:"#1a202c", marginBottom:"1.5rem" }}>👨‍🏫 Child's Teachers</h2>
        {error && <div style={{ background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:8, marginBottom:"1rem" }}>{error}</div>}
        {loading ? <p style={{ color:"#718096" }}>Loading...</p> : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"1.2rem" }}>
            {teachers.map(t => {
              const color = getColor(t.subject);
              return (
                <div key={t._id} onClick={() => setSelected(t)} style={{ background:"#fff", borderRadius:14, padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.07)", cursor:"pointer", borderTop:`4px solid ${color}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.75rem" }}>
                    <div style={{ width:48, height:48, borderRadius:"50%", background:color+"22", color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", fontWeight:700, border:`2px solid ${color}` }}>
                      {t.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, color:"#1a202c" }}>{t.name}</div>
                      <span style={{ background:color+"18", color, borderRadius:20, padding:"0.1rem 0.5rem", fontSize:"0.75rem", fontWeight:600 }}>{t.subject||"Teacher"}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:"0.85rem", color:"#718096" }}>📧 {t.email}</div>
                  {t.phone && <div style={{ fontSize:"0.85rem", color:"#718096", marginTop:"0.25rem" }}>📞 {t.phone}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={() => setSelected(null)}>
          <div style={{ background:"#fff", borderRadius:16, padding:"2rem", maxWidth:380, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:"center", marginBottom:"1.2rem" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:getColor(selected.subject)+"22", color:getColor(selected.subject), display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", fontWeight:700, margin:"0 auto 0.75rem", border:`2px solid ${getColor(selected.subject)}` }}>
                {selected.name?.charAt(0).toUpperCase()}
              </div>
              <h3 style={{ margin:"0 0 0.25rem", color:"#1a202c" }}>{selected.name}</h3>
              <span style={{ background:getColor(selected.subject)+"18", color:getColor(selected.subject), borderRadius:20, padding:"0.2rem 0.8rem", fontSize:"0.85rem", fontWeight:600 }}>{selected.subject||"Teacher"}</span>
            </div>
            {[{icon:"📧",label:"Email",val:selected.email},{icon:"📞",label:"Phone",val:selected.phone||"Not provided"},{icon:"🪪",label:"Employee ID",val:selected.employeeId||"N/A"}].map(item => (
              <div key={item.label} style={{ display:"flex", alignItems:"center", gap:"0.75rem", background:"#f7fafc", borderRadius:8, padding:"0.6rem 0.9rem", marginBottom:"0.5rem" }}>
                <span>{item.icon}</span>
                <div><div style={{ fontSize:"0.75rem", color:"#a0aec0", fontWeight:600 }}>{item.label}</div><div style={{ fontSize:"0.9rem", color:"#2d3748" }}>{item.val}</div></div>
              </div>
            ))}
            <button onClick={() => setSelected(null)} style={{ marginTop:"1rem", width:"100%", padding:"0.65rem", background:"#f7fafc", border:"1.5px solid #e2e8f0", borderRadius:10, fontWeight:600, cursor:"pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}