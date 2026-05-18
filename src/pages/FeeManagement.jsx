import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function FeeManagement() {
  const { currentUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Load data
  useEffect(() => {
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    setStudentsList(allStudents);

    if (currentUser.role === "student") {
      const studentData = allStudents.find(s => s.email === currentUser.email);
      setStudent(studentData);
      
      const savedPayments = localStorage.getItem(`payments_${studentData?.id}`);
      if (savedPayments) {
        setPayments(JSON.parse(savedPayments));
      }
    } else if (currentUser.role === "admin" || currentUser.role === "teacher") {
      const savedPayments = localStorage.getItem("allPayments");
      if (savedPayments) {
        setPayments(JSON.parse(savedPayments));
      }
    }
  }, [currentUser]);

  // Process payment
  const processPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter valid amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    const targetStudent = currentUser.role === "student" ? student : selectedStudent;

    if (amount > (targetStudent?.feesPending || 0)) {
      alert(`Amount exceeds pending fees. Pending: PKR ${targetStudent?.feesPending}`);
      return;
    }

    const receipt = {
      id: `RCP${Date.now()}`,
      studentId: targetStudent.id,
      studentName: `${targetStudent.first} ${targetStudent.last}`,
      studentEmail: targetStudent.email,
      amount: amount,
      method: paymentMethod,
      date: new Date().toISOString(),
      status: "completed",
      receiptNo: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    // Update payments
    let updatedPayments;
    if (currentUser.role === "student") {
      updatedPayments = [receipt, ...payments];
      setPayments(updatedPayments);
      localStorage.setItem(`payments_${targetStudent.id}`, JSON.stringify(updatedPayments));
    } else {
      updatedPayments = [receipt, ...payments];
      setPayments(updatedPayments);
      localStorage.setItem("allPayments", JSON.stringify(updatedPayments));
    }

    // Update student fees
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    const updatedStudents = allStudents.map(s => {
      if (s.id === targetStudent.id) {
        const newPaid = (s.feesPaid || 0) + amount;
        return {
          ...s,
          feesPaid: newPaid,
          feesPending: (s.fees || 0) - newPaid
        };
      }
      return s;
    });
    localStorage.setItem("students", JSON.stringify(updatedStudents));

    if (currentUser.role === "student") {
      setStudent({ ...targetStudent, feesPaid: (targetStudent.feesPaid || 0) + amount, feesPending: (targetStudent.fees || 0) - ((targetStudent.feesPaid || 0) + amount) });
    }

    setPaymentAmount("");
    setShowPaymentModal(false);
    alert(`✅ Payment of PKR ${amount} successful! Receipt No: ${receipt.receiptNo}`);
  };

  // Print receipt
  const printReceipt = (receipt) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fee Receipt - ${receipt.receiptNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .receipt { max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 10px; }
          .header { text-align: center; border-bottom: 2px solid #6c63ff; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #6c63ff; }
          .title { font-size: 20px; margin: 10px 0; }
          .details { margin: 20px 0; line-height: 1.8; }
          .amount { font-size: 24px; color: #43a047; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #888; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px; }
          .label { font-weight: bold; width: 120px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">🎓 EduManage</div>
            <div class="title">FEE PAYMENT RECEIPT</div>
          </div>
          
          <div class="details">
            <table>
              <tr><td class="label">Receipt No:</td><td>${receipt.receiptNo}</td></tr>
              <tr><td class="label">Date:</td><td>${new Date(receipt.date).toLocaleDateString()}</td></tr>
              <tr><td class="label">Student Name:</td><td>${receipt.studentName}</td></tr>
              <tr><td class="label">Student ID:</td><td>${receipt.studentId}</td></tr>
              <tr><td class="label">Payment Method:</td><td>${receipt.method.toUpperCase()}</td></tr>
              <tr><td class="label">Status:</td><td>${receipt.status}</td></tr>
            </table>
            
            <div class="amount">
              Amount Paid: PKR ${receipt.amount.toLocaleString()}
            </div>
          </div>
          
          <div class="footer">
            This is a computer generated receipt. No signature required.
            <br>© EduManage Student Management System
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const canManage = currentUser.role === "admin" || currentUser.role === "teacher";
  const targetStudent = currentUser.role === "student" ? student : selectedStudent;
  const displayPayments = currentUser.role === "student" 
    ? payments 
    : selectedStudent 
      ? payments.filter(p => p.studentId === selectedStudent.id)
      : payments;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>💰 Fee Management</h2>
        {(currentUser.role === "student" || canManage) && targetStudent && (
          <button
            onClick={() => setShowPaymentModal(true)}
            style={{
              padding: "10px 20px",
              background: "#6c63ff",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            + Make Payment
          </button>
        )}
      </div>

      {/* Student Selector for Admin/Teacher */}
      {canManage && (
        <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Select Student</label>
          <select
            value={selectedStudent?.id || ""}
            onChange={(e) => {
              const student = studentsList.find(s => s.id === e.target.value);
              setSelectedStudent(student);
              const studentPayments = JSON.parse(localStorage.getItem(`payments_${student?.id}`) || "[]");
              setPayments(studentPayments);
            }}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="">-- Select Student --</option>
            {studentsList.map(s => (
              <option key={s.id} value={s.id}>{s.first} {s.last} ({s.id})</option>
            ))}
          </select>
        </div>
      )}

      {/* Fee Summary */}
      {targetStudent && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15, marginBottom: 20 }}>
          <div style={{ background: "linear-gradient(135deg, #6c63ff, #9333ea)", padding: 20, borderRadius: 12, color: "white" }}>
            <div>Total Fees</div>
            <div style={{ fontSize: 28, fontWeight: "bold" }}>PKR {targetStudent.fees?.toLocaleString() || 0}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #43a047, #66bb6a)", padding: 20, borderRadius: 12, color: "white" }}>
            <div>Paid Fees</div>
            <div style={{ fontSize: 28, fontWeight: "bold" }}>PKR {(targetStudent.feesPaid || 0).toLocaleString()}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #f97316, #ef4444)", padding: 20, borderRadius: 12, color: "white" }}>
            <div>Pending Fees</div>
            <div style={{ fontSize: 28, fontWeight: "bold" }}>PKR {(targetStudent.feesPending || 0).toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && targetStudent && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{ background: "white", padding: 30, borderRadius: 16, width: 400, maxWidth: "90%" }}>
            <h3 style={{ marginTop: 0 }}>💳 Make Payment</h3>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5 }}>Amount (PKR)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={`Max: ${targetStudent.feesPending || 0}`}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 5 }}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              >
                <option value="cash">💵 Cash</option>
                <option value="card">💳 Card</option>
                <option value="bank">🏦 Bank Transfer</option>
                <option value="online">📱 Online Payment</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={processPayment}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#6c63ff",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Pay Now
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#ccc",
                  color: "#333",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div style={{ background: "white", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "#f5f5f7", padding: 15, borderBottom: "1px solid #ddd" }}>
          <h3 style={{ margin: 0 }}>📜 Payment History</h3>
        </div>
        
        {displayPayments.length === 0 ? (
          <div style={{ textAlign: "center", padding: 50, color: "#888" }}>
            No payment records found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9f9f9" }}>
                  <th style={{ padding: 12, textAlign: "left" }}>Receipt No</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Date</th>
                  <th style={{ padding: 12, textAlign: "right" }}>Amount (PKR)</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Method</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Status</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayPayments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 12 }}>{payment.receiptNo}</td>
                    <td style={{ padding: 12 }}>{new Date(payment.date).toLocaleDateString()}</td>
                    <td style={{ padding: 12, textAlign: "right", color: "#43a047", fontWeight: "bold" }}>
                      PKR {payment.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>{payment.method.toUpperCase()}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <span style={{ padding: "4px 12px", borderRadius: 20, background: "#eaf3de", color: "#3b6d11" }}>
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <button
                        onClick={() => printReceipt(payment)}
                        style={{
                          padding: "4px 12px",
                          background: "#6c63ff",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer"
                        }}
                      >
                        🖨️ Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}