/* B2B-партнери: СТО, заявки, умови за замовчуванням, цінові правила */
(()=>{const {$,$$,money,fd,toast,stBadge,oBadge}=B2B,A=ADM,esc=A.esc;let tab='sto',f='all',q='';
const DEFT={mode:'percent',value:5,minOrder:3000,deferral:false,deferralDays:0,creditLimit:0,used:0};
const defaults=()=>Object.assign({},DEFT,B2B.db().settings.defaults||{});
const disc=t=>t.mode==='fixed'?'−'+money(t.value)+'/од.':'−'+t.value+'%';
const sum=(a)=>B2B.db().orders.filter(o=>o.acc===a.id&&o.status!=='Скасовано').reduce((s,o)=>s+o.total,0);
const termsForm=(t,p='')=>`<div class="sub">Індивідуальні ціни</div><div class="seg" id="${p}em" style="display:flex"><button type="button" data-v="percent" class="${t.mode==='percent'?'on':''}">Знижка, %</button><button type="button" data-v="fixed" class="${t.mode==='fixed'?'on':''}">Фіксована, ₴/од.</button></div>
 <div class="g2"><label class="fl" id="${p}vl">${t.mode==='fixed'?'Знижка, ₴ за одиницю':'Знижка, %'}<input id="${p}ev" type="number" min="0" value="${t.value}"></label><label class="fl">Мін. замовлення, ₴<input id="${p}emn" type="number" min="0" value="${t.minOrder}"></label></div>
 ${A.sw(p+'ed2',t.deferral,'Відстрочка платежу та кредитний ліміт')}<div class="g3" id="${p}dg" style="${t.deferral?'':'opacity:.5;pointer-events:none'}"><label class="fl">Днів<input id="${p}edd" type="number" min="0" value="${t.deferralDays}"></label><label class="fl">Ліміт, ₴<input id="${p}ecl" type="number" min="0" value="${t.creditLimit}"></label><label class="fl">Використано, ₴<input id="${p}eu" type="number" min="0" value="${t.used}"></label></div>`;
function bindTerms(d,p,t){let mode=t.mode;B2B.seg($('#'+p+'em',d),v=>{mode=v;$('#'+p+'vl',d).firstChild.textContent=v==='fixed'?'Знижка, ₴ за одиницю':'Знижка, %'});
 $('#'+p+'ed2',d).onchange=e=>{$('#'+p+'dg',d).style.cssText=e.target.checked?'':'opacity:.5;pointer-events:none'};
 requestAnimationFrame(()=>$('#'+p+'em',d)._mv&&$('#'+p+'em',d)._mv());
 return()=>{const n=k=>Math.max(0,+$('#'+p+k,d).value||0),dfr=$('#'+p+'ed2',d).checked;return{mode,value:n('ev'),minOrder:n('emn'),deferral:dfr,deferralDays:dfr?n('edd'):0,creditLimit:n('ecl'),used:n('eu')}}}

function sto(el){const B=B2B.db(),L=B.accounts.filter(a=>(f==='all'||a.status===f)&&(!q||(a.name+a.edrpou+a.email+a.contact).toLowerCase().includes(q.toLowerCase())));const c=s=>B.accounts.filter(a=>a.status===s).length;
 return`<div class="row4"><div class="card kpi"><small>Нові заявки</small><b>${c('new')}</b></div><div class="card kpi"><small>Верифіковані</small><b>${c('verified')}</b></div><div class="card kpi"><small>Призупинені</small><b>${c('suspended')}</b></div>
  <div class="card kpi"><small>Верифікація нових</small><div class="seg" id="vm"><button data-v="manual" class="${B.settings.verifyMode==='manual'?'on':''}">Ручна</button><button data-v="auto" class="${B.settings.verifyMode==='auto'?'on':''}">Авто</button></div><span>за ЄДРПОУ з 8 цифр</span></div></div>
 <div class="bar"><div class="chips" id="fc">${[['all','Усі'],['new','Нові'],['verified','Верифіковані'],['suspended','Призупинені']].map(([k,l])=>`<button data-f="${k}" class="${f===k?'on':''}">${l}</button>`).join('')}</div><input class="inp" id="sq" type="search" placeholder="Назва, ЄДРПОУ, email" value="${esc(q)}"><div class="sp"><button class="btn btn-y btn-s w" id="ns">${B2B.ico('plus')}Додати СТО</button></div></div>
 <section class="card" style="padding:8px 8px 0"><div class="tw"><table class="t"><thead><tr><th>СТО</th><th>ЄДРПОУ</th><th>Статус</th><th>Ціни</th><th class="r">Мін.</th><th>Відстрочка</th><th class="r">Ліміт (використано)</th><th class="r">Обіг</th></tr></thead><tbody>
 ${L.map(a=>`<tr data-a="${a.id}" tabindex="0" data-row class="${a.status==='new'?'isnew':''}"><td><b>${esc(a.name)}</b><br><small class="mu">${esc(a.contact)} · ${esc(a.email)}</small></td><td class="m">${esc(a.edrpou)}</td><td>${stBadge(a.status)}</td><td>${disc(a.terms)}</td><td class="r">${money(a.terms.minOrder)}</td><td>${a.terms.deferral?a.terms.deferralDays+' дн.':'—'}</td><td class="r">${a.terms.deferral?money(a.terms.creditLimit)+' ('+money(a.terms.used)+')':'—'}</td><td class="r"><b>${money(sum(a))}</b></td></tr>`).join('')||'<tr><td colspan="8"><div class="empty"><b>СТО не знайдено</b></div></td></tr>'}</tbody></table></div></section>`}

function editSto(id){const B=B2B.db(),isNew=!id,a=isNew?{id:'a'+(Date.now()%1e7),name:'',edrpou:'',contact:'',phone:'',email:'',pass:'demo1234',city:'',address:'',posts:2,status:'verified',created:new Date().toISOString(),terms:{...defaults()}}:B.accounts.find(x=>x.id===id),t=a.terms;
 const orders=B.orders.filter(o=>o.acc===a.id).sort((x,y)=>y.date.localeCompare(x.date)).slice(0,5),users=A.adb().users.filter(u=>u.active);
 A.open(`${A.hd(isNew?'Нове СТО':esc(a.name),isNew?'Створення партнера вручну':'ЄДРПОУ '+esc(a.edrpou)+' · зареєстровано '+fd(a.created))}<form id="sf" class="stack" novalidate>
  ${isNew?`<label class="fl">Назва СТО<input id="s-n" required></label><div class="g2"><label class="fl">ЄДРПОУ<input id="s-e" inputmode="numeric" maxlength="8"></label><label class="fl">Контактна особа<input id="s-c"></label></div><div class="g2"><label class="fl">Телефон<input id="s-p"></label><label class="fl">Email (логін)<input id="s-m" type="email"></label></div>`
   :`<small class="mu">${esc(a.contact)} · ${esc(a.phone)} · ${esc(a.email)}<br>${esc(a.city||'')} ${esc(a.address||'')} · постів: ${a.posts||'—'}</small>`}
  <div><div class="sub">Статус</div><div class="seg" id="es" style="display:flex;margin-top:6px"><button type="button" data-v="new" class="${a.status==='new'?'on':''}">Новий</button><button type="button" data-v="verified" class="${a.status==='verified'?'on':''}">Верифікований</button><button type="button" data-v="suspended" class="${a.status==='suspended'?'on':''}">Призупинений</button></div></div>
  <label class="fl" id="rl" style="${a.status==='suspended'?'':'display:none'}">Причина призупинення (бачить СТО)<input id="re" value="${esc(a.reason||'')}"></label>
  ${termsForm(t)}
  <div class="g2"><label class="fl">Менеджер<select id="s-mg"><option value="">—</option>${users.map(u=>`<option value="${u.id}"${a.manager===u.id?' selected':''}>${esc(u.name)}</option>`).join('')}</select></label><label class="fl">Внутрішня примітка<input id="s-nt" value="${esc(a.note||'')}"></label></div>
  ${isNew?'':`<div class="sub">Останні замовлення</div>${orders.map(o=>`<div class="it" style="grid-template-columns:1fr auto auto"><div><a href="#/orders?o=${o.id}"><b>${o.id}</b></a><small>${fd(o.date)}</small></div>${oBadge(o.status)}<b>${money(o.total)}</b></div>`).join('')||'<small class="mu">Замовлень ще немає</small>'}<div class="docs"><a class="btn btn-l btn-s" target="_blank" rel="noopener" href="doc.html?a=${a.id}&t=contract">Договір (PDF)</a></div>`}
  <div class="ft w"><button class="btn btn-y" type="submit">${isNew?'Створити':'Зберегти'}</button>${!isNew&&a.status==='new'?'<button class="btn btn-d" type="button" id="ap">Верифікувати</button>':''}</div></form>`,{wide:true});
 const d=$('#dr');let status=a.status;B2B.seg($('#es',d),v=>{status=v;$('#rl',d).style.display=v==='suspended'?'':'none'});requestAnimationFrame(()=>$('#es',d)._mv&&$('#es',d)._mv());
 const get=bindTerms(d,'',t);
 const ap=$('#ap',d);if(ap)ap.onclick=()=>{a.status='verified';a.reason='';B2B.save();A.log('СТО «'+a.name+'»: верифіковано');toast('СТО верифіковано');A.close();A.refresh()};
 $('#sf',d).onsubmit=e=>{e.preventDefault();if(!A.can('b2b',2))return;
  if(isNew){const nm=$('#s-n',d).value.trim(),em=$('#s-m',d).value.trim();if(!nm||!em){toast('Вкажіть назву та email');return}if(B.accounts.some(x=>x.email.toLowerCase()===em.toLowerCase())){toast('Такий email уже є');return}Object.assign(a,{name:nm,edrpou:$('#s-e',d).value.trim(),contact:$('#s-c',d).value.trim(),phone:$('#s-p',d).value.trim(),email:em});B.accounts.push(a)}
  a.status=status;a.reason=status==='suspended'?$('#re',d).value.trim():'';a.terms=Object.assign(a.terms,get());a.manager=$('#s-mg',d).value;a.note=$('#s-nt',d).value.trim();
  B2B.save();A.log('СТО «'+a.name+'»: '+(isNew?'створено':'оновлено умови')+', статус '+status);toast('Збережено');A.close();A.refresh()}}

function defs(){const t=defaults(),B=B2B.db(),G=A.tree().map(x=>x.g),rules=B.settings.groupRules||{};
 return`<div class="row2"><section class="card"><h2 style="margin-bottom:6px">Умови за замовчуванням</h2><p class="mu" style="margin-bottom:12px">Застосовуються до нових реєстрацій (і до авто-верифікованих). Змінити для конкретного СТО можна в його картці.</p><form id="df" class="stack">${termsForm(t,'d')}<div class="ft w" style="position:static;border:0;padding:0"><button class="btn btn-y" type="submit">Зберегти умови</button></div></form></section>
  <section class="card"><h2 style="margin-bottom:6px">Правила цін за розділами</h2><p class="mu" style="margin-bottom:12px">Додаткова знижка B2B на розділ каталогу поверх індивідуальної знижки СТО. 0 = без правила.</p><div class="tw"><table class="t"><tbody>${G.map(g=>`<tr><td>${esc(g)}</td><td class="r"><input class="inp s" data-g="${esc(g)}" type="number" min="0" max="50" value="${rules[g]||0}" ${A.can('b2b',2)?'':'disabled'} aria-label="Додаткова знижка ${esc(g)}"> %</td></tr>`).join('')}</tbody></table></div></section></div>
 <section class="card"><h2 style="margin-bottom:10px">Калькулятор ціни СТО</h2><div class="bar"><select class="inp" id="cs">${B.accounts.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select><select class="inp" id="cp" style="max-width:360px">${A.products().slice(0,60).map(p=>`<option value="${p.id}">${esc(p.name)} · ${p.pn}</option>`).join('')}</select><b id="cr"></b></div></section>`}

A.reg('b2b',{title:'B2B-партнери',sub:'СТО, умови, ціни та верифікація',render(el,qq){if(qq.f){f=qq.f;tab='sto'}if(qq.t)tab=qq.t;
 el.innerHTML=`<div class="tabs2" id="tb"><button data-t="sto" class="${tab==='sto'?'on':''}">Партнери</button><button data-t="rules" class="${tab==='rules'?'on':''}">Умови й цінові правила</button><a href="#/orders?f=all" class="w2" style="margin-left:auto;padding:10px 14px;font-weight:600;color:var(--mut)">B2B-замовлення →</a></div><div id="tc">${tab==='sto'?sto(el):defs()}</div>`;
 $('#tb').onclick=e=>{const b=e.target.closest('[data-t]');if(b){tab=b.dataset.t;A.refresh()}};
 const B=B2B.db(),tc=$('#tc');
 if(tab==='sto'){B2B.seg($('#vm'),v=>{if(!A.can('b2b',2))return;B.settings.verifyMode=v;B2B.save();A.log('Верифікація нових СТО: '+(v==='auto'?'автоматична':'ручна'));toast('Верифікація: '+(v==='auto'?'автоматична':'ручна'))});
  $('#fc').onclick=e=>{const b=e.target.closest('[data-f]');if(b){f=b.dataset.f;A.refresh()}};
  $('#sq').oninput=e=>{q=e.target.value;const p=e.target.selectionStart;A.refresh();const i=$('#sq');i.focus();i.setSelectionRange(p,p)};
  tc.onclick=e=>{const r=e.target.closest('[data-a]');if(r)editSto(r.dataset.a)};tc.onkeydown=e=>{if(e.key==='Enter'&&e.target.dataset.a)editSto(e.target.dataset.a)};
  const ns=$('#ns');if(ns)ns.onclick=()=>editSto()}
 else{const get=bindTerms(tc,'d',defaults());
  $('#df').onsubmit=e=>{e.preventDefault();if(!A.can('b2b',2))return;const v=get();v.used=0;B.settings.defaults=v;B2B.save();A.log('Умови B2B за замовчуванням оновлено');toast('Збережено')};
  tc.querySelectorAll('[data-g]').forEach(i=>i.onchange=()=>{B.settings.groupRules=B.settings.groupRules||{};const v=Math.min(50,Math.max(0,+i.value||0));v?B.settings.groupRules[i.dataset.g]=v:delete B.settings.groupRules[i.dataset.g];B2B.save();A.log('Правило цін «'+i.dataset.g+'»: +'+v+'%');toast('Правило збережено');calc()});
  const calc=()=>{const a=B.accounts.find(x=>x.id===$('#cs').value),p=A.prod($('#cp').value);$('#cr').textContent=a&&p?'Роздріб '+money(p.price)+' → ціна СТО '+money(B2B.price(p,a)):''};
  $('#cs').onchange=calc;$('#cp').onchange=calc;calc()}}});
})();
