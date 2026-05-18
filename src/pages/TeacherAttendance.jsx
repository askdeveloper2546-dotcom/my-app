import { useState, useEffect } from "react";

export default function TeacherAttendance({ students }) {
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [viewHistory, setViewHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  const classes = [...new Set(students.map(s => s.cls))];
  const currentStudents = students.filter(s => s.cls === selectedClass);

  // Load attendance for selected date
  useEffect(() => {
    const key = `attendance_${selectedClass}_${selectedDate}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      setAttendance(JSON.parse(saved));
    } else {
      const newAtt = {};
      currentStudents.forEach(s => {
        newAtt[s.id] = "present";
      });
      setAttendance(newAtt);
    }
  }, [selectedClass, selectedDate, currentStudents]);

  // Load history when viewHistory is true
  useEffect(() => {
    if (!viewHistory) return;
    
    const history = [];
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    for (const cls of classes) {
      for (const date of last30Days) {
        const att = localStorage.getItem(`attendance_${cls}_${date}`);
        if (att) {
          const attData = JSON.parse(att);
          const presentCount = Object.values(attData).filter(v => v === "present").length;
          const totalCount = Object.keys(attData).length;
          history.push({
            class: cls,
            date: date,
            present: presentCount,
            total: totalCount,
            percentage: Math.round((presentCount / totalCount) * 100)
          });
        }
      }
    }
    
    setHistoryData(history.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, [viewHistory, classes]);

  const toggleAttendance = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = () => {
    const present = Object.values(attendance).filter(v => v === "present").length;
    
    // Save daily attendance
    localStorage.setItem(`attendance_${selectedClass}_${selectedDate}`, JSON.stringify(attendance));
    
    // Update student overall attendance
    const updatedStudents = students.map(student => {
      if (student.cls === selectedClass) {
        const existingHistory = localStorage.getItem(`student_attendance_${student.id}`);
        const history = existingHistory ? JSON.parse(existingHistory) : [];
        
        // Remove old entry for this date if exists
        const filteredHistory = history.filter(h => h.date !== selectedDate);
        
        filteredHistory.push({ 
          date: selectedDate, 
          status: attendance[student.id], 
          class: selectedClass 
        });
        
        localStorage.setItem(`student_attendance_${student.id}`, JSON.stringify(filteredHistory));
        
        const presentCount = filteredHistory.filter(h => h.status === "present").length;
        const newAttendance = Math.round((presentCount / filteredHistory.length) * 100);
        
        return { ...student, att: newAttendance };
      }
      return student;
    });
    
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    
    alert(`✅ Attendance Saved!\n${present} Present / ${currentStudents.length} Total in ${selectedClass} on ${selectedDate}`);
  };

  const presentCount = Object.values(attendance).filter(v => v === "present").length;

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Teacher Attendance Panel</h2>

      {/* Toggle Buttons */}
      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <button
          onClick={() => setViewHistory(false)}
          style={{
            padding: "10px 20px",
            background: !viewHistory ? "#6c63ff" : "#ddd",
            color: !viewHistory ? "white" : "#333",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          📝 Mark Attendance
        </button>
        <button
          onClick={() => setViewHistory(true)}
          style={{
            padding: "10px 20px",
            background: viewHistory ? "#6c63ff" : "#ddd",
            color: viewHistory ? "white" : "#333",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          📊 View History
        </button>
      </div>

      {!viewHistory ? (
        // MARK ATTENDANCE VIEW
        <>
          {/* Class and Date Selector */}
          <div style={{ 
            background: "white", 
            padding: 20, 
            borderRadius: 12, 
            marginBottom: 20,
            border: "1px solid #ddd"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Select Class</label>
                <select 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                >
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Select Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 15, marginBottom: 20 }}>
            <div style={{ background: "#f0f0f0", padding: 15, borderRadius: 10, flex: 1, textAlign: "center" }}>
              <div>👥 Total</div>
              <h2>{currentStudents.length}</h2>
            </div>
            <div style={{ background: "#e0f5e0", padding: 15, borderRadius: 10, flex: 1, textAlign: "center" }}>
              <div>✅ Present</div>
              <h2 style={{ color: "green" }}>{presentCount}</h2>
            </div>
            <div style={{ background: "#ffe0e0", padding: 15, borderRadius: 10, flex: 1, textAlign: "center" }}>
              <div>❌ Absent</div>
              <h2 style={{ color: "red" }}>{currentStudents.length - presentCount}</h2>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveAttendance}
            style={{
              padding: "12px 24px",
              background: "#6c63ff",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              marginBottom: 20,
              fontWeight: "bold"
            }}
          >
            💾 Save Attendance for {selectedDate}
          </button>

          {/* Student List */}
          <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: "#f5f5f7", padding: "12px 20px", fontWeight: "bold", display: "grid", gridTemplateColumns: "2fr 1fr" }}>
              <div>Student Name</div>
              <div style={{ textAlign: "center" }}>Mark Attendance</div>
            </div>
            
            {currentStudents.map(student => (
              <div
                key={student.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  alignItems: "center",
                  padding: "12px 20px",
                  borderBottom: "1px solid #eee",
                  background: "white"
                }}
              >
                <div>
                  <strong>{student.first} {student.last}</strong>
                  <div style={{ fontSize: 12, color: "#666" }}>ID: {student.id}</div>
                  <div style={{ fontSize: 12 }}>Overall: {student.att}%</div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button
                    onClick={() => toggleAttendance(student.id, "present")}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 20,
                      border: "none",
                      cursor: "pointer",
                      background: attendance[student.id] === "present" ? "#22c55e" : "#e5e7eb",
                      color: attendance[student.id] === "present" ? "white" : "#333"
                    }}
                  >
                    ✓ Present
                  </button>
                  <button
                    onClick={() => toggleAttendance(student.id, "absent")}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 20,
                      border: "none",
                      cursor: "pointer",
                      background: attendance[student.id] === "absent" ? "#ef4444" : "#e5e7eb",
                      color: attendance[student.id] === "absent" ? "white" : "#333"
                    }}
                  >
                    ✗ Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        // HISTORY VIEW
        <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: "#f5f5f7", padding: "15px 20px", borderBottom: "1px solid #ddd" }}>
            <h3 style={{ margin: 0 }}>📊 Attendance History (Last 30 Days)</h3>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9f9f9" }}>
                  <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #ddd" }}>Date</th>
                  <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #ddd" }}>Class</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #ddd" }}>Present</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #ddd" }}>Total</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #ddd" }}>Percentage</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #ddd" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((record, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 12 }}>{record.date}</td>
                    <td style={{ padding: 12 }}>{record.class}</td>
                    <td style={{ padding: 12, textAlign: "center", color: "#43a047" }}>{record.present}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>{record.total}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: 20,
                        background: record.percentage >= 75 ? "#eaf3de" : record.percentage >= 60 ? "#faeeda" : "#fcebeb",
                        color: record.percentage >= 75 ? "#3b6d11" : record.percentage >= 60 ? "#854f0b" : "#a32d2d"
                      }}>
                        {record.percentage}%
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      {record.percentage >= 75 ? "✅ Good" : record.percentage >= 60 ? "⚠️ Average" : "❌ Low"}
                    </td>
                  </tr>
                ))}
                {historyData.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 40, color: "#888" }}>
                      No attendance records found. Start marking attendance!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}