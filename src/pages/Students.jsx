import { useState } from "react";

const AV_BG = ["#EEF0FE","#FCE4EC","#E1F5EE","#FAEEDA","#E6F1FB","#FCEBEB"];
const AV_FG = ["#534AB7","#880E4F","#0F6E56","#854F0B","#185FA5","#A32D2D"];

/* ---------------- ADD FORM ---------------- */
function AddForm({ onAdd, onClose }) {
  const [form, setForm] = useState({
    first: "",
    last: "",
    cls: "10-A",
    gender: "Female"
  });

  const set = (f) => (e) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  function handleAdd() {
    if (!form.first.trim() || !form.last.trim()) {
      alert("Enter student name");
      return;
    }
    onAdd(form);
    onClose();
  }

  return (
    <div className="form-overlay">
      <div className="form-card">
        <h2>➕ Add new student</h2>

        <div className="fr2">
          <div className="fg">
            <label>First name</label>
            <input value={form.first} onChange={set("first")} />
          </div>

          <div className="fg">
            <label>Last name</label>
            <input value={form.last} onChange={set("last")} />
          </div>
        </div>

        <div className="fr2">
          <div className="fg">
            <label>Class</label>
            <select value={form.cls} onChange={set("cls")}>
              {["10-A","10-B","11-A","11-B","12-A"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="fg">
            <label>Gender</label>
            <select value={form.gender} onChange={set("gender")}>
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleAdd}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- EDIT FORM ---------------- */
function EditForm({ student, onUpdate, onClose }) {
  const [form, setForm] = useState(student);

  const set = (f) => (e) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  function handleUpdate() {
    if (!form.first.trim() || !form.last.trim()) {
      alert("Enter student name");
      return;
    }
    onUpdate(form);
    onClose();
  }

  return (
    <div className="form-overlay">
      <div className="form-card">
        <h2>✏️ Edit student</h2>

        <div className="fr2">
          <div className="fg">
            <label>First name</label>
            <input value={form.first} onChange={set("first")} />
          </div>

          <div className="fg">
            <label>Last name</label>
            <input value={form.last} onChange={set("last")} />
          </div>
        </div>

        <div className="fr2">
          <div className="fg">
            <label>Class</label>
            <select value={form.cls} onChange={set("cls")}>
              {["10-A","10-B","11-A","11-B","12-A"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="fg">
            <label>Gender</label>
            <select value={form.gender} onChange={set("gender")}>
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleUpdate}>Update</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function Students({ students, setStudents }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  /* SEARCH */
  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.first.toLowerCase().includes(q) ||
      s.last.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.cls.toLowerCase().includes(q)
    );
  });

  /* ADD */
  function addStudent(form) {
    setStudents((prev) => [
      ...prev,
      {
        id: "S-" + String(prev.length + 1).padStart(3, "0"),
        first: form.first.trim(),
        last: form.last.trim(),
        cls: form.cls,
        gender: form.gender,
        att: Math.floor(Math.random() * 20) + 75,
        status: "active",
      },
    ]);
  }

  /* UPDATE */
  function updateStudent(updated) {
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  }

  /* DELETE */
  function deleteStudent(id) {
    if (window.confirm("Delete this student?")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="table-card" style={{ position: "relative" }}>
      <div className="table-header">
        <h3>All students ({students.length})</h3>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add student
        </button>
      </div>

      <div className="search-bar">
        <span>🔍</span>
        <input
          placeholder="Search by name, ID or class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Roll no</th>
            <th>Class</th>
            <th>Attendance</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((s, idx) => {
            const i = idx % AV_BG.length;

            return (
              <tr key={s.id}>
                <td>
                  <div className="student-info">
                    <div
                      className="student-avatar"
                      style={{
                        background: AV_BG[i],
                        color: AV_FG[i],
                      }}
                    >
                      {s.first[0]}{s.last[0]}
                    </div>
                    <span>{s.first} {s.last}</span>
                  </div>
                </td>

                <td>{s.id}</td>
                <td>{s.cls}</td>

                <td>
                  <div style={{ width: 60, height: 5, background: "#eee" }}>
                    <div
                      style={{
                        width: `${s.att}%`,
                        height: 5,
                        background:
                          s.att >= 80 ? "#43a047" : s.att >= 65 ? "#EF9F27" : "#E24B4A",
                      }}
                    />
                  </div>
                </td>

                <td>
                  <span className={`status-pill ${s.status}`}>
                    {s.status}
                  </span>
                </td>

                <td>
                  <button
                    className="action-btn"
                    onClick={() => setEditStudent(s)}
                  >
                    ✏️
                  </button>

                  <button
                    className="action-btn"
                    onClick={() => deleteStudent(s.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}

          {filtered.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                <div style={{ textAlign: "center", padding: 30, color: "#888" }}>
  <h3>📭 No Students Found</h3>
  <p>Add a new student to get started</p>
</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ADD FORM */}
      {showForm && (
        <AddForm
          onAdd={addStudent}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* EDIT FORM */}
      {editStudent && (
        <EditForm
          student={editStudent}
          onUpdate={updateStudent}
          onClose={() => setEditStudent(null)}
        />
      )}
    </div>
  );
}