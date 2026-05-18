import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onGoSignup }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ TOAST STATE
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: ""
  });

  function showToast(message, type) {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 2000);
  }

  function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    setTimeout(() => {
      const res = login(email, password);

      if (!res.success) {
        setError(res.error);
        showToast(res.error, "error");
      } else {
        showToast("Login Successful 🎉", "success");
      }

      setLoading(false);
    }, 1000);
  }

  return (
    <div className="auth-page">

      <div className="auth-left">
        <h1>📚 EduManage</h1>
        <p>Smart Student Management System</p>

        <div className="auth-bullets">
          <p>✔ Attendance Tracking</p>
          <p>✔ Student Management</p>
          <p>✔ Reports & Analytics</p>
        </div>
      </div>

      <div className="auth-right">

        <div className="auth-card-modern">

          <h2>Welcome Back 👋</h2>
          <p className="sub">Login to continue</p>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button className="btn-modern" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Sign In"}
            </button>

          </form>

          <p className="switch">
            Don't have account?{" "}
            <span onClick={onGoSignup}>Create one</span>
          </p>

        </div>

      </div>

      {/* ✅ TOAST UI */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

    </div>
  );
}