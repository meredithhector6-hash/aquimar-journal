import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { listenEntries, listenProjects, listenProfile, saveProfile } from "./services";
import HomeView from "./views/HomeView";
import JournalView from "./views/JournalView";
import ProjectsView from "./views/ProjectsView";
import StatsView from "./views/StatsView";
import SettingsView from "./views/SettingsView";
import AuthScreen from "./views/AuthScreen";

// ─── THEMES ──────────────────────────────────────────────────────────
export const THEMES = {
  clair:     { name:"Clair",      bg:"#ffffff", bgSoft:"#faf7f2", bgCard:"#faf7f2", border:"#f0e6d8", terra:"#c4715a", gold:"#c9973f", text:"#2c2c2c", muted:"#7a7a7a", white:"#ffffff", navBg:"#ffffff", inputBg:"#ffffff" },
  sombre:    { name:"Sombre",     bg:"#1a1410", bgSoft:"#241c16", bgCard:"#2c211a", border:"#3d2e24", terra:"#d4836a", gold:"#d4a84f", text:"#f0e6d8", muted:"#a08878", white:"#ffffff", navBg:"#1a1410", inputBg:"#2c211a" },
  parchemin: { name:"Parchemin",  bg:"#f5f0e8", bgSoft:"#ede6d4", bgCard:"#ede6d4", border:"#d4c4a8", terra:"#8b4513", gold:"#b8860b", text:"#3c2a1a", muted:"#8b7355", white:"#f5f0e8", navBg:"#f5f0e8", inputBg:"#f5f0e8" },
  nuit:      { name:"Nuit bleue", bg:"#0f1419", bgSoft:"#16202a", bgCard:"#1e2d3d", border:"#2a3f55", terra:"#e07b54", gold:"#f0a030", text:"#e8eaed", muted:"#8899aa", white:"#ffffff", navBg:"#0f1419", inputBg:"#1e2d3d" },
};

export const FONTS = { display:"'Playfair Display',Georgia,serif", body:"'Lato','Helvetica Neue',sans-serif" };

// ─── BOTTOM NAV ──────────────────────────────────────────────────────
const NAV = [
  { id:"home",     label:"Accueil",  path:"M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" },
  { id:"journal",  label:"Journal",  path:"M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" },
  { id:"projects", label:"Projets",  path:"M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" },
  { id:"stats",    label:"Stats",    path:"M18 20v-10 M12 20v-16 M6 20v-6" },
  { id:"settings", label:"Réglages", path:"M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" },
];

const BottomNav = ({ tab, setTab, C }) => (
  <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.navBg, borderTop:`1px solid ${C.border}`, display:"flex", zIndex:100, paddingBottom:"env(safe-area-inset-bottom,4px)" }}>
    {NAV.map(n => (
      <button key={n.id} onClick={() => setTab(n.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"9px 0 7px", background:"none", border:"none", cursor:"pointer", color:tab===n.id?C.terra:C.muted }}>
        <svg width="20" height="20" viewBox="0 0 24 24" style={{display:"block",flexShrink:0}}>
          <path d={n.path} stroke={tab===n.id?C.terra:C.muted} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize:9, fontFamily:FONTS.body, fontWeight:tab===n.id?700:400, letterSpacing:"0.05em" }}>{n.label}</span>
      </button>
    ))}
  </nav>
);

// ─── LOADING ─────────────────────────────────────────────────────────
const Loading = () => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", background:"#faf7f2" }}>
    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:"#c4715a", fontWeight:600 }}>Aquim'@rt</p>
    <p style={{ fontFamily:"'Lato',sans-serif", fontSize:11, color:"#7a7a7a", marginTop:8, letterSpacing:"0.15em" }}>JOURNAL</p>
    <div style={{ marginTop:24, width:32, height:32, border:"2px solid #f0e6d8", borderTop:"2px solid #c4715a", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── APP ─────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState("home");
  const [activeProject, setActiveProject] = useState(null);
  const [entries, setEntries]         = useState([]);
  const [projects, setProjects]       = useState([]);
  const [themeName, setThemeName]     = useState("clair");

  const C = THEMES[themeName];

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Data listeners (se déclenchent quand user est connecté)
  useEffect(() => {
    if (!user) return;
    const unsubEntries  = listenEntries(user.uid, setEntries);
    const unsubProjects = listenProjects(user.uid, setProjects);
    const unsubProfile  = listenProfile(user.uid, profile => {
      if (profile?.theme) setThemeName(profile.theme);
    });
    return () => { unsubEntries(); unsubProjects(); unsubProfile(); };
  }, [user]);

  // Sauvegarde le thème dans Firebase quand il change
  const handleThemeChange = (name) => {
    setThemeName(name);
    if (user) saveProfile(user.uid, { theme: name });
  };

  if (loading) return <Loading />;
  if (!user)   return <AuthScreen onAuth={setUser} C={THEMES.clair} FONTS={FONTS} />;

  const shared = { C, FONTS, user, entries, projects, setTab, setActiveProject };

  return (
    <div style={{ maxWidth:430, margin:"0 auto", background:C.bg, minHeight:"100vh", fontFamily:FONTS.body, overflowX:"hidden" }}>
      <div style={{ overflowY:"auto", height:"100vh", paddingBottom:64 }}>
        {tab==="home"     && <HomeView     {...shared} />}
        {tab==="journal"  && <JournalView  {...shared} />}
        {tab==="projects" && <ProjectsView {...shared} activeProject={activeProject} />}
        {tab==="stats"    && <StatsView    {...shared} />}
        {tab==="settings" && <SettingsView {...shared} themeName={themeName} setThemeName={handleThemeChange} onSignOut={() => { signOut(auth); setUser(null); setEntries([]); setProjects([]); }} />}
      </div>
      <BottomNav tab={tab} setTab={t => { setTab(t); if(t!=="projects") setActiveProject(null); }} C={C} />
    </div>
  );
}
