import { useState, useEffect } from "react";

export default function StudentAttendance({ user, students }) {
  const [myData, setMyData] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, percentage: 0 });
  
  useEffect(() => {
    const student = students.find(s => s.email === user.email);
    setMyData(student);
    
    if (student) {
      const history = localStorage.getItem(`student_attendance_${student.id}`);
      if (history) {
        const data = JSON.parse(history);
        setAttendanceHistory(data.reverse());
        
        const present = data.filter(h => h.status === "present").length;
        const absent = data.filter(h => h.status === "absent").length;
        const percentage = data.length > 0 ? Math.round((present / data.length) * 100) : 0;
        setSummary({ present, absent, percentage });
      }
    }
  }, [user, students]);
  
  if (!myData) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 50 }}>
        <h2>📭 Student data not found</h2>
      </div>
    );
  }
  
  return (
    <div>
      {/* Stats Cards */}
      <div className="stat-grid">
        <div className="card modern-card">
          <div className="card-label">📊 Overall Attendance</div>
          <div className="card-value" style={{ color: summary.percentage >= 75 ? "#43a047" : "#f97316" }}>
            {summary.percentage}%
          </div>
          <small>{summary.present} Present / {summary.absent} Absent</small>
        </div>
        <div className="card modern-card">
          <div className="card-label">✅ Total Present</div>
          <div className="card-value" style={{ color: "#43a047" }}>{summary.present}</div>
          <small>Days attended</small>
        </div>
        <div className="card modern-card">
          <div className="card-label">❌ Total Absent</div>
          <div className="card-value" style={{ color: "#E24B4A" }}>{summary.absent}</div>
          <small>Days missed</small>
        </div>
        <div className="card modern-card">
          <div className="card-label">📅 Current Status</div>
          <div className="card-value">
            {summary.percentage >= 75 ? "✅ Good" : summary.percentage >= 60 ? "⚠️ Average" : "❌ Critical"}
          </div>
          <small>{summary.percentage >= 75 ? "Keep it up!" : summary.percentage >= 60 ? "Needs improvement" : "Contact parents"}</small>
        </div>
      </div>
      
      {/* Attendance Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">📈 Attendance Progress</div>
        <div style={{ 
          width: "100%", 
          height: 20, 
          background: "#eee", 
          borderRadius: 10,
          overflow: "hidden"
        }}>
          <div style={{
            width: `${summary.percentage}%`,
            height: "100%",
            background: `linear-gradient(90deg, #6c63ff, ${summary.percentage >= 75 ? "#43a047" : "#f97316"})`,
            transition: "width 0.5s ease"
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <span>0%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
      
      {/* Attendance History Table */}
      <div className="table-card">
        <div className="table-header">
          <h3>📅 My Attendance History</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Class</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {attendanceHistory.map((record, i) => (
              <tr key={i}>
                <td>{record.date}</td>
                <td>{record.class}</td>
                <td>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    background: record.status === "present" ? "#eaf3de" : "#fcebeb",
                    color: record.status === "present" ? "#3b6d11" : "#a32d2d"
                  }}>
                    {record.status === "present" ? "✅ Present" : "❌ Absent"}
                  </span>
                </td>
                <td>
                  {record.status === "present" 
                    ? "Attended class" 
                    : record.percentage < 60 ? "Warning: Low attendance" : "Missed class"}
                </td>
              </tr>
            ))}
            {attendanceHistory.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: 40 }}>
                  No attendance records found yet. Your teacher will mark attendance soon.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Warning Message */}
      {summary.percentage < 60 && summary.percentage > 0 && (
        <div className="card" style={{ marginTop: 20, background: "#fcebeb", border: "1px solid #f7c1c1" }}>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "#a32d2d" }}>⚠️ Low Attendance Warning</h3>
            <p>Your attendance is below 60%. Please attend classes regularly to avoid academic probation.</p>
          </div>
        </div>
      )}
    </div>
  );
}