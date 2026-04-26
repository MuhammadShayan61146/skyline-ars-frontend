import React, { useState, useEffect } from 'react';
import { flightsAPI, bookingsAPI, authAPI } from '../services/api';
import { EmptyState, statusBadge, pkr, ResultBox } from './PaxComponents';
import { toast } from 'react-hot-toast';

export default function BookingsPage({ refreshStats }) {
  const [bookings,   setBookings]   = useState([]);
  const [flights,    setFlights]    = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [flightId,   setFlightId]   = useState('');
  const [passId,     setPassId]     = useState('');
  const [cls,        setCls]        = useState('Economy');
  const [seat,       setSeat]       = useState('');
  const [result,     setResult]     = useState(null);
  const [filter,     setFilter]     = useState('all');

  const load = () => {
    Promise.all([bookingsAPI.getAll(), flightsAPI.getAll(), authAPI.getPassengers()])
      .then(([bk,fl,ps])=>{ setBookings(bk.data||[]); setFlights(fl.data||[]); setPassengers(ps.data||[]); })
      .catch(()=>{});
  };
  useEffect(()=>{ load(); },[]);

  const book = async () => {
    if(!flightId||!passId) return toast.error('Please select a flight and passenger.');
    setResult(null);
    try {
      const res = await bookingsAPI.create({ flightId:parseInt(flightId), passengerId:parseInt(passId), cls, seat });
      const b = res.booking;
      setResult({ msg:`✅ Booking confirmed!\nReference: ${b.ref}\nSeat: ${b.seat} | Class: ${b.cls}\nFare: ${pkr(b.fare)} | Miles: +${b.miles||0}`, type:'s' });
      setFlightId(''); setPassId(''); setSeat(''); setCls('Economy');
      load(); refreshStats();
      toast.success('Booking confirmed!');
    } catch(e){ setResult({ msg:'✗ '+( e.message||'Booking failed.'), type:'e' }); }
  };

  const cancel = async (id, ref) => {
    if(!window.confirm(`Cancel booking ${ref}?`)) return;
    try {
      await bookingsAPI.cancel(id); load(); refreshStats();
      toast(`Booking ${ref} cancelled.`, { icon:'❌' });
    } catch(e){ toast.error(e.message||'Failed.'); }
  };

  const displayed = filter==='all' ? bookings : bookings.filter(b=>b.status===filter);

  return (
    <div className="page-anim">
      <div className="card cap sgap">
        <div className="card-hdr"><h3><span>🎫</span>Create New Booking</h3></div>
        <div className="grid-3">
          <div className="fg">
            <label className="fl">Select Flight</label>
            <select className="fs" value={flightId} onChange={e=>setFlightId(e.target.value)}>
              <option value="">— Choose a flight —</option>
              {flights.filter(f=>f.avail>0).map(f=>(
                <option key={f.id} value={f.id}>{f.number} — {f.from} → {f.to} ({f.avail} seats)</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Select Passenger</label>
            <select className="fs" value={passId} onChange={e=>setPassId(e.target.value)}>
              <option value="">— Choose a passenger —</option>
              {passengers.map(p=>(
                <option key={p.id} value={p.id}>{p.name} ({p.username})</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Class</label>
            <select className="fs" value={cls} onChange={e=>setCls(e.target.value)}>
              <option>Economy</option><option>Business</option>
            </select>
          </div>
          <div className="fg">
            <label className="fl">Seat Preference (optional)</label>
            <input className="fi" placeholder="e.g. 12A (auto-assigned if blank)" value={seat} onChange={e=>setSeat(e.target.value)}/>
          </div>
        </div>
        <div className="fe">
          <button className="btn btn-p" onClick={book}>✅ Confirm Booking</button>
        </div>
        {result && <ResultBox msg={result.msg} type={result.type}/>}
      </div>

      <div className="card">
        <div className="card-hdr">
          <h3><span>📋</span>All Bookings</h3>
          <div className="fc">
            {['all','Confirmed','Cancelled'].map(f=>(
              <button key={f} className={`btn btn-sm ${filter===f?'btn-p':'btn-ghost'}`} onClick={()=>setFilter(f)}>
                {f==='all'?'All':f}
              </button>
            ))}
          </div>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Reference</th><th>Passenger</th><th>Flight</th><th>Route</th><th>Date</th><th>Seat</th><th>Class</th><th>Fare</th><th>Miles</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {[...displayed].reverse().map(b=>(
                <tr key={b.id}>
                  <td className="mo tp2" style={{fontSize:10}}>{b.ref}</td>
                  <td style={{fontWeight:500}}>{b.passengerName||'—'}</td>
                  <td className="to mo">{b.flightNumber||'—'}</td>
                  <td>{b.from&&b.to?`${b.from} → ${b.to}`:'—'}</td>
                  <td className="mu mo">{b.date||'—'}</td>
                  <td className="mo">{b.seat}</td>
                  <td>{b.cls}</td>
                  <td className="to mo">{pkr(b.fare)}</td>
                  <td className="tc mo">+{(b.miles||0).toLocaleString()}</td>
                  <td><span className={`badge ${statusBadge(b.status)}`}>{b.status}</span></td>
                  <td>
                    {b.status==='Confirmed'
                      ? <button className="btn btn-r btn-sm" onClick={()=>cancel(b.id,b.ref)}>Cancel</button>
                      : '—'}
                  </td>
                </tr>
              ))}
              {!displayed.length && <tr><td colSpan={11}><EmptyState icon="🎫" text="NO BOOKINGS FOUND"/></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
