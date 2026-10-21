// Atlas bill check (beta). Prototype: the result is a placeholder until the Atlas backend (invoice OCR + Iris comparison) is connected.
(function(){
  const body=document.getElementById('awBody'), start=body.innerHTML;
  const cc=document.getElementById('atlas').dataset.variant==='cc';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function bindDrop(){
    const drop=document.getElementById('drop'), file=document.getElementById('atlasFile');
    file.addEventListener('change',()=>picked(file.files[0]));
    ['dragenter','dragover'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add('over')}));
    ['dragleave','drop'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.remove('over')}));
    drop.addEventListener('drop',ev=>picked(ev.dataTransfer.files[0]));
  }
  function picked(f){
    if(!f) return;
    body.innerHTML=`<div class="aw-file"><span>${esc(f.name)}</span><button type="button" id="awX" aria-label="Remove file">✕</button></div>
      <label class="chk"><input type="checkbox" id="c1"><span>This invoice has <strong>no personal information</strong>: no patient name, IC or passport number, date of birth, address, phone or member ID.</span></label>
      <label class="chk"><input type="checkbox" id="c2"><span>I understand this is <strong>for comparison only</strong>: an indication, not a pricing decision, audit finding or advice.</span></label>
      <button class="btn btn-primary aw-go" type="button" id="awGo" disabled>Check this bill</button>`;
    const go=document.getElementById('awGo'), c1=document.getElementById('c1'), c2=document.getElementById('c2');
    const st=()=>{go.disabled=!(c1.checked&&c2.checked)}; c1.addEventListener('change',st); c2.addEventListener('change',st);
    document.getElementById('awX').addEventListener('click',reset);
    go.addEventListener('click',()=>{
      body.innerHTML='<div class="scan"><span></span>Reading the invoice and comparing…</div>';
      setTimeout(()=>{
        body.innerHTML= cc ? `<div class="aw-res"><p class="eyebrow">Atlas indication</p><b>This bill may be higher than expected</b>
          <div class="gauge" aria-hidden="true"><i class="z1"></i><i class="z2"></i><b style="left:76%"></b></div>
          <div class="gk"><span>Expected range</span><span>Higher than expected</span></div>
          <p>Bills for similar care at comparable hospitals are usually lower. Our cost containment team can review it line by line as a test case, and negotiate with the hospital if the charges do not hold up.</p>
          <a class="btn btn-primary aw-go" href="mailto:Assistance-Partnerships@healthmetrics.com?subject=Cost%20containment%20test%20case&body=Hi%20HealthMetrics%20team%2C%0A%0AWe%20used%20the%20bill%20check%20on%20your%20website%20and%20would%20like%20to%20run%20a%20cost%20containment%20test%20case.%0A%0ACompany%3A%0AName%3A%0APhone%3A%0A">Run a test case with us</a>
          <div class="aw-links"><span class="hint">Opens an email to our team.</span><button type="button" id="awAgain">Check another</button></div></div>`
        : `<div class="aw-res"><p class="eyebrow">Atlas indication</p><b>This bill looks within the expected range</b>
          <div class="gauge" aria-hidden="true"><i class="z1"></i><i class="z2"></i><b style="left:42%"></b></div>
          <div class="gk"><span>Expected range</span><span>Higher than expected</span></div>
          <p>Compared with bills for similar care at comparable hospitals. An indication only: AI can misread invoices, so check before relying on it.</p>
          <div class="aw-links"><a href="cost-containment.html">Get a full bill review →</a><button type="button" id="awAgain">Check another</button></div></div>`;
        document.getElementById('awAgain').addEventListener('click',reset);
      },1600);
    });
  }
  function reset(){ body.innerHTML=start; bindDrop(); }
  bindDrop();
})();
