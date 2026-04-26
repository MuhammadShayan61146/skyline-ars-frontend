import React from 'react';

export const KPI = ({ val, label, sub, icon, color }) => (
  <div className="kpi" style={{ '--kc': color }}>
    {icon && <div className="kpi-icon">{icon}</div>}
    <div className="kpi-val">{val}</div>
    <div className="kpi-label">{label}</div>
    {sub && <div className="kpi-sub">{sub}</div>}
  </div>
);

export const Badge = ({ children, type='bb' }) => (
  <span className={`badge ${type}`}>{children}</span>
);

export const statusBadge = (s) => {
  const map = { Confirmed:'bg', Cancelled:'br', Open:'br', 'In Progress':'bo', Resolved:'bg',
    Scheduled:'bc', Delayed:'bo', Boarding:'bg', 'On Time':'bg', Critical:'br', High:'br', Medium:'bo', Low:'bc' };
  return map[s] || 'bb';
};

export const tierBadge = (tier) => {
  const cls = { Gold:'tier-gold', Silver:'tier-silver', Bronze:'tier-bronze' };
  return <span className={`tier-b ${cls[tier]||'tier-bronze'}`}>{tier||'Bronze'}</span>;
};

export const pkr = (v) => 'PKR ' + Math.round(v||0).toLocaleString();

export const EmptyState = ({ icon='📭', text='NO DATA FOUND' }) => (
  <div className="empty"><div style={{ fontSize:32, marginBottom:10 }}>{icon}</div><p>{text}</p></div>
);

export const ResultBox = ({ msg, type='s' }) => (
  msg ? <div className={`result-box r${type}`}>{msg}</div> : null
);

export const InfoBox  = ({ children }) => <div className="info-box">{children}</div>;
export const WarnBox  = ({ children }) => <div className="warn-box">{children}</div>;
export const ErrBox   = ({ children }) => <div className="err-box">{children}</div>;

export const OccBar = ({ avail, seats }) => {
  const pct = seats ? Math.round(((seats-avail)/seats)*100) : 0;
  const color = pct>=90?'var(--red)':pct>=60?'var(--gold)':'var(--primary)';
  return (
    <div>
      <div className="occ-bar">
        <div className="occ-fill" style={{ width:`${Math.min(pct,100)}%`, background:color }} />
      </div>
      <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:2 }}>{seats-avail}/{seats} booked</div>
    </div>
  );
};

export const LogEntry = ({ msg, type='info', time }) => (
  <div className={`log-entry ${type}`}>
    <div className="log-time">{time || new Date().toLocaleTimeString('en-US',{hour12:false})}</div>
    <div>{msg}</div>
  </div>
);
