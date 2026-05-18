import { useState, useEffect } from "react";
import { addTask, toggleTask, listenTasks, updateProject } from "../services";
import { FONTS } from "../App";

const fmtShort = (iso) => { try { return new Date(iso).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}); } catch { return iso; }};
const daysUntil = (s) => { try { const t=new Date();t.setHours(0,0,0,0);const d=new Date(s);d.setHours(0,0,0,0);return Math.ceil((d-t)/86400000); } catch { return 0; }};
const pColor = (p, C) => p==="haute"?C.terra:p==="moyenne"?C.gold:C.muted;

// ─── GANTT ────────────────────────────────────────────────────────────
const GanttChart = ({ tasks, color, start, end }) => {
  const s=new Date(start),e=new Date(end),tot=e-s;
  const pos=(d)=>Math.max(0,Math.min(100,((new Date(d)-s)/tot)*100));
  const todayP=pos(new Date());
  const months=[]; const c=new Date(s);
  while(c<=e){months.push(c.toLocaleDateString("fr-FR",{month:"short"}));c.setMonth(c.getMonth()+1);}
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>{months.map((m,i)=><span key={i} style={{fontFamily:FONTS.body,fontSize:8,color:"#999"}}>{m}</span>)}</div>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",left:`${todayP}%`,top:0,bottom:0,width:1,background:color,zIndex:5}}/>
        {tasks.map(t=>{const ep=pos(t.deadline||new Date().toISOString());const sp=Math.max(0,ep-10);return(
          <div key={t.id} style={{position:"relative",height:24,marginBottom:4,display:"flex",alignItems:"center"}}>
            <div style={{position:"absolute",left:`${sp}%`,width:`${Math.max(ep-sp,3)}%`,height:17,background:t.done?"#ccc":color,borderRadius:3,opacity:t.done?.5:1,display:"flex",alignItems:"center",paddingLeft:4,overflow:"hidden",minWidth:40}}>
              <span style={{fontFamily:FONTS.body,fontSize:7,color:"#fff",whiteSpace:"nowrap",fontWeight:600}}>{t.done?"✓ ":""}{(t.text||"").substring(0,16)}…</span>
            </div>
          </div>
        );})}
      </div>
    </div>
  );
};

// ─── PROJECT DETAIL ───────────────────────────────────────────────────
const ProjectDetail = ({ project, onBack, user, C }) => {
  const [view, setView] = useState("tasks");
  const [tasks, setTasks] = useState([]);
  const [newT, setNewT] = useState(""); const [newD, setNewD] = useState(""); const [newP, setNewP] = useState("moyenne");
  const today=new Date(); const yr=today.getFullYear(); const mo=today.getMonth();
  const fd=new Date(yr,mo,1).getDay(); const dim=new Date(yr,mo+1,0).getDate();
  const tDays=tasks.filter(t=>!t.done).map(t=>parseInt((t.deadline||"").split("-")[2])).filter(Boolean);
  const done=tasks.filter(t=>t.done).length;
  const pct=Math.round((done/(tasks.length||1))*100);

  useEffect(()=>{
    if(!user||!project?.id) return;
    return listenTasks(user.uid, project.id, setTasks);
  },[user, project?.id]);

  const tog = async (taskId, isDone) => { await toggleTask(user.uid, project.id, taskId, !isDone); };
  const add = async () => {
    if(!newT.trim()) return;
    await addTask(user.uid, project.id, { text:newT.trim(), done:false, deadline:newD||new Date(Date.now()+7*86400000).toISOString().split("T")[0], priority:newP });
    setNewT(""); setNewD(""); setNewP("moyenne");
  };

  return(
    <div>
      <div style={{background:C.bgSoft,padding:"48px 20px 16px",borderBottom:`1px solid ${C.border}`}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.terra,marginBottom:12}}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" stroke={C.terra} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontFamily:FONTS.body,fontSize:11}}>Tous les projets</span>
        </button>
        <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{width:4,height:36,background:project.color,borderRadius:2,flexShrink:0}}/>
          <div><h1 style={{fontFamily:FONTS.display,fontSize:19,color:C.text,fontWeight:600}}>{project.name}</h1><p style={{fontFamily:FONTS.body,fontSize:11,color:C.muted,marginTop:2}}>{project.description}</p></div>
        </div>
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontFamily:FONTS.body,fontSize:10,color:C.muted}}>{done}/{tasks.length} tâches</span><span style={{fontFamily:FONTS.body,fontSize:10,color:project.color,fontWeight:700}}>{pct}%</span></div>
          <div style={{height:5,background:C.border,borderRadius:3}}><div style={{height:"100%",width:`${pct}%`,background:project.color,borderRadius:3}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
            <span style={{fontFamily:FONTS.body,fontSize:9,color:C.muted}}>Début : {fmtShort(project.start)}</span>
            <span style={{fontFamily:FONTS.body,fontSize:9,color:C.muted}}>Fin : {fmtShort(project.deadline)}</span>
          </div>
        </div>
      </div>

      <div style={{display:"flex",background:C.bgSoft,borderBottom:`1px solid ${C.border}`}}>
        {[["tasks","Tâches"],["gantt","Gantt"],["calendar","Calendrier"]].map(([id,label])=>(
          <button key={id} onClick={()=>setView(id)} style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:`2px solid ${view===id?project.color:"transparent"}`,color:view===id?project.color:C.muted,cursor:"pointer",fontFamily:FONTS.body,fontSize:11,letterSpacing:"0.05em"}}>
            {label}
          </button>
        ))}
      </div>

      <div style={{padding:"13px 20px"}}>
        {view==="tasks"&&(<>
          <div style={{background:C.bgCard,padding:"12px",borderRadius:10,marginBottom:12}}>
            <input placeholder="Nouvelle tâche..." value={newT} onChange={e=>setNewT(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
              style={{width:"100%",border:"none",borderBottom:`1px solid ${C.border}`,fontFamily:FONTS.body,fontSize:13,color:C.text,background:"transparent",outline:"none",paddingBottom:7,marginBottom:8,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
              <input type="date" value={newD} onChange={e=>setNewD(e.target.value)} style={{border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 6px",fontFamily:FONTS.body,fontSize:10,color:C.text,background:C.inputBg,outline:"none"}}/>
              {["basse","moyenne","haute"].map(pr=><button key={pr} onClick={()=>setNewP(pr)} style={{padding:"3px 8px",borderRadius:20,fontSize:9,cursor:"pointer",border:`1px solid ${newP===pr?pColor(pr,C):C.border}`,background:newP===pr?pColor(pr,C):C.bg,color:newP===pr?C.white:C.muted,fontFamily:FONTS.body}}>{pr}</button>)}
              <button onClick={add} style={{marginLeft:"auto",background:project.color,color:C.white,border:"none",borderRadius:20,padding:"3px 11px",fontSize:10,cursor:"pointer",fontFamily:FONTS.body}}>Ajouter</button>
            </div>
          </div>
          <p style={{fontFamily:FONTS.body,fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:5}}>En cours</p>
          {tasks.filter(t=>!t.done).sort((a,b)=>daysUntil(a.deadline)-daysUntil(b.deadline)).map(t=>(
            <div key={t.id} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <button onClick={()=>tog(t.id,t.done)} style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${project.color}`,background:"none",cursor:"pointer",flexShrink:0,marginTop:2}}/>
              <div style={{flex:1}}>
                <p style={{fontFamily:FONTS.body,fontSize:13,color:C.text}}>{t.text}</p>
                <div style={{display:"flex",gap:5,marginTop:3,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontFamily:FONTS.body,fontSize:9,color:C.muted}}>{fmtShort(t.deadline)}</span>
                  {daysUntil(t.deadline)<=3&&daysUntil(t.deadline)>=0&&<span style={{background:C.terra,color:"#fff",fontSize:8,padding:"1px 5px",borderRadius:20,fontFamily:FONTS.body}}>J-{daysUntil(t.deadline)}</span>}
                  <span style={{fontSize:8,padding:"1px 5px",borderRadius:20,fontFamily:FONTS.body,background:`${pColor(t.priority,C)}22`,color:pColor(t.priority,C),fontWeight:700}}>{t.priority}</span>
                </div>
              </div>
            </div>
          ))}
          {tasks.filter(t=>t.done).length>0&&(<>
            <p style={{fontFamily:FONTS.body,fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",margin:"13px 0 5px"}}>Terminées</p>
            {tasks.filter(t=>t.done).map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:`1px solid ${C.border}`,opacity:.5}}>
                <button onClick={()=>tog(t.id,t.done)} style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${project.color}`,background:project.color,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="9" height="9" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
                </button>
                <p style={{fontFamily:FONTS.body,fontSize:13,color:C.muted,textDecoration:"line-through"}}>{t.text}</p>
              </div>
            ))}
          </>)}
        </>)}

        {view==="gantt"&&(
          <div>
            <p style={{fontFamily:FONTS.body,fontSize:10,color:C.muted,marginBottom:12}}>Vue temporelle · <span style={{color:C.terra}}>—</span> Aujourd'hui</p>
            <GanttChart tasks={tasks} color={project.color} start={project.start} end={project.deadline}/>
            <div style={{marginTop:18,padding:"10px 12px",background:C.bgCard,borderRadius:10,borderLeft:`2px solid ${project.color}`}}>
              <p style={{fontFamily:FONTS.body,fontSize:11,color:C.muted}}>Durée : <strong style={{color:C.text}}>{Math.ceil((new Date(project.deadline)-new Date(project.start))/86400000)} jours</strong></p>
              <p style={{fontFamily:FONTS.body,fontSize:11,color:C.muted,marginTop:3}}>Restant : <strong style={{color:project.color}}>{Math.max(0,daysUntil(project.deadline))} jours</strong></p>
            </div>
          </div>
        )}

        {view==="calendar"&&(
          <div>
            <p style={{fontFamily:FONTS.display,fontSize:15,color:C.text,fontWeight:600,marginBottom:12,textAlign:"center"}}>{today.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:5}}>{["D","L","M","M","J","V","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontFamily:FONTS.body,fontSize:8,color:C.muted,fontWeight:700}}>{d}</div>)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
              {Array.from({length:fd}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:dim}).map((_,i)=>{const day=i+1;const has=tDays.includes(day);const isTod=day===today.getDate();return(
                <div key={day} style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",fontSize:10,fontFamily:FONTS.body,background:isTod?C.terra:has?`${project.color}22`:"transparent",color:isTod?C.white:has?project.color:C.text,fontWeight:(has||isTod)?700:400,border:has&&!isTod?`1px solid ${project.color}`:"1px solid transparent"}}>{day}</div>
              );})}
            </div>
            <div style={{marginTop:16}}>
              <p style={{fontFamily:FONTS.body,fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:7}}>Deadlines ce mois</p>
              {tasks.filter(t=>{const d=new Date(t.deadline||"");return d.getFullYear()===yr&&d.getMonth()===mo;}).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).map(t=>(
                <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:t.done?C.muted:project.color}}/><p style={{fontFamily:FONTS.body,fontSize:12,color:t.done?C.muted:C.text,textDecoration:t.done?"line-through":"none"}}>{t.text}</p></div>
                  <span style={{fontFamily:FONTS.body,fontSize:10,color:C.muted}}>{fmtShort(t.deadline)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PROJECTS LIST ────────────────────────────────────────────────────
export default function ProjectsView({ C, user, projects, activeProject, setActiveProject }) {
  const proj = projects.find(p=>p.id===activeProject);
  if(proj) return <ProjectDetail project={proj} onBack={()=>setActiveProject(null)} user={user} C={C}/>;

  return(
    <div>
      <div style={{background:C.bgSoft,padding:"48px 20px 16px",borderBottom:`1px solid ${C.border}`}}>
        <h1 style={{fontFamily:FONTS.display,fontSize:22,color:C.text,fontWeight:600}}>Projets</h1>
        <p style={{fontFamily:FONTS.body,fontSize:10,color:C.muted,marginTop:3}}>{projects.length} projets actifs</p>
      </div>
      <div style={{padding:"16px 20px 0"}}>
        {projects.length===0&&<p style={{fontFamily:FONTS.body,fontSize:13,color:C.muted,textAlign:"center",padding:"32px 0",fontStyle:"italic"}}>Aucun projet pour l'instant.</p>}
        {projects.map(p=>{const dl=daysUntil(p.deadline);return(
          <div key={p.id} onClick={()=>setActiveProject(p.id)} style={{background:C.bgCard,borderRadius:12,marginBottom:12,overflow:"hidden",cursor:"pointer",boxShadow:"0 1px 10px rgba(0,0,0,0.05)"}}>
            <div style={{height:3,background:p.color}}/>
            <div style={{padding:"13px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <h2 style={{fontFamily:FONTS.display,fontSize:15,color:C.text,fontWeight:600}}>{p.name}</h2>
                <svg width="14" height="14" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" stroke={C.muted} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
              </div>
              <p style={{fontFamily:FONTS.body,fontSize:11,color:C.muted,marginBottom:9,lineHeight:1.4}}>{p.description}</p>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <span style={{background:dl<=30?`${C.gold}22`:C.border,color:dl<=30?C.gold:C.muted,fontSize:9,padding:"2px 7px",borderRadius:20,fontFamily:FONTS.body}}>J-{dl}</span>
              </div>
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}
