import { useState, useEffect } from "react";

export default function AdminDashboard({ students }) {
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    averageAttendance: 0,
    totalFeesCollected: 0,
    totalFeesPending: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Load teachers from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const teacherList = users.filter(u => u.role === "teacher");
    setTeachers(teacherList);

    // Calculate statistics
    const totalStudents = students.length;
    const totalTeachers = teacherList.length;
    const totalClasses = [...new Set(students.map(s => s.cls))].length;
    const averageAttendance = students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + (s.att || 0), 0) / students.length)
      : 0;
    
    // Calculate fees
    const totalFees = students.reduce((sum, s) => sum + (s.fees || 0), 0);
    const totalPaid = students.reduce((sum, s) => sum + (s.feesPaid || 0), 0);
    const totalPending = totalFees - totalPaid;

    setStats({
      totalStudents,
      totalTeachers,
      totalClasses,
      averageAttendance,
      totalFeesCollected: totalPaid,
      totalFeesPending: totalPending
    });

    // Load recent activities
    const activities = [];
    const today = new Date().toISOString().split('T')[0];
    
    // Check attendance for today
    const classes = [...new Set(students.map(s => s.cls))];
    for (const cls of classes) {
      const attendance = localStorage.getItem(`attendance_${cls}_${today}`);
      if (attendance) {
        const attData = JSON.parse(attendance);
        const present = Object.values(attData).filter(v => v === "present").length;
        activities.push({
          type: "attendance",
          message: `Attendance marked for ${cls}`,
          time: "Today",
          details: `${present}/${Object.keys(attData).length} students present`
        });
      }
    }

    // Check recent grade updates
    const recentGrades = [];
    for (const student of students) {
      const gradeReport = localStorage.getItem(`gradeReport_${student.id}`);
      if (gradeReport) {
        const report = JSON.parse(gradeReport);
        const updateDate = new Date(report.updatedAt);
        const daysDiff = Math.floor((new Date() - updateDate) / (1000 * 60 * 60 * 24));
        if (daysDiff < 7) {
          recentGrades.push({
            type: "grades",
            message: `Grades updated for ${student.first} ${student.last}`,
            time: `${daysDiff} days ago`,
            details: `GPA: ${report.gpa}`
          });
        }
      }
    }
    
    setRecentActivities([...activities, ...recentGrades].slice(0, 10));
  }, [students]);

  // Class-wise performance
  const classPerformance = () => {
    const classes = [...new Set(students.map(s => s.cls))];
    return classes.map(cls => {
      const classStudents = students.filter(s => s.cls === cls);
      const avgAttendance = classStudents.length > 0
        ? Math.round(classStudents.reduce((sum, s) => sum + (s.att || 0), 0) / classStudents.length)
        : 0;
      const avgGPA = classStudents.length > 0
        ? (classStudents.reduce((sum, s) => sum + parseFloat(s.gpa || 0), 0) / classStudents.length).toFixed(2)
        : 0;
      return { cls, total: classStudents.length, avgAttendance, avgGPA };
    });
  };

  return (
    <div>
      <h2>👑 Admin Dashboard</h2>
      <p style={{ marginBottom: 20, color: "#666" }}>Complete control and overview of the system</p>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15, marginBottom: 20 }}>
        <div style={{ background: "white", padding: 20, borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>👥</div>
          <div style={{ fontSize: 28, fontWeight: "bold" }}>{stats.totalStudents}</div>
          <div style={{ color: "#666" }}>Total Students</div>
        </div>
        <div style={{ background: "white", padding: 20, borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>👨‍🏫</div>
          <div style={{ fontSize: 28, fontWeight: "bold" }}>{stats.totalTeachers}</div>
          <div style={{ color: "#666" }}>Total Teachers</div>
        </div>
        <div style={{ background: "white", padding: 20, borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>📚</div>
          <div style={{ fontSize: 28, fontWeight: "bold" }}>{stats.totalClasses}</div>
          <div style={{ color: "#666" }}>Total Classes</div>
        </div>
        <div style={{ background: "white", padding: 20, borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 28, fontWeight: "bold" }}>{stats.averageAttendance}%</div>
          <div style={{ color: "#666" }}>Avg Attendance</div>
        </div>
      </div>

      {/* Fee Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 15, marginBottom: 20 }}>
        <div style={{ background: "linear-gradient(135deg, #43a047, #66bb6a)", padding: 20, borderRadius: 12, color: "white" }}>
          <div>💰 Total Fees Collected</div>
          <div style={{ fontSize: 32, fontWeight: "bold" }}>PKR {stats.totalFeesCollected.toLocaleString()}</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #ef4444, #f97316)", padding: 20, borderRadius: 12, color: "white" }}>
          <div>⏳ Total Pending Fees</div>
          <div style={{ fontSize: 32, fontWeight: "bold" }}>PKR {stats.totalFeesPending.toLocaleString()}</div>
        </div>
      </div>

      {/* Class Performance Table */}
      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "#f5f5f7", padding: 15, borderBottom: "1px solid #ddd" }}>
          <h3 style={{ margin: 0 }}>📊 Class-wise Performance</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9" }}>
                <th style={{ padding: 12, textAlign: "left" }}>Class</th>
                <th style={{ padding: 12, textAlign: "center" }}>Students</th>
                <th style={{ padding: 12, textAlign: "center" }}>Avg Attendance</th>
                <th style={{ padding: 12, textAlign: "center" }}>Avg GPA</th>
                <th style={{ padding: 12, textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {classPerformance().map((cls, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 12 }}><strong>{cls.cls}</strong></td>
                  <td style={{ padding: 12, textAlign: "center" }}>{cls.total}</td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <span style={{ color: cls.avgAttendance >= 75 ? "green" : cls.avgAttendance >= 60 ? "orange" : "red" }}>
                      {cls.avgAttendance}%
                    </span>
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <span style={{ color: cls.avgGPA >= 3.0 ? "green" : cls.avgGPA >= 2.0 ? "orange" : "red" }}>
                      {cls.avgGPA}
                    </span>
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: cls.avgAttendance >= 75 ? "#eaf3de" : cls.avgAttendance >= 60 ? "#faeeda" : "#fcebeb",
                      color: cls.avgAttendance >= 75 ? "#3b6d11" : cls.avgAttendance >= 60 ? "#854f0b" : "#a32d2d"
                    }}>
                      {cls.avgAttendance >= 75 ? "Good" : cls.avgAttendance >= 60 ? "Average" : "Needs Improvement"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teachers List */}
      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "#f5f5f7", padding: 15, borderBottom: "1px solid #ddd" }}>
          <h3 style={{ margin: 0 }}>👨‍🏫 Teachers List</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9" }}>
                <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                <th style={{ padding: 12, textAlign: "left" }}>Email</th>
                <th style={{ padding: 12, textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 12 }}>{teacher.first} {teacher.last}</td>
                  <td style={{ padding: 12 }}>{teacher.email}</td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <span style={{ padding: "4px 12px", borderRadius: 20, background: "#eaf3de", color: "#3b6d11" }}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: 40, color: "#888" }}>
                    No teachers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activities */}
      <div style={{ background: "white", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "#f5f5f7", padding: 15, borderBottom: "1px solid #ddd" }}>
          <h3 style={{ margin: 0 }}>🕒 Recent Activities</h3>
        </div>
        <div>
          {recentActivities.map((activity, i) => (
            <div key={i} style={{ 
              padding: "12px 20px", 
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{activity.message}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{activity.details}</div>
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>{activity.time}</div>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
              No recent activities
            </div>
          )}
        </div>
      </div>
    </div>
  );
}