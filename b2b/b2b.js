/* TEFAST B2B — спільне ядро: «база» в localStorage, ціни, кошик, замовлення, каркас сторінок.
   Це макет без сервера: усі дані живуть у браузері й можуть бути скинуті кнопкою «Скинути демо-дані». */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const K={db:'tefast-b2b-db',ses:'tefast-b2b-session',cart:'tefast-b2b-cart'},mem={};
const rd=k=>{try{const v=localStorage.getItem(k);return v==null?null:JSON.parse(v)}catch(e){return mem[k]??null}};
const wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){mem[k]=v}};
const pad=n=>String(n).padStart(2,'0');
const fd=(d,t)=>{d=new Date(d);return pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'+d.getFullYear()+(t?' '+pad(d.getHours())+':'+pad(d.getMinutes()):'')};
const money=n=>{n=Math.round(n*100)/100;const s=(Number.isInteger(n)?String(n):n.toFixed(2).replace('.',','));return s.replace(/\B(?=(\d{3})+(?!\d)(?![^,]*,\d{3}))/g,' ')+' ₴'};
const days=n=>{const d=new Date();d.setDate(d.getDate()+n);return d};
const byId=id=>PRODUCTS.find(p=>p.id===id);
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9а-яіїєґ]/gi,'');

/* ---------- «база» ---------- */
function seed(){
 const now=Date.now(),day=864e5;
 const mk=(id,name,edrpou,contact,phone,email,pass,status,terms,extra={})=>({id,name,edrpou,contact,phone,email,pass,city:'Полтава',address:'вул. Сервісна',posts:4,status,created:new Date(now-30*day).toISOString(),terms,...extra});
 const db={settings:{verifyMode:'manual'},accounts:[
  mk('a1','СТО «АвтоЕлектро Полтава»','38291745','Андрій Коваленко','+380 50 000 00 01','sto@demo.example','demo1234','verified',{mode:'percent',value:12,minOrder:5000,deferral:true,deferralDays:14,creditLimit:50000,used:12400}),
  mk('a2','СТО «Швидкий сервіс»','41562873','Ірина Мельник','+380 50 000 00 02','new@demo.example','demo1234','new',{mode:'percent',value:5,minOrder:3000,deferral:false,deferralDays:0,creditLimit:0,used:0},{created:new Date(now-2*day).toISOString()}),
  mk('a3','СТО «Гараж 24»','35871290','Олег Бондар','+380 50 000 00 03','stop@demo.example','demo1234','suspended',{mode:'fixed',value:150,minOrder:5000,deferral:true,deferralDays:7,creditLimit:20000,used:20000},{reason:'Є прострочена заборгованість за рахунком TF-10388.'})
 ],orders:[]};
 const it=(id,q)=>{const p=byId(id);return{id,q,retail:p.price,price:Math.round(p.price*.88)}};
 const mkO=(n,off,items,pay,status)=>{const retail=items.reduce((s,x)=>s+x.retail*x.q,0),total=items.reduce((s,x)=>s+x.price*x.q,0);return{id:'TF-'+n,acc:'a1',date:new Date(now-off*day).toISOString(),items,retail,total,pay,due:pay==='deferral'?new Date(now-off*day+14*day).toISOString():null,delivery:'Нова пошта',comment:'',status}};
 db.orders=[mkO(10421,12,[it('kolodky-halmivni',4),it('rulova-tiaha',6)],'deferral','Виконано'),mkO(10438,3,[it('vazhil-pidviski',2),it('perednii-bamper-model-y',1)],'deferral','Відправлено')];
 return db;
}
let DB=null;
const db=()=>DB||(DB=rd(K.db)||(wr(K.db,seed()),rd(K.db))||seed());
const save=()=>wr(K.db,DB);
const reset=()=>{DB=seed();save();wr(K.ses,null);wr(K.cart,[])};

/* ---------- сесія ---------- */
const me=()=>{const id=rd(K.ses);return id?db().accounts.find(a=>a.id===id)||null:null};
function login(email,pass){const a=db().accounts.find(x=>x.email.toLowerCase()===String(email).trim().toLowerCase());
 if(!a||a.pass!==pass)return{err:'Невірний email або пароль'};wr(K.ses,a.id);return{acc:a}}
const logout=()=>wr(K.ses,null);
function register(d){const D=db();if(D.accounts.some(a=>a.email.toLowerCase()===d.email.toLowerCase()))return{err:'Акаунт із таким email уже існує'};
 const auto=D.settings.verifyMode==='auto'&&/^\d{8}$/.test(d.edrpou);
 const a={id:'a'+(Date.now()%1e7),name:d.name,edrpou:d.edrpou,contact:d.contact,phone:d.phone,email:d.email,pass:d.pass,city:d.city,address:d.address,posts:+d.posts||1,
  status:auto?'verified':'new',created:new Date().toISOString(),auto,terms:{mode:'percent',value:5,minOrder:3000,deferral:false,deferralDays:0,creditLimit:0,used:0}};
 D.accounts.push(a);save();wr(K.ses,a.id);return{acc:a}}

/* ---------- ціни ---------- */
function price(p,acc=me()){const t=acc&&acc.terms;if(!t)return p.price;
 const v=t.mode==='fixed'?p.price-t.value:p.price*(1-t.value/100);return Math.max(1,Math.round(v))}
const discLabel=t=>t.mode==='fixed'?`−${money(t.value)} за одиницю`:`−${t.value}% від роздрібної`;
function avail(p,mode='delivery'){const s=p.stock,today=s>=6?Math.floor(s*.4):0,tomorrow=s>=3?Math.floor(s*.3):0,later=s-today-tomorrow;
 const lat=days(3);return{today,tomorrow,later,laterDate:pad(lat.getDate())+'.'+pad(lat.getMonth()+1),total:s}}

/* ---------- кошик ---------- */
const cart={get:()=>rd(K.cart)||[],set:v=>wr(K.cart,v),
 add(id,q=1){const c=cart.get(),i=c.find(x=>x.id===id);i?i.q=Math.min(i.q+q,999):c.push({id,q});cart.set(c);badge(true)},
 qty(id,q){let c=cart.get();c=q<=0?c.filter(x=>x.id!==id):c.map(x=>x.id===id?{id,q:Math.min(q,999)}:x);cart.set(c);badge()},
 clear(){cart.set([]);badge()},count:()=>cart.get().reduce((s,x)=>s+x.q,0),
 totals(acc=me()){const it=cart.get().map(x=>{const p=byId(x.id);return{...x,p,price:price(p,acc),retail:p.price}});
  const retail=it.reduce((s,x)=>s+x.retail*x.q,0),total=it.reduce((s,x)=>s+x.price*x.q,0);return{items:it,retail,total,discount:retail-total}}};

/* ---------- замовлення ---------- */
const orders=(acc=me())=>db().orders.filter(o=>acc&&o.acc===acc.id).sort((a,b)=>b.date.localeCompare(a.date));
function createOrder(acc,{pay,delivery,comment}){const t=cart.totals(acc),D=db();
 let n=Math.max(10440,...D.orders.map(x=>+x.id.slice(3)||0))+1+Math.floor(Math.random()*9);
 const o={id:'TF-'+n,acc:acc.id,date:new Date().toISOString(),items:t.items.map(x=>({id:x.id,q:x.q,retail:x.retail,price:x.price})),retail:t.retail,total:t.total,pay,
  due:pay==='deferral'?days(acc.terms.deferralDays).toISOString():null,delivery,comment,status:'Новий'};
 D.orders.push(o);if(pay==='deferral')acc.terms.used+=t.total;save();cart.clear();return o}
const credit=acc=>{const t=acc.terms;return{limit:t.creditLimit,used:t.used,free:Math.max(0,t.creditLimit-t.used)}};

/* ---------- UI-хелпери ---------- */
let tt;function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.append(t)}t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2600)}
function badge(bump){const n=cart.count();$$('.cartc').forEach(e=>{e.textContent=n;e.hidden=!n;if(bump&&n&&!matchMedia('(prefers-reduced-motion:reduce)').matches){e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')}});$$('.nav .bd').forEach(e=>{e.textContent=n;e.hidden=!n})}
const STATUS={new:['Новий','b-new'],verified:['Верифікований','b-ok'],suspended:['Призупинений','b-bad']};
const stBadge=s=>`<span class="badge ${STATUS[s][1]}">${STATUS[s][0]}</span>`;
const OST={'Новий':'b-new','В обробці':'b-warn','Відправлено':'b-warn','Виконано':'b-ok','Скасовано':'b-bad'};
const oBadge=s=>`<span class="badge ${OST[s]||'b-mut'}">${s}</span>`;
function seg(el,onchange){el.classList.add('seg');if(!$('.ind',el)){const i=document.createElement('span');i.className='ind';el.prepend(i)}
 const mv=()=>{const on=$('button.on',el)||$('button',el);if(!on)return;const i=$('.ind',el);i.style.width=on.offsetWidth+'px';i.style.transform=`translateX(${on.offsetLeft-3}px)`};
 $$('button',el).forEach(b=>b.addEventListener('click',()=>{$$('button',el).forEach(x=>x.classList.toggle('on',x===b));mv();onchange&&onchange(b.dataset.v,b)}));
 mv();requestAnimationFrame(mv);addEventListener('resize',mv);(document.fonts&&document.fonts.ready||Promise.resolve()).then(mv);el._mv=mv}

const IC={home:'<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/>',cat:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',bolt:'<path d="M13 2 5 14h6l-1 8 8-12h-6z"/>',cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',site:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'};
const ico=n=>`<svg class="i" viewBox="0 0 24 24">${IC[n]}</svg>`;

function shell({active,title,sub,auth=true}){
 const acc=me();
 if(auth&&(!acc||acc.status!=='verified')){location.replace('login.html');return null}
 const view=$('#view');view.classList.add('view');
 const nav=(href,id,ic,label,extra='')=>`<a href="${href}"${active===id?' class="on" aria-current="page"':''}>${ico(ic)}${label}${extra}</a>`;
 const ini=acc?acc.name.replace(/[«»"]/g,'').split(/\s+/).filter(w=>w.length>2&&!/^СТО$/i.test(w)).map(w=>w[0]).slice(0,2).join('').toUpperCase()||'СТ':'';
 const cr=acc?credit(acc):null,t=acc&&acc.terms;
 const app=document.createElement('div');app.className='app';
 app.innerHTML=`<aside class="side" id="side" aria-label="Меню"><div class="brand"><a href="index.html" aria-label="TEFAST B2B"><img src="../logo.png" alt="TEFAST"></a><b>B2B</b></div>
  <nav class="nav"><div class="grp">Каталоги</div>${nav('index.html','home','home','Головна')}${nav('catalog.html','catalog','cat','Каталог')}${nav('quick.html','quick','bolt','Швидке замовлення')}
  <div class="grp">Замовлення</div>${nav('cart.html','cart','cart','Кошик','<span class="bd cartc" hidden>0</span>')}${nav('orders.html','orders','list','Мої замовлення')}
  <div class="grp">Акаунт</div>${nav('profile.html','profile','user','Профіль і умови')}</nav>
  <div class="foot"><a class="mgr" href="../index.html">${ico('site')}Перейти на сайт</a><a class="mgr" href="admin.html">${ico('shield')}Панель менеджера (демо)</a></div></aside>
  <div class="main"><header class="top" id="top"><button class="ic burger" id="burger" aria-label="Меню">${ico('menu')}</button>
   <div class="tt"><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div>
   <form class="tsearch" id="gs" role="search">${ico('search')}<label class="sr" for="gsi">Пошук за артикулом</label><input id="gsi" placeholder="Артикул або назва" autocomplete="off"></form>
   ${acc&&t.deferral?`<span class="chip bal" title="Доступний кредитний ліміт">${ico('shield')}<span class="v"><small>Доступний ліміт</small>${money(cr.free)}</span></span>`:acc?`<span class="chip bal"><span class="v"><small>Ваша знижка</small>${t.mode==='fixed'?money(t.value):t.value+'%'}</span></span>`:''}
   <a class="ic" href="cart.html" aria-label="Кошик">${ico('cart')}<i class="cartc" hidden>0</i></a>
   <button class="av" id="avb" aria-haspopup="menu" aria-expanded="false" aria-label="Акаунт">${ini}</button>
   <div class="menu" id="menu" role="menu"><div class="who"><b>${acc?acc.name:''}</b><small>${acc?stBadge(acc.status):''}</small></div>
    <a href="profile.html" role="menuitem">${ico('user')}Профіль і умови</a><a href="orders.html" role="menuitem">${ico('list')}Мої замовлення</a><button id="lo" role="menuitem">${ico('out')}Вийти</button></div></header></div>`;
 const main=$('.main',app);view.before(app);main.append(view);
 const top=$('#top'),menu=$('#menu'),avb=$('#avb');
 addEventListener('scroll',()=>top.classList.toggle('scrolled',scrollY>6),{passive:true});
 avb.onclick=e=>{e.stopPropagation();const o=!menu.classList.contains('on');menu.classList.toggle('on',o);avb.setAttribute('aria-expanded',o)};
 addEventListener('click',e=>{if(!menu.contains(e.target)){menu.classList.remove('on');avb.setAttribute('aria-expanded','false')}});
 addEventListener('keydown',e=>{if(e.key==='Escape'){menu.classList.remove('on');$('#side').classList.remove('open')}if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#gsi').focus()}});
 $('#lo').onclick=()=>{logout();location.href='login.html'};
 $('#burger').onclick=()=>$('#side').classList.toggle('open');
 $('#side').addEventListener('click',e=>{if(e.target.closest('a'))$('#side').classList.remove('open')});
 document.addEventListener('click',e=>{if($('#side').classList.contains('open')&&!e.target.closest('#side')&&!e.target.closest('#burger'))$('#side').classList.remove('open')});
 $('#gs').onsubmit=e=>{e.preventDefault();const v=$('#gsi').value.trim();location.href='catalog.html'+(v?'?q='+encodeURIComponent(v):'')};
 badge();return acc}

window.B2B={$,$$,db,save,reset,me,login,logout,register,price,discLabel,avail,cart,orders,createOrder,credit,byId,money,fd,days,pad,norm,toast,badge,STATUS,stBadge,oBadge,seg,ico,IC,shell};
})();
