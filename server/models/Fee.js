const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paidAt: { type: Date, default: Date.now },
  method: { type: String, enum: ["cash", "online", "cheque"], default: "cash" },
  receiptNo: { type: String },
  note: { type: String, default: "" },
});

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: String, required: true },
    month: { type: String, required: true },   // e.g. "June 2026"
    session: { type: String, required: true }, // e.g. "2025-2026"
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["unpaid", "partial", "paid"], default: "unpaid" },
    dueDate: { type: Date, required: true },
    payments: [paymentSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-update status and paidAmount before save
feeSchema.pre("save", function (next) {
  this.paidAmount = this.payments.reduce((a, p) => a + p.amount, 0);
  const due = this.totalAmount - this.discount;
  if (this.paidAmount >= due) this.status = "paid";
  else if (this.paidAmount > 0) this.status = "partial";
  else this.status = "unpaid";
  next();
});

module.exports = mongoose.model("Fee", feeSchema);
