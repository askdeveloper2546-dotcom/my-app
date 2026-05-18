import { useState } from "react";

export default function Attendance({ students }) {
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [attendance, setAttendance] = useState({});

  const classes = [...new Set(students.map(s => s.cls))];
  const currentStudents = students.filter(s => s.cls === selectedClass);

  // Initialize attendance if empty
  if (Object.keys(attendance).length === 0 && currentStudents.length > 0) {
    const newAtt = {};
    currentStudents.forEach(s => {
      newAtt[s.id] = "present";
    });
    // Use setTimeout to avoid render issues
    setTimeout(() => setAttendance(newAtt), 0);
  }

  const toggleAttendance = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = () => {
    const present = Object.values(attendance).filter(v => v === "present").length;
    alert(`✅ Attendance Saved!\n${present} Present / ${currentStudents.length} Total`);
  };

  const presentCount = Object.values(attendance).filter(v => v === "present").length;

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Attendance System</h2>

      {/* Class Selector */}
      <div style={{ marginBottom: 20 }}>
        <h4>Select Class:</h4>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {classes.map(cls => (
            <button
              key={cls}
              onClick={() => {
                setSelectedClass(cls);
                setAttendance({}); // Reset attendance for new class
              }}
              style={{
                padding: "8px 16px",
                background: selectedClass === cls ? "#6c63ff" : "#ddd",
                color: selectedClass === cls ? "white" : "#333",
                border: "none",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 15, marginBottom: 20 }}>
        <div style={{ background: "#f0f0f0", padding: 15, borderRadius: 10, flex: 1, textAlign: "center" }}>
          <div>Total</div>
          <h2>{currentStudents.length}</h2>
        </div>
        <div style={{ background: "#e0f5e0", padding: 15, borderRadius: 10, flex: 1, textAlign: "center" }}>
          <div>Present</div>
          <h2 style={{ color: "green" }}>{presentCount}</h2>
        </div>
        <div style={{ background: "#ffe0e0", padding: 15, borderRadius: 10, flex: 1, textAlign: "center" }}>
          <div>Absent</div>
          <h2 style={{ color: "red" }}>{currentStudents.length - presentCount}</h2>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveAttendance}
        style={{
          padding: "10px 20px",
          background: "#6c63ff",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          marginBottom: 20
        }}
      >
        💾 Save Attendance
      </button>

      {/* Student List */}
      <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
        {currentStudents.map(student => (
          <div
            key={student.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              borderBottom: "1px solid #eee",
              background: "white"
            }}
          >
            <div>
              <strong>{student.first} {student.last}</strong>
              <div style={{ fontSize: 12, color: "#666" }}>{student.id}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
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
    </div>
  );
}