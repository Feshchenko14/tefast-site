/* Товари та категорії */
(()=>{const {$,$$,money,toast}=B2B,A=ADM,esc=A.esc;
A.im=u=>/^(https?:|data:|\.\.\/)/.test(u||'')?u:'../'+(u||'logo.png');
const F={q:'',grp:'',model:'',type:'',f:'all',pg:0},sel=new Set(),PER=25;
const LOCAL=['img/model-3.jpg','img/model-y.jpg','img/model-s.jpg','img/highland.jpg'];
const BADGES=['','ХІТ','NEW','−10%','−15%','АКЦІЯ'];
function filt(){const L=A.products(),q=F.q.toLowerCase();
 return L.filter(p=>(!q||(p.name+' '+p.pn+' '+p.sub).toLowerCase().includes(q))&&(!F.grp||p.grp===F.grp)&&(!F.model||p.models.includes(F.model))&&(!F.type||p.type===F.type)&&
  (F.f==='all'||(F.f==='on'&&!p.hidden)||(F.f==='hid'&&p.hidden)||(F.f==='low'&&p.stock<=2&&p.stock>0)||(F.f==='zero'&&p.stock===0)||(F.f==='custom'&&p._custom)||(F.f==='edit'&&A.adb().products.ov[p.id])))}
function draw(el){const all=A.products(),L=filt(),pages=Math.max(1,Math.ceil(L.length/PER));F.pg=Math.min(F.pg,pages-1);const w=A.can('products',2),T=A.tree();
 const c=k=>k==='all'?all.length:all.filter(p=>k==='on'?!p.hidden:k==='hid'?p.hidden:k==='low'?p.stock<=2&&p.stock>0:k==='zero'?p.stock===0:k==='custom'?p._custom:!!A.adb().products.ov[p.id]).length;
 el.innerHTML=`<div class="bar"><input class="inp" id="pq" type="search" placeholder="Пошук: назва, артикул" value="${esc(F.q)}" style="min-width:min(240px,100%)"><select class="inp" id="fg"><option value="">Усі розділи</option>${T.map(t=>`<option${F.grp===t.g?' selected':''}>${esc(t.g)}</option>`).join('')}</select>
  <select class="inp" id="fm"><option value="">Усі моделі</option>${MODELS.map(m=>`<option${F.model===m?' selected':''}>${m}</option>`).join('')}</select><select class="inp" id="ft"><option value="">Усі типи</option>${['Оригінал','Аналог','Б/В'].map(m=>`<option${F.type===m?' selected':''}>${m}</option>`).join('')}</select>
  <div class="sp"><button class="btn btn-l btn-s" id="ex">${B2B.ico('dl')}CSV</button><button class="btn btn-y btn-s w" id="nw">${B2B.ico('plus')}Новий товар</button></div></div>
  <div class="chips" id="pf">${[['all','Усі'],['on','Активні'],['hid','Приховані'],['low','Мало (≤2)'],['zero','Немає'],['custom','Власні'],['edit','Змінені']].map(([k,l])=>`<button data-f="${k}" class="${F.f===k?'on':''}">${l}<small>${c(k)}</small></button>`).join('')}</div>
  <div class="bar w" id="bk" style="${sel.size?'':'display:none'}"><b>Обрано: ${sel.size}</b><button class="btn btn-l btn-s" data-b="hide">Сховати</button><button class="btn btn-l btn-s" data-b="show">Показати</button><button class="btn btn-l btn-s" data-b="pct">Ціна ±%…</button><button class="btn btn-l btn-s" data-b="badge">Мітка…</button><button class="btn btn-l btn-s" data-b="clear">Зняти вибір</button></div>
  <section class="card" style="padding:8px 8px 0"><div class="tw"><table class="t"><thead><tr><th class="chk"><input type="checkbox" id="pall" aria-label="Обрати всі"></th><th></th><th>Товар</th><th>Розділ</th><th>Моделі</th><th class="r">Ціна, ₴</th><th class="r">Залишок</th><th>Мітка</th><th>Статус</th></tr></thead><tbody>
  ${L.slice(F.pg*PER,F.pg*PER+PER).map(p=>`<tr data-row="${p.id}" tabindex="0" style="${p.hidden?'opacity:.55':''}"><td class="chk"><input type="checkbox" data-c="${p.id}" ${sel.has(p.id)?'checked':''} aria-label="Обрати"></td><td><img class="thumb" src="${esc(A.im(p.img))}" alt="" loading="lazy"></td><td><b>${esc(p.name)}</b><br><small class="mu">${esc(p.pn)} · ${esc(p.type)}${p.cond==='Б/В'?' · Б/В':''}</small></td><td>${esc(p.grp)}<br><small class="mu">${esc(p.sub)}</small></td><td><small>${p.models.join(', ')}</small></td>
   <td class="r"><input class="inp s" data-i="price" data-id="${p.id}" type="number" min="0" value="${p.price}" ${w?'':'disabled'} aria-label="Ціна">${p.old?`<br><small class="mu"><s>${money(p.old)}</s></small>`:''}</td><td class="r"><input class="inp s" style="width:70px" data-i="stock" data-id="${p.id}" type="number" min="0" value="${p.stock}" ${w?'':'disabled'} aria-label="Залишок"></td><td>${p.badge?`<span class="badge b-warn">${esc(p.badge)}</span>`:''}</td><td>${p.hidden?'<span class="badge b-mut">Прихований</span>':p.stock===0?'<span class="badge b-bad">Немає</span>':p.stock<=2?'<span class="badge b-warn">Мало</span>':'<span class="badge b-ok">Активний</span>'}${p._custom?' <small class="mu">власний</small>':''}</td></tr>`).join('')||'<tr><td colspan="9"><div class="empty"><b>Товарів не знайдено</b></div></td></tr>'}</tbody></table></div></section>
  <div class="bar" style="justify-content:center"><span class="mu">Знайдено: ${L.length}</span>${pages>1?`<button class="btn btn-l btn-s" data-p="-1" ${F.pg?'':'disabled'}>←</button><span>Сторінка ${F.pg+1} з ${pages}</span><button class="btn btn-l btn-s" data-p="1" ${F.pg<pages-1?'':'disabled'}>→</button>`:''}</div>`;
 const R=()=>draw(el);
 $('#pq').oninput=e=>{F.q=e.target.value;F.pg=0;const p=e.target.selectionStart;R();const i=$('#pq');i.focus();i.setSelectionRange(p,p)};
 $('#fg').onchange=e=>{F.grp=e.target.value;F.pg=0;R()};$('#fm').onchange=e=>{F.model=e.target.value;F.pg=0;R()};$('#ft').onchange=e=>{F.type=e.target.value;F.pg=0;R()};
 $('#pf').onclick=e=>{const b=e.target.closest('[data-f]');if(b){F.f=b.dataset.f;F.pg=0;R()}};
 el.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{F.pg+=+b.dataset.p;R()});
 $('#ex').onclick=()=>{A.csv([['ID','Артикул','Назва','Розділ','Підкатегорія','Моделі','Тип','Ціна','Стара ціна','Залишок','Мітка','Прихований']].concat(L.map(p=>[p.id,p.pn,p.name,p.grp,p.sub,p.models.join('/'),p.type,p.price,p.old||'',p.stock,p.badge||'',p.hidden?'так':''])),'tefast-products.csv');A.log('Експорт товарів CSV')};
 const nw=$('#nw');if(nw)nw.onclick=()=>edit(null);
 $('#pall').onchange=e=>{L.slice(F.pg*PER,F.pg*PER+PER).forEach(p=>e.target.checked?sel.add(p.id):sel.delete(p.id));R()};
 const tb=el.querySelector('tbody');
 tb.onclick=e=>{if(e.target.closest('input[data-i]'))return;const c=e.target.closest('[data-c]');if(c){c.checked?sel.add(c.dataset.c):sel.delete(c.dataset.c);R();return}const r=e.target.closest('[data-row]');if(r)edit(r.dataset.row)};
 tb.onkeydown=e=>{if(e.key==='Enter'&&e.target.dataset.row)edit(e.target.dataset.row)};
 tb.onchange=e=>{const i=e.target.closest('input[data-i]');if(!i||!A.can('products',2))return;const v=Math.max(0,Math.round(+i.value||0));patch(i.dataset.id,{[i.dataset.i]:v});A.log('Товар '+i.dataset.id+': '+(i.dataset.i==='price'?'ціна ':'залишок ')+v);toast('Збережено');R()};
 $('#bk').onclick=e=>{const b=e.target.closest('[data-b]');if(!b)return;const k=b.dataset.b,ids=[...sel];
  if(k==='clear'){sel.clear();R();return}
  if(k==='hide'||k==='show')ids.forEach(id=>patch(id,{hidden:k==='hide'}));
  if(k==='pct'){const v=parseFloat(prompt('Змінити ціни на % (наприклад −10 або 5):','-10'));if(isNaN(v))return;ids.forEach(id=>{const p=A.prod(id);patch(id,{price:Math.max(1,Math.round(p.price*(1+v/100)))})})}
  if(k==='badge'){const v=prompt('Мітка на картці (порожньо — прибрати): ХІТ, NEW, АКЦІЯ…','ХІТ');if(v===null)return;ids.forEach(id=>patch(id,{badge:v.trim()}))}
  A.log('Масова дія «'+k+'» для '+ids.length+' товарів');toast('Оновлено: '+ids.length);sel.clear();R()}}
function patch(id,o){const pr=A.adb().products,c=pr.add.find(p=>p.id===id);if(c)Object.assign(c,o);else pr.ov[id]=Object.assign(pr.ov[id]||{},o);A.save()}

function edit(id){const p=id?A.prod(id):{id:'',name:'',pn:'',type:'Оригінал',cond:'Новий',models:[],grp:A.tree()[0].g,sub:'',price:0,old:0,stock:0,badge:'',img:'',side:'—',w:'',desc:'',hidden:false,_custom:true,_new:true},T=A.tree();
 const imgs=[...new Set([...LOCAL,...PRODUCTS.map(x=>x.img)])];
 const subs=g=>(T.find(t=>t.g===g)||{s:[]}).s;
 A.open(`${A.hd(p._new?'Новий товар':esc(p.name),p._new?'Власний товар каталогу':esc(p.pn))}<form id="pf2" novalidate>
  <label class="fl">Назва<input id="e-n" value="${esc(p.name)}" required></label><div class="g2"><label class="fl">Артикул<input id="e-pn" value="${esc(p.pn)}" placeholder="1234-56-A"></label><label class="fl">Тип<select id="e-t">${['Оригінал','Аналог','Б/В'].map(x=>`<option${p.type===x?' selected':''}>${x}</option>`).join('')}</select></label></div>
  <div class="g2"><label class="fl">Розділ<select id="e-g">${T.map(t=>`<option${p.grp===t.g?' selected':''}>${esc(t.g)}</option>`).join('')}</select></label><label class="fl">Підкатегорія<select id="e-s">${subs(p.grp).map(x=>`<option${p.sub===x?' selected':''}>${esc(x)}</option>`).join('')}</select></label></div>
  <div class="fl">Сумісні моделі<div class="chips" style="margin-top:2px">${MODELS.map(m=>`<label class="opt" style="padding:8px 12px"><input type="checkbox" data-m="${m}" ${p.models.includes(m)?'checked':''}><span>${m}</span></label>`).join('')}</div></div>
  <div class="g3"><label class="fl">Ціна, ₴<input id="e-p" type="number" min="0" value="${p.price}"></label><label class="fl">Стара ціна, ₴<input id="e-o" type="number" min="0" value="${p.old||''}" placeholder="—"></label><label class="fl">Залишок, шт.<input id="e-st" type="number" min="0" value="${p.stock}"></label></div>
  <div class="g3"><label class="fl">Мітка<input id="e-b" list="bl" value="${esc(p.badge||'')}"><datalist id="bl">${BADGES.map(b=>`<option value="${b}">`).join('')}</datalist></label><label class="fl">Сторона<input id="e-sd" value="${esc(p.side||'')}"></label><label class="fl">Вага<input id="e-w" value="${esc(p.w||'')}"></label></div>
  <label class="fl">Опис<textarea id="e-d" style="font:inherit;min-height:100px">${esc(p.desc||'')}</textarea></label>
  <label class="fl">Фото (URL або обрати нижче)<input id="e-i" value="${esc(p.img||'')}" placeholder="https://… або img/model-3.jpg"></label><div class="pic" id="gal">${imgs.map(u=>`<button type="button" data-u="${esc(u)}" class="${u===p.img?'on':''}"><img src="${esc(A.im(u))}" alt="" loading="lazy"></button>`).join('')}</div>
  ${A.sw('e-h',p.hidden,'Сховати товар з сайту та B2B')}
  <div class="ft w"><button class="btn btn-y" type="submit">${p._new?'Створити':'Зберегти'}</button>${!p._new?`<a class="btn btn-l" target="_blank" rel="noopener" href="../product.html?id=${p.id}">Дивитись на сайті</a>`:''}${!p._new&&!p._custom&&A.adb().products.ov[p.id]?'<button class="btn btn-l" type="button" id="rs">Скинути правки</button>':''}${p._custom&&!p._new?'<button class="btn btn-r" type="button" id="dl">Видалити</button>':''}</div></form>`,{wide:true});
 const d=$('#dr');$('#e-g',d).onchange=e=>{$('#e-s',d).innerHTML=subs(e.target.value).map(x=>`<option>${esc(x)}</option>`).join('')};
 $('#gal',d).onclick=e=>{const b=e.target.closest('[data-u]');if(!b)return;$('#e-i',d).value=b.dataset.u;$$('#gal button',d).forEach(x=>x.classList.toggle('on',x===b))};
 const rs=$('#rs',d);if(rs)rs.onclick=()=>{delete A.adb().products.ov[p.id];A.save();A.log('Товар '+p.id+': правки скинуто');toast('Скинуто до вихідних даних');A.close();A.refresh()};
 const dl=$('#dl',d);if(dl)dl.onclick=()=>{if(!confirm('Видалити товар «'+p.name+'»?'))return;const pr=A.adb().products;pr.add=pr.add.filter(x=>x.id!==p.id);A.save();A.log('Товар видалено: '+p.name);toast('Видалено');A.close();A.refresh()};
 $('#pf2',d).onsubmit=e=>{e.preventDefault();if(!A.can('products',2))return;const g=x=>$('#'+x,d).value.trim();if(!g('e-n')){$('#e-n',d).classList.add('bad');$('#e-n',d).focus();return}
  const o={name:g('e-n'),pn:g('e-pn'),type:g('e-t'),cond:g('e-t')==='Б/В'?'Б/В':'Новий',grp:g('e-g'),sub:g('e-s'),models:$$('[data-m]',d).filter(x=>x.checked).map(x=>x.dataset.m),price:Math.max(0,+g('e-p')||0),old:+g('e-o')||0,stock:Math.max(0,Math.round(+g('e-st')||0)),badge:g('e-b'),side:g('e-sd')||'—',w:g('e-w'),desc:g('e-d'),img:g('e-i')||'logo.png',hidden:$('#e-h',d).checked};
  if(!o.models.length)o.models=[...MODELS];if(!o.old)delete o.old;
  const pr=A.adb().products;
  if(p._new){const n={id:'x-'+Date.now().toString(36),...o};if(!n.old)n.old=0;pr.add.push(n);A.log('Створено товар: '+o.name)}
  else{if(!o.old)o.old=0;patch(p.id,o);A.log('Оновлено товар: '+o.name)}
  A.save();toast(p._new?'Товар створено':'Збережено');A.close();A.refresh()}}

A.reg('products',{title:'Товари',sub:'Каталог, ціни, залишки, мітки',render(el,qq){if(qq.q!=null&&qq.q!==F.q){F.q=qq.q;F.pg=0}if(qq.f)F.f=qq.f;draw(el)}});

/* ---------- Категорії ---------- */
A.reg('cats',{title:'Категорії',sub:'Дерево розділів, порядок і видимість',render(el){const c=A.adb().cats,T=A.tree(),all=A.products(),w=A.can('cats',2);
 const n=(g,s)=>all.filter(p=>p.grp===g&&(!s||p.sub===s)).length;
 el.innerHTML=`<div class="bar"><span class="mu">Сховані розділи зникають з дерева моделей і каталогу. Нові підкатегорії одразу доступні в редакторі товарів.</span><div class="sp"><button class="btn btn-y btn-s w" id="ag">${B2B.ico('plus')}Розділ / підкатегорія</button></div></div>
 <section class="card" style="padding:8px 8px 0"><div class="tw"><table class="t"><thead><tr><th>Розділ</th><th class="r">Підкатегорій</th><th class="r">Товарів</th><th>Видимість</th><th class="r w">Порядок</th></tr></thead><tbody>
 ${T.map((t,i)=>{const hid=!!c.hide[t.g];return`<tr data-g="${esc(t.g)}" style="${hid?'opacity:.55':''}"><td><b>${esc(t.g)}</b></td><td class="r">${t.s.length}</td><td class="r">${n(t.g)}</td><td><label class="swt"><input type="checkbox" data-hg="${esc(t.g)}" ${hid?'':'checked'} ${w?'':'disabled'} aria-label="Показувати"><i></i></label></td><td class="r w"><button class="btn btn-l btn-s" data-mv="${i}|-1" ${i?'':'disabled'} aria-label="Вище">↑</button> <button class="btn btn-l btn-s" data-mv="${i}|1" ${i<T.length-1?'':'disabled'} aria-label="Нижче">↓</button></td></tr>
  <tr><td colspan="5" style="padding:0 12px 12px;background:#FAFAFB"><div class="chips" style="padding-top:10px">${t.s.map(s=>{const h=!!c.hide[t.g+'|'+s];return`<button data-hs="${esc(t.g+'|'+s)}" class="${h?'':'on'}" ${w?'':'disabled'} title="${h?'Сховано':'Показується'}">${esc(s)}<small>${n(t.g,s)}</small></button>`}).join('')}</div></td></tr>`}).join('')}</tbody></table></div></section>`;
 el.onchange=e=>{const i=e.target.closest('[data-hg]');if(!i)return;c.hide[i.dataset.hg]=!i.checked||undefined;if(i.checked)delete c.hide[i.dataset.hg];A.save();A.log('Розділ «'+i.dataset.hg+'»: '+(i.checked?'показано':'сховано'));A.refresh()};
 el.onclick=e=>{const s=e.target.closest('[data-hs]');if(s&&w){const k=s.dataset.hs;c.hide[k]?delete c.hide[k]:c.hide[k]=true;A.save();A.log('Підкатегорія «'+k.replace('|',' / ')+'»: '+(c.hide[k]?'сховано':'показано'));A.refresh();return}
  const m=e.target.closest('[data-mv]');if(m){const[i,d]=m.dataset.mv.split('|').map(Number),o=T.map(t=>t.g);[o[i],o[i+d]]=[o[i+d],o[i]];c.order=o;A.save();A.log('Змінено порядок розділів');A.refresh()}};
 const ag=$('#ag');if(ag)ag.onclick=()=>{A.open(`${A.hd('Новий розділ або підкатегорія')}<form id="cf" class="stack"><label class="fl">Розділ<input id="c-g" list="gl" placeholder="Існуючий або новий" required><datalist id="gl">${T.map(t=>`<option value="${esc(t.g)}">`).join('')}</datalist></label><label class="fl">Підкатегорія<input id="c-s" placeholder="Необов'язково для нового розділу"></label><div class="ft"><button class="btn btn-y" type="submit">Додати</button></div></form>`);
  $('#cf').onsubmit=e=>{e.preventDefault();const g=$('#c-g').value.trim(),s=$('#c-s').value.trim();if(!g)return;c.add.push({g,s});A.save();A.log('Додано до дерева: '+g+(s?' / '+s:''));toast('Додано');A.close();A.refresh()}}}});
})();
