import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";
import TeacherAttendance from "./pages/TeacherAttendance";
import StudentAttendance from "./pages/StudentAttendance";
import TeacherGrades from "./pages/TeacherGrades";
import AdminDashboard from "./pages/AdminDashboard";
import StudentReportCard from "./pages/StudentReportCard";
import NoticeBoard from "./pages/NoticeBoard";
import ExamTimetable from "./pages/ExamTimetable";
import FeeManagement from "./pages/FeeManagement";  // ✅ ADDED

const INITIAL_STUDENTS = [
  { id: "S-001", first: "Ayesha", last: "Fatima", cls: "10-A", att: 92, status: "active" },
  { id: "S-002", first: "Bilal", last: "Ahmed", cls: "10-A", att: 78, status: "active" },
  { id: "S-003", first: "Sara", last: "Khan", cls: "10-B", att: 95, status: "active" },
  { id: "S-004", first: "Usman", last: "Ali", cls: "11-A", att: 61, status: "inactive" },
  { id: "S-005", first: "Noor", last: "Hassan", cls: "10-A", att: 88, status: "active" },
  { id: "S-006", first: "Hamza", last: "Malik", cls: "11-B", att: 74, status: "active" },
  { id: "S-007", first: "Zainab", last: "Raza", cls: "12-A", att: 97, status: "active" },
  { id: "S-008", first: "Tariq", last: "Mehmood", cls: "10-B", att: 55, status: "inactive" },
];

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "students", label: "Students", icon: "👥" },
  { id: "attendance", label: "Attendance", icon: "📅" },
  { id: "grades", label: "Grades & Results", icon: "📊" },
  { id: "report", label: "Report Card", icon: "📜" },
  { id: "notice", label: "Notice Board", icon: "📢" },
  { id: "exam", label: "Exam Timetable", icon: "📅" },
  { id: "fees", label: "Fee Management", icon: "💰" },  // ✅ ADDED
];

export default function App() {

  const { currentUser, logout } = useAuth();

  const [authView, setAuthView] = useState("login");
  const [activePage, setActivePage] = useState("dashboard");

  const [darkMode, setDarkMode] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem("students");
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  if (!currentUser) {
    return authView === "login"
      ? <Login onGoSignup={() => setAuthView("signup")} />
      : <Signup onGoLogin={() => setAuthView("login")} />;
  }

  const userInitials =
    (currentUser.first[0] + (currentUser.last?.[0] || "")).toUpperCase();

  const pageTitle =
    NAV.find((n) => n.id === activePage)?.label || "Dashboard";

  // ✅ RENDER FUNCTION WITH ALL COMPONENTS
  const renderPage = () => {

    const role = currentUser.role;

    // TEACHER - with TeacherAttendance, TeacherGrades, NoticeBoard, ExamTimetable and FeeManagement
    if (role === "teacher") {
      switch (activePage) {
        case "dashboard":
          return <Dashboard students={students} />;
        case "attendance":
          return <TeacherAttendance students={students} />;
        case "grades":
          return <TeacherGrades students={students} />;
        case "notice":
          return <NoticeBoard />;
        case "exam":
          return <ExamTimetable />;
        case "fees":
          return <FeeManagement />;  // ✅ ADDED
        default:
          return <Dashboard students={students} />;
      }
    }

    // STUDENT - with StudentAttendance, StudentReportCard, NoticeBoard, ExamTimetable and FeeManagement
    if (role === "student") {
      switch (activePage) {
        case "dashboard":
          return <StudentDashboard 
            user={currentUser} 
            students={students} 
            onUpdate={(updated) => {
              setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
            }}
          />;
        case "attendance":
          return <StudentAttendance user={currentUser} students={students} />;
        case "grades":
          return <Grades students={students} />;
        case "report":
          return <StudentReportCard user={currentUser} students={students} />;
        case "notice":
          return <NoticeBoard />;
        case "exam":
          return <ExamTimetable />;
        case "fees":
          return <FeeManagement />;  // ✅ ADDED
        default:
          return <StudentDashboard 
            user={currentUser} 
            students={students}
            onUpdate={(updated) => {
              setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
            }}
          />;
      }
    }

    // ADMIN - with AdminDashboard, NoticeBoard, ExamTimetable and FeeManagement
    if (role === "admin") {
      switch (activePage) {
        case "dashboard":
          return <AdminDashboard students={students} />;
        case "students":
          return <Students students={students} setStudents={setStudents} />;
        case "attendance":
          return <TeacherAttendance students={students} />;
        case "grades":
          return <TeacherGrades students={students} />;
        case "notice":
          return <NoticeBoard />;
        case "exam":
          return <ExamTimetable />;
        case "fees":
          return <FeeManagement />;  // ✅ ADDED
        default:
          return <AdminDashboard students={students} />;
      }
    }

    // DEFAULT (fallback)
    return <Dashboard students={students} />;
  };

  return (
    <div className={`app-wrap ${darkMode ? "dark" : ""}`}>

      {/* SIDEBAR */}
      <div className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <h2>EduManage</h2>
          <p>Student Portal</p>
        </div>

        <div className="nav-items">
          {NAV
            .filter((item) => {
              if (currentUser.role === "teacher") {
                return item.id !== "students";
              }
              if (currentUser.role === "student") {
                return item.id !== "students";
              }
              return true;
            })
            .map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => setActivePage(item.id)}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-row">
            <div className="user-avatar">{userInitials}</div>
            <span className="user-name">
              {currentUser.first} {currentUser.last}
            </span>

            <button className="logout-btn" onClick={logout}>
              🚪
            </button>
          </div>
        </div>

      </div>

      {/* MAIN */}
      <div className="main">

        {/* TOPBAR */}
        <div className="topbar">

          <div>
            <h1>{pageTitle}</h1>
            <p className="topbar-sub">
              Welcome back, {currentUser.first}
            </p>
          </div>

          <div className="topbar-right">

            <div className="top-search">
              <input type="text" placeholder="Search..." />
            </div>

            <button
              className="theme-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <div className="notify-wrap">
              🔔
              <span className="notify-badge">3</span>
            </div>

            <div className="profile-wrap">

              <div
                className="user-avatar"
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ cursor: "pointer" }}
              >
                {userInitials}
              </div>

              {profileOpen && (
                <div className="profile-dropdown">
                  <p><b>{currentUser.first} {currentUser.last}</b></p>
                  <p style={{ fontSize: 12 }}>{currentUser.email}</p>

                  <button onClick={logout} className="logout-mini">
                    Logout
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* CONTENT */}
        <div className="content">
          {renderPage()}
        </div>

      </div>

    </div>
  );
}