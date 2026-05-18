import { useState, useRef } from "react";
import { addEntry, deleteEntry } from "../services";
import { FONTS } from "../App";

const fmtDate = (iso) => new Date(iso).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
const plain = (s="") => s.replace(/<[^>]+>/g,"");
const wc = (t="") => t.trim()?t.trim().split(/\s+/).length:0;

const FONT_OPTS = [
  {id:"playfair",label:"Playfair",css:"'Playfair Display',serif"},
  {id:"lato",label:"Lato",css:"'Lato',sans-serif"},
  {id:"courier",label:"Courier",css:"'Courier New',monospace"},
  {id:"georgia",label:"Georgia",css:"Georgia,serif"},
];

export default function JournalView({ C, user, entries, projects }) {
  const [mode, setMode]   = useState("list"); // list | write | read
  const [sel, setSel]     = useState(null);
  const [title, setTitle] = useState("");
  const [font, setFont]   = useState("playfair");
  const [linked, setLinked] = useState(null);
  const [tags, setTags]   = useState([]);
  const [tagIn, setTagIn] = useState("");
  const [q, setQ]         = useState("");
  const [fProj, setFProj] = useState(null);
  const [saving, setSaving] = useState(false);
  const edRef = useRef();

  const ff = (id) => FONT_OPTS.find(f=>f.id===id)?.css||FONTS.display;
  const allTags = [...new Set(entries.flatMap(e=>e.tags||[]))];

  const filtered = entries.filter(e=>{
    const lq=q.toLowerCase();
    return(!q||e.title?.toLowerCase().includes(lq)||plain(e.content).toLowerCase().includes(lq)||(e.tags||[]).some(t=>t.includes(lq)))
      &&(!fProj||e.projectId===fProj);
  });
  const grouped = filtered.reduce((acc,e)=>{const k=(e.createdAt||e.date||"").split("T")[0];(acc[k]=acc[k]||[]).push(e);return acc;},{});
  const days = Object.keys(grouped).sort((a,b)=>b.localeCompare(a));

  const save = async () => {
    const content = edRef.current?.innerHTML||"";
    if(!content||content==="<br>") return;
    setSaving(true);
    await addEntry(user.uid, {
      title: title.trim(),
      content,
      isRich: true,
      font,
      projectId: linked,
      tags,
      wordCount: wc(plain(content)),
    });
    setTitle(""); setFont("playfair"); setLinked(null); setTags([]);
    if(edRef.current) edRef.current.innerHTML="";
    setSaving(false);
    setMode("list");
  };

  const del = async (id) => {
    await deleteEntry(user.uid, id);
    setMode("list");
  };

  const addTag = () => { const t=tagIn.trim().toLowerCase(); if(t&&!tags.includes(t)) setTags(p=>[...p,t]); setTagIn(""); };

  // ── READ ──
  if(mode==="read"&&sel){
    const proj=projects.find(p=>p.id===sel.projectId);
    return(
      <div>
        <div style={{background:C.bgSoft,padding:"48px 20px 18px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <button onClick={()=>setMode("list")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.terra}}>
              <svg width="17" height="17" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" stroke={C.terra} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{fontFamily:FONTS.body,fontSize:12}}>Retour</span>
            </button>
            <button onClick={()=>del(sel.id)} style={{background:"none",border:"none",cursor:"pointer"}}>
              <svg width="17" height="17" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" stroke={C.muted} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
            </button>
          </div>
          <p style={{fontFamily:FONTS.body,fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase"}}>{sel.createdAt?fmtDate(sel.createdAt):""} · {wc(plain(sel.content))} mots</p>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>
            {proj&&<span style={{background:proj.color,color:"#fff",fontSize:9,padding:"2px 9px",borderRadius:20,fontFamily:FONTS.body}}>{proj.name}</span>}
            {(sel.tags||[]).map(t=><span key={t} style={{background:C.border,color:C.muted,fontSize:9,padding:"2px 8px",borderRadius:20,fontFamily:FONTS.body}}>#{t}</span>)}
          </div>
        </div>
        <div style={{padding:"22px 20px"}}>
          {sel.title&&<h2 style={{fontFamily:ff(sel.font),fontSize:21,color:C.text,fontWeight:600,marginBottom:14}}>{sel.title}</h2>}
          {sel.isRich
            ?<div style={{fontFamily:ff(sel.font),fontSize:15,color:C.text,lineHeight:1.9}} dangerouslySetInnerHTML={{__html:sel.content}}/>
            :<p style={{fontFamily:ff(sel.font),fontSize:15,color:C.text,lineHeight:1.9,whiteSpace:"pre-wrap"}}>{sel.content}</p>}
        </div>
      </div>
    );
  }

  // ── WRITE ──
  if(mode==="write"){
    return(
      <div>
        <div style={{background:C.bgSoft,padding:"48px 14px 0",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <button onClick={()=>setMode("list")} style={{background:"none",border:"none",cursor:"pointer",color:C.muted}}>
              <svg width="20" height="20" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <p style={{fontFamily:FONTS.body,fontSize:10,color:C.muted}}>{new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long"})} · {fmtTime(new Date().toISOString())}</p>
            <button onClick={save} disabled={saving} style={{background:C.terra,color:C.white,border:"none",borderRadius:20,padding:"6px 16px",fontFamily:FONTS.body,fontSize:12,cursor:"pointer"}}>
              {saving?"...":"Sauvegarder"}
            </button>
          </div>
          {/* Polices */}
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8}}>
            {FONT_OPTS.map(f=><button key={f.id} onClick={()=>setFont(f.id)} style={{padding:"3px 11px",borderRadius:20,border:`1px solid ${font===f.id?C.terra:C.border}`,background:font===f.id?C.terra:C.bg,color:font===f.id?C.white:C.muted,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",fontFamily:f.css,flexShrink:0}}>{f.label}</button>)}
          </div>
          {/* Toolbar */}
          <div style={{display:"flex",gap:2,padding:"5px 6px",background:C.bgCard,borderBottom:`1px solid ${C.border}`}}>
            {[["B","bold"],["I","italic"],["U","underline"],["•","insertUnorderedList"]].map(([lbl,cmd])=>(
              <button key={cmd} onMouseDown={e=>{e.preventDefault();document.execCommand(cmd,false,null);}} style={{padding:"5px 9px",borderRadius:6,border:"none",background:"none",cursor:"pointer",fontFamily:FONTS.body,fontSize:12,fontWeight:700,color:C.muted}}>{lbl}</button>
            ))}
            <div style={{width:1,background:C.border,margin:"2px 3px"}}/>
            {[["H1","h1"],["H2","h2"]].map(([lbl,tag])=>(
              <button key={tag} onMouseDown={e=>{e.preventDefault();document.execCommand("formatBlock",false,tag);}} style={{padding:"3px 7px",borderRadius:6,border:"none",background:"none",cursor:"pointer",fontFamily:FONTS.body,fontSize:10,color:C.muted,fontWeight:700}}>{lbl}</button>
            ))}
          </div>
        </div>
        <div style={{padding:"14px 20px"}}>
          <input placeholder="Titre (optionnel)" value={title} onChange={e=>setTitle(e.target.value)}
            style={{width:"100%",border:"none",borderBottom:`1px solid ${C.border}`,fontFamily:ff(font),fontSize:19,fontWeight:600,color:C.text,background:"transparent",outline:"none",marginBottom:12,paddingBottom:7,boxSizing:"border-box"}}/>
          <div ref={edRef} contentEditable suppressContentEditableWarning data-placeholder="Commence à écrire..."
            style={{minHeight:240,fontFamily:ff(font),fontSize:15,color:C.text,background:"transparent",outline:"none",lineHeight:1.9}}/>
          {/* Tags */}
          <div style={{marginTop:18,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
            <p style={{fontFamily:FONTS.body,fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Tags</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:7}}>
              {tags.map(t=><span key={t} onClick={()=>setTags(p=>p.filter(x=>x!==t))} style={{background:C.border,color:C.muted,fontSize:10,padding:"3px 9px",borderRadius:20,cursor:"pointer",fontFamily:FONTS.body}}>#{t} ×</span>)}
            </div>
            <div style={{display:"flex",gap:5}}>
              <input value={tagIn} onChange={e=>setTagIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag()} placeholder="Nouveau tag..." style={{flex:1,border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 9px",fontFamily:FONTS.body,fontSize:12,color:C.text,background:C.inputBg,outline:"none"}}/>
              <button onClick={addTag} style={{background:C.gold,color:C.white,border:"none",borderRadius:8,padding:"5px 11px",fontFamily:FONTS.body,fontSize:11,cursor:"pointer"}}>+</button>
            </div>
          </div>
          {/* Projet */}
          <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
            <p style={{fontFamily:FONTS.body,fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Lier à un projet</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              <button onClick={()=>setLinked(null)} style={{padding:"4px 11px",borderRadius:20,fontSize:10,cursor:"pointer",border:`1px solid ${!linked?C.terra:C.border}`,background:!linked?C.terra:C.bg,color:!linked?C.white:C.muted,fontFamily:FONTS.body}}>Aucun</button>
              {projects.map(p=><button key={p.id} onClick={()=>setLinked(p.id)} style={{padding:"4px 11px",borderRadius:20,fontSize:10,cursor:"pointer",border:`1px solid ${linked===p.id?p.color:C.border}`,background:linked===p.id?p.color:C.bg,color:linked===p.id?C.white:C.muted,fontFamily:FONTS.body}}>{p.name}</button>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST ──
  return(
    <div>
      <div style={{background:C.bgSoft,padding:"48px 20px 13px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div><h1 style={{fontFamily:FONTS.display,fontSize:22,color:C.text,fontWeight:600}}>Journal</h1><p style={{fontFamily:FONTS.body,fontSize:10,color:C.muted,marginTop:2}}>{entries.length} entrée(s)</p></div>
          <button onClick={()=>setMode("write")} style={{background:C.terra,color:C.white,border:"none",borderRadius:22,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 3px 12px ${C.terra}44`,fontSize:22,lineHeight:1}}>+</button>
        </div>
        <div style={{position:"relative",marginBottom:9}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.muted,fontSize:14}}>⌕</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher..." style={{width:"100%",padding:"8px 12px 8px 30px",border:`1px solid ${C.border}`,borderRadius:10,fontFamily:FONTS.body,fontSize:13,color:C.text,background:C.inputBg,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4}}>
          <button onClick={()=>setFProj(null)} style={{padding:"3px 9px",borderRadius:20,fontSize:9,cursor:"pointer",border:`1px solid ${!fProj?C.terra:C.border}`,background:!fProj?C.terra:C.bg,color:!fProj?C.white:C.muted,fontFamily:FONTS.body,whiteSpace:"nowrap"}}>Tous</button>
          {projects.map(p=><button key={p.id} onClick={()=>setFProj(fProj===p.id?null:p.id)} style={{padding:"3px 9px",borderRadius:20,fontSize:9,cursor:"pointer",border:`1px solid ${fProj===p.id?p.color:C.border}`,background:fProj===p.id?p.color:C.bg,color:fProj===p.id?C.white:C.muted,fontFamily:FONTS.body,whiteSpace:"nowrap"}}>{p.name}</button>)}
        </div>
      </div>
      <div style={{padding:"13px 20px 0"}}>
        {days.length===0?<p style={{textAlign:"center",fontFamily:FONTS.body,fontSize:13,color:C.muted,padding:"36px 0"}}>{q?"Aucun résultat.":"Commence à écrire ta première entrée ✍️"}</p>
        :days.map(day=>(
          <div key={day} style={{marginBottom:24}}>
            <p style={{fontFamily:FONTS.body,fontSize:9,color:C.muted,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:7}}>{fmtDate(day+"T12:00:00")}</p>
            {grouped[day].map(e=>{const proj=projects.find(p=>p.id===e.projectId);const words=wc(plain(e.content));return(
              <div key={e.id} onClick={()=>{setSel(e);setMode("read");}} style={{background:C.bgCard,padding:"13px",borderRadius:10,borderLeft:`2px solid ${proj?proj.color:C.border}`,cursor:"pointer",marginBottom:7}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <p style={{fontFamily:FONTS.body,fontSize:9,color:C.muted}}>{e.createdAt?fmtTime(e.createdAt):""} · {words} mots</p>
                  {proj&&<span style={{background:proj.color,color:"#fff",fontSize:8,padding:"2px 7px",borderRadius:20,fontFamily:FONTS.body}}>{proj.name}</span>}
                </div>
                {e.title&&<p style={{fontFamily:ff(e.font),fontSize:14,color:C.text,fontWeight:600,marginBottom:2}}>{e.title}</p>}
                <p style={{fontFamily:ff(e.font),fontSize:12,color:C.muted,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{plain(e.content)}</p>
                {(e.tags||[]).length>0&&<div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>{(e.tags||[]).map(t=><span key={t} style={{background:C.border,color:C.muted,fontSize:8,padding:"2px 6px",borderRadius:20,fontFamily:FONTS.body}}>#{t}</span>)}</div>}
              </div>
            );})}
          </div>
        ))}
      </div>
    </div>
  );
}
