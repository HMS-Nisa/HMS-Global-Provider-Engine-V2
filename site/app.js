// menu
const nav=document.getElementById('nav'), mb=document.getElementById('menuBtn');
function closeMenu(){nav.classList.remove('open');mb.setAttribute('aria-expanded','false');document.body.classList.remove('nav-open')}
mb.addEventListener('click',()=>{const o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o);document.body.classList.toggle('nav-open',o)});
nav.querySelectorAll('ul a:not(.mega-t)').forEach(a=>a.addEventListener('click',closeMenu));
// tapping the scrim (body's backdrop layer) closes the menu
document.addEventListener('click',e=>{if(e.target===document.body&&nav.classList.contains('open'))closeMenu()});

// mobile accordion: mega toggles expand instead of navigating; one open at a time
const mnavMq=matchMedia('(max-width:860px)');
nav.querySelectorAll('li.mega>a').forEach(a=>a.addEventListener('click',e=>{
  if(!mnavMq.matches)return;
  e.preventDefault();
  const li=a.parentElement, open=li.classList.toggle('open');
  a.setAttribute('aria-expanded',open);
  nav.querySelectorAll('li.mega.open').forEach(o=>{if(o!==li){o.classList.remove('open');o.querySelector('a').setAttribute('aria-expanded','false')}});
}));

// copy address
document.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',()=>{
  const t=document.getElementById(b.dataset.copy).innerText.replace(/\n/g,', ');
  const done=()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy address',1600)};
  (navigator.clipboard&&navigator.clipboard.writeText(t).then(done).catch(()=>sel(b.dataset.copy)))||sel(b.dataset.copy);
}));
function sel(id){const r=document.createRange();r.selectNodeContents(document.getElementById(id));const s=getSelection();s.removeAllRanges();s.addRange(r)}

// PWA: register the service worker where the page is served on its own domain; show an install hint on phones
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
if('serviceWorker' in navigator && location.protocol==='https:'){navigator.serviceWorker.register('sw.js').catch(()=>{})}
let deferred=null;
const bar=document.getElementById('install'), go=document.getElementById('installGo');
let dismissed=false; try{dismissed=localStorage.getItem('hms-install-dismissed')==='1'}catch(e){}
const touch=matchMedia('(pointer:coarse)').matches&&innerWidth<900;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(touch&&!dismissed&&!standalone){go.hidden=false;bar.hidden=false}});
go.addEventListener('click',async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;bar.hidden=true});
document.getElementById('installClose').addEventListener('click',()=>{bar.hidden=true;try{localStorage.setItem('hms-install-dismissed','1')}catch(e){}});
const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
if(ios&&!standalone&&!dismissed){document.getElementById('installText').textContent='Add HMS Assistance to your home screen: tap Share, then "Add to Home Screen".';bar.hidden=false}
