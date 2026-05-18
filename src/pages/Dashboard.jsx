import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const COLORS = ["#6c63ff", "#e040fb", "#00bcd4", "#ff7043", "#43a047"];

const activities = [
  { icon: "👤", text: "New student Ayesha Fatima enrolled", time: "2m ago" },
  { icon: "✅", text: "Attendance marked for class 10-A", time: "1h ago" },
  { icon: "⚠️", text: "Usman Ali below attendance threshold", time: "3h ago" },
  { icon: "📊", text: "Term 2 results published", time: "1d ago" },
];

export default function Dashboard({ students }) {

  const present = students.filter((s) => s.att >= 75).length;
  const absent = students.length - present;

  const pieData = [
    { name: "Present", value: present },
    { name: "Absent", value: absent },
  ];

  const classes = ["10-A", "10-B", "11-A", "11-B", "12-A"];

  const avg = (cls) => {
    const g = students.filter((s) => s.cls === cls);
    return g.length
      ? Math.round(g.reduce((a, s) => a + s.att, 0) / g.length)
      : 0;
  };

  const totalAvg = Math.round(
    students.reduce((a, s) => a + s.att, 0) / students.length
  );

  return (
    <div>

      {/* ===== STATS CARDS (UPGRADED UI ONLY) ===== */}
      <div className="section-row">

        <div className="card stat-card modern-card">
          <div className="card-label">👥 Total Students</div>
          <div className="card-value">{students.length}</div>
          <div className="card-badge blue">Students</div>
        </div>

        <div className="card stat-card modern-card">
          <div className="card-label">📊 Avg Attendance</div>
          <div className="card-value">{totalAvg}%</div>
          <div className="card-badge green">Performance</div>
        </div>

        <div className="card stat-card modern-card">
          <div className="card-label">📉 Low Attendance</div>
          <div className="card-value">
            {students.filter((s) => s.att < 65).length}
          </div>
          <div className="card-badge red">Risk</div>
        </div>

        <div className="card stat-card modern-card">
          <div className="card-label">📈 Status</div>
          <div className="card-value">Good</div>
          <div className="card-badge green">Active</div>
        </div>

      </div>

      {/* ===== MAIN SECTION (UNCHANGED LOGIC) ===== */}
      <div className="section-row">

        <div className="card">
          <div className="card-title">📊 Attendance by Class</div>

          {classes.map((cls, i) => (
            <div key={cls} style={{ marginBottom: 12 }}>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12 }}>{cls}</span>
                <span style={{ fontSize: 12, color: COLORS[i] }}>
                  {avg(cls)}%
                </span>
              </div>

              <div style={{
                height: 6,
                background: "#eee",
                borderRadius: 10,
                marginTop: 5
              }}>
                <div
                  style={{
                    width: `${avg(cls)}%`,
                    height: "100%",
                    background: COLORS[i],
                    borderRadius: 10,
                    transition: "0.3s"
                  }}
                />
              </div>

            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">🕒 Recent Activity</div>

          {activities.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 0",
                borderBottom: "1px solid #f2f2f2"
              }}
            >
              <div style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#f3f3f3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {a.icon}
              </div>

              <div>
                <div style={{ fontSize: 12 }}>{a.text}</div>
                <div style={{ fontSize: 10, color: "#888" }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}   