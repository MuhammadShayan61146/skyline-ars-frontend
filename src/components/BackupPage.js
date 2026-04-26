// ════════════════════════════════════════════
//  BackupPage.js
// ════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { maintAPI } from '../services/api';
import { LogEntry, WarnBox, ErrBox } from './PaxComponents';
import { toast } from 'react-hot-toast';

export function BackupPage({ setSysOk }) {
  const [logs,   setLogs]   = useState([]);
  const [bkTime, setBkTime] = useState(null);

  const loadLogs = () => maintAPI.getLogs().then(r=>setLogs(r.data||[])).catch(()=>{});
  useEffect(()=>{ loadLogs(); },[]);

  const backup = async () => {
    try {
      await maintAPI.backup();
      const t = new Date().toLocaleString();
      setBkTime(t);
      toast.success('Backup created successfully!');
      loadLogs();
    } catch(e){ toast.error(e.message||'Backup failed.'); }
  };

  const restore = async () => {
    if(!window.confirm('Restore from backup? This will overwrite all current data.')) return;
    try {
      await maintAPI.restore();
      setSysOk(true);
      toast.success('System restored from backup!');
      loadLogs();
    } catch(e){ toast.error(e.message||'Restore failed.'); }
  };

  return (
    <div className="page-anim">
      <div className="grid-2 sgap">
        <div className="card cac">
          <div className="card-hdr"><h3><span>💾</span>Create Backup</h3></div>
          <p style={{fontSize:13,color:'var(--text2)',marginBottom:13,lineHeight:1.6}}>
            Save a complete snapshot of all flights, passengers, bookings, and logs. Enables instant recovery from any data corruption or failure event.
          </p>
          <div style={{padding:11,background:'var(--bg)',border:'1.5px solid var(--bdr)',borderRadius:'var(--r2)',marginBottom:13,fontFamily:'DM Mono,monospace',fontSize:11,color:'var(--text3)'}}>
            {bkTime
              ? <><span style={{color:'var(--green)',fontWeight:600}}>✅ Backup created</span><br/>Timestamp: {bkTime}</>
              : 'No backup created yet.'}
          </div>
          <button className="btn btn-p btn-full" onClick={backup}>💾 Create Backup Now</button>
        </div>

        <div className="card car">
          <div className="card-hdr"><h3><span>♻️</span>Restore System</h3></div>
          <p style={{fontSize:13,color:'var(--text2)',marginBottom:13,lineHeight:1.6}}>
            Restore all data to the last saved backup. This overwrites current data. Use after a corruption event or failed maintenance operation.
          </p>
          <ErrBox>⚠️ WARNING: This action will overwrite all current data with the backup snapshot.</ErrBox>
          <button className="btn btn-r btn-full" onClick={restore}>♻️ Restore from Backup</button>
        </div>
      </div>

      <div className="card cag">
        <div className="card-hdr"><h3><span>📋</span>System Event Log</h3></div>
        <div className="log-wrap" style={{maxHeight:400}}>
          {logs.map((l,i)=>(
            <LogEntry key={i} msg={l.message||l.description} type={l.type||'info'} time={l.timestamp?.slice(11,19)}/>
          ))}
          {!logs.length && <div className="log-entry info"><div className="log-time">—</div><div>No events logged yet.</div></div>}
        </div>
      </div>
    </div>
  );
}
export default BackupPage;
