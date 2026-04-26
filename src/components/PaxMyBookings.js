// ════ PaxDashboard.js ════════════════════════
import React, { useState, useEffect } from 'react';
import { bookingsAPI, flightsAPI, authAPI } from '../services/api';
import { KPI, pkr, OccBar, statusBadge, tierBadge } from './PaxComponents';

export function PaxDashboard({ user, navigate }) {
  const [bookings, setBookings] = useState([]);
  const [flights,  setFlights]  = useState([]);
  const [me,       setMe]       = useState(user);

  useEffect(()=>{
    Promise.all([bookingsAPI.getMyBookings(), flightsAPI.getAll(), authAPI.getMe()])
      .then(([bk,fl,u])=>{ setBookings(bk.data||[]); setFlights(fl.data||[]); setMe(u.user||user); })
      .catch(()=>{});
  },[]);

  const conf  = bookings.filter(b=>b.status==='Confirmed');
  const spent = conf.reduce((s,b)=>s+(b.fare||0),0);
  const tc    = { Gold:'tier-gold', Silver:'tier-silver', Bronze:'tier-bronze' };

  return (
    <div className="page-anim">
      <div className="grid-4 sgap">
        <KPI val={conf.length}                label="My Bookings"   sub="active reservations" icon="🎫" color="var(--primary)"/>
        <KPI val={(me.miles||0).toLocaleString()} label="Frequent Miles" sub="loyalty program"  icon="✈️" color="var(--cyan)"/>
        <KPI val={Math.round(spent/1000)+'K'} label="Total Spent"   sub="PKR lifetime"        icon="💰" color="var(--green)"/>
        <KPI val={me.tier||'Bronze'}           label="Loyalty Tier"  sub="membership level"    icon="⭐" color="var(--gold)"/>
      </div>
      <div className="grid-2 sgap">
        <div className="card cap">
          <div className="card-hdr"><h3><span>🎫</span>Recent Bookings</h3><button className="btn btn-ghost btn-sm" onClick={()=>navigate('p-mybk')}>View All</button></div>
          {conf.slice(0,4).map(b=>(
            <div key={b.id} style={{padding:'9px 0',borderBottom:'1px solid var(--bdr)'}}>
              <div style={{fontWeight:600,fontSize:13}}>{b.flightNumber} — {b.from} → {b.to}</div>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:10,color:'var(--text3)',marginTop:2}}>{b.ref} · {b.cls} · {pkr(b.fare)}</div>
            </div>
          ))}
          {!conf.length && <div className="empty" style={{padding:20}}>NO ACTIVE BOOKINGS</div>}
        </div>
        <div className="card cac">
          <div className="card-hdr"><h3><span>✈️</span>Available Flights</h3><button className="btn btn-ghost btn-sm" onClick={()=>navigate('p-flights')}>Browse</button></div>
          {flights.filter(f=>f.avail>0).slice(0,4).map(f=>(
            <div key={f.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid var(--bdr)'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:12}}>{f.number} — {f.from} → {f.to}</div>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:10,color:'var(--text3)',marginTop:2}}>{f.date} · {pkr(f.eco)}</div>
              </div>
              <OccBar avail={f.avail} seats={f.seats}/>
            </div>
          ))}
          {!flights.filter(f=>f.avail>0).length && <div className="empty" style={{padding:20}}>NO FLIGHTS AVAILABLE</div>}
        </div>
      </div>
    </div>
  );
}
export default PaxDashboard;

// ════ PaxFlights.js ══════════════════════════
export function PaxFlights({ navigate }) {
  const [flights, setFlights] = useState([]);
  useEffect(()=>{ flightsAPI.getAll().then(r=>setFlights(r.data||[])).catch(()=>{}); },[]);
  const sb = { Scheduled:'bc', Delayed:'bo', Boarding:'bg', Cancelled:'br' };
  return (
    <div className="page-anim">
      <div className="card cap">
        <div className="card-hdr"><h3><span>✈️</span>Available Flights</h3><button className="btn btn-p btn-sm" onClick={()=>navigate('p-book')}>Book a Seat →</button></div>
        <div className="tw">
          <table>
            <thead><tr><th>Flight</th><th>Route</th><th>Dep</th><th>Arr</th><th>Date</th><th>Seats Left</th><th>Economy</th><th>Business</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {flights.map(f=>(
                <tr key={f.id}>
                  <td className="tp2 mo" style={{fontWeight:700}}>{f.number}</td>
                  <td style={{fontWeight:500}}>{f.from} → {f.to}</td>
                  <td className="mu">{f.dep}</td><td className="mu">{f.arr}</td>
                  <td className="mu mo">{f.date}</td>
                  <td className="tg mo">{f.avail}/{f.seats}</td>
                  <td className="to mo">{pkr(f.eco)}</td>
                  <td className="tc mo">{pkr(f.biz)}</td>
                  <td><span className={`badge ${sb[f.status]||'bb'}`}>{f.status}</span></td>
                  <td><button className="btn btn-p btn-sm" onClick={()=>navigate('p-book')}>Book →</button></td>
                </tr>
              ))}
              {!flights.length && <tr><td colSpan={10}><div className="empty">NO FLIGHTS AVAILABLE</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════ PaxBook.js ═════════════════════════════
export function PaxBook({ user }) {
  const [flights, setFlights] = useState([]);
  const [fid,     setFid]     = useState('');
  const [cls,     setCls]     = useState('Economy');
  const [seat,    setSeat]    = useState('');
  const [result,  setResult]  = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(()=>{ flightsAPI.getAll().then(r=>setFlights((r.data||[]).filter(f=>f.avail>0))).catch(()=>{}); },[]);

  const updatePreview = (fid2, cls2) => {
    const f = flights.find(x=>x.id===parseInt(fid2||fid));
    if(!f){ setPreview('Select a flight to preview fare details.'); return; }
    const fare = cls2==='Business'?f.biz:f.eco;
    const miles = cls2==='Business'?Math.round(fare/1000*25):Math.round(fare/1000*10);
    setPreview(`Flight: ${f.number} — ${f.from} → ${f.to}\nDate: ${f.date} | Dep: ${f.dep} | Arr: ${f.arr}\nClass: ${cls2||cls} | Fare: ${pkr(fare)}\nMiles Earned: +${miles.toLocaleString()} | Available Seats: ${f.avail}`);
  };

  const book = async () => {
    if(!fid){ setResult({msg:'⚠ Please select a flight.',type:'w'}); return; }
    try {
      const res = await bookingsAPI.create({ flightId:parseInt(fid), cls, seat });
      const b = res.booking;
      setResult({msg:`✅ Booking confirmed!\nReference: ${b.ref}\nSeat: ${b.seat} | Class: ${b.cls}\nFare: ${pkr(b.fare)}\nMiles earned: +${(b.miles||0).toLocaleString()}`,type:'s'});
      setFid(''); setCls('Economy'); setSeat('');
    } catch(e){ setResult({msg:'✗ '+(e.message||'Booking failed.'),type:'e'}); }
  };

  return (
    <div className="page-anim">
      <div className="card cap sgap">
        <div className="card-hdr"><h3><span>🎫</span>Book a Flight</h3></div>
        <div className="grid-3">
          <div className="fg">
            <label className="fl">Select Flight</label>
            <select className="fs" value={fid} onChange={e=>{ setFid(e.target.value); updatePreview(e.target.value, cls); }}>
              <option value="">— Choose a flight —</option>
              {flights.map(f=><option key={f.id} value={f.id}>{f.number} — {f.from} → {f.to} | {f.date} | {f.avail} seats</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Class</label>
            <select className="fs" value={cls} onChange={e=>{ setCls(e.target.value); updatePreview(fid, e.target.value); }}>
              <option>Economy</option><option>Business</option>
            </select>
          </div>
          <div className="fg">
            <label className="fl">Seat Preference (optional)</label>
            <input className="fi" placeholder="e.g. 12A (auto-assigned if blank)" value={seat} onChange={e=>setSeat(e.target.value)}/>
          </div>
        </div>
        <div style={{padding:13,background:'var(--bg)',border:'1.5px solid var(--bdr)',borderRadius:'var(--r2)',fontFamily:'DM Mono,monospace',fontSize:11,color:'var(--text2)',lineHeight:1.9,whiteSpace:'pre-line'}}>
          {preview||'Select a flight to preview fare details.'}
        </div>
        <div className="fe"><button className="btn btn-p" onClick={book}>✈️ Confirm Booking</button></div>
        {result && <div className={`result-box r${result.type}`}>{result.msg}</div>}
      </div>
      <div className="card cac">
        <div className="card-hdr"><h3><span>ℹ️</span>Booking Information</h3></div>
        <div style={{fontSize:13,color:'var(--text2)',lineHeight:2.2}}>
          • Economy and Business class available on all routes<br/>
          • Seats confirmed instantly upon booking<br/>
          • Earn <span className="to">10 miles per PKR 1,000</span> (Economy) or <span className="to">25 miles per PKR 1,000</span> (Business)<br/>
          • Free cancellation 14+ days before departure (100% refund)<br/>
          • Loyalty tiers: 🥉 Bronze → 🥈 Silver (10K miles) → 🥇 Gold (50K miles)
        </div>
      </div>
    </div>
  );
}

// ════ PaxMyBookings.js ═══════════════════════
export function PaxMyBookings({ navigate }) {
  const [bookings, setBookings] = useState([]);
  useEffect(()=>{ bookingsAPI.getMyBookings().then(r=>setBookings(r.data||[])).catch(()=>{}); },[]);
  return (
    <div className="page-anim">
      <div className="card cap">
        <div className="card-hdr"><h3><span>📋</span>My Bookings</h3><button className="btn btn-p btn-sm" onClick={()=>navigate('p-book')}>+ New Booking</button></div>
        <div className="tw">
          <table>
            <thead><tr><th>Reference</th><th>Flight</th><th>Route</th><th>Date</th><th>Seat</th><th>Class</th><th>Fare</th><th>Miles</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {[...bookings].reverse().map(b=>(
                <tr key={b.id}>
                  <td className="mo tp2" style={{fontSize:10}}>{b.ref}</td>
                  <td className="to mo">{b.flightNumber||'—'}</td>
                  <td>{b.from&&b.to?`${b.from} → ${b.to}`:'—'}</td>
                  <td className="mu mo">{b.date||'—'}</td>
                  <td className="mo">{b.seat}</td><td>{b.cls}</td>
                  <td className="to mo">{pkr(b.fare)}</td>
                  <td className="tc mo">+{(b.miles||0).toLocaleString()}</td>
                  <td><span className={`badge ${b.status==='Confirmed'?'bg':'br'}`}>{b.status}</span></td>
                  <td>{b.status==='Confirmed'?<button className="btn btn-ghost btn-sm" onClick={()=>navigate('p-cancel')}>Cancel</button>:'—'}</td>
                </tr>
              ))}
              {!bookings.length && <tr><td colSpan={10}><div className="empty">NO BOOKINGS YET</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════ PaxCancel.js ═══════════════════════════
export function PaxCancel() {
  const [ref,     setRef]     = useState('');
  const [reason,  setReason]  = useState('Change of plans');
  const [result,  setResult]  = useState(null);
  const [active,  setActive]  = useState([]);

  useEffect(()=>{
    bookingsAPI.getMyBookings().then(r=>setActive((r.data||[]).filter(b=>b.status==='Confirmed'))).catch(()=>{});
  },[]);

  const doCancel = async () => {
    if(!ref){ setResult({msg:'⚠ Please enter a booking reference.',type:'w'}); return; }
    try {
      const res = await bookingsAPI.cancelByRef(ref, reason);
      const { refundAmount, refundPct } = res;
      setResult({msg:`✅ Booking ${ref} cancelled.\n\nRefund: ${pkr(refundAmount)} (${refundPct}%)\nProcessing: 3–5 business days\nReason: ${reason}`,type:'s'});
      setRef('');
      bookingsAPI.getMyBookings().then(r=>setActive((r.data||[]).filter(b=>b.status==='Confirmed'))).catch(()=>{});
    } catch(e){ setResult({msg:'✗ '+(e.message||'Cancellation failed.'),type:'e'}); }
  };

  return (
    <div className="page-anim">
      {/* Refund policy */}
      <div className="card cap sgap">
        <div className="card-hdr"><h3><span>📋</span>Refund Policy</h3></div>
        <div className="refund-grid">
          {[['14+ days','100%'],['7–13 days','75%'],['3–6 days','50%'],['1–2 days','25%'],['Same day','0%']].map(([d,p])=>(
            <div key={d} className="refund-cell"><div className="refund-days">{d}</div><div className="refund-pct">{p}</div></div>
          ))}
        </div>
        <p style={{fontSize:11,color:'var(--text3)',fontFamily:'DM Mono,monospace'}}>Business class passengers receive +10% refund bonus on all tiers.</p>
      </div>

      {/* Cancel form */}
      <div className="card car sgap">
        <div className="card-hdr"><h3><span>❌</span>Cancel a Booking</h3></div>
        <div className="grid-2">
          <div className="fg">
            <label className="fl">Booking Reference</label>
            <input className="fi" placeholder="SK-XXXXXXXX" value={ref} onChange={e=>setRef(e.target.value)}/>
          </div>
          <div className="fg">
            <label className="fl">Cancellation Reason</label>
            <select className="fs" value={reason} onChange={e=>setReason(e.target.value)}>
              {['Change of plans','Emergency','Flight delay','Better price found','Other'].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="fe"><button className="btn btn-r" onClick={doCancel}>❌ Cancel Booking</button></div>
        {result && <div className={`result-box r${result.type}`}>{result.msg}</div>}
      </div>

      {/* Active bookings */}
      <div className="card cac">
        <div className="card-hdr"><h3><span>📋</span>Your Active Bookings</h3></div>
        <div className="tw">
          <table>
            <thead><tr><th>Reference</th><th>Flight</th><th>Route</th><th>Date</th><th>Fare</th><th>Action</th></tr></thead>
            <tbody>
              {active.map(b=>(
                <tr key={b.id}>
                  <td className="mo tp2" style={{fontSize:10}}>{b.ref}</td>
                  <td className="to mo">{b.flightNumber||'—'}</td>
                  <td>{b.from&&b.to?`${b.from} → ${b.to}`:'—'}</td>
                  <td className="mu mo">{b.date||'—'}</td>
                  <td className="to mo">{pkr(b.fare)}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={()=>setRef(b.ref)}>Fill Ref</button></td>
                </tr>
              ))}
              {!active.length && <tr><td colSpan={6}><div className="empty">NO ACTIVE BOOKINGS</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════ PaxProfile.js ══════════════════════════
export function PaxProfile({ user }) {
  const [me, setMe] = useState(user);
  useEffect(()=>{ authAPI.getMe().then(r=>setMe(r.user||user)).catch(()=>{}); },[]);
  const [bk, setBk] = useState([]);
  useEffect(()=>{ bookingsAPI.getMyBookings().then(r=>setBk(r.data||[])).catch(()=>{}); },[]);
  const spent = bk.filter(b=>b.status==='Confirmed').reduce((s,b)=>s+(b.fare||0),0);
  const tc  = { Gold:'tier-gold', Silver:'tier-silver', Bronze:'tier-bronze' };

  return (
    <div className="page-anim">
      <div className="profile-header">
        <div style={{fontSize:44,marginBottom:10}}>✈️</div>
        <div style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:6}}>{me.name}</div>
        <span className={`tier-b ${tc[me.tier||'Bronze']}`}>{(me.tier||'BRONZE').toUpperCase()} MEMBER</span>
        <div className="profile-stats">
          <div><div className="ps-val">{bk.filter(b=>b.status==='Confirmed').length}</div><div className="ps-lbl">ACTIVE BOOKINGS</div></div>
          <div><div className="ps-val">{(me.miles||0).toLocaleString()}</div><div className="ps-lbl">FREQUENT MILES</div></div>
          <div><div className="ps-val">{pkr(spent)}</div><div className="ps-lbl">TOTAL SPENT</div></div>
        </div>
      </div>

      <div className="card cap">
        <div className="card-hdr"><h3><span>👤</span>Account Information</h3></div>
        {[
          ['Full Name',me.name],['Username',me.username],['Email',me.email||'Not set'],
          ['Phone',me.phone||'Not set'],['Passport No.',me.passport||'Not set'],
          ['Nationality',me.nationality||'Not set'],['Frequent Miles',(me.miles||0).toLocaleString()],
          ['Loyalty Tier',me.tier||'Bronze'],['Account Type',(me.role||'passenger').toUpperCase()]
        ].map(([l,v])=>(
          <div key={l} className="detail-row">
            <span className="dr-label">{l}</span>
            <span className="dr-value">{v}</span>
          </div>
        ))}
        <div style={{marginTop:12,padding:12,background:'var(--goldl)',border:'1px solid #fde68a',borderRadius:'var(--r2)',fontSize:12,color:'var(--gold)',lineHeight:2}}>
          <strong>Loyalty Tiers:</strong><br/>
          🥉 Bronze: 0–9,999 miles &nbsp;·&nbsp; 🥈 Silver: 10,000–49,999 miles &nbsp;·&nbsp; 🥇 Gold: 50,000+ miles
        </div>
      </div>
    </div>
  );
}
