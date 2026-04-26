import React, { useState, useEffect } from 'react';
import { flightsAPI, bookingsAPI } from '../services/api';
import { EmptyState, OccBar, pkr } from './PaxComponents';

export default function SeatMapPage() {
  const [flights,  setFlights]  = useState([]);
  const [bookings, setBookings] = useState([]);
  const [fid,      setFid]      = useState('');

  useEffect(()=>{
    Promise.all([flightsAPI.getAll(), bookingsAPI.getAll()])
      .then(([fl,bk])=>{ setFlights(fl.data||[]); setBookings(bk.data||[]); })
      .catch(()=>{});
  },[]);

  const flight = flights.find(f=>f.id===parseInt(fid));
  const taken  = bookings.filter(b=>b.flightId===parseInt(fid)&&b.status==='Confirmed').map(b=>b.seat);
  const rows   = flight ? Math.ceil(flight.seats/6) : 0;

  const cols    = ['A','B','C','D','E','F'];
  const colsDisp= ['A','B','C','','D','E','F'];

  return (
    <div className="page-anim">
      <div className="grid-2 sgap">
        <div className="card cap">
          <div className="card-hdr"><h3><span>✈️</span>Select Flight</h3></div>
          <div className="fg">
            <label className="fl">Flight</label>
            <select className="fs" value={fid} onChange={e=>setFid(e.target.value)}>
              <option value="">— Select a flight —</option>
              {flights.map(f=>(
                <option key={f.id} value={f.id}>{f.number} — {f.from} → {f.to} | {f.date}</option>
              ))}
            </select>
          </div>
          {flight && (
            <div className="mt12">
              <div className="grid-2">
                {[
                  ['Available',flight.avail,'var(--green)'],
                  ['Booked',flight.seats-flight.avail,'var(--red)'],
                ].map(([l,v,c])=>(
                  <div key={l} style={{padding:12,background:'var(--bg)',border:'1.5px solid var(--bdr)',borderRadius:'var(--r2)'}}>
                    <div style={{fontFamily:'DM Mono,monospace',fontSize:9,color:'var(--text3)',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>{l}</div>
                    <div style={{fontSize:28,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,padding:12,background:'var(--bg)',border:'1.5px solid var(--bdr)',borderRadius:'var(--r2)',fontSize:13,lineHeight:2}}>
                <div><strong className="tp2">{flight.number}</strong> — {flight.from} → {flight.to}</div>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:11,color:'var(--text2)'}}>Economy: <strong className="to">{pkr(flight.eco)}</strong></div>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:11,color:'var(--text2)'}}>Business: <strong className="tc">{pkr(flight.biz)}</strong></div>
              </div>
              <OccBar avail={flight.avail} seats={flight.seats}/>
            </div>
          )}
        </div>

        <div className="card cac">
          <div className="card-hdr"><h3><span>💺</span>Seat Layout</h3></div>
          {!flight
            ? <EmptyState icon="💺" text="SELECT A FLIGHT ABOVE"/>
            : <>
              {/* Column headers */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:4}}>
                {colsDisp.map((c,i)=>(
                  <div key={i} style={{textAlign:'center',fontFamily:'DM Mono,monospace',fontSize:9,color:'var(--text3)',fontWeight:700}}>{c}</div>
                ))}
              </div>
              {/* Seat rows */}
              <div style={{maxHeight:380,overflowY:'auto'}}>
                {Array.from({length:rows},(_,r)=>(
                  <div key={r} style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:4}}>
                    {colsDisp.map((c,ci)=>{
                      if(c==='') return <div key={ci} style={{background:'transparent'}}/>;
                      const sid=`${r+1}${c}`;
                      const tk=taken.includes(sid);
                      return (
                        <div key={sid} className={`seat ${tk?'seat-taken':'seat-avail'}`} title={sid}>
                          {sid}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div style={{display:'flex',gap:16,marginTop:12,flexWrap:'wrap'}}>
                {[['var(--greenl)','#bbf7d0','Available'],['var(--redl)','#fecaca','Taken']].map(([bg,bd,lbl])=>(
                  <div key={lbl} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'var(--text2)'}}>
                    <div style={{width:10,height:10,borderRadius:2,background:bg,border:`1px solid ${bd}`}}/>
                    {lbl}
                  </div>
                ))}
              </div>
            </>
          }
        </div>
      </div>
    </div>
  );
}
