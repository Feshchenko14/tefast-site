/* Доступи (користувачі, ролі, журнал) і Налаштування */
(()=>{const {$,$$,fd,toast}=B2B,A=ADM,esc=A.esc;let tab='users';
const lastS=t=>{const m=Math.round((Date.now()-t)/6e4);return m<2?'щойно':m<60?m+' хв тому':m<1440?Math.round(m/60)+' год тому':fd(t)};

function users(){const D=A.adb();
 return`<div class="bar"><span class="mu">Кожен користувач має роль, а роль — рівень доступу до розділів. Щоб побачити ефект, увійдіть під іншою роллю з меню акаунта.</span><div class="sp"><button class="btn btn-y btn-s w" id="nu">${B2B.ico('plus')}Додати користувача</button></div></div>
 <section class="card" style="padding:8px 8px 0"><div class="tw"><table class="t"><thead><tr><th>Користувач</th><th>Роль</th><th>Останній вхід</th><th>Статус</th></tr></thead><tbody>${D.users.map(u=>`<tr data-u="${u.id}" tabindex="0" data-row><td><b>${esc(u.name)}</b><br><small class="mu">${esc(u.email)}</small></td><td>${esc(D.roles[u.role].name)}</td><td>${lastS(u.last)}</td><td>${u.active?'<span class="badge b-ok">Активний</span>':'<span class="badge b-mut">Вимкнено</span>'}</td></tr>`).join('')}</tbody></table></div></section>`}
function editUser(id){const D=A.adb(),me=A.user(),u=id?D.users.find(x=>x.id===id):{id:'',name:'',email:'',role:'manager',active:true,pass:'admin123',last:0};
 A.open(`${A.hd(id?esc(u.name):'Новий користувач',id?esc(u.email):'Пароль у демо: admin123')}<form id="uf" class="stack"><label class="fl">Ім'я<input id="u-n" value="${esc(u.name)}" required></label><label class="fl">Email<input id="u-e" type="email" value="${esc(u.email)}" required></label>
  <label class="fl">Роль<select id="u-r">${Object.entries(D.roles).map(([k,r])=>`<option value="${k}"${u.role===k?' selected':''}>${esc(r.name)}</option>`).join('')}</select></label>${A.sw('u-a',u.active,'Обліковий запис активний')}
  ${id===me.id?'<div class="note warn"><span>Це ваш акаунт: не можна вимкнути себе чи зняти роль «Власник».</span></div>':''}
  <div class="ft w"><button class="btn btn-y" type="submit">Зберегти</button>${id&&id!==me.id?'<button class="btn btn-r" type="button" id="ux">Видалити</button>':''}</div></form>`);
 $('#ux')&&($('#ux').onclick=()=>{if(confirm('Видалити користувача '+u.name+'?')){D.users=D.users.filter(x=>x!==u);A.save();A.log('Видалено користувача '+u.name);A.close();A.refresh()}});
 $('#uf').onsubmit=e=>{e.preventDefault();const o={name:A.val('u-n').trim(),email:A.val('u-e').trim(),role:A.val('u-r'),active:A.chk('u-a')};if(!o.name||!o.email)return;
  if(D.users.some(x=>x!==u&&x.email.toLowerCase()===o.email.toLowerCase())){toast('Такий email уже є');return}
  if(id===me.id){o.active=true;if(me.role==='owner')o.role='owner'}
  if(id)Object.assign(u,o);else D.users.push({id:'u'+Date.now().toString(36),pass:'admin123',last:0,...o});A.save();A.log((id?'Оновлено':'Створено')+' користувача '+o.name+' ('+D.roles[o.role].name+')');toast('Збережено');A.close();A.refresh()}}

function roles(){const D=A.adb(),own=A.can('access',2);
 return`<div class="bar"><span class="mu">Рівні: <b>Немає</b> — розділ прихований, <b>Перегляд</b> — без змін, <b>Редагування</b> — повний доступ. Роль «Власник» змінити не можна.</span><div class="sp"><button class="btn btn-y btn-s w" id="nr">${B2B.ico('plus')}Нова роль</button><button class="btn btn-l btn-s w" id="rr">Скинути ролі</button></div></div>
 <section class="card" style="padding:8px"><div class="tw"><table class="mx"><thead><tr><th>Розділ</th>${Object.entries(D.roles).map(([k,r])=>`<th>${esc(r.name)}</th>`).join('')}</tr></thead><tbody>${A.SECS.map(([s,l])=>`<tr><td>${l}</td>${Object.entries(D.roles).map(([k,r])=>`<td><select data-r="${k}" data-s="${s}" data-l="${r.p[s]||0}" ${r.locked||!own?'disabled':''} aria-label="${esc(r.name)}: ${l}">${A.LV.map((n,i)=>`<option value="${i}"${(r.p[s]||0)===i?' selected':''}>${n}</option>`).join('')}</select></td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`}
function log(){const D=A.adb();
 return`<div class="bar"><span class="mu">Останні дії в панелі (до 300 записів).</span><div class="sp"><button class="btn btn-l btn-s" id="lx">${B2B.ico('dl')}CSV</button></div></div>
 <section class="card" style="padding:8px 8px 0"><div class="tw"><table class="t"><thead><tr><th>Час</th><th>Хто</th><th>Дія</th></tr></thead><tbody>${D.log.slice(0,80).map(l=>`<tr><td class="nw">${fd(l.t,1)}</td><td>${esc(l.u)}</td><td>${esc(l.m)}</td></tr>`).join('')}</tbody></table></div></section>`}

A.reg('access',{title:'Доступи',sub:'Користувачі, ролі та журнал дій',render(el,q){if(q.t)tab=q.t;
 el.innerHTML=`<div class="tabs2" id="tb">${[['users','Користувачі'],['roles','Ролі та права'],['log','Журнал дій']].map(([k,l])=>`<button data-t="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</div><div id="tc">${tab==='users'?users():tab==='roles'?roles():log()}</div>`;
 $('#tb').onclick=e=>{const b=e.target.closest('[data-t]');if(b){tab=b.dataset.t;A.refresh()}};const D=A.adb(),tc=$('#tc');
 if(tab==='users'){tc.onclick=e=>{const r=e.target.closest('[data-u]');if(r)editUser(r.dataset.u)};tc.onkeydown=e=>{if(e.key==='Enter'&&e.target.dataset.u)editUser(e.target.dataset.u)};const nu=$('#nu');if(nu)nu.onclick=()=>editUser()}
 if(tab==='roles'){tc.onchange=e=>{const s=e.target.closest('select[data-r]');if(!s)return;const r=D.roles[s.dataset.r];r.p[s.dataset.s]=+s.value;s.dataset.l=s.value;A.save();A.log('Роль «'+r.name+'», розділ «'+A.SECS.find(x=>x[0]===s.dataset.s)[1]+'»: '+A.LV[+s.value]);toast('Права оновлено')};
  const nr=$('#nr');if(nr)nr.onclick=()=>{const n=prompt('Назва нової ролі:','Оператор');if(!n)return;D.roles['r'+Date.now().toString(36)]={name:n.trim(),p:Object.fromEntries(A.SECS.map(([k])=>[k,0]))};A.save();A.log('Створено роль «'+n+'»');A.refresh()};
  const rr=$('#rr');if(rr)rr.onclick=()=>{if(confirm('Повернути стандартні права всіх ролей?')){Object.keys(A.ROLES0).forEach(k=>D.roles[k]=JSON.parse(JSON.stringify(A.ROLES0[k])));A.save();A.log('Ролі скинуто до стандартних');A.refresh()}}}
 if(tab==='log'){$('#lx').onclick=()=>A.csv([['Час','Хто','Дія']].concat(D.log.map(l=>[fd(l.t,1),l.u,l.m])),'tefast-audit-log.csv')}}});

/* ---------- Налаштування ---------- */
const inp=(id,l,v,t='text')=>`<label class="fl">${l}<input id="${id}" type="${t}" value="${esc(v)}"></label>`;
A.reg('settings',{title:'Налаштування',sub:'Магазин, доставка, реквізити для документів, дані',render(el){const D=A.adb(),s=D.shop,c=D.company,w=A.can('settings',2);
 el.innerHTML=`<form id="sf" class="stack" style="display:grid;gap:16px"><div class="row2"><section class="card stack" style="display:grid;gap:12px"><h2>Магазин і контакти</h2>${inp('s-n','Назва',s.name)}<div class="g2">${inp('s-p','Телефон',s.phone)}${inp('s-e','Email',s.email,'email')}</div>${inp('s-a','Адреса складу',s.address)}${inp('s-h','Графік роботи',s.hours)}
   <h2 style="margin-top:6px">Доставка</h2><div class="g3">${inp('s-f','Безкоштовно від, ₴',s.freeFrom,'number')}${inp('s-np','Нова пошта, ₴',s.np,'number')}${inp('s-c','Кур\'єр, ₴',s.courier,'number')}</div><small class="mu">Ці значення використовує кошик на сайті.</small></section>
  <section class="card stack" style="display:grid;gap:12px"><h2>Реквізити для документів</h2><small class="mu">Підставляються в рахунки, накладні, чеки й договори. У демо всі значення умовні.</small>${inp('c-n','Юрособа',c.name)}<div class="g2">${inp('c-e','ЄДРПОУ',c.edrpou)}${inp('c-t','Оподаткування',c.tax)}</div>${inp('c-i','IBAN',c.iban)}<div class="g2">${inp('c-b','Банк',c.bank)}${inp('c-a','Адреса',c.address)}</div>
   <div class="g3">${inp('c-pi','Префікс рахунку',c.prefInv)}${inp('c-pw','Префікс накладної',c.prefWb)}${inp('c-pr','Префікс чека',c.prefRc)}</div>${inp('c-s','Підписант (посада)',c.signer)}</section></div>
  <div class="bar w"><button class="btn btn-y" type="submit">Зберегти налаштування</button></div></form>
 <section class="card"><h2 style="margin-bottom:6px">Дані демо</h2><p class="mu" style="margin-bottom:12px">Усе зберігається у вашому браузері. Резервна копія дозволяє перенести дані на інший пристрій чи відкотитися.</p><div class="bar"><button class="btn btn-l" id="bk">${B2B.ico('dl')}Завантажити резервну копію (JSON)</button><label class="btn btn-l w" style="cursor:pointer">Відновити з файлу<input type="file" id="bi" accept="application/json" hidden></label><button class="btn btn-r w" id="rs">Скинути всі демо-дані</button></div></section>`;
 $('#sf').onsubmit=e=>{e.preventDefault();if(!w)return;const v=id=>$('#'+id).value.trim(),n=id=>Math.max(0,+v(id)||0);
  Object.assign(D.shop,{name:v('s-n'),phone:v('s-p'),email:v('s-e'),address:v('s-a'),hours:v('s-h'),freeFrom:n('s-f'),np:n('s-np'),courier:n('s-c')});
  Object.assign(D.company,{name:v('c-n'),edrpou:v('c-e'),tax:v('c-t'),iban:v('c-i'),bank:v('c-b'),address:v('c-a'),prefInv:v('c-pi'),prefWb:v('c-pw'),prefRc:v('c-pr'),signer:v('c-s')});A.save();A.log('Оновлено налаштування');toast('Збережено')};
 $('#bk').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({admin:D,b2b:B2B.db()},null,1)],{type:'application/json'}));a.download='tefast-backup-'+A.iso()+'.json';document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);A.log('Резервну копію завантажено')};
 $('#bi').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const o=JSON.parse(t);if(!o.admin||!o.b2b)throw 0;if(!confirm('Замінити поточні дані даними з файлу?'))return;LIVE.wr(LIVE.KEY,o.admin);LIVE.wr('tefast-b2b-db',o.b2b);toast('Відновлено, перезавантаження…');setTimeout(()=>location.reload(),600)}catch(x){toast('Невірний файл резервної копії')}})};
 $('#rs').onclick=()=>{if(confirm('Скинути ВСІ демо-дані (адмінка, B2B, замовлення з сайту)?')){A.resetAll();toast('Скинуто');setTimeout(()=>{location.hash='#/dash';location.reload()},500)}}}});
})();
