let D,lang=new URLSearchParams(location.search).get('lang')||'ko';
const $=s=>document.querySelector(s);
const UI={ko:{badge:'비공식',ph:'궁금한 걸 적어 주세요 (예: 주차)',send:'보내기',chat:'안내',tl:'연표',home:'처음으로',map:'지도 보기',timeline:'연표',report:'정보가 틀렸어요',reportMsg:'오류 제보 기능은 준비 중이에요. 상인회(042-272-8903)에 알려 주세요.',tlHead:'시대별 연표',disputed:'출처 불일치·확인 필요',src:'출처'},
 en:{badge:'Unofficial',ph:'Ask a question (e.g. parking)',send:'Send',chat:'Guide',tl:'Timeline',home:'Main menu',map:'Map',timeline:'Timeline',report:'Report an error',reportMsg:'Error reporting is coming soon. Please call +82-42-272-8903.',tlHead:'Timeline',disputed:'Sources differ — to be confirmed',src:'Source'}};
const L=()=>UI[lang]||UI.ko, T=o=>o[lang]??o.ko;
function seoulNow(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const g=t=>p.find(x=>x.type==t).value;return{dow:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday')),min:+g('hour')*60+ +g('minute'),hm:g('hour')+':'+g('minute')}}
const toMin=s=>{const[h,m]=s.split(':');return h*60+ +m};
function nextDeparture(){const n=seoulNow(),d=D.delivery.departures.find(t=>toMin(t)>n.min);const fmt=t=>{const h=+t.split(':')[0];return lang=='en'?(h<12?h+':00 AM':(h-12||12)+':00 PM'):(h<12?'오전 ':'오후 ')+(h>12?h-12:h)+'시'};
 if(lang=='en')return `Now ${n.hm} (Korea time) → next departure: ${d?'today '+fmt(d):'tomorrow '+fmt(D.delivery.departures[0])}. Cut-off time: coming soon.`;
 return `지금 ${n.hm}(한국 시간) → 다음 출발편: ${d?'오늘 '+fmt(d):'내일 '+fmt(D.delivery.departures[0])} (출발편별 접수 마감: 준비 중)`}
function parkingNow(){const n=seoulNow(),P=D.parking_lot,h=P.charge_hours[n.dow],en=lang=='en';
 if(P.unknown_days.includes(n.dow))return en?`Now ${n.hm}: unattended 24 h, open. Sunday fees: to be confirmed.`:`지금 ${n.hm}: 24시간 무인 운영 중, 일요일·공휴일 요금 부과 여부 확인 필요`;
 const c=h&&n.min>=toMin(h[0])&&n.min<toMin(h[1]);
 if(en)return `Now ${n.hm}: unattended 24 h, open. `+(c?`Fees apply now (until ${h[1]}).`:`Outside fee hours — free.`)+` (Public holidays: to be confirmed)`;
 return `지금 ${n.hm}: 24시간 무인 운영 중, `+(c?`지금은 요금 부과 시간(~${h[1]})`:`지금은 요금 부과 시간 외(무료)`)+` (공휴일이면 확인 필요)`}
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function fmtLine(s){s=s.replace('{{next_departure}}',nextDeparture()).replace('{{parking_now}}',parkingNow());let h=esc(s);
 h=h.replace(/(\+82-42-272-8903|042-272-8903)/g,'<a class="tel" href="tel:+82422728903">$1</a>').replace(/(\+82-2-1330|\b1330\b)/,'<a class="tel" href="tel:1330">$1</a>');
 h=h.replace(/(준비 중|coming soon|확인 필요|to be confirmed)/gi,'<span class="pending">$1</span>');return '<p>'+h+'</p>'}
function add(html,who='bot'){const d=document.createElement('div');d.className='msg '+who;d.innerHTML=html;$('#chat').append(d);d.scrollIntoView({block:'start',behavior:'smooth'});return d}
function btn(id,label){return `<button data-go="${id}">${esc(label)}</button>`}
function item(id){return D.items.find(i=>i.id==id)}
function show(id){
 if(id=='home')return greet();if(id=='timeline')return showTl();
 if(id=='map'){window.open(D.meta.map_url,'_blank');return}
 if(id=='report')return add(fmtLine(L().reportMsg));
 const it=item(id);if(!it)return;const lines=lang=='ko'||lang=='en'?T(it.answer):it.answer.ko;
 const pre=(lang=='zh'||lang=='ja')?fmtLine(T(D.greeting)):'';
 let b=it.buttons.map(x=>btn(x,x=='map'?L().map:x=='timeline'?L().timeline:T(item(x).label))).join('')+btn('home',L().home)+btn('report',L().report);
 add(pre+lines.map(fmtLine).join('')+`<div class="btns">${b}</div>`)}
function greet(){add(fmtLine(T(D.greeting)))}
function answer(q){add(esc(q),'me');const s=q.toLowerCase();let best=null,sc=0;
 for(const it of D.items){let n=it.keywords.filter(k=>s.includes(k.toLowerCase())).reduce((a,k)=>a+k.length,0);if(n>sc){sc=n;best=it}}
 if(/연표|timeline/.test(s))return show('timeline');
 best?show(best.id):add(fmtLine(T(D.fallback))+`<div class="btns">${btn('contact',T(item('contact').label))}</div>`)}
function renderQuick(){$('#quick').innerHTML=D.items.filter(i=>i.quick).map(i=>`<button data-go="${i.id}">${i.icon}<br>${esc(T(i.label))}</button>`).join('')}
function showTl(){$('#tabTl').click()}
function renderTl(){$('#tl').innerHTML=`<h2>${L().tlHead}</h2>`+D.timeline.map(e=>`<div class="ev${e.disputed?' dis':''}"><div class="y">${esc(e.year)}</div><div>${esc(lang=='en'?e.text.en:e.text.ko)}</div><div class="s">${L().src}: ${esc(e.source)} ${e.disputed?`<span class="flag">${L().disputed}</span>`:''}</div></div>`).join('')+`<p class="s">${Object.entries(D.sources).map(([k,v])=>esc(k+': '+v)).join('<br>')}</p>`}
function applyLang(){document.documentElement.lang=lang;document.querySelectorAll('.langs button').forEach(b=>b.classList.toggle('on',b.dataset.lang==lang));
 $('#badge').textContent=L().badge;$('#appName').textContent=lang=='en'?'Munchang Market Helper':D.meta.name;$('#q').placeholder=L().ph;$('#ask button').textContent=L().send;
 $('#tabChat span').textContent=L().chat;$('#tabTl span').textContent=L().tl;$('#disc').innerHTML=fmtLine('ⓘ '+(lang=='en'?D.disclaimer.en:D.disclaimer.ko)+(lang=='en'?' Operator: Jsquare.':' 운영: '+D.meta.operator));
 renderQuick();renderTl()}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){if(!g.closest('.me'))add(esc(g.textContent),'me');show(g.dataset.go)}
 const l=e.target.closest('[data-lang]');if(l){lang=l.dataset.lang;applyLang();$('#chat').innerHTML='';greet()}});
$('#tabChat').onclick=()=>{$('#tabChat').classList.add('on');$('#tabTl').classList.remove('on');$('#chat').hidden=false;$('#tl').hidden=true;$('#quick').hidden=false;$('#ask').hidden=false};
$('#tabTl').onclick=()=>{$('#tabTl').classList.add('on');$('#tabChat').classList.remove('on');$('#chat').hidden=true;$('#tl').hidden=false;$('#quick').hidden=true;$('#ask').hidden=true};
$('#ask').onsubmit=e=>{e.preventDefault();const v=$('#q').value.trim();if(v){answer(v);$('#q').value=''}};
fetch('data.json').then(r=>r.json()).then(d=>{D=d;applyLang();greet();const h=location.hash.slice(1);if(h)show(h)});
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
