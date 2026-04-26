import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { EmptyState, statusBadge, tierBadge } from './PaxComponents';
import { toast } from 'react-hot-toast';

export default function PassengersPage({ refreshStats }) {
  const [passengers, setPassengers] = useState([]);
  const [form, setForm] = useState({ username:'', name:'', email:'', phone:'', passport:'', password:'' });

  const load = () => authAPI.getPassengers().then(r=>setPassengers(r.data||[])).catch(()=>{});
  useEffect(()=>{ load(); },[]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const add = async () => {
    const { username,name,email,phone,passport,password } = form;
    if(!username||!name||!email||!phone||!passport||!password) return toast.error('All fields are required.');
    if(password.length<6) return toast.error('Password must be at least 6 characters.');
    try {
      await authAPI.register({ username,name,email,phone,passport,password });
      setForm({ username:'',name:'',email:'',phone:'',passport:'',password:'' });
      load(); refreshStats();
      toast.success(`${name} registered successfully!`);
    } catch(e){ toast.error(e.message||'Failed to register.'); }
  };

  const del = async (id, name) => {
    if(!window.confirm(`Remove ${name}? This cannot be undone.`)) return;
    try {
      await authAPI.deletePassenger(id); load(); refreshStats();
      toast(`${name} removed.`, { icon:'🗑️' });
    } catch(e){ toast.error(e.message||'Cannot delete — may have active bookings.'); }
  };

  return (
    <div className="page-anim">
      <div className="card cap sgap">
        <div className="card-hdr"><h3><span>➕</span>Register New Passenger</h3></div>
        <div className="grid-3">
          {[['Username','username','e.g. john_doe'],['Full Name','name','e.g. John Doe'],
            ['Email','email','john@email.com'],['Phone','phone','0300-0000000'],
            ['Passport No.','passport','AA1234567'],['Password','password','min 6 chars']
          ].map(([lbl,k,ph])=>(
            <div className="fg" key={k}>
              <label className="fl">{lbl}</label>
              <input className="fi" type={k==='password'?'password':'text'} placeholder={ph}
                value={form[k]} onChange={e=>set(k,e.target.value)}/>
            </div>
          ))}
        </div>
        <div className="fe"><button className="btn btn-p" onClick={add}>➕ Register Passenger</button></div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <h3><span>👤</span>All Passengers</h3>
          <span className="badge bb">{passengers.length} passengers</span>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Username</th><th>Name</th><th>Email</th><th>Phone</th><th>Passport</th><th>Miles</th><th>Tier</th><th>Action</th></tr></thead>
            <tbody>
              {passengers.map(p=>(
                <tr key={p.id}>
                  <td className="mo tp2">{p.username}</td>
                  <td style={{fontWeight:600}}>{p.name}</td>
                  <td className="mu">{p.email}</td>
                  <td className="mo mu">{p.phone}</td>
                  <td className="mo mu">{p.passport}</td>
                  <td className="to mo">{(p.miles||0).toLocaleString()}</td>
                  <td>{tierBadge(p.tier||'Bronze')}</td>
                  <td><button className="btn btn-r btn-sm" onClick={()=>del(p.id,p.name)}>✕</button></td>
                </tr>
              ))}
              {!passengers.length && <tr><td colSpan={8}><EmptyState icon="👤" text="NO PASSENGERS REGISTERED"/></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
