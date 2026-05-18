import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function NoticeBoard() {
  const { currentUser } = useAuth();
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", priority: "normal" });
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  // Load notices from localStorage
  useEffect(() => {
    const savedNotices = localStorage.getItem("notices");
    if (savedNotices) {
      setNotices(JSON.parse(savedNotices));
    } else {
      // Default notices
      const defaultNotices = [
        {
          id: "N001",
          title: "Welcome to New Session 2024-25",
          content: "The new academic session starts from April 1st. All students are requested to complete their registration by March 25th.",
          priority: "high",
          author: "Admin",
          authorRole: "admin",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          views: 45
        },
        {
          id: "N002",
          title: "Annual Sports Day",
          content: "Annual Sports Day will be held on March 15th. Interested students please register with your class teacher.",
          priority: "medium",
          author: "Admin",
          authorRole: "admin",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          views: 32
        },
        {
          id: "N003",
          title: "Mid-Term Examination Schedule",
          content: "Mid-term exams will start from April 20th. Timetable will be uploaded soon.",
          priority: "high",
          author: "Admin",
          authorRole: "admin",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          views: 28
        }
      ];
      setNotices(defaultNotices);
      localStorage.setItem("notices", JSON.stringify(defaultNotices));
    }
  }, []);

  // Save notices to localStorage
  const saveNotices = (updatedNotices) => {
    setNotices(updatedNotices);
    localStorage.setItem("notices", JSON.stringify(updatedNotices));
  };

  // Add new notice
  const addNotice = () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      alert("Please fill title and content");
      return;
    }

    const notice = {
      id: `N${Date.now()}`,
      title: newNotice.title,
      content: newNotice.content,
      priority: newNotice.priority,
      author: `${currentUser.first} ${currentUser.last}`,
      authorRole: currentUser.role,
      date: new Date().toISOString(),
      views: 0
    };

    saveNotices([notice, ...notices]);
    setNewNotice({ title: "", content: "", priority: "normal" });
    setShowForm(false);
    alert("✅ Notice posted successfully!");
  };

  // Update notice
  const updateNotice = () => {
    if (!editingNotice.title.trim() || !editingNotice.content.trim()) {
      alert("Please fill title and content");
      return;
    }

    const updatedNotices = notices.map(n => 
      n.id === editingNotice.id 
        ? { ...n, title: editingNotice.title, content: editingNotice.content, priority: editingNotice.priority }
        : n
    );
    saveNotices(updatedNotices);
    setEditingNotice(null);
    alert("✅ Notice updated successfully!");
  };

  // Delete notice
  const deleteNotice = (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      const updatedNotices = notices.filter(n => n.id !== id);
      saveNotices(updatedNotices);
      alert("✅ Notice deleted!");
    }
  };

  // Increment view count
  const incrementView = (id) => {
    const updatedNotices = notices.map(n => 
      n.id === id ? { ...n, views: (n.views || 0) + 1 } : n
    );
    localStorage.setItem("notices", JSON.stringify(updatedNotices));
  };

  const getPriorityColor = (priority) => {
    if (priority === "high") return { bg: "#fcebeb", color: "#a32d2d", label: "🔴 High" };
    if (priority === "medium") return { bg: "#faeeda", color: "#854f0b", label: "🟠 Medium" };
    return { bg: "#eaf3de", color: "#3b6d11", label: "🟢 Normal" };
  };

  const canManageNotices = currentUser.role === "admin" || currentUser.role === "teacher";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>📢 Notice Board</h2>
        {canManageNotices && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 20px",
              background: "#6c63ff",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            {showForm ? "❌ Cancel" : "+ Post Notice"}
          </button>
        )}
      </div>

      {/* Add/Edit Notice Form */}
      {(showForm || editingNotice) && (
        <div style={{
          background: "white",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          border: "1px solid #ddd"
        }}>
          <h3>{editingNotice ? "✏️ Edit Notice" : "📝 Post New Notice"}</h3>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: 500 }}>Title</label>
            <input
              type="text"
              value={editingNotice ? editingNotice.title : newNotice.title}
              onChange={(e) => editingNotice 
                ? setEditingNotice({ ...editingNotice, title: e.target.value })
                : setNewNotice({ ...newNotice, title: e.target.value })
              }
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              placeholder="Enter notice title"
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: 500 }}>Content</label>
            <textarea
              value={editingNotice ? editingNotice.content : newNotice.content}
              onChange={(e) => editingNotice
                ? setEditingNotice({ ...editingNotice, content: e.target.value })
                : setNewNotice({ ...newNotice, content: e.target.value })
              }
              rows={4}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              placeholder="Enter notice content"
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: 500 }}>Priority</label>
            <select
              value={editingNotice ? editingNotice.priority : newNotice.priority}
              onChange={(e) => editingNotice
                ? setEditingNotice({ ...editingNotice, priority: e.target.value })
                : setNewNotice({ ...newNotice, priority: e.target.value })
              }
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
            >
              <option value="normal">Normal</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={editingNotice ? updateNotice : addNotice}
              style={{
                padding: "10px 20px",
                background: "#6c63ff",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              {editingNotice ? "Update Notice" : "Post Notice"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingNotice(null);
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

      {/* Notices List */}
      {notices.length === 0 ? (
        <div style={{ textAlign: "center", padding: 50, background: "white", borderRadius: 12 }}>
          <p>No notices available.</p>
        </div>
      ) : (
        notices.map((notice) => {
          const priorityStyle = getPriorityColor(notice.priority);
          const date = new Date(notice.date);
          const timeAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
          const timeText = timeAgo === 0 ? "Today" : timeAgo === 1 ? "Yesterday" : `${timeAgo} days ago`;

          return (
            <div
              key={notice.id}
              style={{
                background: "white",
                borderRadius: 12,
                padding: 20,
                marginBottom: 15,
                border: `2px solid ${priorityStyle.color}20`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
              onClick={() => incrementView(notice.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0 }}>{notice.title}</h3>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    background: priorityStyle.bg,
                    color: priorityStyle.color,
                    fontSize: 12,
                    fontWeight: 500
                  }}>
                    {priorityStyle.label}
                  </span>
                </div>
                {canManageNotices && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setEditingNotice(notice)}
                      style={{
                        padding: "4px 12px",
                        background: "#6c63ff",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteNotice(notice.id)}
                      style={{
                        padding: "4px 12px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>

              <p style={{ color: "#444", lineHeight: 1.5, marginBottom: 12 }}>{notice.content}</p>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
                color: "#888",
                borderTop: "1px solid #eee",
                paddingTop: 10
              }}>
                <div>
                  👤 {notice.author} ({notice.authorRole})
                </div>
                <div>
                  📅 {timeText} • 👁️ {notice.views || 0} views
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}