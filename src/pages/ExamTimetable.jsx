import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function ExamTimetable() {
  const { currentUser } = useAuth();
  const [timetables, setTimetables] = useState([]);
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [newExam, setNewExam] = useState({
    className: "10-A",
    subject: "",
    date: "",
    time: "",
    duration: "2 hours",
    room: "",
    examType: "Mid Term"
  });

  const classes = ["10-A", "10-B", "11-A", "11-B", "12-A"];
  const examTypes = ["Mid Term", "Final Term", "Test", "Quiz", "Practical"];

  // Load timetables from localStorage
  useEffect(() => {
    const savedTimetables = localStorage.getItem("examTimetables");
    if (savedTimetables) {
      setTimetables(JSON.parse(savedTimetables));
    } else {
      // Default timetables
      const defaultTimetables = [
        {
          id: "E001",
          className: "10-A",
          subject: "Mathematics",
          date: "2024-04-20",
          time: "09:00 AM",
          duration: "2 hours",
          room: "Hall A",
          examType: "Mid Term",
          createdBy: "Admin",
          createdAt: new Date().toISOString()
        },
        {
          id: "E002",
          className: "10-A",
          subject: "Physics",
          date: "2024-04-22",
          time: "09:00 AM",
          duration: "2 hours",
          room: "Hall A",
          examType: "Mid Term",
          createdBy: "Admin",
          createdAt: new Date().toISOString()
        },
        {
          id: "E003",
          className: "10-A",
          subject: "Computer Science",
          date: "2024-04-24",
          time: "09:00 AM",
          duration: "2 hours",
          room: "Lab 1",
          examType: "Mid Term",
          createdBy: "Admin",
          createdAt: new Date().toISOString()
        }
      ];
      setTimetables(defaultTimetables);
      localStorage.setItem("examTimetables", JSON.stringify(defaultTimetables));
    }
  }, []);

  // Save timetables to localStorage
  const saveTimetables = (updatedTimetables) => {
    setTimetables(updatedTimetables);
    localStorage.setItem("examTimetables", JSON.stringify(updatedTimetables));
  };

  // Add new exam
  const addExam = () => {
    if (!newExam.subject || !newExam.date || !newExam.time) {
      alert("Please fill all required fields");
      return;
    }

    const exam = {
      id: `E${Date.now()}`,
      ...newExam,
      createdBy: `${currentUser.first} ${currentUser.last}`,
      createdAt: new Date().toISOString()
    };

    saveTimetables([...timetables, exam]);
    setNewExam({
      className: selectedClass,
      subject: "",
      date: "",
      time: "",
      duration: "2 hours",
      room: "",
      examType: "Mid Term"
    });
    setShowForm(false);
    alert("✅ Exam added to timetable!");
  };

  // Update exam
  const updateExam = () => {
    if (!editingExam.subject || !editingExam.date || !editingExam.time) {
      alert("Please fill all required fields");
      return;
    }

    const updatedTimetables = timetables.map(e => 
      e.id === editingExam.id ? editingExam : e
    );
    saveTimetables(updatedTimetables);
    setEditingExam(null);
    alert("✅ Exam updated successfully!");
  };

  // Delete exam
  const deleteExam = (id) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      const updatedTimetables = timetables.filter(e => e.id !== id);
      saveTimetables(updatedTimetables);
      alert("✅ Exam deleted!");
    }
  };

  // Filter timetables by class
  const filteredTimetables = timetables.filter(t => t.className === selectedClass);
  
  // Sort by date
  const sortedTimetables = [...filteredTimetables].sort((a, b) => new Date(a.date) - new Date(b.date));

  const canManage = currentUser.role === "admin" || currentUser.role === "teacher";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>📅 Exam Timetable</h2>
        {canManage && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingExam(null);
            }}
            style={{
              padding: "10px 20px",
              background: "#6c63ff",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            {showForm ? "❌ Cancel" : "+ Add Exam"}
          </button>
        )}
      </div>

      {/* Class Selector */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Select Class</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {classes.map(cls => (
            <button
              key={cls}
              onClick={() => {
                setSelectedClass(cls);
                setNewExam({ ...newExam, className: cls });
              }}
              style={{
                padding: "8px 16px",
                background: selectedClass === cls ? "#6c63ff" : "#e0e0e0",
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

      {/* Add/Edit Exam Form */}
      {(showForm || editingExam) && (
        <div style={{
          background: "white",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          border: "1px solid #ddd"
        }}>
          <h3>{editingExam ? "✏️ Edit Exam" : "📝 Add New Exam"}</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 15 }}>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: 500 }}>Class</label>
              <select
                value={editingExam ? editingExam.className : newExam.className}
                onChange={(e) => editingExam 
                  ? setEditingExam({ ...editingExam, className: e.target.value })
                  : setNewExam({ ...newExam, className: e.target.value })
                }
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: 500 }}>Subject</label>
              <input
                type="text"
                value={editingExam ? editingExam.subject : newExam.subject}
                onChange={(e) => editingExam
                  ? setEditingExam({ ...editingExam, subject: e.target.value })
                  : setNewExam({ ...newExam, subject: e.target.value })
                }
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                placeholder="Enter subject"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: 500 }}>Exam Date</label>
              <input
                type="date"
                value={editingExam ? editingExam.date : newExam.date}
                onChange={(e) => editingExam
                  ? setEditingExam({ ...editingExam, date: e.target.value })
                  : setNewExam({ ...newExam, date: e.target.value })
                }
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: 500 }}>Exam Time</label>
              <input
                type="time"
                value={editingExam ? editingExam.time : newExam.time}
                onChange={(e) => editingExam
                  ? setEditingExam({ ...editingExam, time: e.target.value })
                  : setNewExam({ ...newExam, time: e.target.value })
                }
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: 500 }}>Duration</label>
              <input
                type="text"
                value={editingExam ? editingExam.duration : newExam.duration}
                onChange={(e) => editingExam
                  ? setEditingExam({ ...editingExam, duration: e.target.value })
                  : setNewExam({ ...newExam, duration: e.target.value })
                }
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                placeholder="e.g., 2 hours"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: 500 }}>Room/Venue</label>
              <input
                type="text"
                value={editingExam ? editingExam.room : newExam.room}
                onChange={(e) => editingExam
                  ? setEditingExam({ ...editingExam, room: e.target.value })
                  : setNewExam({ ...newExam, room: e.target.value })
                }
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                placeholder="Enter room number"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: 500 }}>Exam Type</label>
              <select
                value={editingExam ? editingExam.examType : newExam.examType}
                onChange={(e) => editingExam
                  ? setEditingExam({ ...editingExam, examType: e.target.value })
                  : setNewExam({ ...newExam, examType: e.target.value })
                }
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              >
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={editingExam ? updateExam : addExam}
              style={{
                padding: "10px 20px",
                background: "#6c63ff",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              {editingExam ? "Update Exam" : "Add Exam"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingExam(null);
              }}
              style={{
                padding: "10px 20px",
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
      )}

      {/* Timetable Display */}
      {sortedTimetables.length === 0 ? (
        <div style={{ textAlign: "center", padding: 50, background: "white", borderRadius: 12 }}>
          <p>No exams scheduled for {selectedClass} yet.</p>
          {canManage && <p>Click "Add Exam" to create a timetable.</p>}
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f7" }}>
                  <th style={{ padding: 12, textAlign: "left" }}>Date</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Subject</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Exam Type</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Time</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Duration</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Room</th>
                  {canManage && <th style={{ padding: 12, textAlign: "center" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sortedTimetables.map((exam) => {
                  const examDate = new Date(exam.date);
                  const isUpcoming = examDate > new Date();
                  const isToday = examDate.toDateString() === new Date().toDateString();
                  
                  return (
                    <tr key={exam.id} style={{ borderBottom: "1px solid #eee", background: isToday ? "#eaf3de" : "white" }}>
                      <td style={{ padding: 12 }}>
                        {exam.date}
                        {isToday && <span style={{ marginLeft: 8, fontSize: 11, color: "#3b6d11" }}>(Today)</span>}
                      </td>
                      <td style={{ padding: 12, fontWeight: 500 }}>{exam.subject}</td>
                      <td style={{ padding: 12, textAlign: "center" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: 20,
                          background: exam.examType === "Final Term" ? "#fcebeb" : "#eaf3de",
                          color: exam.examType === "Final Term" ? "#a32d2d" : "#3b6d11"
                        }}>
                          {exam.examType}
                        </span>
                      </td>
                      <td style={{ padding: 12, textAlign: "center" }}>{exam.time}</td>
                      <td style={{ padding: 12, textAlign: "center" }}>{exam.duration}</td>
                      <td style={{ padding: 12, textAlign: "center" }}>{exam.room || "TBA"}</td>
                      {canManage && (
                        <td style={{ padding: 12, textAlign: "center" }}>
                          <button
                            onClick={() => setEditingExam(exam)}
                            style={{
                              padding: "4px 12px",
                              marginRight: 8,
                              background: "#6c63ff",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer"
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteExam(exam.id)}
                            style={{
                              padding: "4px 12px",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer"
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}