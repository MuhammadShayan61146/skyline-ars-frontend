import React, { useState, useEffect, useRef } from 'react';
import { pkr } from './PaxComponents';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function CostModelPage() {
  const [dev,  setDev]  = useState(2000000);
  const [kloc, setKloc] = useState(1.072);
  const [act,  setAct]  = useState(25);
  const [life, setLife] = useState(10);

  const cf     = 2.5;
  const annual = dev * (act/100) * cf * Math.max(kloc, 0.1);
  const total  = annual * life;
  const ratio  = (total/dev).toFixed(1);

  const bugData = {
    labels: ['Requirements','Design','Coding','Testing','Post-Release'],
    datasets: [{ label:'Cost Multiplier', data:[1,5,10,20,100],
      backgroundColor:['rgba(22,163,74,0.75)','rgba(8,145,178,0.75)','rgba(217,119,6,0.75)','rgba(220,38,38,0.75)','rgba(153,27,27,0.85)'],
      borderColor:['#16a34a','#0891b2','#d97706','#dc2626','#991b1b'], borderWidth:2, borderRadius:4 }]
  };
  const bugOpts = { responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    scales:{ y:{ title:{ display:true, text:'Relative Cost Multiplier', color:'#8fa3be', font:{size:10} }, grid:{ color:'#e2e6ea' }, ticks:{ color:'#4b5768', font:{size:10} }},
              x:{ grid:{ display:false }, ticks:{ color:'#4b5768', font:{size:10} }}}};

  const relData = {
    labels: ['Booking Integrity','Seat Accuracy','Recovery Time','Audit Coverage','Input Safety'],
    datasets:[
      { label:'Before', data:[30,40,0,0,20], backgroundColor:'rgba(220,38,38,0.7)', borderRadius:3 },
      { label:'After',  data:[100,100,95,100,100], backgroundColor:'rgba(22,163,74,0.7)', borderRadius:3 },
    ]
  };
  const relOpts = { responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ labels:{ color:'#4b5768', font:{size:10} }}},
    scales:{ y:{ max:100, grid:{ color:'#e2e6ea' }, ticks:{ color:'#4b5768', font:{size:10}, callback:v=>v+'%' }},
              x:{ grid:{ display:false }, ticks:{ color:'#4b5768', font:{size:10} }}}};

  return (
    <div className="page-anim">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {/* Left */}
        <div>
          <div className="card cap sgap">
            <div className="card-hdr"><h3><span>🧮</span>COCOMO II — Live Calculator</h3></div>
            <p style={{fontSize:12,color:'var(--text2)',marginBottom:13,lineHeight:1.6}}>
              COCOMO II estimates maintenance effort based on development cost, codebase size, annual change traffic, and software lifespan. Edit values to recalculate instantly.
            </p>
            <div className="grid-2">
              {[
                ['Initial Dev Cost (PKR)', dev, setDev, 'number'],
                ['Source Code (KLOC)', kloc, setKloc, 'number'],
                ['Annual Change Traffic (%)', act, setAct, 'number'],
                ['Software Lifespan (years)', life, setLife, 'number'],
              ].map(([lbl,val,setter,type])=>(
                <div className="fg" key={lbl}>
                  <label className="fl">{lbl}</label>
                  <input className="fi" type={type} value={val} step={type==='number'&&lbl.includes('KLOC')?0.1:1}
                    onChange={e=>setter(parseFloat(e.target.value)||0)}/>
                </div>
              ))}
            </div>
            <div className="cr-grid">
              {[
                ['Annual Maintenance','to',pkr(annual)],
                ['Lifetime Total','tr',pkr(total)],
                ['Maint / Dev Ratio','tc',ratio+'×'],
                ['Development Cost','tg',pkr(dev)],
              ].map(([lbl,cls,val])=>(
                <div key={lbl} className="cr-box">
                  <div className="cr-lbl">{lbl}</div>
                  <div className={`cr-val ${cls}`}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card cac">
            <div className="card-hdr"><h3><span>📊</span>Boehm Cost-to-Fix Multiplier</h3></div>
            <div style={{height:220,marginTop:6}}><Bar data={bugData} options={bugOpts}/></div>
          </div>
        </div>

        {/* Right */}
        <div>
          <div className="card cap sgap">
            <div className="card-hdr"><h3><span>📈</span>Maintenance Cost Distribution</h3></div>
            {[
              ['Corrective (Bug Fixes)','21%','var(--red)','tr',total*.21],
              ['Adaptive (Environment)','25%','var(--gold)','to',total*.25],
              ['Perfective (Enhancement)','50%','var(--cyan)','tc',total*.50],
              ['Preventive (Refactoring)','4%','var(--green)','tg',total*.04],
            ].map(([lbl,pct,color,cls,val])=>(
              <div key={lbl} className="dist-row">
                <span className="dist-label">{lbl} ({pct})</span>
                <div className="dist-bar-wrap"><div className="dist-bar-fill" style={{width:pct,background:color}}/></div>
                <span className={`dist-val ${cls}`}>{pkr(val)}</span>
              </div>
            ))}
          </div>

          <div className="card car sgap">
            <div className="card-hdr"><h3><span>💰</span>Risk Cost: TMC = MC + DC + RC</h3></div>
            <div className="grid-3">
              {[
                ['Manpower (MC)','Dev × ACT × CF','var(--red)','tr',pkr(annual)],
                ['Downtime (DC)','Hours × PKR/hr','var(--gold)','to','PKR 356,000'],
                ['Risk (RC)','Prob × Impact','var(--cyan)','tc','PKR 300,000'],
              ].map(([lbl,sub,color,cls,val])=>(
                <div key={lbl} style={{padding:12,background:'var(--bg)',border:'1.5px solid var(--bdr)',borderRadius:'var(--r2)',borderTop:`3px solid ${color}`}}>
                  <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'var(--text3)',marginBottom:4}}>{lbl}</div>
                  <div className={`cr-val ${cls}`}>{val}</div>
                  <div style={{fontSize:10,color:'var(--text3)',marginTop:4}}>{sub}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12,padding:12,background:'var(--goldl)',border:'1.5px solid #fde68a',borderRadius:'var(--r2)',fontSize:12,color:'var(--gold)',textAlign:'center',lineHeight:1.9,fontWeight:500}}>
              Prevention Cost: PKR 5,000 · Fix Cost: PKR 656,400+<br/>
              <strong>Prevention is 131× CHEAPER than post-deployment correction</strong>
            </div>
          </div>

          <div className="card cac mt12">
            <div className="card-hdr"><h3><span>📉</span>Reliability: Before vs After</h3></div>
            <div style={{height:200,marginTop:6}}><Bar data={relData} options={relOpts}/></div>
          </div>
        </div>
      </div>
    </div>
  );
}
