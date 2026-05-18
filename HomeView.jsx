import { FONTS } from "../App";

const fmtDate = (iso) => new Date(iso).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
const daysUntil = (s) => { const t=new Date();t.setHours(0,0,0,0);const d=new Date(s);d.setHours(0,0,0,0);return Math.ceil((d-t)/86400000); };
const plain = (s="") => s.replace(/<[^>]+>/g,"");
const wc = (t="") => t.trim()?t.trim().split(/\s+/).length:0;

export default function HomeView({ C, entries, projects, setTab, setActiveProject }) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const allTasks = projects.flatMap(p=>(p.tasks||[]).map(t=>({...t,projectName:p.name,projectColor:p.color,projectId:p.id})));
  const urgent = allTasks.filter(t=>!t.done&&daysUntil(t.deadline)<=5&&daysUntil(t.deadline)>=0).sort((a,b)=>daysUntil(a.deadline)-daysUntil(b.deadline));
  const recent = [...entries].slice(0,2);
  const todayCount = entries.filter(e=>e.createdAt?.startsWith?.(todayStr)||e.date?.startsWith?.(todayStr)).length;
  const totalWords = entries.reduce((acc,e)=>acc+wc(plain(e.content)),0);

  return (
    <div>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.bgSoft},${C.bgCard})`,padding:"48px 20px 22px",borderBottom:`1px solid ${C.border}`}}>
        <p style={{fontFamily:FONTS.body,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:C.muted,marginBottom:5}}>{fmtDate(today.toISOString())}</p>
        <h1 style={{fontFamily:FONTS.display,fontSize:26,color:C.text,fontWeight:600,lineHeight:1.3}}>Bonjour, <span style={{color:C.terra}}>Meredith.</span></h1>
        <div style={{display:"flex",gap:10,marginTop:14}}>
          {[{l:"Aujourd'hui",v:`${todayCount} entrée${todayCount!==1?"s":""}`,c:C.terra},{l:"Mots écrits",v:totalWords.toLocaleString(),c:C.gold},{l:"Urgentes",v:`${urgent.length} tâche${urgent.length!==1?"s":""}`,c:"#4a7c59"}].map((s,i)=>(
            <div key={i} style={{background:C.bg,borderRadius:9,padding:"10px 8px 8px",flex:1,border:`1px solid ${C.border}`}}>
              <p style={{fontFamily:FONTS.display,fontSize:16,color:s.c,fontWeight:700}}>{s.v}</p>
              <p style={{fontFamily:FONTS.body,fontSize:8,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:2}}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"18px 20px 0"}}>
        {/* CTA */}
        <button onClick={()=>setTab("journal")} style={{width:"100%",padding:"14px 20px",background:C.terra,color:C.white,border:"none",borderRadius:12,fontFamily:FONTS.body,fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:22,boxShadow:`0 4px 16px ${C.terra}44`}}>
          ✍️ Nouvelle entrée
        </button>

        {/* Urgentes */}
        {urgent.length>0&&(
          <section style={{marginBottom:24}}>
            <h2 style={{fontFamily:FONTS.display,fontSize:13,color:C.text,marginBottom:10,paddingBottom:5,borderBottom:`2px solid ${C.terra}`,display:"inline-block"}}>À traiter bientôt</h2>
            {urgent.slice(0,3).map(t=>{const d=daysUntil(t.deadline);return(
              <div key={t.id} onClick={()=>{setActiveProject(t.projectId);setTab("projects");}} style={{background:C.bgCard,padding:"12px 14px",borderRadius:10,borderLeft:`3px solid ${t.projectColor}`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                <div><p style={{fontFamily:FONTS.body,fontSize:13,color:C.text,fontWeight:600}}>{t.text}</p><p style={{fontFamily:FONTS.body,fontSize:10,color:C.muted,marginTop:2}}>{t.projectName}</p></div>
                <span style={{background:d<=1?C.terra:d<=3?C.gold:C.border,color:d<=3?C.white:C.text,fontSize:9,padding:"3px 8px",borderRadius:20,fontFamily:FONTS.body,fontWeight:700,whiteSpace:"nowrap",marginLeft:8}}>{d===0?"Auj.":d===1?"Demain":`J-${d}`}</span>
              </div>
            );})}
          </section>
        )}

        {/* Entrées récentes */}
        <section style={{marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <h2 style={{fontFamily:FONTS.display,fontSize:13,color:C.text,paddingBottom:5,borderBottom:`2px solid ${C.gold}`,display:"inline-block"}}>Dernières entrées</h2>
            <button onClick={()=>setTab("journal")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:FONTS.body,fontSize:11,color:C.terra}}>Voir tout →</button>
          </div>
          {recent.length===0?<p style={{fontFamily:FONTS.body,fontSize:12,color:C.muted,fontStyle:"italic"}}>Aucune entrée pour l'instant.</p>
          :recent.map(e=>{const proj=projects.find(p=>p.id===e.projectId);return(
            <div key={e.id} style={{background:C.bgCard,padding:"13px",borderRadius:10,borderLeft:`2px solid ${proj?proj.color:C.border}`,marginBottom:8}}>
              <p style={{fontFamily:FONTS.body,fontSize:9,color:C.muted,marginBottom:3}}>{e.createdAt?fmtDate(e.createdAt):""}</p>
              {e.title&&<p style={{fontFamily:FONTS.display,fontSize:14,color:C.text,fontWeight:600,marginBottom:3}}>{e.title}</p>}
              <p style={{fontFamily:FONTS.body,fontSize:12,color:C.muted,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{plain(e.content)}</p>
            </div>
          );})}
        </section>

        {/* Projets */}
        <section style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <h2 style={{fontFamily:FONTS.display,fontSize:13,color:C.text,paddingBottom:5,borderBottom:`2px solid ${C.terra}`,display:"inline-block"}}>Projets</h2>
            <button onClick={()=>setTab("projects")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:FONTS.body,fontSize:11,color:C.terra}}>Voir tout →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {projects.map(p=>{const done=(p.tasks||[]).filter(t=>t.done).length;const tot=(p.tasks||[]).length||1;const pct=Math.round((done/tot)*100);return(
              <div key={p.id} onClick={()=>{setActiveProject(p.id);setTab("projects");}} style={{background:C.bgCard,padding:"13px",borderRadius:10,borderTop:`3px solid ${p.color}`,cursor:"pointer"}}>
                <p style={{fontFamily:FONTS.display,fontSize:12,color:C.text,fontWeight:600,marginBottom:8,lineHeight:1.3}}>{p.name}</p>
                <div style={{height:4,background:C.border,borderRadius:2,marginBottom:4}}><div style={{height:"100%",width:`${pct}%`,background:p.color,borderRadius:2}}/></div>
                <p style={{fontFamily:FONTS.body,fontSize:9,color:C.muted}}>{done}/{tot} · {pct}%</p>
              </div>
            );})}
          </div>
        </section>
      </div>
    </div>
  );
}
