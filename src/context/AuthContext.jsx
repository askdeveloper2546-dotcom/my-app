import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const INITIAL_USERS = [
  {
    email: "admin@school.edu",
    password: "admin123",
    first: "Admin",
    last: "User",
    role: "admin",
  },
  {
    email: "teacher@school.edu",
    password: "teacher123",
    first: "Ali",
    last: "Khan",
    role: "teacher",
  },
  {
    email: "student@school.edu",
    password: "student123",
    first: "Ayesha",
    last: "Fatima",
    role: "student",
  },
];

// ✅ AVAILABLE COURSES (Dynamic)
const AVAILABLE_COURSES = [
  { id: "C001", name: "Mathematics", teacher: "Sir Ali", fee: 1500, credits: 4 },
  { id: "C002", name: "Physics", teacher: "Sir Ahmed", fee: 1200, credits: 3 },
  { id: "C003", name: "Computer Science", teacher: "Miss Sara", fee: 1800, credits: 4 },
  { id: "C004", name: "English", teacher: "Miss Fatima", fee: 1000, credits: 3 },
  { id: "C005", name: "Urdu", teacher: "Sir Hassan", fee: 800, credits: 2 },
  { id: "C006", name: "Chemistry", teacher: "Miss Zainab", fee: 1300, credits: 3 },
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  function generateId() {
    return `S-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  }

  function calculateGPA(grade) {
    const gradeMap = {
      "A+": 4.0, "A": 4.0, "A-": 3.7,
      "B+": 3.3, "B": 3.0, "B-": 2.7,
      "C+": 2.3, "C": 2.0, "C-": 1.7,
      "D+": 1.3, "D": 1.0, "F": 0.0
    };
    return gradeMap[grade] || 0;
  }

  function getRandomGrade() {
    const grades = ["A+", "A", "B+", "B", "C+", "C"];
    return grades[Math.floor(Math.random() * grades.length)];
  }

  function createStudentRecord(user, selectedCourses = null) {
    const coursesToEnroll = selectedCourses || AVAILABLE_COURSES.slice(0, 3);
    
    const courses = coursesToEnroll.map(course => ({
      id: course.id,
      subject: course.name,
      teacher: course.teacher,
      fee: course.fee,
      credits: course.credits,
      grade: getRandomGrade(),
      gpa: calculateGPA(getRandomGrade()),
      enrolled: true,
      dateEnrolled: new Date().toISOString().split('T')[0]
    }));

    const totalFees = courses.reduce((sum, c) => sum + c.fee, 0);
    const totalGPA = courses.reduce((sum, c) => sum + c.gpa, 0) / courses.length;
    const attendance = Math.floor(Math.random() * 30) + 65;

    return {
      id: generateId(),
      first: user.first,
      last: user.last,
      email: user.email,
      cls: "10-A",
      att: attendance,
      status: "active",
      fees: totalFees,
      feesPaid: 0,
      feesPending: totalFees,
      gpa: totalGPA.toFixed(2),
      courses: courses,
      allCourses: AVAILABLE_COURSES,
      createdAt: new Date().toISOString()
    };
  }

  function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    return { success: true };
  }

  function signup({ first, last, email, password, role, selectedCourses }) {
    if (users.find(u => u.email === email)) {
      return { success: false, error: "Email already registered" };
    }

    const newUser = { first, last, email, password, role: role || "student" };
    setUsers(prev => [...prev, newUser]);

    if (newUser.role === "student") {
      const savedStudents = JSON.parse(localStorage.getItem("students")) || [];
      const newStudent = createStudentRecord(newUser, selectedCourses);
      
      localStorage.setItem("students", JSON.stringify([...savedStudents, newStudent]));
    }

    return { success: true };
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, AVAILABLE_COURSES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}