import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import './App.css';
import { authAPI, flightsAPI, bookingsAPI, maintAPI } from './services/api';

import LoginPage       from './components/LoginPage';
import Dashboard       from './components/Dashboard';
import FlightsPage     from './components/FlightsPage';
import PassengersPage  from './components/PassengersPage';
import BookingsPage    from './components/BookingsPage';
import SeatMapPage     from './components/SeatMapPage';
import MaintenancePage from './components/MaintenancePage';
import BackupPage      from './components/BackupPage';
import CostModelPage   from './components/CostModelPage';
import IssueTracker    from './components/IssueTracker';
import PaxDashboard    from './components/PaxDashboard';
import PaxFlights      from './components/PaxFlights';
import PaxBook         from './components/PaxBook';
import PaxMyBookings   from './components/PaxMyBookings';
import PaxCancel       from './components/PaxCancel';
import PaxProfile      from './components/PaxProfile';

const ADMIN_NAV = [
  { id:'dashboard',   icon:'📊', label:'Dashboard'      },
  { id:'flights',     icon:'✈️', label:'Flights'         },
  { id:'passengers',  icon:'👤', label:'Passengers'      },
  { id:'bookings',    icon:'🎫', label:'Bookings'        },
  { id:'seatmap',     icon:'💺', label:'Seat Map'        },
];
const ADMIN_SE_NAV = [
  { id:'maintenance', icon:'🔧', label:'Maintenance Demo' },
  { id:'backup',      icon:'💾', label:'Backup & Restore' },
  { id:'costmodel',   icon:'💰', label:'Cost Model'       },
  { id:'issues',      icon:'📋', label:'Issue Tracker'    },
];
const PAX_NAV = [
  { id:'p-home',    icon:'🏠', label:'My Dashboard'   },
  { id:'p-flights', icon:'✈️', label:'Browse Flights'  },
  { id:'p-book',    icon:'🎫', label:'Book a Flight'   },
  { id:'p-mybk',    icon:'📋', label:'My Bookings'     },
  { id:'p-cancel',  icon:'❌', label:'Cancel & Refund' },
  { id:'p-profile', icon:'👤', label:'My Profile'      },
];
const PAGE_TITLES = {
  dashboard:   ['Dashboard',            'Overview of all airline operations'],
  flights:     ['Flight Management',    'Add and manage all scheduled flights'],
  passengers:  ['Passenger Management', 'Register and view passenger accounts'],
  bookings:    ['Booking Management',   'Create and manage seat reservations'],
  seatmap:     ['Seat Map Viewer',      'Interactive aircraft seat layout'],
  maintenance: ['Maintenance Demo',     'Live IEEE Std 1219 lifecycle simulation'],
  backup:      ['Backup & Recovery',    'System backup and restoration'],
  costmodel:   ['Cost Model',           'COCOMO II & maintenance cost analysis'],
  issues:      ['Issue Tracker',        'Log and track all maintenance issues'],
  'p-home':    ['My Dashboard',         'Your booking and account overview'],
  'p-flights': ['Browse Flights',       'View all available routes'],
  'p-book':    ['Book a Flight',        'Reserve your seat'],
  'p-mybk':    ['My Bookings',          'View all your reservations'],
  'p-cancel':  ['Cancel & Refund',      'Manage cancellations and refunds'],
  'p-profile': ['My Profile',           'Account details and loyalty status'],
};

function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return <div className="clock-box">{t}</div>;
}

export default function App() {
  const [user,        setUser]    = useState(null);
  const [page,        setPage]    = useState('dashboard');
  const [sidebarOpen, setSidebar] = useState(false);
  const [stats,       setStats]   = useState({ flights:0, passengers:0, bookings:0, issues:0 });
  const [sysOk,       setSysOk]   = useState(true);

  const refreshStats = useCallback(async () => {
    try {
      const [fl, ps, bk, iss] = await Promise.all([
        flightsAPI.getAll(), authAPI.getPassengers(),
        bookingsAPI.getAll(), maintAPI.getIssues(),
      ]);
      setStats({
        flights:    fl.data?.length || 0,
        passengers: ps.data?.length || 0,
        bookings:   (bk.data||[]).filter(b=>b.status==='Confirmed').length,
        issues:     (iss.data||[]).filter(i=>i.status!=='Resolved').length,
      });
    } catch {}
  }, []);

  useEffect(() => { if (user) refreshStats(); }, [user, refreshStats]);

  const handleLogin = (u) => {
    setUser(u);
    setPage(u.role === 'admin' ? 'dashboard' : 'p-home');
    toast.success(`Welcome, ${u.name}!`);
  };

  const handleLogout = () => {
    setUser(null); setPage('dashboard'); setSidebar(false);
    toast('Signed out.', { icon: '👋' });
  };

  const navigate = (p) => {
    setPage(p); setSidebar(false); refreshStats();
  };

  const renderPage = () => {
    const props = { user, navigate, refreshStats, setSysOk };
    switch (page) {
      case 'dashboard':   return <Dashboard       {...props} />;
      case 'flights':     return <FlightsPage     {...props} />;
      case 'passengers':  return <PassengersPage  {...props} />;
      case 'bookings':    return <BookingsPage     {...props} />;
      case 'seatmap':     return <SeatMapPage      {...props} />;
      case 'maintenance': return <MaintenancePage  {...props} />;
      case 'backup':      return <BackupPage       {...props} />;
      case 'costmodel':   return <CostModelPage    {...props} />;
      case 'issues':      return <IssueTracker     {...props} />;
      case 'p-home':      return <PaxDashboard     {...props} />;
      case 'p-flights':   return <PaxFlights       {...props} />;
      case 'p-book':      return <PaxBook          {...props} />;
      case 'p-mybk':      return <PaxMyBookings    {...props} />;
      case 'p-cancel':    return <PaxCancel        {...props} />;
      case 'p-profile':   return <PaxProfile       {...props} />;
      default:            return <Dashboard        {...props} />;
    }
  };

  const toastStyle = { style: { background:'#fff', color:'#1e2a3a', border:'1px solid #e2e6ea', boxShadow:'0 4px 12px rgba(0,0,0,0.10)' }};

  if (!user) return (
    <>
      <Toaster position="bottom-right" toastOptions={toastStyle} />
      <LoginPage onLogin={handleLogin} />
    </>
  );

  const isAdmin = user.role === 'admin';
  const [ptitle, psub] = PAGE_TITLES[page] || ['Page',''];
  const tierColors = { Gold:'var(--gold)', Silver:'var(--cyan)', Bronze:'#92400e' };
  const uvColor = isAdmin ? 'var(--primary)' : (tierColors[user.tier] || '#92400e');

  return (
    <div className="app-shell">
      <Toaster position="bottom-right" toastOptions={toastStyle} />

      {sidebarOpen && (
        <div onClick={() => setSidebar(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:199 }} />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sb-brand">
          <span style={{ fontSize:18, display:'block', marginBottom:4 }}>✈️</span>
          <h1>SKYLINE ARS</h1>
          <p>MANAGEMENT PORTAL</p>
        </div>

        {isAdmin && <>
          <div className="sb-section">Operations</div>
          {ADMIN_NAV.map(n => (
            <div key={n.id} className={`nav-item${page===n.id?' active':''}`} onClick={() => navigate(n.id)}>
              <span>{n.icon}</span> {n.label}
              {n.id==='flights'    && <span className="nav-badge nb-o">{stats.flights}</span>}
              {n.id==='passengers' && <span className="nav-badge nb-o">{stats.passengers}</span>}
              {n.id==='bookings'   && <span className="nav-badge nb-g">{stats.bookings}</span>}
            </div>
          ))}
          <div className="sb-section">System</div>
          {ADMIN_SE_NAV.map(n => (
            <div key={n.id} className={`nav-item${page===n.id?' active':''}`} onClick={() => navigate(n.id)}>
              <span>{n.icon}</span> {n.label}
              {n.id==='issues' && <span className="nav-badge nb-r">{stats.issues}</span>}
            </div>
          ))}
        </>}

        {!isAdmin && PAX_NAV.map(n => (
          <div key={n.id} className={`nav-item${page===n.id?' active':''}`} onClick={() => navigate(n.id)}>
            <span>{n.icon}</span> {n.label}
          </div>
        ))}

        <div className="sb-footer">
          <div className="user-pill">
            <div className="user-av" style={{ background: uvColor }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:12, fontWeight:600, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name}</p>
              <p style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--sbtext)', letterSpacing:1 }}>
                {user.role.toUpperCase()}{!isAdmin && user.tier ? ` · ${user.tier.toUpperCase()}` : ''}
              </p>
            </div>
            <button className="logout-x" onClick={handleLogout} title="Sign out">⏻</button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-area">
        <div className="topbar">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button className="hamburger-btn"
              onClick={() => setSidebar(o => !o)}
              style={{ display:'none', flexDirection:'column', gap:4, cursor:'pointer', padding:4, background:'none', border:'none' }}>
              <span style={{ display:'block', width:20, height:2, background:'var(--text2)', borderRadius:1 }} />
              <span style={{ display:'block', width:20, height:2, background:'var(--text2)', borderRadius:1 }} />
              <span style={{ display:'block', width:20, height:2, background:'var(--text2)', borderRadius:1 }} />
            </button>
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>{ptitle}</h2>
              <p style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:1, marginTop:1 }}>{psub.toUpperCase()}</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div className={`sys-badge ${sysOk?'ok':'bad'}`}>
              <span className="dot" />
              {sysOk ? 'SYSTEM HEALTHY' : 'SYSTEM CRITICAL'}
            </div>
            <Clock />
          </div>
        </div>

        <div className="content page-anim">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
