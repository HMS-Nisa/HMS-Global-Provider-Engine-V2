const P=window.P||[];
const ccName={MY:'Malaysia',ID:'Indonesia',SG:'Singapore',TH:'Thailand',KH:'Cambodia',MM:'Myanmar',IN:'India',CN:'China',TR:'Türkiye'};
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function tidy(n){ // hospital names from source systems are often in capitals
  if(n!==n.toUpperCase()) return n;
  return n.toLowerCase().replace(/\b([a-z])/g,m=>m.toUpperCase()).replace(/\b(Kpj|Ihh|Kl|Rs|Rsu|Rsia|Usj|Ukm|Msu|Hkl|Sjmc|Ijn|Ttdi|Jb|Pj|Sdn|Bhd)\b/g,m=>m.toUpperCase());
}
function bindFinder(){
  const q=document.getElementById('q'), cc=document.getElementById('cc'), rows=document.getElementById('rows'), count=document.getElementById('count');
  function go(){
    const t=q.value.trim().toLowerCase(), c=cc.value;
    const hit=P.filter(r=>(!c||r[3]===c)&&(!t||(r[0]+' '+r[1]+' '+r[2]).toLowerCase().includes(t)));
    rows.innerHTML=hit.slice(0,150).map(r=>`<tr><td>${esc(tidy(r[0]))}${r[4]==='S'?' <span class="pill">Specialist</span>':''}</td><td class="c">${esc(r[1])}</td><td class="c hide-s">${esc(r[2])}${r[3]?' · '+r[3]:''}</td></tr>`).join('')||'<tr><td colspan="3">No facilities match. Try a city or state name.</td></tr>';
    count.textContent=`${hit.length.toLocaleString()} of ${P.length.toLocaleString()} hospitals and specialist centres shown${hit.length>150?' (first 150 listed)':''}. GP, dental and optical panels are not listed here.`;
  }
  q.addEventListener('input',go); cc.addEventListener('change',go); go();
}

document.getElementById('cc').insertAdjacentHTML('beforeend',Object.keys(ccName).filter(c=>P.some(r=>r[3]===c)).map(c=>`<option value="${c}">${ccName[c]}</option>`).join(''));
bindFinder();
