// ═══════════════════════════════════════════
//  FlightsPage.js
// ═══════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { flightsAPI, bookingsAPI } from '../services/api';
import { EmptyState, OccBar, statusBadge, pkr } from './PaxComponents';
import { toast } from 'react-hot-toast';

export function FlightsPage({ refreshStats }) {
  const [flights, setFlights] = useState([]);
  const [form, setForm] = useState({ number:'',from:'',to:'',dep:'',arr:'',date:'',seats:'',eco:'',biz:'',status:'Scheduled' });

  const load = () => flightsAPI.getAll().then(r=>setFlights(r.data||[])).catch(()=>{});
  useEffect(()=>{ load(); },[]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const add = async () => {
    const { number,from,to,dep,arr,date,seats,eco,biz,status } = form;
    if(!number||!from||!to||!dep||!arr||!date||!seats||!eco||!biz) return toast.error('All fields are required.');
    if(isNaN(seats)||parseInt(seats)<1) return toast.error('Seats must be a positive number.');
    if(isNaN(eco)||isNaN(biz)) return toast.error('Fare must be a valid number.');
    try {
      await flightsAPI.add({ number,from,to,dep,arr,date,seats:parseInt(seats),eco:parseFloat(eco),biz:parseFloat(biz),status });
      setForm({ number:'',from:'',to:'',dep:'',arr:'',date:'',seats:'',eco:'',biz:'',status:'Scheduled' });
      load(); refreshStats();
      toast.success(`Flight ${number} added!`);
    } catch(e){ toast.error(e.message||'Failed to add flight.'); }
  };

  const del = async (id, number) => {
    if(!window.confirm(`Delete flight ${number}? This cannot be undone.`)) return;
    try {
      await flightsAPI.delete(id); load(); refreshStats();
      toast(`Flight ${number} deleted.`, { icon:'🗑️' });
    } catch(e){ toast.error(e.message||'Cannot delete.'); }
  };

  const changeStatus = async (id, number) => {
    const s = prompt('New status (Scheduled/Boarding/Delayed/Cancelled):', 'Scheduled');
    if(!s) return;
    try {
      await flightsAPI.updateStatus(id, s); load();
      toast.success(`${number} → ${s}`);
    } catch(e){ toast.error(e.message||'Failed.'); }
  };

  return (
    <div className="page-anim">
      <div className="card cap sgap">
        <div className="card-hdr"><h3><span>➕</span>Add New Flight</h3></div>
        <div className="grid-3">
          {[['Flight Number','number','e.g. SK-101','text'],['From','from','e.g. Karachi','text'],['To','to','e.g. Dubai','text'],
            ['Departure','dep','08:30','text'],['Arrival','arr','10:45','text'],['Date','date','','date'],
            ['Total Seats','seats','60','number'],['Economy Fare (PKR)','eco','12500','number'],['Business Fare (PKR)','biz','35000','number']
          ].map(([lbl,k,ph,type])=>(
            <div className="fg" key={k}>
              <label className="fl">{lbl}</label>
              <input className="fi" type={type} placeholder={ph} value={form[k]} onChange={e=>set(k,e.target.value)}/>
            </div>
          ))}
        </div>
        <div className="fe"><button className="btn btn-p" onClick={add}>➕ Add Flight</button></div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <h3><span>✈️</span>All Flights</h3>
          <span className="badge bb">{flights.length} flights</span>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Flight</th><th>Route</th><th>Dep</th><th>Arr</th><th>Date</th><th>Available</th><th>Occupancy</th><th>Economy</th><th>Business</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {flights.map(f=>(
                <tr key={f.id}>
                  <td className="tp2 mo" style={{fontWeight:700}}>{f.number}</td>
                  <td style={{fontWeight:500}}>{f.from} <span style={{color:'var(--text3)'}}>→</span> {f.to}</td>
                  <td className="mu">{f.dep}</td><td className="mu">{f.arr}</td>
                  <td className="mu mo">{f.date}</td>
                  <td className="mo">{f.avail}</td>
                  <td><OccBar avail={f.avail} seats={f.seats}/></td>
                  <td className="to mo">{pkr(f.eco)}</td>
                  <td className="tc mo">{pkr(f.biz)}</td>
                  <td><span className={`badge ${statusBadge(f.status)}`}>{f.status}</span></td>
                  <td>
                    <div style={{display:'flex',gap:5}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>changeStatus(f.id,f.number)}>Status</button>
                      <button className="btn btn-r btn-sm" onClick={()=>del(f.id,f.number)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!flights.length && <tr><td colSpan={11}><EmptyState icon="✈️" text="NO FLIGHTS ADDED YET"/></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default FlightsPage;
