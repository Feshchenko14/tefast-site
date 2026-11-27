/* Замовлення (сайт + B2B), статуси, історія, документи */
(()=>{const {$,$$,money,fd,toast}=B2B,A=ADM,esc=A.esc;
let src='all',st='all',q='',pg=0,sel=new Set(),inited=false;const PER=20;
const DOCS=[['invoice','Рахунок'],['waybill','Накладна'],['receipt','Товарний чек'],['pick','Лист комплектації'],['return','Акт повернення']];
const docBtns=id=>`<div class="docs">${DOCS.map(([t,l],i)=>`<a class="btn ${i<2?'btn-y':'btn-l'} btn-s" target="_blank" rel="noopener" href="doc.html?o=${id}&t=${t}">${l}</a>`).join('')}<a class="btn btn-d btn-s" target="_blank" rel="noopener" href="doc.html?o=${id}&t=all">Усі документи</a></div>`;
const B2ST=['Новий','В обробці','Відправлено','Виконано','Скасовано'];

function filtered(){const L=A.orders();return L.filter(o=>(src==='all'||o.ref===src)&&(st==='all'||o.status===st)&&(!q||(o.id+' '+o.who+' '+o.sub+' '+o.items.map(i=>(A.prod(i.id)||{}).name).join(' ')).toLowerCase().includes(q.toLowerCase())))}
function draw(el){const all=A.orders(),L=filtered(),pages=Math.max(1,Math.ceil(L.length/PER));pg=Math.min(pg,pages-1);const cnt=s=>all.filter(o=>(src==='all'||o.ref===src)&&o.status===s).length;
 const sts=['Новий','Підтверджено','В обробці','Оплачено','Відправлено','Виконано','Скасовано','Повернення'].filter(s=>cnt(s)||s===st);
 el.innerHTML=`<div class="bar"><div class="chips" id="sc">${[['all','Усі'],['retail','Сайт'],['b2b','B2B']].map(([k,l])=>`<button data-s="${k}" class="${src===k?'on':''}">${l}</button>`).join('')}</div>
  <input class="inp" id="oq" type="search" placeholder="Пошук: номер, клієнт, товар" value="${esc(q)}" style="min-width:min(260px,100%)"><div class="sp"><button class="btn btn-l btn-s" id="ex">${B2B.ico('dl')}CSV</button><button class="btn btn-d btn-s" id="bd" ${sel.size?'':'disabled'}>${B2B.ico('print')}Документи (${sel.size})</button></div></div>
  <div class="chips" id="stc"><button data-t="all" class="${st==='all'?'on':''}">Усі статуси<small>${all.filter(o=>src==='all'||o.ref===src).length}</small></button>${sts.map(s=>`<button data-t="${s}" class="${st===s?'on':''}">${s}<small>${cnt(s)}</small></button>`).join('')}</div>
  <section class="card" style="padding:8px 8px 0"><div class="tw"><table class="t"><thead><tr><th class="chk"><input type="checkbox" id="all" aria-label="Обрати всі на сторінці"></th><th>Номер</th><th>Клієнт</th><th>Канал</th><th>Дата</th><th class="r">Позицій</th><th class="r">Сума</th><th>Статус</th></tr></thead><tbody>
  ${L.slice(pg*PER,pg*PER+PER).map(o=>`<tr data-row="${o.id}" tabindex="0" class="${o.status==='Новий'?'isnew':''}"><td class="chk"><input type="checkbox" data-c="${o.id}" ${sel.has(o.id)?'checked':''} aria-label="Обрати ${o.id}"></td><td><b>${o.id}</b></td><td>${esc(o.who)}<br><small class="mu">${esc(o.sub)}</small></td><td>${o.ref==='b2b'?'<span class="badge b-mut">B2B</span>':'Сайт'}</td><td class="nw">${fd(o.date,1)}</td><td class="r">${A.sumQ(o.items)}</td><td class="r"><b>${money(o.total)}</b></td><td>${A.stB(o.status)}</td></tr>`).join('')||`<tr><td colspan="8"><div class="empty"><b>Нічого не знайдено</b>Змініть фільтри або пошук</div></td></tr>`}</tbody></table></div></section>
  ${pages>1?`<div class="bar" style="justify-content:center"><button class="btn btn-l btn-s" data-p="-1" ${pg?'':'disabled'}>←</button><span>Сторінка ${pg+1} з ${pages}</span><button class="btn btn-l btn-s" data-p="1" ${pg<pages-1?'':'disabled'}>→</button></div>`:''}`;
 $('#sc').onclick=e=>{const b=e.target.closest('[data-s]');if(b){src=b.dataset.s;pg=0;draw(el)}};
 $('#stc').onclick=e=>{const b=e.target.closest('[data-t]');if(b){st=b.dataset.t;pg=0;draw(el)}};
 $('#oq').oninput=e=>{q=e.target.value;pg=0;const p=e.target.selectionStart;draw(el);const i=$('#oq');i.focus();i.setSelectionRange(p,p)};
 $('#ex').onclick=()=>{A.csv([['Номер','Канал','Дата','Клієнт','Місто/тип','Позицій','Сума','Статус']].concat(L.map(o=>[o.id,o.ref==='b2b'?'B2B':'Сайт',fd(o.date,1),o.who,o.sub,A.sumQ(o.items),o.total,o.status])),'tefast-orders.csv');A.log('Експорт замовлень CSV ('+L.length+')')};
 $('#bd').onclick=()=>window.open('doc.html?o='+[...sel].join(',')+'&t=invoice,waybill','_blank');
 $('#all').onchange=e=>{L.slice(pg*PER,pg*PER+PER).forEach(o=>e.target.checked?sel.add(o.id):sel.delete(o.id));draw(el)};
 el.querySelector('tbody').onclick=e=>{const c=e.target.closest('[data-c]');if(c){c.checked?sel.add(c.dataset.c):sel.delete(c.dataset.c);$('#bd').disabled=!sel.size;$('#bd').lastChild.textContent='Документи ('+sel.size+')';return}const r=e.target.closest('[data-row]');if(r)show(r.dataset.row)};
 el.querySelector('tbody').onkeydown=e=>{if(e.key==='Enter'&&e.target.dataset.row)show(e.target.dataset.row)};
 el.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{pg+=+b.dataset.p;draw(el)})}

function show(id){const o=A.orders().find(x=>x.id===id);if(!o)return;const r=o.raw,retail=o.ref==='retail',sts=retail?A.RST:B2ST,w=A.can('orders',2);
 const B=B2B.db(),acc=!retail?B.accounts.find(a=>a.id===r.acc)||{}:null;
 const items=o.items.map(i=>{const p=A.prod(i.id)||{name:i.id,pn:'',img:'../logo.png'};return`<div class="it"><img src="${esc(A.im(p.img))}" alt=""><div><b>${esc(p.name)}</b><small>${esc(p.pn)} · ${i.q} × ${money(i.price)}</small></div><div class="s">${money(i.price*i.q)}</div></div>`}).join('');
 const next=sts[sts.indexOf(r.status)+1];
 A.open(`${A.hd('Замовлення '+o.id,fd(o.date,1)+' · '+(retail?'сайт':'B2B'))}<div class="stack">
  <dl class="kv"><div><dt>Статус</dt><dd><select class="inp w" id="os">${sts.map(s=>`<option${s===r.status?' selected':''}>${s}</option>`).join('')}</select><span class="ro-only">${A.stB(r.status)}</span></dd></div>
  ${retail?`<div><dt>Клієнт</dt><dd>${esc(r.cust.name)}</dd></div><div><dt>Телефон</dt><dd>${esc(r.cust.phone)}</dd></div><div><dt>Доставка</dt><dd>${A.DEL[r.delivery]}<br><small class="mu">${esc(r.cust.city)}, ${esc(r.cust.addr)}</small></dd></div><div><dt>Оплата</dt><dd>${A.PAY[r.pay]}</dd></div>${r.promo?`<div><dt>Промокод</dt><dd>${esc(r.promo)} (−${money(r.disc)})</dd></div>`:''}`
   :`<div><dt>СТО</dt><dd>${esc(acc.name||'—')}</dd></div><div><dt>Контакт</dt><dd>${esc(acc.contact||'')} ${esc(acc.phone||'')}</dd></div><div><dt>Оплата</dt><dd>${r.pay==='deferral'?'Відстрочка до '+fd(r.due):'Передоплата'}</dd></div><div><dt>Доставка</dt><dd>${esc(r.delivery)}</dd></div>`}
  ${r.comment?`<div><dt>Коментар клієнта</dt><dd>${esc(r.comment)}</dd></div>`:''}</dl>
  <div class="sub">Склад замовлення (${o.items.length} поз., ${A.sumQ(o.items)} шт.)</div>${items}
  <div class="tot">${retail?`<div><span>Товари</span><span>${money(o.items.reduce((s,i)=>s+i.q*i.price,0))}</span></div>${r.disc?`<div style="color:var(--ok)"><span>Знижка за промокодом</span><span>−${money(r.disc)}</span></div>`:''}<div><span>Доставка</span><span>${r.fee?money(r.fee):'Безкоштовно'}</span></div>`:`<div><span>За роздрібними цінами</span><span>${money(r.retail)}</span></div><div style="color:var(--ok)"><span>Знижка СТО</span><span>−${money(r.retail-r.total)}</span></div>`}<div class="g"><span>Разом</span><span>${money(o.total)}</span></div></div>
  <div class="sub">Документи</div>${docBtns(o.id)}
  ${retail?`<div class="sub">Внутрішня примітка</div><label class="fl"><textarea id="on" style="min-height:70px;font:inherit" class="w" placeholder="Видно лише команді">${esc(r.note||'')}</textarea></label><div class="sub">Історія</div><div class="tl">${(r.hist||[]).slice().reverse().map(h=>`<div><span>${esc(h.m)}<br><small>${fd(h.t,1)} · ${esc(h.u)}</small></span></div>`).join('')}</div>`:''}
  <div class="ft w">${next&&next!=='Скасовано'?`<button class="btn btn-y" id="nx">→ ${next}</button>`:''}<button class="btn btn-l" id="sv">Зберегти</button>${retail&&r.status!=='Скасовано'?'<button class="btn btn-r" id="cn">Скасувати замовлення</button>':''}</div></div>`);
 const set=(s)=>{if(s===r.status)return;if(retail){r.hist.push({t:new Date().toISOString(),m:'Статус: '+r.status+' → '+s,u:A.user().name})}else{const B=B2B.db();}
  r.status=s;if(retail)A.save();else B2B.save();A.log('Замовлення '+o.id+': статус «'+s+'»');toast('Статус '+o.id+': '+s)};
 const done=()=>{show(id);A.refresh()};
 $('#os').onchange=e=>{set(e.target.value);done()};
 const nx=$('#nx');if(nx)nx.onclick=()=>{set(next);done()};
 const cn=$('#cn');if(cn)cn.onclick=()=>{if(confirm('Скасувати замовлення '+o.id+'?')){set('Скасовано');done()}};
 $('#sv').onclick=()=>{const n=$('#on');if(n){r.note=n.value.trim();A.save()}A.log('Замовлення '+o.id+': збережено');toast('Збережено');A.close()}}

A.reg('orders',{title:'Замовлення',sub:'Сайт і B2B в одному списку',render(el,qq){if(qq.f&&qq.f!==st){st=qq.f;}if(qq.q!=null&&qq.q!==q){q=qq.q}draw(el);if(qq.o)show(qq.o)}});
})();
