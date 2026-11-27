/* Дашборд і аналітика */
(()=>{const {$,$$,money,fd,pad}=B2B,A=ADM,esc=A.esc;
const DEAD=s=>s==='Скасовано'||s==='Повернення';
const dkey=d=>A.iso(new Date(d));
let range=30;
function stat(days,off=0){const O=A.orders().filter(o=>!DEAD(o.status)),from=new Date();from.setHours(0,0,0,0);
 const a=new Date(from);a.setDate(a.getDate()-days+1-off);const b=new Date(from);b.setDate(b.getDate()+1-off);
 const L=O.filter(o=>{const t=new Date(o.date);return t>=a&&t<b});const rev=L.reduce((s,o)=>s+o.total,0);
 return{L,rev,n:L.length,aov:L.length?rev/L.length:0,b2b:L.filter(o=>o.ref==='b2b').reduce((s,o)=>s+o.total,0)}}
const delta=(c,p)=>p?`<span style="color:${c>=p?'var(--ok)':'var(--bad)'}">${c>=p?'▲':'▼'} ${Math.abs(Math.round((c-p)/p*100))}% до попереднього періоду</span>`:'<span>немає даних для порівняння</span>';
function daily(days){const lab=[],r=[],b=[],map={};for(let i=days-1;i>=0;i--){const d=A.dayAgo(i),k=A.iso(d);map[k]=lab.length;lab.push(pad(d.getDate())+'.'+pad(d.getMonth()+1));r.push(0);b.push(0)}
 A.orders().filter(o=>!DEAD(o.status)).forEach(o=>{const i=map[dkey(o.date)];if(i!=null)(o.ref==='b2b'?b:r)[i]+=o.total});return{lab,r,b}}
function agg(L){const P={},G={};L.forEach(o=>o.items.forEach(i=>{const p=A.prod(i.id);const n=p?p.name:i.id,g=p?p.grp:'Інше';P[n]=P[n]||{n,q:0,v:0};P[n].q+=i.q;P[n].v+=i.q*i.price;G[g]=(G[g]||0)+i.q*i.price}));
 return{top:Object.values(P).sort((a,b)=>b.v-a.v),grp:Object.entries(G).map(([n,v])=>({n,v})).sort((a,b)=>b.v-a.v)}}
const kpi=(l,v,s)=>`<div class="card kpi"><small>${l}</small><b>${v}</b><span>${s}</span></div>`;

A.reg('dash',{title:'Дашборд',sub:'Що важливо сьогодні',render(el){
 const D=A.adb(),B=B2B.db(),s=stat(30),p=stat(30,30),all=A.orders(),newO=all.filter(o=>o.status==='Новий'),newS=B.accounts.filter(a=>a.status==='new'),
  low=A.products().filter(x=>x.stock<=2&&!x.hidden),pend=D.reviews.filter(r=>r.status==='pending'),now=A.iso(),soon=D.promos.filter(c=>c.active&&c.to&&c.to>=now&&c.to<=A.iso(A.dayAgo(-7)));
 const d=daily(30);
 el.innerHTML=`<div class="row4">${kpi('Виручка за 30 днів',money(s.rev),delta(s.rev,p.rev))}${kpi('Замовлень',s.n,delta(s.n,p.n))}${kpi('Середній чек',money(s.aov),delta(s.aov,p.aov))}${kpi('Частка B2B',s.rev?Math.round(s.b2b/s.rev*100)+'%':'—',money(s.b2b)+' від СТО')}</div>
 <div class="row2" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)"><section class="card"><div class="ph-h"><h2>Продажі по днях</h2><div class="leg"><span><i style="background:#FFDE01"></i>Роздріб</span><span><i style="background:#29282D"></i>B2B</span></div></div>${A.bars(d.lab,[{n:'Роздріб',c:'#FFDE01',v:d.r},{n:'B2B',c:'#29282D',v:d.b}])}</section>
  <section class="card"><h2 style="margin-bottom:12px">Потребує уваги</h2><div class="attn">
   ${A.can('orders')?`<a href="#/orders?f=Новий"><b>${newO.length}</b><span>нових замовлень чекають обробки</span></a>`:''}
   ${A.can('b2b')?`<a href="#/b2b?f=new"><b>${newS.length}</b><span>заявок СТО на верифікацію</span></a>`:''}
   ${A.can('products')?`<a href="#/products?f=low"><b>${low.length}</b><span>товарів із залишком ≤ 2</span></a>`:''}
   ${A.can('content')?`<a href="#/content?t=reviews"><b>${pend.length}</b><span>відгуків на модерації</span></a>`:''}
   ${A.can('promo')?`<a href="#/promo"><b>${soon.length}</b><span>промокодів, що спливають за 7 днів</span></a>`:''}</div></section></div>
 <section class="card" style="padding:8px 8px 0"><div class="ph-h" style="padding:12px 12px 0"><h2>Останні замовлення</h2>${A.can('orders')?'<a class="btn btn-l btn-s" href="#/orders">Усі замовлення</a>':''}</div><div class="tw"><table class="t"><thead><tr><th>Номер</th><th>Клієнт</th><th>Канал</th><th>Дата</th><th class="r">Сума</th><th>Статус</th></tr></thead><tbody>
  ${all.slice(0,7).map(o=>`<tr><td><b>${o.id}</b></td><td>${esc(o.who)}</td><td>${o.ref==='b2b'?'B2B':'Сайт'}</td><td>${fd(o.date)}</td><td class="r"><b>${money(o.total)}</b></td><td>${A.stB(o.status)}</td></tr>`).join('')}</tbody></table></div></section>`}});

A.reg('analytics',{title:'Аналітика',sub:'Продажі, товари, канали, акції',render(el){
 const s=stat(range),p=stat(range,range),d=daily(Math.min(range,90)),ag=agg(s.L),D=A.adb(),B=B2B.db();
 const byStatus={};A.orders().filter(o=>{const t=new Date(o.date);return t>=new Date(Date.now()-range*864e5)}).forEach(o=>byStatus[o.status]=(byStatus[o.status]||0)+1);
 const sto={};s.L.filter(o=>o.ref==='b2b').forEach(o=>sto[o.who]=(sto[o.who]||0)+o.total);
 const pc=D.promos.map(c=>({c,n:s.L.filter(o=>o.raw.promo===c.code).length,v:s.L.filter(o=>o.raw.promo===c.code).reduce((x,o)=>x+(o.raw.disc||0),0)}));
 const retail=s.L.filter(o=>o.ref==='retail'),pay={};retail.forEach(o=>pay[A.PAY[o.raw.pay]]=(pay[A.PAY[o.raw.pay]]||0)+1);
 el.innerHTML=`<div class="bar"><div class="chips" id="rg">${[7,30,90].map(n=>`<button data-r="${n}" class="${range===n?'on':''}">${n} днів</button>`).join('')}</div><div class="sp"><button class="btn btn-l btn-s" id="ex">${B2B.ico('dl')}Експорт CSV</button></div></div>
 <div class="row4">${kpi('Виручка',money(s.rev),delta(s.rev,p.rev))}${kpi('Замовлень',s.n,delta(s.n,p.n))}${kpi('Середній чек',money(s.aov),delta(s.aov,p.aov))}${kpi('Одиниць продано',s.L.reduce((x,o)=>x+A.sumQ(o.items),0),'за період')}</div>
 <section class="card"><div class="ph-h"><h2>Динаміка продажів</h2><div class="leg"><span><i style="background:#FFDE01"></i>Роздріб</span><span><i style="background:#29282D"></i>B2B</span></div></div>${A.bars(d.lab,[{n:'Роздріб',c:'#FFDE01',v:d.r},{n:'B2B',c:'#29282D',v:d.b}],{h:210})}</section>
 <div class="row2"><section class="card"><h2 style="margin-bottom:14px">Продажі за розділами</h2>${ag.grp.length?A.donut(ag.grp.slice(0,7)):'<div class="empty">Немає даних</div>'}</section>
  <section class="card"><h2 style="margin-bottom:14px">Статуси замовлень</h2>${A.hbar(A.RST.filter(x=>byStatus[x]).map(x=>({n:x,v:byStatus[x]})),v=>v)}</section></div>
 <div class="row2"><section class="card" style="padding:8px 8px 0"><h2 style="padding:12px 12px 0">Топ товарів</h2><div class="tw"><table class="t"><thead><tr><th>Товар</th><th class="r">Шт.</th><th class="r">Виручка</th></tr></thead><tbody>${ag.top.slice(0,8).map(x=>`<tr><td>${esc(x.n)}</td><td class="r">${x.q}</td><td class="r"><b>${money(x.v)}</b></td></tr>`).join('')||'<tr><td colspan="3"><div class="empty">Немає продажів</div></td></tr>'}</tbody></table></div></section>
  <section class="card"><h2 style="margin-bottom:14px">Топ СТО за обсягом</h2>${Object.keys(sto).length?A.hbar(Object.entries(sto).map(([n,v])=>({n,v})).sort((a,b)=>b.v-a.v).slice(0,6)):'<div class="empty">За період B2B-замовлень немає</div>'}
   <h2 style="margin:20px 0 12px">Оплата (роздріб)</h2>${Object.keys(pay).length?A.hbar(Object.entries(pay).map(([n,v])=>({n,v})),v=>v+' зам.'):'<div class="empty">Немає даних</div>'}</section></div>
 <section class="card" style="padding:8px 8px 0"><h2 style="padding:12px 12px 0">Ефективність промокодів</h2><div class="tw"><table class="t"><thead><tr><th>Код</th><th>Статус</th><th class="r">Замовлень за період</th><th class="r">Надано знижок</th><th class="r">Використань загалом</th></tr></thead><tbody>${pc.map(x=>`<tr><td><b>${esc(x.c.code)}</b></td><td>${x.c.active?'<span class="badge b-ok">Активний</span>':'<span class="badge b-mut">Вимкнено</span>'}</td><td class="r">${x.n}</td><td class="r">${money(x.v)}</td><td class="r">${x.c.used}${x.c.limit?' / '+x.c.limit:''}</td></tr>`).join('')}</tbody></table></div></section>`;
 $('#rg').onclick=e=>{const b=e.target.closest('[data-r]');if(b){range=+b.dataset.r;A.refresh()}};
 $('#ex').onclick=()=>{A.csv([['Номер','Канал','Дата','Клієнт','Статус','Сума']].concat(s.L.map(o=>[o.id,o.ref==='b2b'?'B2B':'Сайт',fd(o.date),o.who,o.status,o.total])),'tefast-sales-'+range+'d.csv');A.log('Експорт аналітики CSV')}}});
})();
