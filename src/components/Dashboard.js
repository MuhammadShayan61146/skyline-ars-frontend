import React, { useState, useEffect } from 'react';
import { flightsAPI, bookingsAPI, maintAPI, authAPI } from '../services/api';
import { KPI, pkr, EmptyState, OccBar, statusBadge, LogEntry } from './PaxComponents';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard({ navigate }) {
  const [flights,  setFlights]  = useState([]);
  const [bookings, setBookings] = useState([]);
  const [issues,   setIssues]   = useState([]);
  const [logs,     setLogs]     = useState([]);
  const [pax,      setPax]      = useState([]);

  useEffect(() => {
    Promise.all([
      flightsAPI.getAll(), bookingsAPI.getAll(),
      maintAPI.getIssues(), maintAPI.getLogs(), authAPI.getPassengers()
    ]).then(([fl,bk,iss,lg,ps]) => {
      setFlights(fl.data||[]);  setBookings(bk.data||[]);
      setIssues((iss.data||[]).filter(i=>i.status!=='Resolved'));
      setLogs(lg.data||[]); setPax(ps.data||[]);
    }).catch(()=>{});
  }, []);

  const confirmed = bookings.filter(b=>b.status==='Confirmed').length;
  const cancelled = bookings.filter(b=>b.status==='Cancelled').length;
  const revenue   = bookings.filter(b=>b.status==='Confirmed').reduce((s,b)=>s+(b.fare||0),0);

  const chartData = {
    labels: ['Confirmed','Cancelled'],
    datasets:[{ data:[confirmed,cancelled],
      backgroundColor:['rgba(22,163,74,0.75)','rgba(220,38,38,0.75)'],
      borderColor:['#16a34a','#dc2626'], borderWidth:2 }]
  };
  const chartOpts = { responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ labels:{ color:'#4b5768', font:{ family:'DM Mono', size:10 }, padding:12 }}} };

  return (
    <div className="page-anim">
      <div className="grid-4 sgap">
        <KPI val={flights.length}  label="Total Flights"      sub="active routes"     icon="✈️" color="var(--primary)" />
        <KPI val={pax.length}      label="Passengers"         sub="registered"        icon="👤" color="var(--gold)"    />
        <KPI val={confirmed}       label="Active Bookings"    sub={cancelled+' cancelled'} icon="🎫" color="var(--green)" />
        <KPI val={issues.length}   label="Open Issues"        sub="maintenance tracker" icon="⚠️" color="var(--red)"  />
      </div>

      <div className="grid-m sgap">
        {/* Left col */}
        <div>
          {/* Recent bookings */}
          <div className="card cap sgap">
            <div className="card-hdr">
              <h3><span>🎫</span>Recent Bookings</h3>
              <button className="btn btn-ghost btn-sm" onClick={()=>navigate('bookings')}>View All</button>
            </div>
            <div className="tw">
              <table>
                <thead><tr><th>Reference</th><th>Passenger</th><th>Flight</th><th>Route</th><th>Status</th></tr></thead>
                <tbody>
                  {[...bookings].reverse().slice(0,6).map(b=>(
                    <tr key={b.id}>
                      <td className="mo tp2" style={{fontSize:10}}>{b.ref}</td>
                      <td style={{fontWeight:500}}>{b.passengerName||'—'}</td>
                      <td className="to mo">{b.flightNumber||'—'}</td>
                      <td>{b.from&&b.to?`${b.from} → ${b.to}`:'—'}</td>
                      <td><span className={`badge ${statusBadge(b.status)}`}>{b.status}</span></td>
                    </tr>
                  ))}
                  {!bookings.length && <tr><td colSpan={5}><EmptyState icon="🎫" text="NO BOOKINGS YET"/></td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue + chart */}
          <div className="grid-2">
            <div className="card cagr">
              <div className="card-hdr"><h3><span>💰</span>Revenue</h3></div>
              <div style={{fontSize:32,fontWeight:800,color:'var(--green)',letterSpacing:'-1px',lineHeight:1}}>{pkr(revenue)}</div>
              <div style={{fontSize:11,color:'var(--text2)',marginTop:5}}>From confirmed bookings</div>
              <div className="divider"/>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                <span style={{color:'var(--text2)'}}>Confirmed</span><span className="tg">{confirmed}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginTop:6}}>
                <span style={{color:'var(--text2)'}}>Cancelled</span><span className="tr">{cancelled}</span>
              </div>
            </div>
            <div className="card cac">
              <div className="card-hdr"><h3><span>📊</span>Booking Split</h3></div>
              <div style={{height:160}}>
                <Doughnut data={chartData} options={chartOpts}/>
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div>
          {/* Flight status */}
          <div className="card cac sgap">
            <div className="card-hdr">
              <h3><span>✈️</span>Flight Status</h3>
              <button className="btn btn-ghost btn-sm" onClick={()=>navigate('flights')}>View All</button>
            </div>
            {flights.slice(0,6).map(f=>(
              <div key={f.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid var(--bdr)'}}>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:11,fontWeight:700,color:'var(--primary)',width:64,flexShrink:0}}>{f.number}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500,marginBottom:3}}>{f.from} → {f.to}</div>
                  <OccBar avail={f.avail} seats={f.seats}/>
                </div>
                <span className={`badge ${statusBadge(f.status)}`} style={{flexShrink:0}}>{f.status}</span>
              </div>
            ))}
            {!flights.length && <EmptyState icon="✈️" text="NO FLIGHTS"/>}
          </div>

          {/* Open issues */}
          <div className="card car">
            <div className="card-hdr">
              <h3><span>⚠️</span>Open Issues</h3>
              <button className="btn btn-ghost btn-sm" onClick={()=>navigate('issues')}>View All</button>
            </div>
            {issues.slice(0,5).map(i=>(
              <div key={i.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid var(--bdr)'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{i.module}</div>
                  <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{(i.desc||'').slice(0,50)}…</div>
                </div>
                <span className={`badge ${statusBadge(i.severity)}`} style={{flexShrink:0,marginLeft:10}}>{i.severity}</span>
              </div>
            ))}
            {!issues.length && <EmptyState icon="✅" text="ALL ISSUES RESOLVED"/>}
          </div>

          {/* Activity log */}
          <div className="card cag mt12">
            <div className="card-hdr"><h3><span>📋</span>Activity Log</h3></div>
            <div className="log-wrap">
              {logs.slice(0,8).map((l,i)=>(
                <LogEntry key={i} msg={l.message||l.description} type={l.type||'info'} time={l.timestamp?.slice(11,19)}/>
              ))}
              {!logs.length && <div className="log-entry info"><div className="log-time">—</div><div>System initialized. All modules online.</div></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
