import { useState } from "react";

export default function StudentDashboard({ user, students, onUpdate }) {
  const [myData, setMyData] = useState(() => {
    const student = students.find(s => s.email === user.email);
    if (student) {
      // Load saved courses if any
      const savedCourses = localStorage.getItem(`courses_${student.id}`);
      if (savedCourses) {
        student.courses = JSON.parse(savedCourses);
        student.gpa = (student.courses.reduce((sum, c) => sum + (c.gpa || 0), 0) / student.courses.length).toFixed(2);
        student.feesPending = student.courses.reduce((sum, c) => sum + (c.fee || 0), 0) - (student.feesPaid || 0);
      }
    }
    return student;
  });

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState("courses");

  // Available courses for enrollment
  const availableCourses = [
    { id: "C001", name: "Mathematics", teacher: "Sir Ali", fee: 1500, credits: 4 },
    { id: "C002", name: "Physics", teacher: "Sir Ahmed", fee: 1200, credits: 3 },
    { id: "C003", name: "Computer Science", teacher: "Miss Sara", fee: 1800, credits: 4 },
    { id: "C004", name: "English", teacher: "Miss Fatima", fee: 1000, credits: 3 },
    { id: "C005", name: "Urdu", teacher: "Sir Hassan", fee: 800, credits: 2 },
    { id: "C006", name: "Chemistry", teacher: "Miss Zainab", fee: 1300, credits: 3 },
  ];

  if (!myData) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 50 }}>
        <h2>📭 Student data not found</h2>
        <p>Please contact administrator</p>
      </div>
    );
  }

  // Add course
  const addCourse = (course) => {
    if (myData.courses?.some(c => c.id === course.id)) {
      alert("❌ Course already enrolled!");
      return;
    }

    const newCourse = {
      id: course.id,
      subject: course.name,
      teacher: course.teacher,
      fee: course.fee,
      credits: course.credits,
      grade: "Pending",
      gpa: 0,
      enrolled: true,
      dateEnrolled: new Date().toISOString().split('T')[0]
    };

    const updatedCourses = [...(myData.courses || []), newCourse];
    const totalGPA = updatedCourses.reduce((sum, c) => sum + c.gpa, 0) / updatedCourses.length;
    const totalFees = updatedCourses.reduce((sum, c) => sum + c.fee, 0);
    
    const updatedStudent = {
      ...myData,
      courses: updatedCourses,
      gpa: totalGPA.toFixed(2),
      fees: totalFees,
      feesPending: totalFees - (myData.feesPaid || 0)
    };

    setMyData(updatedStudent);
    localStorage.setItem(`courses_${myData.id}`, JSON.stringify(updatedCourses));
    
    const allStudents = JSON.parse(localStorage.getItem("students"));
    const updatedStudents = allStudents.map(s => s.id === myData.id ? updatedStudent : s);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    
    if (onUpdate) onUpdate(updatedStudent);
    setShowCourseModal(false);
    alert("✅ Course added successfully!");
  };

  // Drop course
  const dropCourse = (courseId) => {
    if (!window.confirm("Are you sure you want to drop this course?")) return;
    
    const updatedCourses = (myData.courses || []).filter(c => c.id !== courseId);
    const totalGPA = updatedCourses.length > 0 
      ? (updatedCourses.reduce((sum, c) => sum + c.gpa, 0) / updatedCourses.length).toFixed(2)
      : 0;
    const totalFees = updatedCourses.reduce((sum, c) => sum + c.fee, 0);
    
    const updatedStudent = {
      ...myData,
      courses: updatedCourses,
      gpa: totalGPA,
      fees: totalFees,
      feesPending: totalFees - (myData.feesPaid || 0)
    };

    setMyData(updatedStudent);
    localStorage.setItem(`courses_${myData.id}`, JSON.stringify(updatedCourses));
    
    const allStudents = JSON.parse(localStorage.getItem("students"));
    const updatedStudents = allStudents.map(s => s.id === myData.id ? updatedStudent : s);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    
    alert("✅ Course dropped successfully!");
  };

  // Pay fees
  const payFees = (amount) => {
    if (amount > myData.feesPending) {
      alert("Amount exceeds pending fees!");
      return;
    }
    
    const updatedStudent = {
      ...myData,
      feesPaid: (myData.feesPaid || 0) + amount,
      feesPending: myData.feesPending - amount
    };
    
    setMyData(updatedStudent);
    const allStudents = JSON.parse(localStorage.getItem("students"));
    const updatedStudents = allStudents.map(s => s.id === myData.id ? updatedStudent : s);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    
    alert(`✅ PKR ${amount} paid successfully!`);
  };

  const totalCredits = (myData.courses || []).reduce((sum, c) => sum + (c.credits || 0), 0);
  const averageGPA = myData.gpa || 0;

  return (
    <div>
      {/* Stats Cards */}
      <div className="stat-grid">
        <div className="card modern-card">
          <div className="card-label">👤 Student Name</div>
          <div className="card-value">{myData.first} {myData.last}</div>
        </div>
        <div className="card modern-card">
          <div className="card-label">📚 Enrolled Courses</div>
          <div className="card-value">{(myData.courses || []).length}</div>
          <small>{totalCredits} Credits</small>
        </div>
        <div className="card modern-card">
          <div className="card-label">🎯 Overall GPA</div>
          <div className="card-value" style={{ color: averageGPA >= 3.0 ? "#43a047" : "#f97316" }}>
            {averageGPA > 0 ? averageGPA : "N/A"}
          </div>
        </div>
        <div className="card modern-card">
          <div className="card-label">💰 Pending Fees</div>
          <div className="card-value">PKR {myData.feesPending || myData.fees || 0}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button 
          className={`btn-primary`}
          onClick={() => setSelectedTab("courses")}
          style={{ 
            background: selectedTab === "courses" ? "#6c63ff" : "#ccc",
            padding: "10px 20px",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "white"
          }}
        >
          📚 My Courses
        </button>
        <button 
          className={`btn-primary`}
          onClick={() => setSelectedTab("fees")}
          style={{ 
            background: selectedTab === "fees" ? "#6c63ff" : "#ccc",
            padding: "10px 20px",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "white"
          }}
        >
          💰 Fees Details
        </button>
        <button 
          className={`btn-primary`}
          onClick={() => setSelectedTab("attendance")}
          style={{ 
            background: selectedTab === "attendance" ? "#6c63ff" : "#ccc",
            padding: "10px 20px",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "white"
          }}
        >
          📅 Attendance
        </button>
      </div>

      {/* Courses Tab */}
      {selectedTab === "courses" && (
        <>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <h3>📚 My Enrolled Courses</h3>
              <button className="btn-primary" onClick={() => setShowCourseModal(true)}>
                + Add Course
              </button>
            </div>
            
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f7" }}>
                  <th style={{ padding: 12, textAlign: "left" }}>Subject</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Teacher</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Credits</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Grade</th>
                  <th style={{ padding: 12, textAlign: "center" }}>GPA</th>
                  <th style={{ padding: 12, textAlign: "right" }}>Fee (PKR)</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {(myData.courses || []).map((course, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 12 }}>{course.subject}</td>
                    <td style={{ padding: 12 }}>{course.teacher}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>{course.credits}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        background: course.grade === "Pending" ? "#faeeda" : "#eaf3de",
                        color: course.grade === "Pending" ? "#854f0b" : "#3b6d11"
                      }}>
                        {course.grade}
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>{course.gpa}</td>
                    <td style={{ padding: 12, textAlign: "right" }}>PKR {course.fee}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <button 
                        onClick={() => dropCourse(course.id)}
                        style={{
                          padding: "4px 12px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer"
                        }}
                      >
                        Drop
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(myData.courses || []).length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
                <h3>📭 No Courses Enrolled</h3>
                <p>Click "Add Course" to enroll in subjects</p>
              </div>
            )}
          </div>

          {/* Result Card */}
          <div className="card" style={{ marginTop: 20 }}>
            <h3>📊 Academic Result</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, textAlign: "center", marginTop: 15 }}>
              <div>
                <h3>{(myData.courses || []).length}</h3>
                <p>Total Courses</p>
              </div>
              <div>
                <h3 style={{ color: averageGPA >= 3.0 ? "#43a047" : "#f97316" }}>{averageGPA || "N/A"}</h3>
                <p>CGPA</p>
              </div>
              <div>
                <h3 style={{ color: averageGPA >= 2.0 ? "#43a047" : "#ef4444" }}>
                  {averageGPA >= 2.0 ? "✅ PASS" : "❌ FAIL"}
                </h3>
                <p>Status</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fees Tab */}
      {selectedTab === "fees" && (
        <div className="card">
          <h3>💰 Fee Details</h3>
          <div style={{ textAlign: "center", padding: 20 }}>
            <h2 style={{ fontSize: 48, color: "#6c63ff" }}>PKR {myData.feesPending || myData.fees || 0}</h2>
            <p>Pending Fees</p>
            <hr style={{ margin: "20px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <h3>PKR {myData.fees || 0}</h3>
                <p>Total Fees</p>
              </div>
              <div>
                <h3 style={{ color: "#43a047" }}>PKR {myData.feesPaid || 0}</h3>
                <p>Paid Fees</p>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <input 
                type="number" 
                placeholder="Enter amount to pay"
                id="feeAmount"
                style={{ padding: 10, marginRight: 10, borderRadius: 8, border: "1px solid #ddd", width: 150 }}
              />
              <button 
                className="btn-primary"
                onClick={() => {
                  const amount = parseInt(document.getElementById("feeAmount").value);
                  if (amount > 0) payFees(amount);
                }}
                style={{ padding: "10px 20px", background: "#6c63ff", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {selectedTab === "attendance" && (
        <div className="card">
          <h3>📅 My Attendance</h3>
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ 
              width: 200, 
              height: 200, 
              borderRadius: "50%", 
              margin: "auto",
              background: `conic-gradient(#6c63ff 0deg ${myData.att * 3.6}deg, #eee ${myData.att * 3.6}deg 360deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{ background: "white", width: 140, height: 140, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <h1 style={{ fontSize: 36, margin: 0 }}>{myData.att}%</h1>
                <p style={{ margin: 0 }}>Attendance</p>
              </div>
            </div>
            <p style={{ marginTop: 20 }}>
              {myData.att >= 75 ? "✅ Good standing" : myData.att >= 65 ? "⚠️ Needs improvement" : "❌ Low attendance warning"}
            </p>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showCourseModal && (
        <div className="form-overlay">
          <div className="form-card" style={{ width: 500 }}>
            <h2>➕ Add New Course</h2>
            <p>Select a course to enroll:</p>
            
            {availableCourses.filter(c => !(myData.courses || []).some(enrolled => enrolled.id === c.id)).map(course => (
              <div key={course.id} style={{ 
                padding: 12, 
                border: "1px solid #ddd", 
                borderRadius: 8, 
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <strong>{course.name}</strong>
                  <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                    Teacher: {course.teacher} | Credits: {course.credits} | Fee: PKR {course.fee}
                  </p>
                </div>
                <button className="btn-primary" onClick={() => addCourse(course)} style={{ padding: "6px 16px", background: "#6c63ff", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
                  Enroll
                </button>
              </div>
            ))}
            
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button className="btn-cancel" onClick={() => setShowCourseModal(false)} style={{ padding: "8px 16px", background: "#ccc", border: "none", borderRadius: 6, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}