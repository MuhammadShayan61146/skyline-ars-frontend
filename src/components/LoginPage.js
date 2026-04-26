import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const DEMO = [
  { label:'👑 System Administrator', badge:'ADMIN',  u:'admin',      p:'admin123', color:'var(--primary)' },
  { label:'🥈 Ahmed Hassan',          badge:'Silver', u:'passenger1', p:'pass123',  color:'var(--cyan)'    },
  { label:'🥉 Sara Ali',              badge:'Bronze', u:'passenger2', p:'pass123',  color:'#92400e'        },
  { label:'🥇 Usman Tariq',           badge:'Gold',   u:'passenger3', p:'pass123',  color:'var(--gold)'    },
];

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username || !password) { setError('Username and password are required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await authAPI.login({ username, password });
      onLogin(res.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  const fill = (u, p) => { setUsername(u); setPassword(p); setError(''); };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#1a2332 0%,#1e4db7 60%,#0891b2 100%)', padding:20 }}>
      <div style={{ width:'100%', maxWidth:440 }}>

        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <span style={{ fontSize:44, display:'block', marginBottom:10 }}>✈️</span>
          <h1 style={{ fontSize:26, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>SKYLINE ARS</h1>
          <p style={{ fontFamily:'DM Mono,monospace', fontSize:10, letterSpacing:3, color:'rgba(255,255,255,0.5)', marginTop:5 }}>AIRLINE RESERVATION MANAGEMENT SYSTEM</p>
        </div>

        {/* Card */}
        <div style={{ background:'#fff', borderRadius:12, padding:32, boxShadow:'0 24px 60px rgba(0,0,0,0.25)' }}>
          <h2 style={{ fontSize:14, fontWeight:600, color:'#4b5768', marginBottom:18, letterSpacing:'0.3px' }}>Sign in to your account</h2>

          {/* Hint */}
          <div style={{ background:'#eff4ff', border:'1px solid #c7d8ff', borderRadius:6, padding:'10px 13px', marginBottom:18, fontSize:12, color:'#1e4db7', lineHeight:1.6 }}>
            Use any account below or enter credentials manually.
          </div>

          {/* Username */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.8px', textTransform:'uppercase', color:'#4b5768', marginBottom:6 }}>Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              placeholder="Enter username" autoComplete="off"
              style={{ width:'100%', padding:'10px 13px', background:'#f0f2f5', border:'1.5px solid #e2e6ea', borderRadius:6, color:'#1e2a3a', fontFamily:'Inter,sans-serif', fontSize:14, outline:'none', transition:'border-color .2s' }}
              onFocus={e=>e.target.style.borderColor='#1e4db7'}
              onBlur={e=>e.target.style.borderColor='#e2e6ea'} />
          </div>

          {/* Password */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.8px', textTransform:'uppercase', color:'#4b5768', marginBottom:6 }}>Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              type="password" placeholder="••••••••"
              style={{ width:'100%', padding:'10px 13px', background:'#f0f2f5', border:'1.5px solid #e2e6ea', borderRadius:6, color:'#1e2a3a', fontFamily:'Inter,sans-serif', fontSize:14, outline:'none', transition:'border-color .2s' }}
              onFocus={e=>e.target.style.borderColor='#1e4db7'}
              onBlur={e=>e.target.style.borderColor='#e2e6ea'} />
          </div>

          {error && <p style={{ fontSize:12, color:'#dc2626', textAlign:'center', marginBottom:10 }}>{error}</p>}

          {/* Login */}
          <button onClick={handleLogin} disabled={loading}
            style={{ width:'100%', padding:12, background:'#1e4db7', border:'none', borderRadius:6, color:'#fff', fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:600, cursor:loading?'not-allowed':'pointer', opacity:loading?.7:1, transition:'all .2s', letterSpacing:'0.3px' }}
            onMouseEnter={e=>{ if(!loading) e.target.style.background='#2563eb'; }}
            onMouseLeave={e=>{ e.target.style.background='#1e4db7'; }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>

          {/* Demo accounts */}
          <div style={{ marginTop:20, border:'1.5px solid #e2e6ea', borderRadius:6, overflow:'hidden' }}>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:2.5, color:'#8fa3be', padding:'8px 13px', background:'#f8f9fb', borderBottom:'1px solid #e2e6ea', textTransform:'uppercase' }}>
              Quick Access — Click to Auto-Fill
            </div>
            {DEMO.map((d, i) => (
              <div key={i} onClick={() => fill(d.u, d.p)}
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 13px', cursor:'pointer', borderBottom:i<DEMO.length-1?'1px solid #e2e6ea':'none', fontSize:13, transition:'background .15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#eff4ff'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span style={{ color:'#1e2a3a', fontWeight:500 }}>
                  {d.label} <span style={{ fontFamily:'DM Mono,monospace', fontSize:9, padding:'2px 7px', borderRadius:10, background:'#f0f2f5', color:d.color, fontWeight:600 }}>{d.badge}</span>
                </span>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'#1e4db7', fontWeight:500 }}>{d.u}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:16, fontFamily:'DM Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.35)', letterSpacing:2 }}>
          DAWOOD UNIVERSITY · SOFTWARE ENGINEERING · 2025
        </p>
      </div>
    </div>
  );
}
