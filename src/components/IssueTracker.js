import React, { useState, useEffect } from 'react';
import { maintAPI } from '../services/api';
import { EmptyState, statusBadge, pkr } from './PaxComponents';
import { toast } from 'react-hot-toast';

export default function IssueTracker() {
  const [issues, setIssues] = useState([]);
  const [form, setForm] = useState({ module:'', type:'Corrective', desc:'', severity:'High', cost:'' });
  const [show, setShow] = useState(false);

  const load = () => maintAPI.getIssues().then(r=>setIssues(r.data||[])).catch(()=>{});
  useEffect(()=>{ load(); },[]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const add = async () => {
    if(!form.module||!form.desc) return toast.error('Module and description are required.');
    try {
      await maintAPI.addIssue({ ...form, cost:parseFloat(form.cost)||0 });
      setForm({ module:'', type:'Corrective', desc:'', severity:'High', cost:'' });
      setShow(false); load();
      toast.success('Issue logged successfully!');
    } catch(e){ toast.error(e.message||'Failed to add issue.'); }
  };

  const resolve = async (id) => {
    try {
      await maintAPI.resolveIssue(id); load();
      toast.success('Issue resolved!');
    } catch(e){ toast.error(e.message||'Failed.'); }
  };

  const typeBadge  = { Corrective:'br', Adaptive:'bo', Perfective:'bc', Preventive:'bg' };
  const sevBadge   = { Critical:'br', High:'br', Medium:'bo', Low:'bc' };
  const statBadge  = { Open:'br', 'In Progress':'bo', Resolved:'bg' };

  const open      = issues.filter(i=>i.status!=='Resolved').length;
  const totalCost = issues.reduce((s,i)=>s+(i.cost||0),0);

  return (
    <div className="page-anim">
      {/* Summary */}
      <div className="grid-3 sgap">
        {[
          ['Total Issues',issues.length,'var(--primary)'],
          ['Open / In Progress',open,'var(--red)'],
          ['Total Cost Estimate',pkr(totalCost),'var(--gold)'],
        ].map(([lbl,val,color])=>(
          <div key={lbl} className="card" style={{borderTop:`3px solid ${color}`}}>
            <div style={{fontSize:24,fontWeight:800,color,letterSpacing:'-0.5px',lineHeight:1}}>{val}</div>
            <div style={{fontSize:12,color:'var(--text2)',marginTop:6,fontWeight:500}}>{lbl}</div>
          </div>
        ))}
      </div>

      <div className="card cap">
        <div className="card-hdr">
          <h3><span>📋</span>Maintenance Issue Tracker</h3>
          <button className="btn btn-p btn-sm" onClick={()=>setShow(s=>!s)}>{show?'✕ Close':'➕ Add Issue'}</button>
        </div>

        {show && (
          <div style={{padding:16,background:'var(--bg)',border:'1.5px solid var(--bdr)',borderRadius:'var(--r2)',marginBottom:14}}>
            <div className="grid-2">
              <div className="fg">
                <label className="fl">Module</label>
                <input className="fi" placeholder="e.g. Booking Module" value={form.module} onChange={e=>set('module',e.target.value)}/>
              </div>
              <div className="fg">
                <label className="fl">Type</label>
                <select className="fs" value={form.type} onChange={e=>set('type',e.target.value)}>
                  {['Corrective','Adaptive','Perfective','Preventive'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="fl">Severity</label>
                <select className="fs" value={form.severity} onChange={e=>set('severity',e.target.value)}>
                  {['Critical','High','Medium','Low'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="fl">Est. Cost (PKR)</label>
                <input className="fi" type="number" placeholder="e.g. 50000" value={form.cost} onChange={e=>set('cost',e.target.value)}/>
              </div>
            </div>
            <div className="fg">
              <label className="fl">Description</label>
              <input className="fi" placeholder="Describe the issue…" value={form.desc} onChange={e=>set('desc',e.target.value)}/>
            </div>
            <div className="fe">
              <button className="btn btn-ghost btn-sm" onClick={()=>setShow(false)}>Cancel</button>
              <button className="btn btn-p btn-sm" onClick={add}>Add Issue</button>
            </div>
          </div>
        )}

        <div className="tw">
          <table>
            <thead><tr><th>#</th><th>Module</th><th>Type</th><th>Description</th><th>Severity</th><th>Cost (PKR)</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {[...issues].reverse().map(i=>(
                <tr key={i.id}>
                  <td className="mo mu">#{i.id}</td>
                  <td style={{fontWeight:500}}>{i.module}</td>
                  <td><span className={`badge ${typeBadge[i.type]||'bb'}`}>{i.type}</span></td>
                  <td style={{maxWidth:200,whiteSpace:'normal',fontSize:12,color:'var(--text2)'}}>{i.desc}</td>
                  <td><span className={`badge ${sevBadge[i.severity]||'bb'}`}>{i.severity}</span></td>
                  <td className="to mo">{pkr(i.cost)}</td>
                  <td><span className={`badge ${statBadge[i.status]||'bb'}`}>{i.status}</span></td>
                  <td className="mu mo">{i.date||'—'}</td>
                  <td>
                    {i.status!=='Resolved'
                      ? <button className="btn btn-gr btn-sm" onClick={()=>resolve(i.id)}>✓ Resolve</button>
                      : '—'}
                  </td>
                </tr>
              ))}
              {!issues.length && <tr><td colSpan={9}><EmptyState icon="📋" text="NO ISSUES LOGGED"/></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
