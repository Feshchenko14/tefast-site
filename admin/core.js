/* TEFAST Admin — ядро: сховище, ролі, роутер, каркас, графіки, бокові панелі.
   Демо без сервера: усе в localStorage (ключ tefast-admin-db); B2B-дані — у tefast-b2b-db (b2b/b2b.js). */
(()=>{
const {$,$$,money,fd,pad,toast,seg,ico,IC}=B2B,esc=LIVE.esc,rd=LIVE.rd,wr=LIVE.wr,KEY=LIVE.KEY,SES='tefast-admin-session';
const P2={dash:'<rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>',chart:'<path d="M3 3v18h18"/><path d="m7 15 4-5 4 3 5-7"/>',box:'<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',tag:'<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.3"/>',pct:'<path d="m19 5-14 14"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',img:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',key:'<circle cx="8" cy="14" r="4"/><path d="m11 11 9-9M16 6l3 3M14 8l2 2"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M22 21a7 7 0 0 0-4-6.3"/>',file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',print:'<path d="M6 9V3h12v6M6 18H4v-8h16v8h-2M7 14h10v7H7z"/>',dl:'<path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/>',star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',x:'<path d="M5 5l14 14M19 5 5 19"/>',news:'<path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5"/>',q:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',truck:'<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',bell:'<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>',check:'<path d="m5 12 5 5 9-10"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'};
Object.assign(IC,P2);

/* ---------- розділи та ролі ---------- */
const SECS=[['dash','Дашборд'],['analytics','Аналітика'],['orders','Замовлення'],['products','Товари'],['cats','Категорії'],['promo','Промокоди й акції'],['content','Контент сайту'],['b2b','B2B-партнери'],['access','Доступи'],['settings','Налаштування']];
const LV=['Немає','Перегляд','Редагування'];
const mkp=o=>Object.fromEntries(SECS.map(([k])=>[k,o[k]||0]));
const ROLES0={owner:{name:'Власник',locked:true,p:mkp(Object.fromEntries(SECS.map(([k])=>[k,2])))},
 manager:{name:'Менеджер',p:mkp({dash:2,analytics:1,orders:2,products:1,promo:1,b2b:2})},
 content:{name:'Контент-менеджер',p:mkp({dash:1,products:2,cats:2,promo:2,content:2})},
 accountant:{name:'Бухгалтер',p:mkp({dash:1,analytics:2,orders:1,b2b:1})},
 warehouse:{name:'Склад',p:mkp({dash:1,orders:2,products:2})}};
const RST=['Новий','Підтверджено','Оплачено','Відправлено','Виконано','Скасовано','Повернення'];
const RCLS={'Новий':'b-new','Підтверджено':'b-warn','Оплачено':'b-ok','Відправлено':'b-warn','Виконано':'b-ok','Скасовано':'b-bad','Повернення':'b-bad'};
const stB=s=>`<span class="badge ${RCLS[s]||B2B.oBadge(s).match(/b-\w+/)?.[0]||'b-mut'}">${s}</span>`;
const DEL={np:'Нова пошта, відділення',co:'Кур\'єр Нової пошти',pk:'Самовивіз зі складу'};
const PAY={card:'Карткою онлайн',cod:'Накладений платіж',inv:'Рахунок для юрособи'};

/* ---------- сховище ---------- */
function mul(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const iso=d=>LIVE.iso(d),dayAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return d};
function seed(){
 const r=mul(2026),pick=a=>a[Math.floor(r()*a.length)],now=Date.now();
 const names=['Олексій Коваль','Марина Дорош','Ігор Петренко','Тарас Шевчук','Юлія Бондар','Назар Мельник','Оксана Гринь','Віктор Сидоренко','Андрій Лисенко','Катерина Тимчук','Денис Кравець','Софія Романюк'];
 const cities=['Київ','Львів','Дніпро','Одеса','Харків','Полтава','Вінниця','Чернівці'];
 const base=PRODUCTS.slice(0,24);let orders=[];
 for(let i=0;i<38;i++){const age=i<4?0+(i>1?1:0):Math.floor(Math.pow(r(),1.4)*58)+1,d=new Date(now-age*864e5-Math.floor(r()*8e7));
  const its=[];const n=1+Math.floor(r()*3);for(let k=0;k<n;k++){const p=pick(base);if(!its.find(x=>x.id===p.id))its.push({id:p.id,q:1+Math.floor(r()*(p.price<3000?3:1)),price:p.price})}
  const sub=its.reduce((s,x)=>s+x.price*x.q,0),dl=pick(['np','np','np','co','pk']),fee=dl==='co'?200:dl==='np'&&sub<3000?150:0,pr=r()<.22?'TESLA10':'',disc=pr&&sub>=2000?Math.round(sub*.1):0;
  const st=age<=1?pick(['Новий','Новий','Підтверджено']):age<5?pick(['Підтверджено','Оплачено','Відправлено']):age<12?pick(['Відправлено','Виконано','Виконано']):pick(['Виконано','Виконано','Виконано','Виконано','Скасовано','Повернення']);
  const nm=pick(names);orders.push({id:'',date:d.toISOString(),src:'site',cust:{name:nm,phone:'+380 67 '+String(100+Math.floor(r()*899))+' '+String(10+Math.floor(r()*89))+' '+String(10+Math.floor(r()*89)),email:'',city:pick(cities),addr:'Відділення №'+(1+Math.floor(r()*80))},items:its,delivery:dl,fee,pay:pick(['card','card','cod','inv']),promo:pr&&disc?pr:'',disc,total:sub-disc+fee,comment:r()<.3?'VIN: 5YJ3E1EA7KF'+String(100000+Math.floor(r()*899999)):'',status:st,hist:[{t:d.toISOString(),m:'Замовлення створено на сайті',u:'Сайт'}]})}
 orders.sort((a,b)=>a.date.localeCompare(b.date));orders.forEach((o,i)=>o.id='R-'+(24100+i));orders.reverse();
 const mkU=(id,name,email,role,last,act=true)=>({id,name,email,role,last,active:act,pass:'admin123'});
 const D={v:1,
  shop:Object.assign({},LIVE.DEF_SHOP),
  company:{name:'ТОВ «ТЕФАСТ» (приклад)',edrpou:'00000000',iban:'UA00 0000 0000 0000 0000 0000 0000 0',bank:'АТ «Банк» (приклад)',address:'Полтава, вул. Складська (приклад)',tax:'Без ПДВ (приклад)',prefInv:'СФ-',prefWb:'РН-',prefRc:'ТЧ-',signer:'Менеджер з продажу'},
  roles:JSON.parse(JSON.stringify(ROLES0)),
  users:[mkU('u1','Дмитро Ф.','owner@demo.example','owner',now),mkU('u2','Ірина Менеджер','manager@demo.example','manager',now-3600e3),mkU('u3','Олег Контент','content@demo.example','content',now-864e5),mkU('u4','Наталія Бухгалтер','buh@demo.example','accountant',now-2*864e5),mkU('u5','Сергій Склад','sklad@demo.example','warehouse',now-5*864e5,false)],
  products:{ov:{},add:[],del:[]},cats:{hide:{},add:[],order:[]},
  banners:JSON.parse(JSON.stringify(DEF.banners)).map(b=>Object.assign(b,{from:'',to:''})),
  posts:JSON.parse(JSON.stringify(DEF.posts)),
  reviews:JSON.parse(JSON.stringify(DEF.reviews)).concat([{id:'r4',text:'Фара підійшла, але чекав на відправку три дні. Загалом задоволений.',name:'Богдан С.',meta:'Model 3 · Одеса',rating:4,status:'pending'},{id:'r5',text:'Дякую за швидку консультацію по VIN!',name:'Леся М.',meta:'Model Y · Тернопіль',rating:5,status:'pending'}]),
  faq:JSON.parse(JSON.stringify(DEF.faq)),
  promos:JSON.parse(JSON.stringify(LIVE.DEF_PROMOS)).concat([{id:'c3',code:'BLACK27',type:'percent',value:15,min:5000,limit:50,used:0,from:'2026-11-27',to:'2026-11-30',active:false,note:'Чорна п\'ятниця: −15% від 5 000 ₴'}]),
  actions:[{id:'a1',name:'Чорна п\'ятниця: електрика −10%',mode:'percent',value:10,grp:'Електрика',model:'',type:'',ids:[],from:'2026-11-27',to:'2026-11-30',active:false,badge:'BLACK FRIDAY'},
   {id:'a2',name:'Тиждень гальм −12%',mode:'percent',value:12,grp:'Гальмівна система',model:'',type:'',ids:[],from:'',to:'',active:false,badge:''},
   {id:'a3',name:'Аналоги −7%',mode:'percent',value:7,grp:'',model:'',type:'Аналог',ids:[],from:'',to:'',active:false,badge:''}],
  orders,log:[{t:new Date().toISOString(),u:'Система',m:'Демо-дані створено'}],seen:{}};
 return D}
let A=null;
const adb=()=>A||(A=rd(KEY)||(wr(KEY,seed()),rd(KEY)));
const save=()=>wr(KEY,A);
const user=()=>{const id=rd(SES);return id?adb().users.find(u=>u.id===id&&u.active)||null:null};
const role=()=>{const u=user();return u?adb().roles[u.role]:null};
const lvl=s=>{const r=role();return r?(r.p[s]||0):0};
const can=(s,l=1)=>lvl(s)>=l;
function log(m){const D=adb();D.log.unshift({t:new Date().toISOString(),u:(user()||{}).name||'—',m});D.log.length=Math.min(D.log.length,300);save()}
function ingest(){/* замовлення з вітрини → база адмінки */
 const q=rd(LIVE.NEW);if(!q||!q.length)return;const D=adb();let n=Math.max(24100,...D.orders.map(o=>+String(o.id).slice(2)||0));
 q.forEach(o=>{o.id='R-'+(++n);o.hist=[{t:o.date,m:'Замовлення створено на сайті',u:'Сайт'}];D.orders.unshift(o);if(o.promo){const p=D.promos.find(x=>x.code===o.promo);if(p)p.used++}});
 D.log.unshift({t:new Date().toISOString(),u:'Сайт',m:'Нових замовлень з вітрини: '+q.length});save();wr(LIVE.NEW,[])}
const resetAll=()=>{A=null;localStorage.removeItem(KEY);localStorage.removeItem(LIVE.NEW);B2B.reset();wr(SES,null)};

/* ---------- каталог: ефективні товари ---------- */
function products(){const pr=adb().products,ov=pr.ov,del=new Set(pr.del);
 return PRODUCTS.filter(p=>!del.has(p.id)).map(p=>ov[p.id]?Object.assign({},p,ov[p.id],{_base:true}):Object.assign({},p,{_base:true})).concat(pr.add.map(p=>Object.assign({},p,{_custom:true})))}
const prod=id=>products().find(p=>p.id===id);
function tree(){const c=adb().cats,T=TREE.map(t=>({g:t.g,s:[...t.s]}));(c.add||[]).forEach(x=>{let g=T.find(t=>t.g===x.g);if(!g){g={g:x.g,s:[]};T.push(g)}if(x.s&&!g.s.includes(x.s))g.s.push(x.s)});
 if(c.order&&c.order.length)T.sort((a,b)=>{const x=c.order.indexOf(a.g),y=c.order.indexOf(b.g);return(x<0?99:x)-(y<0?99:y)});return T}

/* ---------- замовлення (роздріб + B2B) ---------- */
function orders(){const D=adb(),B=B2B.db(),out=[];
 D.orders.forEach(o=>out.push({ref:'retail',id:o.id,date:o.date,who:o.cust.name,sub:o.cust.city,items:o.items,total:o.total,status:o.status,raw:o}));
 B.orders.forEach(o=>{const a=B.accounts.find(x=>x.id===o.acc)||{name:'—'};out.push({ref:'b2b',id:o.id,date:o.date,who:a.name,sub:'СТО-партнер',items:o.items,total:o.total,status:o.status,raw:o})});
 return out.sort((a,b)=>b.date.localeCompare(a.date))}
const sumQ=it=>it.reduce((s,x)=>s+x.q,0);

/* ---------- графіки ---------- */
const COL=['#FFDE01','#29282D','#C0C0C0','#9a8a00','#6B6A72','#EBCA00','#b9b9be','#3A393F'];
function bars(labels,series,{h=190,fmtv=money}={}){const W=720,pl=46,pb=22,pt=8,w=W-pl-4,H=h,ch=H-pb-pt,n=labels.length,max=Math.max(1,...labels.map((_,i)=>series.reduce((s,x)=>s+(x.v[i]||0),0)));
 const nice=(()=>{const e=Math.pow(10,Math.floor(Math.log10(max))),m=max/e;return(m<=1?1:m<=2?2:m<=5?5:10)*e})();
 const bw=w/n,g=[0,.5,1].map(f=>{const y=pt+ch*(1-f);return`<line class="g" x1="${pl}" x2="${W}" y1="${y}" y2="${y}"/><text x="${pl-6}" y="${y+4}" text-anchor="end">${nice*f>=1000?Math.round(nice*f/1000)+'k':Math.round(nice*f)}</text>`}).join('');
 let rects='';labels.forEach((l,i)=>{let y=pt+ch;series.forEach(s=>{const v=s.v[i]||0,hh=v/nice*ch;if(hh>0){y-=hh;rects+=`<rect class="b" x="${pl+i*bw+bw*.14}" y="${y}" width="${bw*.72}" height="${hh}" rx="2" fill="${s.c}"><title>${l} · ${s.n}: ${fmtv(v)}</title></rect>`}})});
 const step=Math.ceil(n/8),xl=labels.map((l,i)=>i%step===0||i===n-1?`<text x="${pl+i*bw+bw/2}" y="${H-5}" text-anchor="middle">${l}</text>`:'').join('');
 return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Графік">${g}${rects}${xl}</svg>`}
function donut(items){const tot=items.reduce((s,x)=>s+x.v,0)||1;let a=0;const R=54,C=2*Math.PI*R;
 const arcs=items.map((x,i)=>{const len=x.v/tot*C,o=`<circle r="${R}" cx="70" cy="70" fill="none" stroke="${COL[i%COL.length]}" stroke-width="22" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-a}" transform="rotate(-90 70 70)"><title>${esc(x.n)}: ${money(x.v)}</title></circle>`;a+=len;return o}).join('');
 return`<div class="donut"><svg viewBox="0 0 140 140" role="img" aria-label="Структура">${arcs}<text x="70" y="75" text-anchor="middle" style="font:600 14px var(--hf);fill:var(--ink)">${Math.round(tot/1000)}k</text></svg><div class="leg" style="flex-direction:column;gap:6px;flex:1;min-width:140px">${items.map((x,i)=>`<span><i style="background:${COL[i%COL.length]}"></i>${esc(x.n)} · <b style="color:var(--ink)">${Math.round(x.v/tot*100)}%</b></span>`).join('')}</div></div>`}
function hbar(items,f=money){const m=Math.max(1,...items.map(x=>x.v));return`<div class="hbar">${items.map(x=>`<div><span class="n" title="${esc(x.n)}">${esc(x.n)}</span><span><i style="width:${Math.max(3,x.v/m*100)}%"></i></span><b>${f(x.v)}</b></div>`).join('')}</div>`}
function csv(rows,name){const t='﻿'+rows.map(r=>r.map(c=>'"'+String(c??'').replace(/"/g,'""')+'"').join(';')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv;charset=utf-8'}));a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}

/* ---------- бокова панель ---------- */
let drEl,ovEl;
function open(html,{wide=false}={}){drEl.className='dr'+(wide?' wide':'');drEl.innerHTML=html;drEl.scrollTop=0;requestAnimationFrame(()=>{drEl.classList.add('on');ovEl.classList.add('on')});
 const x=drEl.querySelector('[data-x]');if(x)x.onclick=close;return drEl}
function close(){drEl&&drEl.classList.remove('on');ovEl&&ovEl.classList.remove('on')}
const sw=(id,on,label)=>`<label class="opt" style="align-items:center"><span class="swt"><input type="checkbox" id="${id}" ${on?'checked':''}><i></i></span><span>${label}</span></label>`;
const hd=(t,s)=>`<div class="hd"><div><h2>${t}</h2>${s?`<small class="mu">${s}</small>`:''}</div><button class="btn btn-l btn-s" type="button" data-x aria-label="Закрити">✕</button></div>`;
const val=id=>drEl.querySelector('#'+id).value,chk=id=>drEl.querySelector('#'+id).checked;

/* ---------- роутер і каркас ---------- */
const PAGES={};let cur={id:'dash',q:{}};
const reg=(id,p)=>PAGES[id]=p;
const parse=()=>{const h=location.hash.replace(/^#\/?/,'');const[a,b]=h.split('?');return{id:a||'dash',q:Object.fromEntries(new URLSearchParams(b||''))}};
const NAV=[['Огляд',[['dash','dash','Дашборд'],['analytics','chart','Аналітика']]],['Продажі',[['orders','list','Замовлення'],['b2b','shield','B2B-партнери']]],['Каталог',[['products','box','Товари'],['cats','cat','Категорії'],['promo','pct','Промокоди й акції']]],['Сайт',[['content','img','Контент сайту']]],['Система',[['access','key','Доступи'],['settings','gear','Налаштування']]]];
function counts(){const D=adb(),B=B2B.db();return{orders:D.orders.filter(o=>o.status==='Новий').length+B.orders.filter(o=>o.status==='Новий').length,b2b:B.accounts.filter(a=>a.status==='new').length,content:D.reviews.filter(r=>r.status==='pending').length}}
function shell(){const u=user(),r=role(),c=counts();
 document.body.className='adm';
 const ini=u.name.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
 $('#app').innerHTML=`<div class="app"><aside class="side" id="side" aria-label="Меню"><div class="brand"><a href="#/dash" aria-label="TEFAST Admin"><img src="../logo.png" alt="TEFAST"></a><b>ADMIN</b></div><nav class="nav">${NAV.map(([g,items])=>{const it=items.filter(([id])=>can(id));return it.length?`<div class="grp">${g}</div>`+it.map(([id,ic,l])=>`<a href="#/${id}" data-id="${id}">${ico(ic)}${l}${c[id]?`<span class="bd">${c[id]}</span>`:''}</a>`).join(''):''}).join('')}</nav>
  <div class="foot"><a class="mgr" href="../index.html" target="_blank" rel="noopener">${ico('site')}Відкрити сайт</a><a class="mgr" href="../b2b/login.html" target="_blank" rel="noopener">${ico('shield')}Кабінет СТО</a></div></aside>
  <div class="main"><header class="top" id="top"><button class="ic burger" id="burger" aria-label="Меню">${ico('menu')}</button><div class="tt"><h1 id="pt"></h1><p id="ps"></p></div><span class="demo">ДЕМО</span>
   <form class="tsearch" id="gs" role="search">${ico('search')}<label class="sr" for="gsi">Пошук</label><input id="gsi" placeholder="№ замовлення, товар, СТО" autocomplete="off"><kbd>/</kbd></form>
   <button class="av" id="avb" aria-haspopup="menu" aria-expanded="false" aria-label="Акаунт">${ini}</button>
   <div class="menu" id="menu" role="menu"><div class="who"><b>${esc(u.name)}</b><small>${esc(r.name)} · ${esc(u.email)}</small></div><div style="padding:6px 12px;color:var(--mut);font-size:12px">Увійти як (демо ролей)</div>${adb().users.filter(x=>x.active&&x.id!==u.id).map(x=>`<button data-as="${x.id}" role="menuitem">${ico('user')}${esc(x.name)} <small style="color:var(--mut)">${esc(adb().roles[x.role].name)}</small></button>`).join('')}<button id="lo" role="menuitem">${ico('out')}Вийти</button></div></header>
   <main class="view" id="view" aria-live="polite"></main></div></div><div class="ov" id="ov"></div><aside class="dr" id="dr" aria-label="Деталі"></aside>`;
 drEl=$('#dr');ovEl=$('#ov');ovEl.onclick=close;
 const menu=$('#menu'),avb=$('#avb'),top=$('#top');
 addEventListener('scroll',()=>top.classList.toggle('scrolled',scrollY>6),{passive:true});
 avb.onclick=e=>{e.stopPropagation();const o=!menu.classList.contains('on');menu.classList.toggle('on',o);avb.setAttribute('aria-expanded',o)};
 addEventListener('click',e=>{if(!menu.contains(e.target)){menu.classList.remove('on');avb.setAttribute('aria-expanded','false')}});
 menu.addEventListener('click',e=>{const b=e.target.closest('[data-as]');if(b){wr(SES,b.dataset.as);location.hash='#/dash';boot();toast('Ви увійшли як '+user().name)}});
 $('#lo').onclick=()=>{wr(SES,null);boot()};
 $('#burger').onclick=()=>$('#side').classList.toggle('open');
 $('#side').addEventListener('click',e=>{if(e.target.closest('a'))$('#side').classList.remove('open')});
 document.addEventListener('click',e=>{if($('#side')&&$('#side').classList.contains('open')&&!e.target.closest('#side')&&!e.target.closest('#burger'))$('#side').classList.remove('open')});
 $('#gs').onsubmit=e=>{e.preventDefault();const v=$('#gsi').value.trim();if(!v)return;const D=adb();
  const o=orders().find(x=>x.id.toLowerCase()===v.toLowerCase()||x.id.toLowerCase().endsWith(v.toLowerCase())&&v.length>=4);
  location.hash=o&&can('orders')?'#/orders?q='+encodeURIComponent(v):can('products')?'#/products?q='+encodeURIComponent(v):'#/dash'};
 route()}
function login(){document.body.className='';const D=adb();
 $('#app').innerHTML=`<div class="login"><form class="box" id="lf"><img src="../logo.png" alt="TEFAST"><div><h2 style="font-size:20px">Вхід в адмін-панель</h2><p style="color:var(--mut);margin-top:4px">Демо: пароль <b>admin123</b>. Оберіть роль, щоб побачити різні рівні доступу.</p></div>
  <label class="fl">Email<input id="le" type="email" value="owner@demo.example" autocomplete="username"></label><label class="fl">Пароль<input id="lp" type="password" value="admin123" autocomplete="current-password"></label><div class="err" id="lerr" style="color:var(--bad);min-height:18px"></div>
  <button class="btn btn-y" type="submit">Увійти</button><div class="who"><small style="color:var(--mut)">Швидкий вхід:</small>${D.users.filter(u=>u.active).map(u=>`<button type="button" data-u="${u.id}"><span class="av" style="color:var(--ink);width:34px;height:34px;border-radius:50%;background:var(--y);display:grid;place-items:center;font-weight:700;flex:none">${esc(u.name[0])}</span><span><b>${esc(u.name)}</b><small>${esc(D.roles[u.role].name)}</small></span></button>`).join('')}</div><a href="../index.html" style="color:var(--mut);text-align:center">← На сайт</a></form></div>`;
 const go=u=>{wr(SES,u.id);u.last=Date.now();save();log('Вхід у панель');location.hash='#/dash';boot()};
 $('#lf').onsubmit=e=>{e.preventDefault();const u=D.users.find(x=>x.email.toLowerCase()===$('#le').value.trim().toLowerCase());if(!u||u.pass!==$('#lp').value)return $('#lerr').textContent='Невірний email або пароль';if(!u.active)return $('#lerr').textContent='Обліковий запис вимкнено';go(u)};
 $$('[data-u]').forEach(b=>b.onclick=()=>go(D.users.find(u=>u.id===b.dataset.u)))}
function route(){cur=parse();let id=cur.id;if(!PAGES[id])id='dash';
 if(!can(id)){const first=SECS.find(([k])=>can(k));if(first&&first[0]!==id){location.replace('#/'+first[0]);return}}
 close();const pg=PAGES[id],v=$('#view');
 $$('.nav a').forEach(a=>{const on=a.dataset.id===id;a.classList.toggle('on',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
 $('#pt').textContent=pg.title;$('#ps').textContent=pg.sub||'';document.title=pg.title+' — TEFAST Admin';
 document.body.classList.toggle('ro',!can(id,2));
 if(!can(id)){v.innerHTML='<div class="deny card"><h2>Немає доступу</h2><p style="color:var(--mut);margin-top:8px">Для вашої ролі цей розділ вимкнено.</p></div>';return}
 v.innerHTML=(!can(id,2)?'<div class="note info"><span>Ваша роль має лише перегляд цього розділу: кнопки редагування приховано.</span></div>':'')+'<div id="pg"></div>';
 v.style.display='grid';pg.render($('#pg'),cur.q);scrollTo(0,0)}
function refresh(){const p=$('#pg');if(p){const y=scrollY;PAGES[PAGES[cur.id]?cur.id:'dash'].render(p,cur.q);scrollTo(0,y)}const c=counts();$$('.nav a').forEach(a=>{let b=$('.bd',a);const n=c[a.dataset.id];if(n){if(!b){b=document.createElement('span');b.className='bd';a.append(b)}b.textContent=n}else if(b)b.remove()})}
function boot(){ingest();if(!user()){login();return}shell()}
addEventListener('hashchange',()=>{if(user()&&$('#view'))route()});
addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='/'&&$('#gsi')&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#gsi').focus()}});
addEventListener('storage',e=>{if(e.key===LIVE.NEW&&user()){ingest();refresh()}});

window.ADM={adb,save,log,user,role,can,lvl,reg,boot,route,refresh,SECS,LV,ROLES0,RST,stB,DEL,PAY,products,prod,tree,orders,sumQ,bars,donut,hbar,csv,open,close,sw,hd,val,chk,esc,iso,dayAgo,resetAll,seed,counts,mul,COL};
document.addEventListener('DOMContentLoaded',boot);
})();
