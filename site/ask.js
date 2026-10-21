// "Ask us" router (prototype): matches what the visitor types to the right page.
// Production swap: send the query to an LLM endpoint that returns one of these page ids; the UI stays the same.
(function(){
  const PAGES=[
    {id:'travel-assistance.html',t:'Travel Assistance',d:'Your travellers abroad: insurers\' policyholders and business travellers.',k:'travel traveller travellers trip abroad overseas outbound holiday tourist tourists insurer insurers policyholder policyholders business travel worldwide japan europe vacation passport'},
    {id:'workforce-assistance.html',t:'Workforce Assistance',d:'Staff at home, on site and offshore.',k:'employee employees staff workforce corporate company employer domestic local site remote offshore mine mining plantation rig vessel factory workers team hr benefits'},
    {id:'case-handling.html',t:'In-country Case Handling',d:'Cases passed to us in Southeast Asia.',k:'assistance company tpa third party administrator partner subcontract refer case cases nominate local ground in-country handle handling member visiting foreigner'},
    {id:'evacuation.html',t:'Evacuation & Repatriation',d:'Air ambulance and escorted transfers.',k:'evacuation evacuate evac air ambulance medevac helicopter flight repatriation repatriate fly home transfer boat sea escort remains body'},
    {id:'cost-containment.html',t:'Cost Containment',d:'Every bill checked before you pay it.',k:'bill bills invoice overcharge overcharged expensive high cost costs containment review audit negotiate reduce saving savings price too much fraud'},
    {id:'network-access.html',t:'Network Access & Payment Guarantee',d:'Cashless admission at 15,000+ providers.',k:'cashless guarantee gop guarantee of payment admission admit deposit panel network hospital hospitals clinic tariff direct billing'},
    {id:'network.html',t:'Network map and hospital finder',d:'Find a hospital in our network.',k:'find hospital hospitals clinic clinics where map finder search list near bali jakarta kuala lumpur penang bangkok singapore phuket location'},
    {id:'case-management.html',t:'Case Management',d:'A named case manager, around the clock.',k:'case manager management follow monitor update doctor medical oversight family translation 24/7 support'},
    {id:'settlement.html',t:'Cross-border Settlement',d:'Pay locally, settle once in your currency.',k:'currency currencies fx exchange invoice usd eur myr sgd idr thb pay payment settle settlement local bank'},
    {id:'hub.html',t:'HMS Hub',d:'Plug in once, send cases straight in.',k:'api integrate integration platform portal system hub connect software adjudicate self-service tool technology'},
    {id:'data.html',t:'Data & Insights',d:'Know what care costs before you price it.',k:'data insight insights benchmark benchmarks pricing analytics report dashboard atlas cost trends utilisation mcp ai'},
    {id:'providers.html',t:'For providers',d:'Join our network.',k:'join network provider providers hospital clinic ambulance operator pharmacy lab partner with you become supplier vendor house call'},
    {id:'contact.html',t:'Contact us',d:'Talk to our partnerships team.',k:'contact talk call email speak sales partnership quote price office address meet'}
  ];
  const norm=s=>s.toLowerCase().replace(/[^a-z0-9/ ]+/g,' ');
  function score(q,p){
    const words=norm(q).split(/\s+/).filter(w=>w.length>2&&!['the','and','for','our','you','your','with','need','want','looking','what','who','are','can','have','help'].includes(w));
    const hay=' '+norm(p.k+' '+p.t+' '+p.d)+' ';
    let s=0; for(const w of words){ if(hay.includes(' '+w+' ')) s+=3; else if(w.length>4&&hay.includes(w.slice(0,5))) s+=1; }
    return s;
  }
  const f=document.getElementById('askForm'), q=document.getElementById('askQ'), out=document.getElementById('askOut');
  if(!f) return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function run(text){
    const r=PAGES.map(p=>({p,s:score(text,p)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,3);
    if(!r.length){ out.innerHTML='<p class="ask-none">We could not match that yet. <a href="contact.html">Ask our team directly →</a></p>'; return; }
    out.innerHTML=`<p class="ask-lbl">Best match</p><a class="ask-best" href="${r[0].p.id}"><b>${esc(r[0].p.t)}</b><span>${esc(r[0].p.d)}</span><i>Open →</i></a>`+
      (r.length>1?`<p class="ask-lbl" style="margin-top:10px">Also relevant</p>`+r.slice(1).map(x=>`<a class="ask-alt" href="${x.p.id}">${esc(x.p.t)} →</a>`).join(''):'');
  }
  f.addEventListener('submit',ev=>{ev.preventDefault(); const t=q.value.trim(); if(!t) return; run(t); const best=out.querySelector('.ask-best'); if(best&&ev.submitter&&ev.submitter.dataset.go==='1') location.href=best.getAttribute('href');});
  q.addEventListener('input',()=>{ if(q.value.trim().length>3) run(q.value); else out.innerHTML=''; });
  document.querySelectorAll('.ask-chip').forEach(c=>c.addEventListener('click',()=>{q.value=c.textContent; run(c.textContent); q.focus();}));
})();
