/* Промокоди та акції */
(()=>{const {$,$$,money,toast}=B2B,A=ADM,esc=A.esc;let tab='codes';
const period=o=>o.from||o.to?(o.from||'…')+' → '+(o.to||'…'):'без обмежень';
function state(o){const t=A.iso();if(!o.active)return['Вимкнено','b-mut'];if(o.from&&o.from>t)return['Заплановано','b-warn'];if(o.to&&o.to<t)return['Завершено','b-bad'];return['Діє','b-ok']}
const sb=o=>{const[l,c]=state(o);return`<span class="badge ${c}">${l}</span>`};
const cover=a=>A.products().filter(p=>(!a.grp||p.grp===a.grp)&&(!a.model||p.models.includes(a.model))&&(!a.type||p.type===a.type)&&(!a.ids||!a.ids.length||a.ids.includes(p.id))&&!p.hidden);

function codes(el){const D=A.adb();
 return`<div class="bar"><span class="mu">Покупець вводить код у кошику. Перевірка: активність, дати, мінімальна сума, ліміт використань.</span><div class="sp"><button class="btn btn-y btn-s w" id="nc">${B2B.ico('plus')}Новий промокод</button></div></div>
 <section class="card" style="padding:8px 8px 0"><div class="tw"><table class="t"><thead><tr><th>Код</th><th>Знижка</th><th class="r">Від суми</th><th>Період</th><th class="r">Використано</th><th>Статус</th></tr></thead><tbody>${D.promos.map(c=>`<tr data-c="${c.id}" tabindex="0" data-row><td><b>${esc(c.code)}</b><br><small class="mu">${esc(c.note||'')}</small></td><td>${c.type==='percent'?'−'+c.value+'%':'−'+money(c.value)}</td><td class="r">${money(c.min)}</td><td class="nw">${period(c)}</td><td class="r">${c.used}${c.limit?' / '+c.limit:''}</td><td>${sb(c)}</td></tr>`).join('')||'<tr><td colspan="6"><div class="empty">Промокодів немає</div></td></tr>'}</tbody></table></div></section>`}
function acts(el){const D=A.adb();
 return`<div class="bar"><span class="mu">Акція автоматично знижує ціни на вітрині (ціна перекреслюється, з'являється мітка). B2B-ціни рахуються від базових.</span><div class="sp"><button class="btn btn-y btn-s w" id="na">${B2B.ico('plus')}Нова акція</button></div></div>
 <section class="card" style="padding:8px 8px 0"><div class="tw"><table class="t"><thead><tr><th>Акція</th><th>Знижка</th><th>На що діє</th><th class="r">Товарів</th><th>Період</th><th>Діє</th><th>Статус</th></tr></thead><tbody>${D.actions.map(a=>`<tr data-a="${a.id}" tabindex="0" data-row><td><b>${esc(a.name)}</b>${a.badge?`<br><small class="mu">Мітка: ${esc(a.badge)}</small>`:''}</td><td>${a.mode==='percent'?'−'+a.value+'%':'−'+money(a.value)}</td><td><small>${[a.grp,a.model,a.type].filter(Boolean).join(' · ')||'Увесь каталог'}</small></td><td class="r">${cover(a).length}</td><td class="nw">${period(a)}</td><td><label class="swt" title="Увімкнути/вимкнути"><input type="checkbox" data-tg="${a.id}" ${a.active?'checked':''} ${A.can('promo',2)?'':'disabled'} aria-label="Діє"><i></i></label></td><td>${sb(a)}</td></tr>`).join('')||'<tr><td colspan="7"><div class="empty">Акцій немає</div></td></tr>'}</tbody></table></div></section>`}

function editCode(id){const D=A.adb(),c=id?D.promos.find(x=>x.id===id):{id:'',code:'',type:'percent',value:10,min:0,limit:0,used:0,from:'',to:'',active:true,note:''};
 A.open(`${A.hd(id?'Промокод '+esc(c.code):'Новий промокод')}<form id="cf" class="stack"><div class="g2"><label class="fl">Код<input id="k-c" value="${esc(c.code)}" style="text-transform:uppercase" required></label><label class="fl">Тип знижки<select id="k-t"><option value="percent"${c.type==='percent'?' selected':''}>Відсоток, %</option><option value="fixed"${c.type==='fixed'?' selected':''}>Фіксована сума, ₴</option></select></label></div>
  <div class="g3"><label class="fl">Значення<input id="k-v" type="number" min="1" value="${c.value}"></label><label class="fl">Від суми, ₴<input id="k-m" type="number" min="0" value="${c.min}"></label><label class="fl">Ліміт (0 = без)<input id="k-l" type="number" min="0" value="${c.limit}"></label></div>
  <div class="g2"><label class="fl">Діє з<input id="k-f" type="date" value="${c.from}"></label><label class="fl">Діє до<input id="k-o" type="date" value="${c.to}"></label></div>
  <label class="fl">Опис для команди<input id="k-n" value="${esc(c.note||'')}"></label>${A.sw('k-a',c.active,'Код активний')}
  ${id?`<small class="mu">Використано: ${c.used}${c.limit?' з '+c.limit:''}</small>`:''}
  <div class="ft w"><button class="btn btn-y" type="submit">Зберегти</button>${id?'<button class="btn btn-r" type="button" id="kd">Видалити</button>':''}</div></form>`);
 $('#kd')&&($('#kd').onclick=()=>{if(confirm('Видалити промокод '+c.code+'?')){D.promos=D.promos.filter(x=>x!==c);A.save();A.log('Видалено промокод '+c.code);A.close();A.refresh()}});
 $('#cf').onsubmit=e=>{e.preventDefault();const code=A.val('k-c').trim().toUpperCase().replace(/\s/g,'');if(!code)return;if(D.promos.some(x=>x.code===code&&x!==c)){toast('Такий код уже існує');return}
  const o={code,type:A.val('k-t'),value:Math.max(1,+A.val('k-v')||1),min:Math.max(0,+A.val('k-m')||0),limit:Math.max(0,+A.val('k-l')||0),from:A.val('k-f'),to:A.val('k-o'),note:A.val('k-n'),active:A.chk('k-a')};
  if(o.type==='percent')o.value=Math.min(90,o.value);if(id)Object.assign(c,o);else D.promos.push({id:'c'+Date.now().toString(36),used:0,...o});A.save();A.log((id?'Оновлено':'Створено')+' промокод '+code);toast('Збережено');A.close();A.refresh()}}

function editAct(id){const D=A.adb(),a=id?D.actions.find(x=>x.id===id):{id:'',name:'',mode:'percent',value:10,grp:'',model:'',type:'',ids:[],from:'',to:'',active:true,badge:''},T=A.tree();
 A.open(`${A.hd(id?esc(a.name):'Нова акція')}<form id="af" class="stack"><label class="fl">Назва (внутрішня)<input id="a-n" value="${esc(a.name)}" required></label>
  <div class="g2"><label class="fl">Тип знижки<select id="a-m"><option value="percent"${a.mode==='percent'?' selected':''}>Відсоток, %</option><option value="fixed"${a.mode==='fixed'?' selected':''}>Сума з ціни, ₴</option></select></label><label class="fl">Значення<input id="a-v" type="number" min="1" value="${a.value}"></label></div>
  <div class="sub">На що діє (порожньо = усе)</div><div class="g3"><label class="fl">Розділ<select id="a-g"><option value="">Усі</option>${T.map(t=>`<option${a.grp===t.g?' selected':''}>${esc(t.g)}</option>`).join('')}</select></label><label class="fl">Модель<select id="a-mo"><option value="">Усі</option>${MODELS.map(m=>`<option${a.model===m?' selected':''}>${m}</option>`).join('')}</select></label><label class="fl">Тип<select id="a-t"><option value="">Усі</option>${['Оригінал','Аналог','Б/В'].map(m=>`<option${a.type===m?' selected':''}>${m}</option>`).join('')}</select></label></div>
  <div class="g2"><label class="fl">Діє з<input id="a-f" type="date" value="${a.from}"></label><label class="fl">Діє до<input id="a-o" type="date" value="${a.to}"></label></div>
  <label class="fl">Мітка на картці (порожньо = −N%)<input id="a-b" value="${esc(a.badge||'')}" placeholder="Наприклад: BLACK FRIDAY"></label>${A.sw('a-a',a.active,'Акція ввімкнена')}
  <div class="note info" id="pv"></div>
  <div class="ft w"><button class="btn btn-y" type="submit">Зберегти</button>${id?'<button class="btn btn-r" type="button" id="ad">Видалити</button>':''}</div></form>`);
 const cur=()=>({mode:A.val('a-m'),value:Math.max(1,+A.val('a-v')||1),grp:A.val('a-g'),model:A.val('a-mo'),type:A.val('a-t'),ids:[]});
 const pv=()=>{const o=cur(),L=cover(o),p=L[0];$('#pv').innerHTML=`<span>Охоплює товарів: <b>${L.length}</b>${p?`. Приклад: «${esc(p.name)}» ${money(p.price)} → <b>${money(o.mode==='fixed'?Math.max(1,p.price-o.value):Math.round(p.price*(1-o.value/100)))}</b>`:''}</span>`};
 $('#af').oninput=pv;$('#af').onchange=pv;pv();
 $('#ad')&&($('#ad').onclick=()=>{if(confirm('Видалити акцію?')){D.actions=D.actions.filter(x=>x!==a);A.save();A.log('Видалено акцію '+a.name);A.close();A.refresh()}});
 $('#af').onsubmit=e=>{e.preventDefault();const nm=A.val('a-n').trim();if(!nm)return;const o={...cur(),name:nm,from:A.val('a-f'),to:A.val('a-o'),badge:A.val('a-b').trim(),active:A.chk('a-a')};
  if(id)Object.assign(a,o);else D.actions.push({id:'a'+Date.now().toString(36),...o});A.save();A.log((id?'Оновлено':'Створено')+' акцію «'+nm+'»');toast('Збережено');A.close();A.refresh()}}

A.reg('promo',{title:'Промокоди й акції',sub:'Знижки для покупців сайту',render(el,q){if(q.t)tab=q.t;
 el.innerHTML=`<div class="tabs2" id="tb"><button data-t="codes" class="${tab==='codes'?'on':''}">Промокоди</button><button data-t="acts" class="${tab==='acts'?'on':''}">Акції на товари</button></div><div id="tc">${tab==='codes'?codes(el):acts(el)}</div>`;
 $('#tb').onclick=e=>{const b=e.target.closest('[data-t]');if(b){tab=b.dataset.t;A.refresh()}};
 const nc=$('#nc'),na=$('#na');if(nc)nc.onclick=()=>editCode();if(na)na.onclick=()=>editAct();
 $('#tc').onclick=e=>{if(e.target.closest('.swt'))return;const r=e.target.closest('[data-row]');if(!r)return;r.dataset.c?editCode(r.dataset.c):editAct(r.dataset.a)};
 $('#tc').onkeydown=e=>{if(e.key==='Enter'&&e.target.dataset.row!=null){e.target.dataset.c?editCode(e.target.dataset.c):editAct(e.target.dataset.a)}};
 $('#tc').onchange=e=>{const t=e.target.closest('[data-tg]');if(!t)return;const a=A.adb().actions.find(x=>x.id===t.dataset.tg);a.active=t.checked;A.save();A.log('Акція «'+a.name+'»: '+(a.active?'увімкнено':'вимкнено'));toast('Акція «'+a.name+'»: '+(a.active?'увімкнено':'вимкнено'));A.refresh()}}});
})();
