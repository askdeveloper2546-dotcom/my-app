import { useState, useEffect } from "react";

export default function TeacherGrades({ students }) {
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState({});
  const [message, setMessage] = useState("");

  // Subjects array - fixed
  const subjects = ["Mathematics", "Physics", "Computer Science", "English", "Urdu"];

  // Get unique classes
  const classes = students && students.length > 0 
    ? [...new Set(students.map(s => s.cls))] 
    : ["10-A"];

  // Filter students by class
  const classStudents = students && students.length > 0
    ? students.filter(s => s.cls === selectedClass)
    : [];

  // Grade options
  const gradeOptions = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];
  
  const gradeToGPA = {
    "A+": 4.0, "A": 4.0, "B+": 3.3, "B": 3.0,
    "C+": 2.3, "C": 2.0, "D": 1.0, "F": 0.0
  };

  // Load student's grades
  useEffect(() => {
    if (selectedStudent && selectedStudent.id) {
      const savedGrades = localStorage.getItem(`grades_${selectedStudent.id}`);
      if (savedGrades) {
        setGrades(JSON.parse(savedGrades));
      } else {
        const defaultGrades = {};
        subjects.forEach(sub => {
          defaultGrades[sub] = "Pending";
        });
        setGrades(defaultGrades);
      }
    }
  }, [selectedStudent]);

  // Update grade for a subject
  const updateGrade = (subject, grade) => {
    setGrades(prev => ({
      ...prev,
      [subject]: grade
    }));
  };

  // Save all grades for student
  const saveGrades = () => {
    if (!selectedStudent) return;

    // Calculate GPA
    let totalGPA = 0;
    let gradedSubjects = 0;
    
    subjects.forEach(subject => {
      const grade = grades[subject];
      if (grade && grade !== "Pending") {
        totalGPA += gradeToGPA[grade] || 0;
        gradedSubjects++;
      }
    });
    
    const finalGPA = gradedSubjects > 0 ? (totalGPA / gradedSubjects).toFixed(2) : "0.00";

    // Save grades
    const gradeData = {
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.first} ${selectedStudent.last}`,
      class: selectedClass,
      grades: grades,
      gpa: finalGPA,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`grades_${selectedStudent.id}`, JSON.stringify(grades));
    localStorage.setItem(`gradeReport_${selectedStudent.id}`, JSON.stringify(gradeData));

    // Update student's GPA in main students array
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    const updatedStudents = allStudents.map(s => 
      s.id === selectedStudent.id ? { ...s, gpa: parseFloat(finalGPA) } : s
    );
    localStorage.setItem("students", JSON.stringify(updatedStudents));

    setMessage("✅ Grades saved successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  // Get grade color
  const getGradeColor = (grade) => {
    if (grade === "A+" || grade === "A") return "#43a047";
    if (grade === "B+" || grade === "B") return "#6c63ff";
    if (grade === "C+" || grade === "C") return "#f97316";
    return "#ef4444";
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Teacher Grade Management</h2>

      {/* Class Selector */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Select Class</label>
        <select 
          value={selectedClass} 
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedStudent(null);
            setGrades({});
          }}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        >
          {classes.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* Student Selector */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Select Student</label>
        <select 
          value={selectedStudent?.id || ""} 
          onChange={(e) => {
            const student = classStudents.find(s => s.id === e.target.value);
            setSelectedStudent(student || null);
            setGrades({});
          }}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        >
          <option value="">-- Select Student --</option>
          {classStudents.map(student => (
            <option key={student.id} value={student.id}>
              {student.first} {student.last} ({student.id})
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      {message && (
        <div style={{ 
          padding: 10, 
          background: "#eaf3de", 
          color: "#3b6d11", 
          borderRadius: 8, 
          marginBottom: 20,
          textAlign: "center"
        }}>
          {message}
        </div>
      )}

      {/* Grade Entry Form */}
      {selectedStudent && (
        <>
          <div style={{ background: "white", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ background: "#f5f5f7", padding: 15, borderBottom: "1px solid #ddd" }}>
              <h3 style={{ margin: 0 }}>
                📝 Enter Grades for {selectedStudent.first} {selectedStudent.last}
              </h3>
              <p style={{ margin: "5px 0 0", fontSize: 12, color: "#666" }}>ID: {selectedStudent.id} | Class: {selectedClass}</p>
            </div>
            
            <div style={{ padding: 20 }}>
              {subjects.map(subject => (
                <div key={subject} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  marginBottom: 15,
                  padding: 10,
                  background: "#f9f9f9",
                  borderRadius: 8,
                  flexWrap: "wrap"
                }}>
                  <div style={{ fontWeight: "bold", width: 150 }}>{subject}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {gradeOptions.map(grade => (
                      <button
                        key={grade}
                        onClick={() => updateGrade(subject, grade)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "none",
                          cursor: "pointer",
                          background: grades[subject] === grade ? getGradeColor(grade) : "#e5e7eb",
                          color: grades[subject] === grade ? "white" : "#333",
                          fontWeight: "bold"
                        }}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Grades Summary */}
          <div style={{ background: "white", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ background: "#f5f5f7", padding: 15, borderBottom: "1px solid #ddd" }}>
              <h3 style={{ margin: 0 }}>📊 Current Grades Summary</h3>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    <th style={{ padding: 12, textAlign: "left" }}>Subject</th>
                    <th style={{ padding: 12, textAlign: "center" }}>Grade</th>
                    <th style={{ padding: 12, textAlign: "center" }}>GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(subject => {
                    const grade = grades[subject] || "Pending";
                    const gpa = grade !== "Pending" ? (gradeToGPA[grade] || 0) : 0;
                    return (
                      <tr key={subject} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: 12 }}>{subject}</td>
                        <td style={{ padding: 12, textAlign: "center" }}>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: 20,
                            background: grade !== "Pending" ? "#eaf3de" : "#faeeda",
                            color: grade !== "Pending" ? "#3b6d11" : "#854f0b"
                          }}>
                            {grade}
                          </span>
                         </td>
                        <td style={{ padding: 12, textAlign: "center" }}>{gpa}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={saveGrades}
              style={{
                padding: "12px 24px",
                background: "#6c63ff",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              💾 Save All Grades
            </button>
          </div>
        </>
      )}

      {!selectedStudent && classStudents.length > 0 && (
        <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 12 }}>
          <p>Please select a student to enter grades.</p>
        </div>
      )}

      {classStudents.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 12 }}>
          <p>No students found in {selectedClass}</p>
        </div>
      )}
    </div>
  );
}