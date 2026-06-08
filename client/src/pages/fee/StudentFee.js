import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const statusColor = { paid:"#276749", partial:"#d97706", unpaid:"#c53030" };
const statusBg    = { paid:"#f0fff4", partial:"#fefcbf", unpaid:"#fff5f5" };

export default function StudentFee() {
  const [fees, setFees]   = useState([]);
  const [error, setError] = useState("");

  useEffect(() => { fetchFees(); }, []);

  const fetchFees = async () => {
    try { const { data } = await axios.get(`${API}/fee`); setFees(data.fees); }
    catch { setError("Failed to load fee records"); }
  };

  const totalDue  = fees.reduce((a, f) => a + Math.max(0, (f.totalAmount - f.discount) - f.paidAmount), 0);
  const totalPaid = fees.reduce((a, f) => a + f.paidAmount, 0);

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <h2 style={s.title}>💰 My Fee Status</h2>
        <p style={s.sub}>View your fee details and payment history</p>

        {error && <div style={s.error}>{error}</div>}

        {/* Summary */}
        <div style={s.statsRow}>
          {[
            { icon:"📋", label:"Total Records", val:fees.length,                                    color:"#7c3aed" },
            { icon:"✅", label:"Paid",           val:fees.filter(f=>f.status==="paid").length,       color:"#059669" },
            { icon:"❌", label:"Unpaid",         val:fees.filter(f=>f.status==="unpaid").length,     color:"#e53e3e" },
            { icon:"💵", label:"Total Paid",     val:`₹${totalPaid.toLocaleString()}`,               color:"#0891b2" },
            { icon:"💸", label:"Total Due",      val:`₹${totalDue.toLocaleString()}`,                color:"#db2777" },
          ].map(st => (
            <div key={st.label} style={{...s.stat, borderTop:`3px solid ${st.color}`}}>
              <span style={s.statIcon}>{st.icon}</span>
              <span style={s.statVal}>{st.val}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>

        {totalDue > 0 && (
          <div style={s.alert}>
            ⚠️ You have <strong>₹{totalDue.toLocaleString()}</strong> in pending fees. Please pay at the school office.
          </div>
        )}

        {fees.length === 0 ? (
          <div style={s.empty}>No fee records found. Contact admin if this seems wrong.</div>
        ) : (
          <div style={s.list}>
            {fees.map(fee => {
              const netDue   = fee.totalAmount - fee.discount;
              const remaining = netDue - fee.paidAmount;
              const isOverdue = new Date(fee.dueDate) < new Date() && fee.status !== "paid";
              return (
                <div key={fee._id} style={{...s.card, borderLeft:`4px solid ${statusColor[fee.status]}`}}>
                  <div style={s.cardTop}>
                    <div>
                      <h3 style={s.month}>{fee.month} — {fee.session}</h3>
                      <span style={{...s.badge, color:statusColor[fee.status], background:statusBg[fee.status]}}>
                        {fee.status.toUpperCase()}
                      </span>
                      {isOverdue && <span style={{...s.badge, background:"#fff5f5", color:"#c53030", marginLeft:"0.5rem"}}>OVERDUE</span>}
                    </div>
                    <div style={s.amountBox}>
                      <span style={s.bigAmount}>₹{netDue.toLocaleString()}</span>
                      <span style={s.amountLabel}>Total Fee</span>
                    </div>
                  </div>

                  <div style={s.details}>
                    <div style={s.detailRow}>
                      <span>Total Amount</span><span>₹{fee.totalAmount.toLocaleString()}</span>
                    </div>
                    {fee.discount > 0 && (
                      <div style={s.detailRow}>
                        <span>Discount</span><span style={{color:"#059669"}}>- ₹{fee.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={s.detailRow}>
                      <span>Amount Paid</span><span style={{color:"#059669"}}>₹{fee.paidAmount.toLocaleString()}</span>
                    </div>
                    <div style={{...s.detailRow, fontWeight:"700", borderTop:"1px solid #e2e8f0", paddingTop:"0.5rem"}}>
                      <span>Remaining</span>
                      <span style={{color:remaining>0?"#c53030":"#059669"}}>
                        {remaining > 0 ? `₹${remaining.toLocaleString()}` : "✅ Fully Paid"}
                      </span>
                    </div>
                  </div>

                  <div style={s.metaRow}>
                    <span>📅 Due Date: {new Date(fee.dueDate).toLocaleDateString()}</span>
                  </div>

                  {/* Payment receipts */}
                  {fee.payments?.length > 0 && (
                    <div style={s.receipts}>
                      <p style={s.receiptTitle}>🧾 Payment History</p>
                      {fee.payments.map((p, i) => (
                        <div key={i} style={s.receiptRow}>
                          <span>₹{p.amount} via {p.method}</span>
                          <span>{new Date(p.paidAt).toLocaleDateString()}</span>
                          <span style={{color:"#7c3aed"}}>{p.receiptNo}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:{ minHeight:"100vh", background:"#f7fafc" },
  content:{ maxWidth:"900px", margin:"0 auto", padding:"2rem" },
  title:{ fontSize:"1.6rem", color:"#1a202c", margin:"0 0 0.25rem" },
  sub:{ color:"#718096", marginBottom:"1.5rem" },
  statsRow:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:"1rem", marginBottom:"1.5rem" },
  stat:{ background:"#fff", borderRadius:"12px", padding:"1rem", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:"0.25rem" },
  statIcon:{ fontSize:"1.4rem" },
  statVal:{ fontSize:"1.4rem", fontWeight:"700", color:"#2d3748" },
  statLabel:{ fontSize:"0.78rem", color:"#718096" },
  alert:{ background:"#fff5f5", border:"1px solid #fed7d7", borderRadius:"8px", padding:"0.9rem 1.2rem", marginBottom:"1.5rem", color:"#c53030", fontSize:"0.9rem" },
  list:{ display:"flex", flexDirection:"column", gap:"1.2rem" },
  card:{ background:"#fff", borderRadius:"12px", padding:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTop:{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" },
  month:{ margin:"0 0 0.4rem", color:"#2d3748", fontSize:"1.1rem" },
  badge:{ padding:"0.2rem 0.6rem", borderRadius:"20px", fontSize:"0.75rem", fontWeight:"700" },
  amountBox:{ textAlign:"right" },
  bigAmount:{ display:"block", fontSize:"1.6rem", fontWeight:"800", color:"#2d3748" },
  amountLabel:{ fontSize:"0.78rem", color:"#718096" },
  details:{ background:"#f7fafc", borderRadius:"8px", padding:"1rem", marginBottom:"0.75rem" },
  detailRow:{ display:"flex", justifyContent:"space-between", padding:"0.3rem 0", fontSize:"0.875rem", color:"#4a5568" },
  metaRow:{ fontSize:"0.82rem", color:"#718096", marginBottom:"0.75rem" },
  receipts:{ borderTop:"1px solid #e2e8f0", paddingTop:"0.75rem" },
  receiptTitle:{ margin:"0 0 0.5rem", fontSize:"0.85rem", fontWeight:"600", color:"#4a5568" },
  receiptRow:{ display:"flex", justifyContent:"space-between", fontSize:"0.8rem", color:"#718096", padding:"0.25rem 0" },
  empty:{ textAlign:"center", color:"#a0aec0", padding:"3rem", background:"#fff", borderRadius:"12px" },
  error:{ background:"#fff5f5", color:"#c53030", padding:"0.75rem", borderRadius:"8px", marginBottom:"1rem" },
};
