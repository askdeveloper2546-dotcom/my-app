import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Signup({ onGoLogin }) {
  const { signup } = useAuth();

  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    password: "",
    role: "student", // ✅ DEFAULT STUDENT
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const res = signup(form);

    if (!res.success) {
      setError(res.error);
      setSuccess("");
      return;
    }

    setSuccess("Account created successfully! 🎉 Now login.");
    setError("");

    // optional reset form
    setForm({
      first: "",
      last: "",
      email: "",
      password: "",
      role: "student",
    });
  }

  return (
    <div className="auth-page">

      <div className="auth-left">
        <h1>🎓 EduManage</h1>
        <p>Create your account</p>

        <div className="auth-bullets">
          <p>✔ Manage Students</p>
          <p>✔ Track Attendance</p>
          <p>✔ Generate Reports</p>
        </div>
      </div>

      <div className="auth-right">

        <div className="auth-card-modern">

          <h2>Create Account ✨</h2>
          <p className="sub">Sign up to continue</p>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>First Name</label>
              <input
                name="first"
                value={form.first}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Last Name</label>
              <input
                name="last"
                value={form.last}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <button className="btn-modern">
              Create Account
            </button>

          </form>

          <p className="switch">
            Already have account?{" "}
            <span onClick={onGoLogin}>Login</span>
          </p>

        </div>

      </div>

    </div>
  );
}