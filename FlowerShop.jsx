import { useState, useEffect, useRef } from "react";

// ─── MOCK AUTH DATA ───────────────────────────────────────────────────────────
const MOCK_USERS = [{ email: "demo@bloom.com", password: "demo1234" }];

// ─── FLOATING PETALS ─────────────────────────────────────────────────────────
function Petals() {
  const petals = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 6}s`,
    size: `${10 + Math.random() * 14}px`,
    color: ["#f9a8d4","#fbcfe8","#e9d5ff","#fde68a","#fca5a5","#c4b5fd"][i % 6],
    rotate: `${Math.random() * 360}deg`,
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {petals.map(p => (
        <div key={p.id} style={{
          position:"absolute",top:"-20px",left:p.left,
          width:p.size,height:p.size,borderRadius:"50% 0 50% 0",
          background:p.color,opacity:0.55,
          animation:`fall ${p.duration} ${p.delay} infinite linear`,
          transform:`rotate(${p.rotate})`,
        }}/>
      ))}
      <style>{`
        @keyframes fall {
          0%{transform:translateY(-20px) rotate(0deg);opacity:0.6}
          100%{transform:translateY(105vh) rotate(720deg);opacity:0}
        }
      `}</style>
    </div>
  );
}

// ─── CAPTCHA WIDGET ───────────────────────────────────────────────────────────
function CaptchaWidget({ verified, onVerify }) {
  const [checking, setChecking] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [selected, setSelected] = useState([]);
  const images = [
    { id:0, label:"🌹", isFlower:true },
    { id:1, label:"🚗", isFlower:false },
    { id:2, label:"🌷", isFlower:true },
    { id:3, label:"🏠", isFlower:false },
    { id:4, label:"🌸", isFlower:true },
    { id:5, label:"📱", isFlower:false },
    { id:6, label:"🌺", isFlower:true },
    { id:7, label:"✈️", isFlower:false },
    { id:8, label:"🌼", isFlower:true },
  ];
  const handleCheck = () => {
    if (verified) return;
    setChecking(true);
    setTimeout(() => { setChecking(false); setShowChallenge(true); }, 900);
  };
  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };
  const submitChallenge = () => {
    const correctFlowers = images.filter(i=>i.isFlower).map(i=>i.id);
    const correct = correctFlowers.every(id=>selected.includes(id)) && selected.length === correctFlowers.length;
    if (correct) { setShowChallenge(false); onVerify(true); }
    else { setSelected([]); }
  };
  return (
    <div style={{border:"1px solid #e2e8f0",borderRadius:12,background:"#fafafa",padding:"12px 16px",marginTop:4}}>
      {!showChallenge && !verified && (
        <div style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={handleCheck}>
          <div style={{
            width:22,height:22,border:"2px solid #94a3b8",borderRadius:4,display:"flex",
            alignItems:"center",justifyContent:"center",background:"white",flexShrink:0,
            transition:"all 0.2s",
          }}>
            {checking && <div style={{width:14,height:14,border:"2px solid #ec4899",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 0.6s linear infinite"}}/>}
          </div>
          <span style={{fontSize:14,color:"#374151",fontFamily:"serif"}}>I'm not a robot</span>
          <div style={{marginLeft:"auto",textAlign:"center"}}>
            <div style={{fontSize:22}}>🔒</div>
            <div style={{fontSize:9,color:"#94a3b8",lineHeight:1.2}}>reCAPTCHA<br/>Privacy·Terms</div>
          </div>
        </div>
      )}
      {verified && (
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:22,height:22,borderRadius:4,background:"#10b981",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{color:"white",fontSize:13,fontWeight:700}}>✓</span>
          </div>
          <span style={{fontSize:14,color:"#10b981",fontWeight:600}}>Verified!</span>
          <div style={{marginLeft:"auto",textAlign:"center"}}>
            <div style={{fontSize:22}}>🔒</div>
            <div style={{fontSize:9,color:"#94a3b8",lineHeight:1.2}}>reCAPTCHA<br/>Privacy·Terms</div>
          </div>
        </div>
      )}
      {showChallenge && (
        <div>
          <p style={{fontSize:13,color:"#374151",marginBottom:8,fontWeight:600}}>Select all images with flowers</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
            {images.map(img => (
              <div key={img.id} onClick={()=>toggleSelect(img.id)} style={{
                height:54,borderRadius:8,border:selected.includes(img.id)?"3px solid #ec4899":"2px solid #e2e8f0",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,cursor:"pointer",
                background:selected.includes(img.id)?"#fdf2f8":"white",transition:"all 0.15s",
              }}>{img.label}</div>
            ))}
          </div>
          <button onClick={submitChallenge} style={{
            width:"100%",padding:"8px",background:"#ec4899",color:"white",border:"none",
            borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",
          }}>Verify</button>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ onAuth, darkMode }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [captchaOk, setCaptchaOk] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = "Valid email required";
    if (!password || password.length < 6) e.password = "Min 6 characters";
    if (tab === "signup" && password !== confirm) e.confirm = "Passwords don't match";
    if (!captchaOk) e.captcha = "Please complete the CAPTCHA";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      if (tab === "login") {
        const user = MOCK_USERS.find(u => u.email === email && u.password === password);
        if (!user) { setLoading(false); setErrors({ general: "Invalid email or password. Try demo@bloom.com / demo1234" }); return; }
      }
      if (remember) localStorage.setItem("bloom_auth", JSON.stringify({ email }));
      else sessionStorage.setItem("bloom_auth", JSON.stringify({ email }));
      setLoading(false);
      onAuth(email);
    }, 1800);
  };

  const inputStyle = (err) => ({
    width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${err?"#f87171":"#e2e8f0"}`,
    fontSize:14,outline:"none",background: darkMode?"#1e1b4b":"white",
    color: darkMode?"#f8fafc":"#1e293b",boxSizing:"border-box",transition:"border 0.2s",
  });

  const bg = darkMode
    ? "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)"
    : "linear-gradient(135deg,#fff0f6 0%,#f3e8ff 40%,#e0f2fe 100%)";

  return (
    <div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",position:"relative"}}>
      <Petals />
      <div style={{
        width:"100%",maxWidth:460,background: darkMode?"rgba(30,27,75,0.85)":"rgba(255,255,255,0.88)",
        backdropFilter:"blur(16px)",borderRadius:24,padding:"40px 36px",
        boxShadow:"0 24px 60px rgba(236,72,153,0.18)",border:"1px solid rgba(236,72,153,0.15)",
        position:"relative",zIndex:1,
      }}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:40,marginBottom:4}}>🌸</div>
          <h1 style={{fontSize:26,fontWeight:700,color: darkMode?"#f9a8d4":"#9d174d",fontFamily:"'Georgia',serif",margin:0}}>Bloom & Blossom</h1>
          <p style={{fontSize:13,color: darkMode?"#c4b5fd":"#6b7280",margin:"4px 0 0"}}>Your premier floral destination</p>
        </div>

        <div style={{display:"flex",background: darkMode?"#312e81":"#f9f0f5",borderRadius:12,padding:4,marginBottom:24}}>
          {["login","signup"].map(t => (
            <button key={t} onClick={()=>{setTab(t);setErrors({});setCaptchaOk(false);}} style={{
              flex:1,padding:"9px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,
              background: tab===t?(darkMode?"#7c3aed":"white"):"transparent",
              color: tab===t?(darkMode?"white":"#9d174d"):(darkMode?"#c4b5fd":"#94a3b8"),
              boxShadow: tab===t?"0 2px 8px rgba(0,0,0,0.1)":"none",transition:"all 0.2s",
            }}>{t === "login" ? "Sign In" : "Sign Up"}</button>
          ))}
        </div>

        {errors.general && <div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#b91c1c"}}>{errors.general}</div>}

        <div style={{marginBottom:14}}>
          <label style={{fontSize:13,fontWeight:600,color: darkMode?"#c4b5fd":"#374151",display:"block",marginBottom:5}}>Email address</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle(errors.email)} onFocus={e=>e.target.style.borderColor="#ec4899"} onBlur={e=>e.target.style.borderColor=errors.email?"#f87171":"#e2e8f0"}/>
          {errors.email && <p style={{fontSize:12,color:"#ef4444",margin:"4px 0 0"}}>{errors.email}</p>}
        </div>

        <div style={{marginBottom: tab==="signup"?14:6,position:"relative"}}>
          <label style={{fontSize:13,fontWeight:600,color: darkMode?"#c4b5fd":"#374151",display:"block",marginBottom:5}}>Password</label>
          <div style={{position:"relative"}}>
            <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={{...inputStyle(errors.password),paddingRight:42}}/>
            <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:16}}>{showPass?"🙈":"👁"}</button>
          </div>
          {errors.password && <p style={{fontSize:12,color:"#ef4444",margin:"4px 0 0"}}>{errors.password}</p>}
        </div>

        {tab === "signup" && (
          <div style={{marginBottom:14}}>
            <label style={{fontSize:13,fontWeight:600,color: darkMode?"#c4b5fd":"#374151",display:"block",marginBottom:5}}>Confirm Password</label>
            <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="••••••••" style={inputStyle(errors.confirm)}/>
            {errors.confirm && <p style={{fontSize:12,color:"#ef4444",margin:"4px 0 0"}}>{errors.confirm}</p>}
          </div>
        )}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:13,color: darkMode?"#c4b5fd":"#6b7280"}}>
            <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{accentColor:"#ec4899"}}/>
            Remember me
          </label>
          {tab === "login" && <a href="#" style={{fontSize:13,color:"#ec4899",textDecoration:"none",fontWeight:500}}>Forgot password?</a>}
        </div>

        <div style={{marginBottom:16}}>
          <label style={{fontSize:13,fontWeight:600,color: darkMode?"#c4b5fd":"#374151",display:"block",marginBottom:6}}>Security Verification</label>
          <CaptchaWidget verified={captchaOk} onVerify={setCaptchaOk}/>
          {errors.captcha && <p style={{fontSize:12,color:"#ef4444",margin:"4px 0 0"}}>{errors.captcha}</p>}
        </div>

        <button onClick={submit} disabled={loading} style={{
          width:"100%",padding:"13px",background: loading?"#f9a8d4":"linear-gradient(135deg,#ec4899,#a855f7)",
          color:"white",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",
          boxShadow:"0 4px 20px rgba(236,72,153,0.4)",transition:"all 0.2s",letterSpacing:"0.3px",
        }}>
          {loading ? (
            <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <div style={{width:16,height:16,border:"2px solid white",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
              {tab==="login"?"Signing in…":"Creating account…"}
            </span>
          ) : tab==="login" ? "Sign In to Bloom 🌹" : "Create Account 🌷"}
        </button>

        <div style={{display:"flex",alignItems:"center",gap:10,margin:"20px 0 16px"}}>
          <div style={{flex:1,height:1,background:"#e2e8f0"}}/>
          <span style={{fontSize:12,color:"#94a3b8"}}>or continue with</span>
          <div style={{flex:1,height:1,background:"#e2e8f0"}}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["G","Google","#ea4335"],["f","Facebook","#1877f2"]].map(([icon,name,col])=>(
            <button key={name} onClick={()=>alert("Social login UI only — not wired in this demo")} style={{
              padding:"10px",borderRadius:10,border:"1.5px solid #e2e8f0",background: darkMode?"rgba(255,255,255,0.05)":"white",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",fontWeight:600,fontSize:13,
              color: darkMode?"#f8fafc":"#374151",transition:"all 0.2s",
            }}>
              <span style={{color:col,fontWeight:900,fontSize:15}}>{icon}</span>{name}
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── SHOP DATA ────────────────────────────────────────────────────────────────
const PRODUCTS = [
  {id:1,name:"Romantic Red Roses",price:49.99,emoji:"🌹",tag:"Bestseller",cat:"Roses"},
  {id:2,name:"Pastel Tulip Bunch",price:34.99,emoji:"🌷",tag:"New",cat:"Tulips"},
  {id:3,name:"Spring Mix Bouquet",price:42.99,emoji:"💐",tag:"Popular",cat:"Mixed"},
  {id:4,name:"Lavender Dreams",price:38.99,emoji:"🪻",tag:"Seasonal",cat:"Lavender"},
  {id:5,name:"White Lily Elegance",price:55.99,emoji:"🌸",tag:"Premium",cat:"Lilies"},
  {id:6,name:"Sunflower Sunshine",price:29.99,emoji:"🌻",tag:"Cheerful",cat:"Sunflowers"},
  {id:7,name:"Wedding Arch Blooms",price:149.99,emoji:"🌿",tag:"Wedding",cat:"Wedding"},
  {id:8,name:"Birthday Burst",price:44.99,emoji:"🎀",tag:"Gift",cat:"Birthday"},
];
const CATEGORIES = [
  {name:"Roses",emoji:"🌹",count:24},
  {name:"Tulips",emoji:"🌷",count:18},
  {name:"Wedding",emoji:"💍",count:32},
  {name:"Birthday",emoji:"🎂",count:20},
  {name:"Mixed",emoji:"💐",count:15},
  {name:"Lilies",emoji:"🌸",count:12},
];
const TESTIMONIALS = [
  {name:"Sofia R.",text:"The bouquet for my wedding was absolutely magical. Every bloom was fresh and perfectly arranged!",rating:5,avatar:"🧡"},
  {name:"James M.",text:"Ordered roses for our anniversary. They arrived beautifully packaged and lasted two full weeks!",rating:5,avatar:"💙"},
  {name:"Priya K.",text:"Best flower shop I've ever used. The lavender arrangement made my home smell incredible.",rating:5,avatar:"💜"},
];

// ─── SHOP PAGE ────────────────────────────────────────────────────────────────
function ShopPage({ user, onLogout, darkMode, setDarkMode }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i=>i.id===product.id);
      if (ex) return prev.map(i=>i.id===product.id?{...i,qty:i.qty+1}:i);
      return [...prev, {...product,qty:1}];
    });
    setToast(`${product.emoji} ${product.name} added to cart!`);
    setTimeout(()=>setToast(null), 2500);
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(i=>i.id!==id));
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);

  const filtered = activeCategory==="All" ? PRODUCTS : PRODUCTS.filter(p=>p.cat===activeCategory);

  const dm = darkMode;
  const bg = dm?"#0f0a1e":"#fff8fb";
  const card = dm?"rgba(30,20,60,0.95)":"rgba(255,255,255,0.9)";
  const text = dm?"#f9f0ff":"#1e1b2e";
  const muted = dm?"#c4b5fd":"#7c3aed";

  return (
    <div style={{minHeight:"100vh",background:bg,fontFamily:"'Georgia',serif",position:"relative"}}>
      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:50,background: dm?"rgba(15,10,30,0.95)":"rgba(255,248,251,0.92)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${dm?"#4c1d95":"#fce7f3"}`,padding:"0 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:28}}>🌸</span>
            <span style={{fontSize:20,fontWeight:700,color: dm?"#f9a8d4":"#9d174d"}}>Bloom & Blossom</span>
          </div>
          <div style={{display:"flex",gap:28,fontSize:14,fontWeight:500}}>
            {["Shop","Categories","Wedding","About"].map(l=>(
              <a key={l} href={`#${l.toLowerCase()}`} style={{color: dm?"#c4b5fd":"#6b21a8",textDecoration:"none",transition:"color 0.2s"}}>{l}</a>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setDarkMode(!dm)} style={{background:"none",border:`1px solid ${dm?"#7c3aed":"#fce7f3"}`,borderRadius:20,padding:"6px 12px",cursor:"pointer",fontSize:14,color:muted}}>{dm?"☀️ Light":"🌙 Dark"}</button>
            <button onClick={()=>setCartOpen(true)} style={{position:"relative",background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",border:"none",borderRadius:20,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:700}}>
              🛒 Cart
              {cartCount>0&&<span style={{position:"absolute",top:-6,right:-6,background:"#ef4444",color:"white",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{cartCount}</span>}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#ec4899,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:13,fontWeight:700}}>{user[0].toUpperCase()}</div>
              <button onClick={onLogout} style={{background:"none",border:"none",color:muted,cursor:"pointer",fontSize:13,fontWeight:500}}>Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* TOAST */}
      {toast && (
        <div style={{position:"fixed",bottom:24,right:24,background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",padding:"12px 20px",borderRadius:14,zIndex:200,fontSize:14,fontWeight:600,boxShadow:"0 8px 30px rgba(236,72,153,0.4)",animation:"slideUp 0.3s ease"}}>
          {toast}
        </div>
      )}

      {/* CART MODAL */}
      {cartOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",justifyContent:"flex-end"}}>
          <div style={{width:380,background: dm?"#1a0f3a":"white",height:"100vh",overflowY:"auto",padding:28,boxShadow:"-10px 0 40px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h2 style={{margin:0,fontSize:20,color:text}}>Your Cart 🛒</h2>
              <button onClick={()=>setCartOpen(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:muted}}>×</button>
            </div>
            {cart.length===0 ? <p style={{color:muted,textAlign:"center",marginTop:60}}>Your cart is empty 🌷</p> : (
              <>
                {cart.map(item=>(
                  <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,padding:12,background: dm?"rgba(255,255,255,0.05)":"#fdf4ff",borderRadius:12}}>
                    <span style={{fontSize:30}}>{item.emoji}</span>
                    <div style={{flex:1}}>
                      <p style={{margin:0,fontWeight:600,fontSize:14,color:text}}>{item.name}</p>
                      <p style={{margin:0,color:muted,fontSize:13}}>×{item.qty} · ${(item.price*item.qty).toFixed(2)}</p>
                    </div>
                    <button onClick={()=>removeFromCart(item.id)} style={{background:"#fce7f3",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",color:"#be185d",fontSize:13}}>✕</button>
                  </div>
                ))}
                <div style={{borderTop:`1px solid ${dm?"#4c1d95":"#fce7f3"}`,paddingTop:16,marginTop:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:16,color:text,marginBottom:16}}>
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                  <button style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer"}}>Checkout 🌹</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* HERO */}
      <section style={{background: dm?"linear-gradient(135deg,#1a0f3a,#2d1b69)":"linear-gradient(135deg,#fff0f6,#f3e8ff,#e0f2fe)",padding:"90px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <Petals/>
        <div style={{position:"relative",zIndex:1,maxWidth:700,margin:"0 auto"}}>
          <p style={{fontSize:13,letterSpacing:3,textTransform:"uppercase",color: dm?"#f9a8d4":"#ec4899",marginBottom:12,fontWeight:600}}>~ Fresh & Handcrafted ~</p>
          <h1 style={{fontSize:"clamp(38px,6vw,72px)",fontWeight:700,color: dm?"#f9f0ff":"#4a044e",lineHeight:1.1,marginBottom:20}}>
            Where Every Petal<br/>Tells a Story
          </h1>
          <p style={{fontSize:17,color: dm?"#c4b5fd":"#7c3aed",marginBottom:36,lineHeight:1.7}}>
            Handcrafted bouquets grown with love, delivered to your door fresh every morning.
          </p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="#shop" style={{padding:"14px 32px",background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",textDecoration:"none",borderRadius:30,fontWeight:700,fontSize:15,boxShadow:"0 8px 24px rgba(236,72,153,0.4)"}}>Shop Now 🌸</a>
            <a href="#categories" style={{padding:"14px 32px",border:`2px solid ${dm?"#a855f7":"#ec4899"}`,color: dm?"#c4b5fd":"#9d174d",textDecoration:"none",borderRadius:30,fontWeight:600,fontSize:15}}>Browse Collections</a>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" style={{padding:"72px 24px",maxWidth:1200,margin:"0 auto"}}>
        <h2 style={{textAlign:"center",fontSize:34,color: dm?"#f9a8d4":"#9d174d",marginBottom:8}}>Our Collections</h2>
        <p style={{textAlign:"center",color:muted,marginBottom:48,fontSize:16}}>Find the perfect arrangement for every occasion</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16}}>
          {CATEGORIES.map(cat=>(
            <div key={cat.name} onClick={()=>setActiveCategory(cat.name)} style={{
              background: card,borderRadius:18,padding:"24px 16px",textAlign:"center",cursor:"pointer",
              border:`2px solid ${activeCategory===cat.name?"#ec4899":dm?"#4c1d95":"#fce7f3"}`,
              backdropFilter:"blur(8px)",transition:"all 0.2s",boxShadow: activeCategory===cat.name?"0 8px 24px rgba(236,72,153,0.25)":"none",
            }}>
              <div style={{fontSize:36,marginBottom:8}}>{cat.emoji}</div>
              <p style={{fontWeight:700,color:text,margin:"0 0 4px",fontSize:14}}>{cat.name}</p>
              <p style={{color:muted,fontSize:12,margin:0}}>{cat.count} items</p>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP PRODUCTS */}
      <section id="shop" style={{padding:"0 24px 72px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32,flexWrap:"wrap",gap:12}}>
          <h2 style={{fontSize:34,color: dm?"#f9a8d4":"#9d174d",margin:0}}>Featured Bouquets</h2>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {["All",...new Set(PRODUCTS.map(p=>p.cat))].map(c=>(
              <button key={c} onClick={()=>setActiveCategory(c)} style={{
                padding:"7px 16px",borderRadius:20,border:`1.5px solid ${activeCategory===c?"#ec4899":dm?"#4c1d95":"#fce7f3"}`,
                background: activeCategory===c?"linear-gradient(135deg,#ec4899,#a855f7)":dm?"rgba(255,255,255,0.05)":"white",
                color: activeCategory===c?"white":muted,cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.2s",
              }}>{c}</button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:24}}>
          {filtered.map(product=>(
            <div key={product.id} className="product-card" style={{
              background:card,borderRadius:20,overflow:"hidden",border:`1px solid ${dm?"#4c1d95":"#fce7f3"}`,
              backdropFilter:"blur(8px)",transition:"all 0.25s",cursor:"pointer",
            }}>
              <div style={{height:180,background: dm?"linear-gradient(135deg,#2d1b69,#1e1b4b)":"linear-gradient(135deg,#fdf2f8,#f3e8ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:72,position:"relative"}}>
                {product.emoji}
                <span style={{position:"absolute",top:12,right:12,background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:12}}>{product.tag}</span>
              </div>
              <div style={{padding:18}}>
                <h3 style={{margin:"0 0 6px",fontSize:16,fontWeight:700,color:text}}>{product.name}</h3>
                <p style={{margin:"0 0 14px",color:muted,fontSize:13}}>Fresh · Hand-tied · Same-day delivery</p>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:20,fontWeight:700,color:"#ec4899"}}>${product.price}</span>
                  <button onClick={()=>addToCart(product)} style={{
                    padding:"8px 18px",background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",
                    border:"none",borderRadius:20,fontWeight:600,fontSize:13,cursor:"pointer",
                    boxShadow:"0 4px 14px rgba(236,72,153,0.3)",transition:"transform 0.15s",
                  }}>Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{background: dm?"linear-gradient(135deg,#1a0f3a,#2d1b69)":"linear-gradient(135deg,#fdf2f8,#f3e8ff)",padding:"72px 24px"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <h2 style={{textAlign:"center",fontSize:34,color: dm?"#f9a8d4":"#9d174d",marginBottom:8}}>Happy Customers 💕</h2>
          <p style={{textAlign:"center",color:muted,marginBottom:48,fontSize:16}}>Real stories from people who love their blooms</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24}}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} style={{background:card,borderRadius:20,padding:24,backdropFilter:"blur(8px)",border:`1px solid ${dm?"#4c1d95":"#fce7f3"}`}}>
                <div style={{fontSize:22,marginBottom:8}}>{"⭐".repeat(t.rating)}</div>
                <p style={{color:text,lineHeight:1.7,fontSize:15,margin:"0 0 16px",fontStyle:"italic"}}>"{t.text}"</p>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#ec4899,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{t.avatar}</div>
                  <span style={{fontWeight:700,color:muted,fontSize:14}}>{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="about" style={{padding:"72px 24px",maxWidth:600,margin:"0 auto",textAlign:"center"}}>
        <h2 style={{fontSize:34,color: dm?"#f9a8d4":"#9d174d",marginBottom:8}}>Get in Touch 🌷</h2>
        <p style={{color:muted,marginBottom:32,fontSize:16}}>Have a special request? We'd love to create something unique just for you.</p>
        <div style={{display:"grid",gap:14}}>
          <input placeholder="Your name" style={{padding:"13px 16px",borderRadius:12,border:`1.5px solid ${dm?"#4c1d95":"#fce7f3"}`,background:card,color:text,fontSize:14,outline:"none"}}/>
          <input placeholder="your@email.com" style={{padding:"13px 16px",borderRadius:12,border:`1.5px solid ${dm?"#4c1d95":"#fce7f3"}`,background:card,color:text,fontSize:14,outline:"none"}}/>
          <textarea placeholder="Tell us about your dream arrangement..." rows={4} style={{padding:"13px 16px",borderRadius:12,border:`1.5px solid ${dm?"#4c1d95":"#fce7f3"}`,background:card,color:text,fontSize:14,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
          <button style={{padding:"14px",background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:"0 8px 24px rgba(236,72,153,0.4)"}}>Send Message 💌</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background: dm?"#0a0618":"#4a044e",color:"white",padding:"40px 24px",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:8}}>🌸</div>
        <p style={{fontWeight:700,fontSize:18,marginBottom:4}}>Bloom & Blossom</p>
        <p style={{color:"rgba(255,255,255,0.6)",fontSize:14,marginBottom:20}}>Handcrafted with love · Est. 2018</p>
        <div style={{display:"flex",justifyContent:"center",gap:20,marginBottom:20}}>
          {["🌿 Instagram","🐦 Twitter","📘 Facebook","📌 Pinterest"].map(s=>(
            <a key={s} href="#" style={{color:"rgba(255,255,255,0.7)",textDecoration:"none",fontSize:13,transition:"color 0.2s"}}>{s}</a>
          ))}
        </div>
        <p style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>© 2026 Bloom & Blossom. All rights reserved.</p>
      </footer>

      <style>{`
        .product-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(236,72,153,0.2)!important}
        @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        *{box-sizing:border-box;}
      `}</style>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("bloom_auth") || sessionStorage.getItem("bloom_auth");
    if (stored) {
      try { setUser(JSON.parse(stored).email); } catch {}
    }
  }, []);

  const handleAuth = (email) => setUser(email);
  const handleLogout = () => {
    localStorage.removeItem("bloom_auth");
    sessionStorage.removeItem("bloom_auth");
    setUser(null);
  };

  if (!user) return <AuthPage onAuth={handleAuth} darkMode={darkMode} />;
  return <ShopPage user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />;
}
