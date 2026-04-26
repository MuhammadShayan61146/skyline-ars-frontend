import React, { useState } from 'react';
import { maintAPI } from '../services/api';
import { pkr, InfoBox, LogEntry } from './PaxComponents';
import { toast } from 'react-hot-toast';

const PHASES = [
  { title:'Create System Backup',       desc:'Snapshot healthy state before any changes' },
  { title:'Simulate Data Corruption',   desc:'Trigger real-world maintenance failure scenario' },
  { title:'Inspect Damage',             desc:'Observe corrupted data in Flights & Bookings' },
  { title:'Apply Corrective Maintenance',desc:'Restore from backup — full recovery in <1 second' },
  { title:'Preventive Hardening',       desc:'Enable validations, logging, integrity checks' },
  { title:'View Maintenance Cost Report',desc:'Total cost incurred vs prevention cost' },
];

export default function MaintenancePage({ setSysOk }) {
  const [phase,   setPhase]   = useState(0);
  const [logs,    setLogs]    = useState([{ msg:'Maintenance simulator ready. Click Step 1 to begin.', type:'info' }]);
  const [costs,   setCosts]   = useState({ c:0, a:0, p:0 });
  const [done,    setDone]    = useState([]);

  const addLog = (msg, type='info') => setLogs(l=>[...l, { msg, type, time:new Date().toLocaleTimeString('en-US',{hour12:false}) }]);
  const addCost = (t, v) => setCosts(c=>({...c,[t]:c[t]+v}));

  const runPhase = async (n) => {
    if(n !== phase) { toast.warn('Complete previous step first.'); return; }
    try {
      switch(n) {
        case 0:
          await maintAPI.backup();
          addLog('STEP 1: System backup created successfully.','success');
          addLog('Snapshot saved — all data secured.','info'); break;
        case 1:
          await maintAPI.corruptData();
          setSysOk(false);
          addLog('DATA CORRUPTION SIMULATED!','error');
          addLog('All seat availability → -999 (invalid)','error');
          addLog('All booking statuses → CORRUPT_ERR','error');
          addLog('Estimated downtime: PKR 300,000/hr','error');
          addCost('c',300000); addCost('a',50000); break;
        case 2:
          addLog('STEP 3: Inspecting damage…','warn');
          addLog('Flights table: availSeats = -999 on ALL records','error');
          addLog('Bookings table: status = CORRUPT_ERR on ALL confirmed','error');
          addLog('System INOPERABLE. Navigate to Flights tab to verify.','error'); break;
        case 3:
          await maintAPI.restore();
          setSysOk(true);
          addLog('STEP 4: Corrective maintenance applied.','success');
          addLog('System restored from backup in < 1 second.','success');
          addCost('c',200000); break;
        case 4:
          addLog('STEP 5: Preventive hardening applied.','success');
          ['Seat conflict detection','Delete-flight protection','Input validation','Audit logging','Auto backup schedule']
            .forEach(f=>addLog(`✓ ${f}: ENABLED`,'success'));
          addCost('p',5000); break;
        case 5:
          const tot = costs.c+costs.a+costs.p+255000;
          addLog('═══ MAINTENANCE COST REPORT ═══','info');
          addLog(`Corrective:  ${pkr(costs.c+200000)}`,'warn');
          addLog(`Adaptive:    ${pkr(costs.a+50000)}`,'warn');
          addLog(`Preventive:  ${pkr(costs.p+5000)}`,'success');
          addLog(`TOTAL COST:  ${pkr(tot)}`,'error');
          addLog('Prevention (PKR 5K) vs Recovery (PKR 550K+) = 110:1 ratio!','warn');
          addLog('Simulation complete. See Cost Model for full analysis.','success'); break;
        default: break;
      }
      setDone(d=>[...d, n]);
      setPhase(n+1);
    } catch(e){ addLog('Error: '+(e.message||'Step failed.'),'error'); toast.error(e.message||'Step failed.'); }
  };

  const reset = () => { setPhase(0); setLogs([{msg:'Demo reset. Click Step 1 to begin again.',type:'info'}]); setCosts({c:0,a:0,p:0}); setDone([]); setSysOk(true); };
  const total = costs.c+costs.a+costs.p;

  return (
    <div className="page-anim">
      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:14}}>
        <div>
          <div className="card cap sgap">
            <div className="card-hdr">
              <h3><span>🔧</span>6-Step Maintenance Lifecycle Simulation</h3>
              <button className="btn btn-ghost btn-sm" onClick={reset}>↺ Reset</button>
            </div>
            <InfoBox>Follow the 6 steps in order. This live simulation demonstrates why maintenance is the most expensive SDLC phase — based on IEEE Std 1219.</InfoBox>
            {PHASES.map((p,i)=>(
              <div key={i} className={`mp${done.includes(i)?' done':phase===i?' active':''}`} onClick={()=>runPhase(i)}>
                <div className="ph-n">{done.includes(i)?'✓':i+1}</div>
                <div className="ph-info">
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
                <span className={`badge ${done.includes(i)?'bg':phase===i?'bb':'bo'}`}>
                  {done.includes(i)?'DONE ✓':phase===i?'READY →':'PENDING'}
                </span>
              </div>
            ))}
          </div>

          {/* Before vs After */}
          <div className="card">
            <div className="card-hdr"><h3><span>⚡</span>Before vs After Maintenance</h3></div>
            <div className="tw">
              <table>
                <thead><tr><th>Feature</th><th>Before ❌</th><th>After ✅</th></tr></thead>
                <tbody>
                  {[
                    ['Double Booking','Allowed — no check','Blocked — conflict detected'],
                    ['Delete Flight w/ Bookings','Crashes system','Prevented — integrity enforced'],
                    ['Seat Count on Cancel','Never restored','Auto-restored instantly'],
                    ['Input Validation','No validation — crashes','Full validation with messages'],
                    ['Audit Logging','None','100% coverage'],
                    ['Data Backup','None — total loss risk','One-click, <3 sec restore'],
                    ['System Reliability','72%','95% post-maintenance'],
                  ].map(([f,b,a])=>(
                    <tr key={f}><td style={{fontWeight:600}}>{f}</td><td className="tr">{b}</td><td className="tg">{a}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4 Types */}
          <div className="card car mt12">
            <div className="card-hdr"><h3><span>💡</span>4 Types of Software Maintenance</h3></div>
            {[
              ['Corrective ~21%','br','COSTLIEST/TASK','Fixing post-deployment bugs. Costs 100× more than fixing during design phase.'],
              ['Adaptive ~25%','bo','ONGOING','Updating for new OS, APIs, and regulations — a continuous cost stream.'],
              ['Perfective ~50%','bc','LARGEST SHARE','Improving features, new requirements, performance optimisation.'],
              ['Preventive ~4%','bg','CHEAPEST','Most neglected but prevents all future corrective costs.'],
            ].map(([n,badge,label,desc])=>(
              <div key={n} className="mt-card">
                <div className="mt-top">
                  <span className="mt-name">{n}</span>
                  <span className={`badge ${badge}`}>{label}</span>
                </div>
                <div className="mt-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          <div className="card cac sgap">
            <div className="card-hdr"><h3><span>🖥️</span>Live Output</h3></div>
            <div className="log-wrap" style={{maxHeight:320}}>
              {logs.map((l,i)=><LogEntry key={i} msg={l.msg} type={l.type} time={l.time}/>)}
            </div>
          </div>

          <div className="card cap mt12">
            <div className="card-hdr"><h3><span>💰</span>Cost Tracker</h3></div>
            <div style={{textAlign:'center',padding:'12px 0 16px'}}>
              <div style={{fontSize:36,fontWeight:800,color:'var(--red)',letterSpacing:'-1px',lineHeight:1}}>{pkr(total)}</div>
              <div style={{fontSize:11,color:'var(--text3)',marginTop:4,fontFamily:'DM Mono,monospace'}}>Accumulated maintenance cost</div>
            </div>
            {[
              ['Corrective','c','var(--red)','tr'],
              ['Adaptive','a','var(--gold)','to'],
              ['Preventive','p','var(--green)','tg'],
            ].map(([lbl,k,color,cls])=>(
              <div key={k} className="cbar">
                <div className="cbar-hdr">
                  <span style={{color:'var(--text2)',fontSize:12,fontWeight:500}}>{lbl}</span>
                  <span className={`${cls}`} style={{fontFamily:'DM Mono,monospace',fontSize:11}}>{pkr(costs[k])}</span>
                </div>
                <div className="cbar-bg">
                  <div className="cbar-fill" style={{width:`${Math.min((costs[k]/600000)*100,100)}%`,background:color}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
