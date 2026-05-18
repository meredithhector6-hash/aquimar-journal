import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function AuthScreen({ C, FONTS }) {
  const [mode, setMode]     = useState("login"); // login | register
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pw);
      } else {
        await createUserWithEmailAndPassword(auth, email, pw);
      }
    } catch (e) {
      const msgs = {
        "auth/user-not-found":    "Aucun compte trouvé avec cet e-mail.",
        "auth/wrong-password":    "Mot de passe incorrect.",
        "auth/email-already-in-use": "Cet e-mail est déjà utilisé.",
        "auth/weak-password":     "Le mot de passe doit faire au moins 6 caractères.",
        "auth/invalid-email":     "Adresse e-mail invalide.",
        "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
      };
      setError(msgs[e.code] || "Une erreur est survenue.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#faf7f2", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 28px" }}>
      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <p style={{ fontFamily:FONTS.display, fontSize:28, color:"#c4715a", fontWeight:700, letterSpacing:"0.02em" }}>Aquim'@rt</p>
        <p style={{ fontFamily:FONTS.body, fontSize:11, color:"#7a7a7a", letterSpacing:"0.25em", textTransform:"uppercase", marginTop:4 }}>Journal</p>
        <div style={{ width:40, height:2, background:"#c4715a", margin:"12px auto 0" }}/>
      </div>

      {/* Card */}
      <div style={{ width:"100%", maxWidth:360, background:"#ffffff", borderRadius:16, padding:"28px 24px", boxShadow:"0 4px 24px rgba(0,0,0,0.08)", border:"1px solid #f0e6d8" }}>
        <h2 style={{ fontFamily:FONTS.display, fontSize:18, color:"#2c2c2c", fontWeight:600, marginBottom:22 }}>
          {mode === "login" ? "Connexion" : "Créer un compte"}
        </h2>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontFamily:FONTS.body, fontSize:10, color:"#7a7a7a", letterSpacing:"0.15em", textTransform:"uppercase", display:"block", marginBottom:6 }}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.com"
              style={{ width:"100%", padding:"11px 13px", border:"1px solid #f0e6d8", borderRadius:9, fontFamily:FONTS.body, fontSize:14, color:"#2c2c2c", background:"#faf7f2", outline:"none", boxSizing:"border-box" }}
            />
          </div>
          <div>
            <label style={{ fontFamily:FONTS.body, fontSize:10, color:"#7a7a7a", letterSpacing:"0.15em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Mot de passe</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key==="Enter" && handle()}
              style={{ width:"100%", padding:"11px 13px", border:"1px solid #f0e6d8", borderRadius:9, fontFamily:FONTS.body, fontSize:14, color:"#2c2c2c", background:"#faf7f2", outline:"none", boxSizing:"border-box" }}
            />
          </div>

          {error && (
            <p style={{ fontFamily:FONTS.body, fontSize:12, color:"#c4715a", background:"#fdf0ec", padding:"8px 12px", borderRadius:7, borderLeft:"2px solid #c4715a" }}>{error}</p>
          )}

          <button onClick={handle} disabled={loading || !email || !pw}
            style={{ padding:"13px", background: loading||!email||!pw ? "#e0d4cc" : "#c4715a", color:"#ffffff", border:"none", borderRadius:9, fontFamily:FONTS.body, fontSize:12, letterSpacing:"0.15em", textTransform:"uppercase", cursor: loading||!email||!pw ? "not-allowed" : "pointer", marginTop:4 }}>
            {loading ? "..." : mode==="login" ? "Se connecter" : "Créer le compte"}
          </button>
        </div>

        <p style={{ textAlign:"center", marginTop:20, fontFamily:FONTS.body, fontSize:12, color:"#7a7a7a" }}>
          {mode==="login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <button onClick={() => { setMode(mode==="login"?"register":"login"); setError(""); }}
            style={{ background:"none", border:"none", color:"#c4715a", cursor:"pointer", fontFamily:FONTS.body, fontSize:12, fontWeight:700, padding:0 }}>
            {mode==="login" ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </div>

      <p style={{ fontFamily:FONTS.body, fontSize:10, color:"#b0a898", marginTop:28, textAlign:"center", letterSpacing:"0.1em" }}>
        Des faits, des idées, des gens.
      </p>
    </div>
  );
}
