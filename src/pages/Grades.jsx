const GRADE_DATA = {
  "S-001":[88,92,79,85], "S-002":[72,68,80,74], "S-003":[95,90,88,92],
  "S-004":[55,60,65,58], "S-005":[83,77,85,80],
};
const SUBJECTS = ["Math","Science","English","Urdu"];
const MEDALS   = ["🥇","🥈","🥉","4️⃣"];
const AV_BG = ["#EEF0FE","#FCE4EC","#E1F5EE","#FAEEDA","#E6F1FB","#FCEBEB"];
const AV_FG = ["#534AB7","#880E4F","#0F6E56","#854F0B","#185FA5","#A32D2D"];

const lG  = n => n>=90?"A":n>=80?"B+":n>=70?"B":n>=60?"C":"D";
const gC  = n => n>=90?"#43a047":n>=80?"#6c63ff":n>=70?"#f4a261":"#E24B4A";
const gBg = n => n>=90?"#eaf3de":n>=80?"#EEF0FE":n>=70?"#FAEEDA":"#FCEBEB";

export default function Grades({ students }) {
  const cls10a = students.filter(s => s.cls === "10-A" && GRADE_DATA[s.id]);
  const subAvgs = SUBJECTS.map((_,i) => {
    const vals = Object.values(GRADE_DATA).map(g => g[i]);
    return Math.round(vals.reduce((a,b) => a+b, 0) / vals.length);
  });
  const ranked = cls10a
    .map(s => ({ ...s, avg: Math.round(GRADE_DATA[s.id].reduce((a,b)=>a+b,0)/4) }))
    .sort((a,b) => b.avg - a.avg).slice(0,4);

  return (
    <div>
      <div className="section-row">
        <div className="card">
          <div className="card-title">Subject performance — 10-A</div>
          {SUBJECTS.map((sub,i) => (
            <div key={sub} className="grade-item">
              <span style={{ fontSize:13 }}>{sub}</span>
              <div style={{ flex:1, margin:"0 12px", height:5, borderRadius:3, background:"#f0f0f0" }}>
                <div style={{ width:`${subAvgs[i]}%`, height:5, borderRadius:3, background:gC(subAvgs[i]) }} />
              </div>
              <span style={{ fontSize:12, color:"#888", minWidth:26 }}>{subAvgs[i]}%</span>
              <div className="grade-badge" style={{ background:gBg(subAvgs[i]), color:gC(subAvgs[i]) }}>{lG(subAvgs[i])}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Top performers</div>
          {ranked.map((s,i) => {
            const ci = i % AV_BG.length;
            return (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"0.5px solid #f0f0f0" }}>
                <span style={{ fontSize:16 }}>{MEDALS[i]}</span>
                <div className="student-avatar" style={{ background:AV_BG[ci], color:AV_FG[ci], width:28, height:28, fontSize:10 }}>{s.first[0]}{s.last[0]}</div>
                <div style={{ flex:1, fontSize:13 }}>{s.first} {s.last}</div>
                <div className="grade-badge" style={{ background:gBg(s.avg), color:gC(s.avg) }}>{lG(s.avg)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="table-card">
        <div className="table-header"><h3>Student grade report</h3></div>
        <table>
          <thead><tr><th>Student</th>{SUBJECTS.map(s=><th key={s}>{s}</th>)}<th>Overall</th></tr></thead>
          <tbody>
            {cls10a.map((s,idx) => {
              const g = GRADE_DATA[s.id];
              const avg = Math.round(g.reduce((a,b)=>a+b,0)/4);
              const ci = idx % AV_BG.length;
              return (
                <tr key={s.id}>
                  <td><div className="student-info">
                    <div className="student-avatar" style={{ background:AV_BG[ci], color:AV_FG[ci] }}>{s.first[0]}{s.last[0]}</div>
                    <span>{s.first} {s.last}</span>
                  </div></td>
                  {g.map((v,i) => <td key={i}><div className="grade-badge" style={{ background:gBg(v), color:gC(v) }}>{v}</div></td>)}
                  <td><strong style={{ color:gC(avg) }}>{lG(avg)}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}