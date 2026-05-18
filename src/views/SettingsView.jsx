import { useState } from "react";
import { THEMES, FONTS } from "../App";

export default function SettingsView({ C, themeName, setThemeName, onSignOut, user }) {
  const [wr, setWr]     = useState(true);
  const [wt, setWt]     = useState("08:00");
  const [tr, setTr]     = useState(true);
  const [da, setDa]     = useState(true);
  const [days, setDays] = useState(3);

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{ width:40, height:22, borderRadius:11, background:value?C.terra:C.border, position:"relative", cursor:"pointer", transition:"background .2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:value?21:3, width:16, height:16, borderRadius:"50%", background:C.white, transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
    </div>
  );

  return (
    <div>
      <div style={{ background:C.bgSoft, padding:"48px 20px 16px", borderBottom:`1px solid ${C.border}` }}>
        <h1 style={{ fontFamily:FONTS.display, fontSize:22, color:C.text, fontWeight:600 }}>Réglages</h1>
        {user && <p style={{ fontFamily:FONTS.body, fontSize:11, color:C.muted, marginTop:3 }}>{user.email}</p>}
      </div>
      <div style={{ padding:"16px 20px 0" }}>
        <p style={{ fontFamily:FONTS.body, fontSize:9, color:C.muted, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:11 }}>Thème</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:24 }}>
          {Object.entries(THEMES).map(([key, theme]) => (
            <button key={key} onClick={() => setThemeName(key)}
              style={{ background:theme.bgSoft, border:`2px solid ${themeName===key?theme.terra:theme.border}`, borderRadius:11, padding:"12px 11px", cursor:"pointer", textAlign:"left" }}>
              <div style={{ display:"flex", gap:5, marginBottom:7 }}>
                {[theme.terra, theme.gold, theme.bg].map((col,i) => <div key={i} style={{ width:13, height:13, borderRadius:"50%", background:col, border:"1px solid rgba(0,0,0,0.1)" }}/>)}
              </div>
              <p style={{ fontFamily:FONTS.body, fontSize:12, color:theme.text, fontWeight:themeName===key?700:400 }}>{theme.name}</p>
              {themeName===key && <p style={{ fontFamily:FONTS.body, fontSize:9, color:theme.terra, marginTop:2 }}>✓ Actif</p>}
            </button>
          ))}
        </div>

        <p style={{ fontFamily:FONTS.body, fontSize:9, color:C.muted, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:11 }}>Notifications</p>
        {[
          { label:"Rappel d'écriture quotidien", sub:"Te rappelle d'écrire chaque jour", value:wr, onChange:setWr, extra:wr&&<input type="time" value={wt} onChange={e=>setWt(e.target.value)} style={{ border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 8px", fontFamily:FONTS.body, fontSize:11, color:C.text, background:C.inputBg, outline:"none", marginTop:8 }}/> },
          { label:"Rappel de tâches", sub:"Notification à l'échéance d'une tâche", value:tr, onChange:setTr },
          { label:"Alerte deadline projet", sub:`Prévenir ${days} jours avant la fin`, value:da, onChange:setDa, extra:da&&<div style={{ display:"flex", gap:5, marginTop:8 }}>{[1,3,5,7].map(d=><button key={d} onClick={()=>setDays(d)} style={{ padding:"3px 9px", borderRadius:20, border:`1px solid ${days===d?C.terra:C.border}`, background:days===d?C.terra:C.bg, color:days===d?C.white:C.muted, fontSize:10, cursor:"pointer", fontFamily:FONTS.body }}>J-{d}</button>)}</div> },
        ].map((item, i) => (
          <div key={i} style={{ background:C.bgCard, padding:"13px", borderRadius:10, marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ fontFamily:FONTS.body, fontSize:13, color:C.text, fontWeight:600 }}>{item.label}</p>
                <p style={{ fontFamily:FONTS.body, fontSize:10, color:C.muted, marginTop:2 }}>{item.sub}</p>
              </div>
              <Toggle value={item.value} onChange={item.onChange}/>
            </div>
            {item.extra}
          </div>
        ))}

        <div style={{ marginTop:22, padding:"14px", background:C.bgCard, borderRadius:12, borderLeft:`2px solid ${C.terra}` }}>
          <p style={{ fontFamily:FONTS.display, fontSize:14, color:C.text, fontWeight:600 }}>Aquim'@rt Journal</p>
          <p style={{ fontFamily:FONTS.body, fontSize:11, color:C.muted, marginTop:3 }}>Version 2.0 · PWA + Firebase</p>
          <p style={{ fontFamily:FONTS.body, fontSize:11, color:C.muted, marginTop:2, fontStyle:"italic" }}>Des faits, des idées, des gens.</p>
        </div>

        <button onClick={onSignOut} style={{ width:"100%", marginTop:20, marginBottom:32, padding:"12px", background:"none", border:`1px solid ${C.border}`, borderRadius:10, fontFamily:FONTS.body, fontSize:12, color:C.muted, cursor:"pointer", letterSpacing:"0.1em" }}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
