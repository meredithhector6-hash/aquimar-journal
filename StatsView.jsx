// src/views/StatsView.jsx
import { FONTS } from "../App";
const plain = (s="") => s.replace(/<[^>]+>/g,"");
const wc = (t="") => t.trim()?t.trim().split(/\s+/).length:0;

export function StatsView({ C, entries, projects }) {
  const today = new Date();
  const allTasks = projects.flatMap(p=>p.tasks||[]);
  const totalWords = entries.reduce((acc,e)=>acc+wc(plain(e.content||"")),0);
  const compTasks = allTasks.filter(t=>t.done).length;
  const last7 = Array.from({length:7}).map((_,i)=>{const d=new Date(today);d.setDate(d.getDate()-(6-i));const k=d.toISOString().split("T")[0];return{label:d.toLocaleDateString("fr-FR",{weekday:"short"}).charAt(0).toUpperCase(),count:entries.filter(e=>(e.createdAt||"").startsWith(k)).length};});
  const maxE = Math.max(...last7.map(d=>d.count),1);
  const recent = [...entries].slice(0,7).reverse();
  const maxW = Math.max(...recent.map(e=>wc(plain(e.content||""))),1);
  const tagCounts = entries.flatMap(e=>e.tags||[]).reduce((acc,t)=>{acc[t]=(acc[t]||0)+1;return acc;},{});

  const Stat=({val,label,c})=>(
    <div style={{background:C.bgCard,borderRadius:11,padding:"14px 12px",flex:1,borderTop:`3px solid ${c}`}}>
      <p style={{fontFamily:FONTS.display,fontSize:20,color:c,fontWeight:700}}>{val}</p>
      <p style={{fontFamily:FONTS.body,fontSize:9,color:C.muted,marginTop:2,letterSpacing:"0.07em"}}>{label}</p>
    </div>
  );

  return(
    <div>
      <div style={{background:C.bgSoft,padding:"48px 20px 16px",borderBottom:`1px solid ${C.border}`}}>
        <h1 style={{fontFamily:FONTS.display,fontSize:22,color:C.text,fontWeight:600}}>Statistiques</h1>
        <p style={{fontFamily:FONTS.body,fontSize:10,color:C.muted,marginTop:3}}>Vue d'ensemble de ton activité</p>
      </div>
      <div style={{padding:"16px 20px 0"}}>
        <div style={{display:"flex",gap:9,marginBottom:18}}>
          <Stat val={entries.length} label="Entrées total" c={C.terra}/>
          <Stat val={totalWords.toLocaleString()} label="Mots écrits" c={C.gold}/>
          <Stat val={`${compTasks}/${allTasks.length}`} label="Tâches done" c="#4a7c59"/>
        </div>

        <div style={{background:C.bgCard,borderRadius:12,padding:"14px",marginBottom:14}}>
          <p style={{fontFamily:FONTS.display,fontSize:13,color:C.text,fontWeight:600,marginBottom:12}}>Entrées — 7 derniers jours</p>
          <div style={{display:"flex",gap:5,alignItems:"flex-end",height:56}}>
            {last7.map((d,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end"}}>
                <div style={{width:"65%",height:`${(d.count/maxE)*100}%`,background:d.count>0?C.terra:C.border,borderRadius:"2px 2px 0 0",minHeight:d.count>0?4:2}}/>
                <span style={{fontFamily:FONTS.body,fontSize:8,color:C.muted}}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:C.bgCard,borderRadius:12,padding:"14px",marginBottom:14}}>
          <p style={{fontFamily:FONTS.display,fontSize:13,color:C.text,fontWeight:600,marginBottom:12}}>Avancement des projets</p>
          {projects.map(p=>{const tasks=p.tasks||[];const pct=Math.round((tasks.filter(t=>t.done).length/(tasks.length||1))*100);return(
            <div key={p.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:FONTS.body,fontSize:11,color:C.text}}>{p.name}</span><span style={{fontFamily:FONTS.body,fontSize:11,color:p.color,fontWeight:700}}>{pct}%</span></div>
              <div style={{height:6,background:C.border,borderRadius:3}}><div style={{height:"100%",width:`${pct}%`,background:p.color,borderRadius:3}}/></div>
            </div>
          );})}
        </div>

        {recent.length>1&&(
          <div style={{background:C.bgCard,borderRadius:12,padding:"14px",marginBottom:14}}>
            <p style={{fontFamily:FONTS.display,fontSize:13,color:C.text,fontWeight:600,marginBottom:12}}>Mots par entrée (récentes)</p>
            <div style={{display:"flex",gap:4,alignItems:"flex-end",height:60}}>
              {recent.map((e,i)=>{const w=wc(plain(e.content||""));return(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end"}}>
                  <div style={{width:"70%",height:`${(w/maxW)*100}%`,background:C.gold,borderRadius:"2px 2px 0 0",minHeight:w>0?3:0}}/>
                  <span style={{fontFamily:FONTS.body,fontSize:7,color:C.muted}}>{w}m</span>
                </div>
              );})}
            </div>
          </div>
        )}

        {Object.keys(tagCounts).length>0&&(
          <div style={{background:C.bgCard,borderRadius:12,padding:"14px",marginBottom:10}}>
            <p style={{fontFamily:FONTS.display,fontSize:13,color:C.text,fontWeight:600,marginBottom:10}}>Mes tags</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).map(([tag,count])=>(
                <span key={tag} style={{background:`${C.terra}18`,border:`1px solid ${C.terra}44`,color:C.terra,padding:"5px 11px",borderRadius:20,fontFamily:FONTS.body,fontSize:11,fontWeight:count>1?700:400}}>#{tag} <span style={{opacity:.6}}>×{count}</span></span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
