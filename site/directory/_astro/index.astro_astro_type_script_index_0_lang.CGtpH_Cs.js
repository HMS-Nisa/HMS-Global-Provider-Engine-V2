const M=document.getElementById("year");M&&(M.textContent=new Date().getFullYear().toString());const u=document.getElementById("countrySelect"),o=document.getElementById("provinceSelect"),s=document.getElementById("citySelect"),w=document.getElementById("serviceTypeSelect"),k=document.getElementById("searchInput"),h=document.getElementById("resultsGrid"),y=document.getElementById("emptyState"),T=document.getElementById("count"),z=document.getElementById("resetBtn"),f=document.getElementById("loadMoreContainer"),I=document.getElementById("loadMoreBtn");let x=window.SERVER_DATA||[],i=[],p=50;const B=50;function v(e,t={}){const n=window;n.gtag?.("event",e,t),(n.dataLayer||=[]).push({event:e,...t})}let $;function V(e,t){clearTimeout($),e&&($=setTimeout(()=>{v("directory_search",{search_term:e,result_count:t})},800))}function S(){const e=u.value,t=o.value,n=s.value,l=w.value,r=k.value.toLowerCase().trim();i=x.filter(a=>{const c=(!e||a.country===e)&&(!t||a.province===t)&&(!n||a.city===n),d=!l||a.serviceType===l,m=!r||a.name.toLowerCase().includes(r)||a.address.toLowerCase().includes(r)||a.city?.toLowerCase().includes(r);return c&&d&&m})}function G(){S(),b("init"),L()}function E(e,t){return[...new Set(e.map(n=>n[t]).filter(Boolean))].sort()}function _(e,t,n){const l=e.value;e.innerHTML=`<option value="">${n}</option>`,t.forEach(r=>{const a=document.createElement("option");a.value=r,a.textContent=r,e.appendChild(a)}),t.includes(l)?e.value=l:e.value=""}function b(e){const t=u.value;if(s.value,e==="init"&&_(u,E(x,"country"),"All Countries"),!t)s.disabled=!0,s.innerHTML='<option value="">Select a Country first</option>',s.classList.add("bg-slate-50"),s.classList.remove("bg-white"),o.disabled=!0,o.innerHTML='<option value="">Select a City first</option>',o.classList.add("bg-slate-50"),o.classList.remove("bg-white");else{if(e==="country"||e==="init"){s.disabled=!1,s.classList.remove("bg-slate-50"),s.classList.add("bg-white");const n=x.filter(r=>r.country===t),l=E(n,"city");_(s,l,"All Cities")}if(!s.value)o.disabled=!0,o.innerHTML='<option value="">Select a City first</option>',o.classList.add("bg-slate-50"),o.classList.remove("bg-white");else{o.disabled=!1,o.classList.remove("bg-slate-50"),o.classList.add("bg-white");const n=x.filter(r=>r.country===t&&r.city===s.value),l=E(n,"province");_(o,l,"All Provinces")}}}function g(e){const t=e.target,n=t.id;n==="countrySelect"?(s.value="",o.value="",b("country")):n==="citySelect"&&(o.value="",b("city")),S(),p=B,L();const l=u.value,r=o.value,a=s.value,c=w.value,d=k.value.toLowerCase().trim();n==="searchInput"?V(d,i.length):v("directory_filter",{filter_name:n.replace("Select",""),filter_value:t.value||"(all)",result_count:i.length,active_country:l||"(all)",active_city:a||"(all)",active_province:r||"(all)",active_service_type:c||"(all)"})}function L(){if(!(!h||!T||!y||!f)){if(h.innerHTML="",T.textContent=i.length.toString(),i.length===0){y.classList.remove("hidden"),y.style.opacity="1",f.classList.add("hidden");return}else y.classList.add("hidden");p>=i.length?f.classList.add("hidden"):f.classList.remove("hidden"),i.slice(0,p).forEach((e,t)=>{const n=document.createElement("article"),l=t<15?t*50:0;n.style.animationDelay=`${l}ms`,n.className="animate-card opacity-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/60 flex flex-col h-full group cursor-default hover:border-[#127289]/50 hover:ring-2 hover:ring-[#127289]/10";const a="bg-[#127289]",c={GP:{bg:"#EFF6FF",color:"#1D4ED8"},Hospital:{bg:"#FFF7ED",color:"#C2410C"},Dental:{bg:"#F5F3FF",color:"#7C3AED"},Specialist:{bg:"#ECFDF5",color:"#059669"},Other:{bg:"#F8FAFC",color:"#64748B"}},d=c[e.serviceType]||c.Other,m=e.phone?e.phone:null,D=j=>String(j).replace(/[&<>"']/g,H=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[H]),C=e.address?e.address.replace(/[\s,]+$/,"").trim():"",F=C?D(C):null,A=encodeURIComponent([e.name,C,e.city].filter(Boolean).join(", "));n.innerHTML=`
				<div class="h-1 w-full ${a} opacity-90 group-hover:h-1.5 transition-all duration-300"></div>

				<div class="p-6 flex flex-col h-full relative z-10">
					<div class="flex justify-between items-center mb-4">
						<span style="background:${d.bg};color:${d.color}" class="px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider leading-none">${e.serviceType}</span>
						<div class="flex items-center gap-1.5" title="Direct Contract">
							<span class="relative flex h-1.5 w-1.5">
							  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
							  <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
							</span>
						</div>
					</div>
					
					<h3 class="text-[17px] font-semibold text-slate-800 mb-4 leading-snug tracking-tight group-hover:text-[#127289] transition-colors">${e.name}</h3>
					
					<div class="space-y-2.5 mb-6">
						${F?`
						<div class="flex items-start gap-3">
							<div class="text-slate-300 group-hover:text-[#127289] transition-colors mt-0.5 shrink-0">
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
							</div>
							<p class="text-[13px] text-slate-500 font-medium leading-relaxed">${F}</p>
						</div>`:`
						<div class="flex items-start gap-3">
							<div class="text-slate-300 group-hover:text-[#127289] transition-colors mt-0.5 shrink-0">
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
							</div>
							<p class="text-[13px] text-slate-400 italic font-medium leading-relaxed">Address not listed — tap Map for location &amp; directions</p>
						</div>`}
						${m?`
						<div class="flex items-center gap-3">
							<div class="text-slate-300 group-hover:text-[#127289] transition-colors shrink-0">
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
							</div>
							<p class="text-[13px] text-slate-500 font-medium tracking-wide">${m}</p>
						</div>`:""}
					</div>
					
					<div class="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
						<div class="flex flex-col">
							<span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</span>
							<span class="text-[11px] font-bold text-slate-700 group-hover:text-[#127289] transition-colors">${e.city}, ${e.province}</span>
						</div>
						<a href="https://www.google.com/maps/search/?api=1&query=${A}" target="_blank" rel="noopener noreferrer" data-map-link data-provider="${e.name}" data-city="${e.city}" data-country="${e.country}" data-service-type="${e.serviceType}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-[#127289] hover:bg-[#127289] hover:text-white transition-all duration-300 border border-slate-100 hover:border-[#127289] shadow-sm group/btn" title="View on Map">
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
							<span class="text-[10px] font-bold uppercase tracking-wider">Map</span>
						</a>
					</div>
				</div>
			`,h.appendChild(n)})}}u.addEventListener("change",g);o.addEventListener("change",g);s.addEventListener("change",g);w.addEventListener("change",g);k.addEventListener("input",g);I&&I.addEventListener("click",()=>{p+=B,L(),v("directory_load_more",{visible_count:Math.min(p,i.length),result_count:i.length})});h&&h.addEventListener("click",e=>{const t=e.target.closest("[data-map-link]");t&&v("provider_map_click",{provider_name:t.dataset.provider,provider_city:t.dataset.city,provider_country:t.dataset.country,provider_service_type:t.dataset.serviceType})});document.getElementById("mainSiteLink")?.addEventListener("click",()=>{v("outbound_click",{link_url:"https://healthmetrics.com",link_text:"Visit Main Site"})});z.addEventListener("click",()=>{u.value="",o.value="",s.value="",w.value="",k.value="",b("init"),S(),p=B,L(),v("directory_reset",{result_count:i.length})});G();
