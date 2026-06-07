import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = "http://localhost:5000/api";

const statusColor = { paid:"#276749", partial:"#d97706", unpaid:"#c53030" };
const statusBg    = { paid:"#f0fff4", partial:"#fefcbf", unpaid:"#fff5f5" };

export default function AdminFee() {
  const [fees, setFees]         = useState([]);
  const [stats, setStats]       = useState(null);
  const [students, setStudents] = useState([]);
  const [tab, setTab]           = useState("overview");
  const [form, setForm]         = useState({ studentId:"", month:"", session:"2025-2026", totalAmount:"", discount:"0", dueDate:"" });
  const [payForm, setPayForm]   = useState({ amount:"", method:"cash", note:"" });
  const [payingId, setPayingId] = useState(null);
  const [msg, setMsg]           = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => { fetchStats(); fetchFees(); fetchStudents(); }, []);

  const fetchStats = async () => {
    try { const { data } = await axios.get(`${API}/fee/stats`); setStats(data.stats); } catch {}
  };
  const fetchFees = async () => {
    try {
      const q = filterStatus ? `?status=${filterStatus}` : "";
      const { data } = await axios.get(`${API}/fee${q}`);
      setFees(data.fees);
    } catch {}
  };
  const fetchStudents = async () => {
    try { const { data } = await axios.get(`${API}/results/students`); setStudents(data.students); } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setMsg(""); setError(""); setLoading(true);
    try {
      await axios.post(`${API}/fee`, form);
      setMsg("✅ Fee record created!");
      setForm({ studentId:"", month:"", session:"2025-2026", totalAmount:"", discount:"0", dueDate:"" });
      fetchFees(); fetchStats();
    } catch (err) { setError(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  const handlePayment = async (feeId) => {
    setMsg(""); setError(""); setLoading(true);
    try {
      const { data } = await axios.post(`${API}/fee/${feeId}/pay`, payForm);
      setMsg(`✅ Payment recorded! Receipt: ${data.receiptNo}`);
      setPayingId(null);
      setPayForm({ amount:"", method:"cash", note:"" });
      fetchFees(); fetchStats();
    } catch (err) { setError(err.response?.data?.message || "Payment failed"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fee record?")) return;
    try { await axios.delete(`${API}/fee/${id}`); fetchFees(); fetchStats(); }
    catch { setError("Delete failed"); }
  };

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <h2 style={s.title}>💰 Fee Management</h2>
        <p style={s.sub}>Create, track and collect student fees</p>

        {msg   && <div style={s.success}>{msg}</div>}
        {error && <div style={s.error}>{error}</div>}

        {/* Stats */}
        {stats && (
          <div style={s.statsRow}>
            {[
              { icon:"📋", label:"Total Records", val:stats.total,                         color:"#7c3aed" },
              { icon:"✅", label:"Paid",           val:stats.paid,                          color:"#059669" },
              { icon:"⏳", label:"Partial",        val:stats.partial,                       color:"#d97706" },
              { icon:"❌", label:"Unpaid",         val:stats.unpaid,                        color:"#e53e3e" },
              { icon:"💵", label:"Collected",      val:`₹${stats.totalCollected.toLocaleString()}`, color:"#0891b2" },
              { icon:"💸", label:"Due",            val:`₹${stats.totalDue.toLocaleString()}`,        color:"#db2777" },
            ].map(st => (
              <div key={st.label} style={{...s.stat, borderTop:`3px solid ${st.color}`}}>
                <span style={s.statIcon}>{st.icon}</span>
                <span style={s.statVal}>{st.val}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={s.tabs}>
          {[["overview","📋 All Fees"],["create","➕ Create Fee"]].map(([key,label]) => (
            <button key={key} style={{...s.tab,...(tab===key?s.activeTab:{})}} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {/* Create Fee */}
        {tab === "create" && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>➕ Create Fee Record</h3>
            <form onSubmit={handleCreate} style={s.form}>
              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>Select Student</label>
                  <select style={s.input} value={form.studentId} onChange={e => setForm({...form,studentId:e.target.value})} required>
                    <option value="">-- Select Student --</option>
                    {students.map(st => <option key={st._id} value={st._id}>{st.name} — Class {st.class||"N/A"}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Month</label>
                  <select style={s.input} value={form.month} onChange={e => setForm({...form,month:e.target.value})} required>
                    <option value="">-- Select Month --</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Session</label>
                  <input style={s.input} placeholder="2025-2026" value={form.session} onChange={e => setForm({...form,session:e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Total Amount (₹)</label>
                  <input style={s.input} type="number" placeholder="e.g. 5000" value={form.totalAmount} onChange={e => setForm({...form,totalAmount:e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Discount (₹)</label>
                  <input style={s.input} type="number" placeholder="0" value={form.discount} onChange={e => setForm({...form,discount:e.target.value})} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Due Date</label>
                  <input style={s.input} type="date" value={form.dueDate} onChange={e => setForm({...form,dueDate:e.target.value})} required />
                </div>
              </div>
              <button style={{...s.btn,opacity:loading?0.7:1}} type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Fee Record"}
              </button>
            </form>
          </div>
        )}

        {/* All Fees */}
        {tab === "overview" && (
          <div style={s.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.2rem",flexWrap:"wrap",gap:"0.75rem"}}>
              <h3 style={{...s.cardTitle,margin:0}}>📋 All Fee Records ({fees.length})</h3>
              <select style={{...s.input,width:"160px"}} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); fetchFees(); }}>
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            {fees.length === 0 ? <div style={s.empty}>No fee records found.</div> : (
              <div style={s.list}>
                {fees.map(fee => {
                  const due = fee.totalAmount - fee.discount;
                  const remaining = due - fee.paidAmount;
                  return (
                    <div key={fee._id} style={{...s.feeCard, borderLeft:`4px solid ${statusColor[fee.status]}`}}>
                      <div style={s.feeTop}>
                        <div>
                          <span style={s.feeName}>{fee.student?.name}</span>
                          <span style={s.feeMeta}> — Class {fee.class} | {fee.month} {fee.session}</span>
                        </div>
                        <span style={{...s.badge, color:statusColor[fee.status], background:statusBg[fee.status]}}>
                          {fee.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={s.feeDetails}>
                        <span>💰 Total: ₹{fee.totalAmount}</span>
                        {fee.discount>0 && <span>🎁 Discount: ₹{fee.discount}</span>}
                        <span>✅ Paid: ₹{fee.paidAmount}</span>
                        <span style={{color:remaining>0?"#c53030":"#276749"}}>
                          {remaining > 0 ? `⚠️ Due: ₹${remaining}` : "✅ Fully Paid"}
                        </span>
                        <span>📅 Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                      </div>

                      {/* Payment history */}
                      {fee.payments?.length > 0 && (
                        <div style={s.payHistory}>
                          {fee.payments.map((p,i) => (
                            <span key={i} style={s.payTag}>
                              ₹{p.amount} via {p.method} — {new Date(p.paidAt).toLocaleDateString()} | 🧾 {p.receiptNo}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={s.feeActions}>
                        {fee.status !== "paid" && (
                          <button style={s.payBtn} onClick={() => setPayingId(payingId===fee._id?null:fee._id)}>
                            💵 Record Payment
                          </button>
                        )}
                        <button style={s.delBtn} onClick={() => handleDelete(fee._id)}>Delete</button>
                      </div>

                      {/* Inline payment form */}
                      {payingId === fee._id && (
                        <div style={s.payFormBox}>
                          <div style={s.grid2}>
                            <div style={s.field}>
                              <label style={s.label}>Amount (₹)</label>
                              <input style={s.input} type="number" placeholder="Amount" value={payForm.amount}
                                onChange={e => setPayForm({...payForm,amount:e.target.value})} />
                            </div>
                            <div style={s.field}>
                              <label style={s.label}>Payment Method</label>
                              <select style={s.input} value={payForm.method} onChange={e => setPayForm({...payForm,method:e.target.value})}>
                                <option value="cash">Cash</option>
                                <option value="online">Online</option>
                                <option value="cheque">Cheque</option>
                              </select>
                            </div>
                          </div>
                          <input style={{...s.input,marginTop:"0.5rem"}} placeholder="Note (optional)" value={payForm.note}
                            onChange={e => setPayForm({...payForm,note:e.target.value})} />
                          <button style={{...s.btn,marginTop:"0.75rem",opacity:loading?0.7:1}}
                            onClick={() => handlePayment(fee._id)} disabled={loading}>
                            {loading ? "Processing..." : "Confirm Payment"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:{ minHeight:"100vh", background:"#f7fafc" },
  content:{ maxWidth:"1100px", margin:"0 auto", padding:"2rem" },
  title:{ fontSize:"1.6rem", color:"#1a202c", margin:"0 0 0.25rem" },
  sub:{ color:"#718096", marginBottom:"1.5rem" },
  statsRow:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem", marginBottom:"1.5rem" },
  stat:{ background:"#fff", borderRadius:"12px", padding:"1rem", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:"0.25rem" },
  statIcon:{ fontSize:"1.4rem" },
  statVal:{ fontSize:"1.5rem", fontWeight:"700", color:"#2d3748" },
  statLabel:{ fontSize:"0.78rem", color:"#718096" },
  tabs:{ display:"flex", gap:"0.75rem", marginBottom:"1.5rem" },
  tab:{ padding:"0.5rem 1.2rem", border:"1.5px solid #e2e8f0", borderRadius:"20px", background:"#fff", cursor:"pointer", fontSize:"0.875rem", color:"#4a5568" },
  activeTab:{ background:"#059669", color:"#fff", borderColor:"#059669" },
  card:{ background:"#fff", borderRadius:"12px", padding:"1.5rem", marginBottom:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle:{ margin:"0 0 1.2rem", color:"#2d3748", fontSize:"1.05rem", fontWeight:"600" },
  form:{ display:"flex", flexDirection:"column", gap:"1.2rem" },
  grid2:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1rem" },
  field:{ display:"flex", flexDirection:"column", gap:"0.4rem" },
  label:{ fontSize:"0.85rem", fontWeight:"600", color:"#4a5568" },
  input:{ padding:"0.65rem 0.9rem", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"0.95rem", outline:"none", fontFamily:"inherit", width:"100%", boxSizing:"border-box" },
  btn:{ padding:"0.7rem 1.8rem", background:"#059669", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"600", cursor:"pointer", alignSelf:"flex-start" },
  list:{ display:"flex", flexDirection:"column", gap:"1rem" },
  feeCard:{ border:"1.5px solid #e2e8f0", borderRadius:"10px", padding:"1.2rem" },
  feeTop:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.6rem" },
  feeName:{ fontWeight:"700", color:"#2d3748", fontSize:"1rem" },
  feeMeta:{ color:"#718096", fontSize:"0.85rem" },
  badge:{ padding:"0.25rem 0.7rem", borderRadius:"20px", fontSize:"0.78rem", fontWeight:"700" },
  feeDetails:{ display:"flex", gap:"1.2rem", flexWrap:"wrap", fontSize:"0.82rem", color:"#4a5568", marginBottom:"0.75rem" },
  payHistory:{ display:"flex", flexDirection:"column", gap:"0.3rem", marginBottom:"0.75rem" },
  payTag:{ fontSize:"0.78rem", color:"#4a5568", background:"#f7fafc", padding:"0.3rem 0.7rem", borderRadius:"6px", border:"1px solid #e2e8f0" },
  feeActions:{ display:"flex", gap:"0.75rem" },
  payBtn:{ padding:"0.4rem 1rem", background:"#f0fff4", color:"#276749", border:"1px solid #9ae6b4", borderRadius:"6px", cursor:"pointer", fontWeight:"600", fontSize:"0.85rem" },
  delBtn:{ padding:"0.4rem 1rem", background:"#fff5f5", color:"#c53030", border:"1px solid #fed7d7", borderRadius:"6px", cursor:"pointer", fontWeight:"600", fontSize:"0.85rem" },
  payFormBox:{ marginTop:"1rem", padding:"1rem", background:"#f7fafc", borderRadius:"8px" },
  success:{ background:"#f0fff4", color:"#276749", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
  error:{ background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
  empty:{ color:"#a0aec0", textAlign:"center", padding:"2rem" },
};
