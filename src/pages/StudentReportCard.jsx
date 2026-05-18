import { useState, useEffect } from "react";

export default function StudentReportCard({ user, students }) {
  const [myData, setMyData] = useState(null);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const student = students.find(s => s.email === user.email);
    setMyData(student);

    if (student) {
      // Load grades from localStorage
      const savedGrades = localStorage.getItem(`grades_${student.id}`);
      if (savedGrades) {
        setGrades(JSON.parse(savedGrades));
      } else {
        // Default grades if not set
        const defaultGrades = {
          "Mathematics": "Pending",
          "Physics": "Pending",
          "Computer Science": "Pending",
          "English": "Pending",
          "Urdu": "Pending"
        };
        setGrades(defaultGrades);
      }
    }
    setLoading(false);
  }, [user, students]);

  const gradeToGPA = {
    "A+": 4.0, "A": 4.0, "B+": 3.3, "B": 3.0,
    "C+": 2.3, "C": 2.0, "D": 1.0, "F": 0.0
  };

  const getGradeColor = (grade) => {
    if (grade === "A+" || grade === "A") return "#43a047";
    if (grade === "B+" || grade === "B") return "#6c63ff";
    if (grade === "C+" || grade === "C") return "#f97316";
    if (grade === "D") return "#ff9800";
    return "#ef4444";
  };

  const getGradeStatus = (grade) => {
    if (grade === "F") return "❌ Fail";
    if (grade === "Pending") return "⏳ Pending";
    return "✅ Pass";
  };

  // Calculate total GPA
  let totalGPA = 0;
  let gradedSubjects = 0;
  const subjects = Object.keys(grades);
  
  subjects.forEach(subject => {
    const grade = grades[subject];
    if (grade !== "Pending") {
      totalGPA += gradeToGPA[grade] || 0;
      gradedSubjects++;
    }
  });
  
  const cgpa = gradedSubjects > 0 ? (totalGPA / gradedSubjects).toFixed(2) : "0.00";
  const overallStatus = parseFloat(cgpa) >= 2.0 ? "PASS" : "FAIL";
  const overallStatusColor = parseFloat(cgpa) >= 2.0 ? "#43a047" : "#ef4444";

  // Print function
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!myData) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <h2>📭 Student data not found</h2>
      </div>
    );
  }

  return (
    <div className="report-card-container">
      {/* Print Button */}
      <div style={{ textAlign: "right", marginBottom: 20, printColorAdjust: "exact" }}>
        <button
          onClick={handlePrint}
          style={{
            padding: "10px 20px",
            background: "#6c63ff",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          🖨️ Print Report Card
        </button>
      </div>

      {/* Report Card */}
      <div className="report-card" style={{
        background: "white",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        printShadow: "none"
      }}>
        
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #6c63ff, #9333ea)",
          color: "white",
          padding: "30px",
          textAlign: "center"
        }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>📘 EduManage</h1>
          <p style={{ margin: "5px 0 0", opacity: 0.9 }}>Student Report Card</p>
        </div>

        {/* Student Info */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 20,
          padding: 25,
          background: "#f9f9f9",
          borderBottom: "1px solid #eee"
        }}>
          <div>
            <div style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>Student Name</div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>{myData.first} {myData.last}</div>
          </div>
          <div>
            <div style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>Student ID</div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>{myData.id}</div>
          </div>
          <div>
            <div style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>Class</div>
            <div style={{ fontSize: 16 }}>{myData.cls}</div>
          </div>
          <div>
            <div style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>Attendance</div>
            <div style={{ fontSize: 16, color: myData.att >= 75 ? "#43a047" : "#f97316" }}>{myData.att}%</div>
          </div>
        </div>

        {/* Grades Table */}
        <div style={{ padding: 25 }}>
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>📊 Academic Performance</h3>
          
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f7", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: 12, textAlign: "left" }}>Subject</th>
                <th style={{ padding: 12, textAlign: "center" }}>Grade</th>
                <th style={{ padding: 12, textAlign: "center" }}>GPA</th>
                <th style={{ padding: 12, textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, i) => {
                const grade = grades[subject];
                const gpa = grade !== "Pending" ? gradeToGPA[grade] || 0 : 0;
                const status = getGradeStatus(grade);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 12 }}>{subject}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        background: grade !== "Pending" ? "#eaf3de" : "#faeeda",
                        color: grade !== "Pending" ? "#3b6d11" : "#854f0b",
                        fontWeight: "bold"
                      }}>
                        {grade}
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: "bold", color: getGradeColor(grade) }}>
                      {gpa}
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* CGPA Section */}
          <div style={{
            marginTop: 30,
            padding: 20,
            background: "#f5f5f7",
            borderRadius: 12,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 14, color: "#666" }}>Cumulative GPA (CGPA)</div>
            <div style={{
              fontSize: 48,
              fontWeight: "bold",
              color: overallStatusColor,
              margin: "10px 0"
            }}>
              {cgpa}
            </div>
            <div style={{
              display: "inline-block",
              padding: "8px 24px",
              borderRadius: 30,
              background: overallStatus === "PASS" ? "#eaf3de" : "#fcebeb",
              color: overallStatusColor,
              fontWeight: "bold"
            }}>
              {overallStatus === "PASS" ? "✅ PASS" : "❌ FAIL"}
            </div>
          </div>

          {/* Remarks */}
          <div style={{ marginTop: 20, padding: 15, borderTop: "1px solid #eee" }}>
            <h4>📝 Remarks:</h4>
            <p style={{ color: "#666", lineHeight: 1.6 }}>
              {parseFloat(cgpa) >= 3.5 
                ? "Excellent performance! Keep up the great work!" 
                : parseFloat(cgpa) >= 3.0 
                ? "Good performance! Keep striving for excellence."
                : parseFloat(cgpa) >= 2.0 
                ? "Satisfactory performance. Need improvement in weak subjects."
                : "Needs significant improvement. Please focus on studies."}
            </p>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 20,
            paddingTop: 15,
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "#888"
          }}>
            <div>Generated on: {new Date().toLocaleDateString()}</div>
            <div>© EduManage System</div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .report-card-container, .report-card-container * {
              visibility: visible;
            }
            .report-card-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            button {
              display: none !important;
            }
            .report-card {
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </style>
    </div>
  );
}