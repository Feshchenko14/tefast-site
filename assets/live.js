/* TEFAST live — міст між адмін-панеллю та вітриною/B2B (демо без сервера).
   Читає «базу» адмінки (localStorage tefast-admin-db) і накладає правки на PRODUCTS, TREE, головну та кошик.
   Якщо адмінку ще не відкривали, нічого не змінюється. Підключати ПІСЛЯ tree.js і data.js. */
(()=>{
const KEY='tefast-admin-db',NEW='tefast-new-orders',mem={};
const rd=k=>{try{const v=localStorage.getItem(k);return v==null?null:JSON.parse(v)}catch(e){return mem[k]??null}};
const wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){mem[k]=v}};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const iso=d=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const DEF_SHOP={name:'TEFAST',phone:'+380 50 000 00 00',email:'hello@tefast.example',address:'Полтава, вул. Складська',hours:'Пн–Пт 9:00–19:00, Сб 10:00–16:00',freeFrom:3000,np:150,courier:200};
const DEF_PROMOS=[
 {id:'c1',code:'TESLA10',type:'percent',value:10,min:2000,limit:0,used:0,from:'',to:'',active:true,note:'−10% на кошик від 2 000 ₴'},
 {id:'c2',code:'WELCOME300',type:'fixed',value:300,min:3000,limit:100,used:0,from:'',to:'',active:true,note:'−300 ₴ першим покупцям'}];
const inRange=(o,t)=>(!o.from||o.from<=t)&&(!o.to||o.to>=t);
const db=()=>rd(KEY);
const shop=()=>Object.assign({},DEF_SHOP,(db()||{}).shop||{});
const promos=()=>{const d=db();return d&&d.promos?d.promos:DEF_PROMOS};
/* перевірка промокоду: {ok,discount,promo} або {ok:false,err} */
function promo(code,subtotal){code=String(code||'').trim().toUpperCase();if(!code)return{ok:false,err:'Введіть промокод'};
 const p=promos().find(x=>x.code.toUpperCase()===code);if(!p||!p.active)return{ok:false,err:'Промокод не знайдено'};
 const t=iso();if(!inRange(p,t))return{ok:false,err:'Термін дії промокоду минув або ще не настав'};
 const pend=(rd(NEW)||[]).filter(o=>o.promo===p.code).length;
 if(p.limit&&p.used+pend>=p.limit)return{ok:false,err:'Ліміт використань вичерпано'};
 if(subtotal<p.min)return{ok:false,err:'Мінімальна сума для цього коду — '+p.min+' ₴'};
 const d=p.type==='percent'?Math.round(subtotal*p.value/100):Math.min(p.value,subtotal);return{ok:true,discount:d,promo:p}}
/* нове замовлення з вітрини: адмінка підхопить його при відкритті */
function addOrder(o){const q=rd(NEW)||[];q.push(o);wr(NEW,q)}
window.LIVE={KEY,NEW,rd,wr,db,esc,iso,shop,promos,promo,addOrder,inRange,DEF_SHOP,DEF_PROMOS};

const path=location.pathname;
if(/\/admin\//.test(path))return;          // адмінка сама керує даними
const D=db();if(!D)return;
const isB2B=/\/b2b\//.test(path);

/* ---------- каталог: правки товарів, приховані та нові ---------- */
try{
 const pr=D.products||{},ov=pr.ov||{},del=new Set(pr.del||[]);
 let list=PRODUCTS.filter(p=>!del.has(p.id)).map(p=>ov[p.id]?Object.assign({},p,ov[p.id]):p);
 list=list.concat((pr.add||[]).filter(p=>!del.has(p.id)));
 /* акції: лише на вітрині, B2B-ціни рахуються від базових */
 if(!isB2B){const t=iso();(D.actions||[]).filter(a=>a.active&&inRange(a,t)).forEach(a=>{
  const hit=p=>(!a.grp||p.grp===a.grp)&&(!a.model||p.models.includes(a.model))&&(!a.type||p.type===a.type)&&(!a.ids||!a.ids.length||a.ids.includes(p.id));
  list=list.map(p=>{if(!hit(p))return p;const np=a.mode==='fixed'?Math.max(1,p.price-a.value):Math.round(p.price*(1-a.value/100));
   if(np>=p.price)return p;const q=Object.assign({},p);q.old=Math.max(p.old||0,p.price);q.price=np;q.badge=a.badge||('−'+Math.round((1-np/q.old)*100)+'%');return q})})}
 /* приховані товари не показуються в списках, але byId() знаходить їх (старі замовлення, кошик) */
 const all=list,shown=all.filter(p=>!p.hidden);
 Object.defineProperty(shown,'find',{value:function(f){return Array.prototype.find.call(all,f)},enumerable:false});
 window.PRODUCTS=shown;
}catch(e){console.warn('live: products',e)}

/* ---------- дерево розділів ---------- */
try{const c=D.cats;if(c&&window.TREE){
 (c.add||[]).forEach(x=>{let g=TREE.find(t=>t.g===x.g);if(!g){g={g:x.g,s:[]};TREE.push(g)}if(x.s&&!g.s.includes(x.s))g.s.push(x.s)});
 if(c.hide){for(let i=TREE.length-1;i>=0;i--){const g=TREE[i];if(c.hide[g.g]){TREE.splice(i,1);continue}g.s=g.s.filter(s=>!c.hide[g.g+'|'+s])}}
 if(c.order&&c.order.length)TREE.sort((a,b)=>{const x=c.order.indexOf(a.g),y=c.order.indexOf(b.g);return(x<0?99:x)-(y<0?99:y)});
 window.GROUPS=TREE.map(t=>t.g)}}catch(e){console.warn('live: tree',e)}

/* ---------- головна: банери, блог, відгуки, FAQ ---------- */
const fmt=t=>esc(t).replace(/\[\[(.+?)\]\]/g,'<mark>$1</mark>');
function home(){
 const t=iso(),hbox=document.querySelector('.hbox');
 if(hbox&&D.banners){const L=D.banners.filter(b=>b.on&&inRange(b,t));const n=L.length;
  if(n){hbox.querySelectorAll('.slide').forEach(e=>e.remove());const ctl=hbox.querySelector('.ctl');
   const link=(l,c,x)=>x.b1?'':'';
   L.forEach((b,i)=>{const d=document.createElement('div');d.className='slide'+(i?'':' on');d.setAttribute('role','group');d.setAttribute('aria-label',(i+1)+' з '+n);
    d.innerHTML=`<div class="sl-t"><span class="pill"><b></b>${esc(b.pill)}</span><h1>${fmt(b.title)}</h1><p>${esc(b.text)}</p><div class="acts">${b.b1?`<a class="btn btn-y" href="${esc(b.l1||'#')}">${esc(b.b1)}<svg class="i"><use href="#arrow"/></svg></a>`:''}${b.b2?`<a class="btn btn-l" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.4)" href="${esc(b.l2||'#')}">${esc(b.b2)}</a>`:''}</div></div><div class="sl-i"><img src="${esc(b.img)}" alt="${esc(b.alt||'')}"${i?' loading="lazy"':' fetchpriority="high"'}>${b.chipB?`<div class="chip c1"><span class="dot"><svg class="i"><use href="#${esc(b.chipIcon||'check')}"/></svg></span><span><b>${esc(b.chipB)}</b><small>${esc(b.chipS||'')}</small></span></div>`:''}</div>`;
    hbox.insertBefore(d,ctl)});
   const num=hbox.querySelector('.num');if(num)num.innerHTML='01<span> / 0'+n+'</span>';
   const bars=hbox.querySelector('.bars');if(bars)bars.innerHTML=L.map((_,i)=>`<button${i?'':' class="on"'} aria-label="Слайд ${i+1}"><span></span></button>`).join('')}}
 const pg=document.querySelector('.pgrid');
 if(pg&&D.posts){const P=D.posts.filter(p=>p.status==='published').slice(0,6);if(P.length)pg.innerHTML=P.map(p=>`<article class="post"><a class="pi" href="#" tabindex="-1" aria-hidden="true"><img src="${esc(p.img)}" alt="" loading="lazy"><span class="pt">${esc(p.tag)}</span></a><div class="pb"><time>${esc(p.date)}</time><h3><a href="#">${esc(p.title)}</a></h3><p>${esc(p.text)}</p><a class="pm" href="#">Детальніше<svg class="i"><use href="#arrow"/></svg></a></div></article>`).join('')}
 const rl=document.querySelector('.rl');
 if(rl&&D.reviews){const R=D.reviews.filter(r=>r.status==='published');if(R.length){rl.innerHTML=R.slice(0,6).map((r,i)=>`<article class="rev${i?'':' f'}"><p>${esc(r.text)}</p><div class="who"><span class="av">${esc((r.name||'?')[0])}</span><div><b>${esc(r.name)}</b><small>${esc(r.meta)}</small></div></div></article>`).join('');
  const avg=R.reduce((s,r)=>s+(+r.rating||5),0)/R.length,sc=document.querySelector('.score b');if(sc)sc.textContent=avg.toFixed(1)}}
 const fq=document.querySelector('.faq');
 if(fq&&D.faq){const F=D.faq.filter(f=>f.on);if(F.length)fq.innerHTML=F.map((f,i)=>`<details${i?'':' open'}><summary>${esc(f.q)}<svg class="i"><use href="#plus"/></svg></summary><p>${esc(f.a)}</p></details>`).join('')}
}
if(!isB2B)try{home()}catch(e){console.warn('live: home',e)}
})();
