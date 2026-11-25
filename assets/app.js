(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ')+' ₴';
const byId=id=>PRODUCTS.find(p=>p.id===id);
const byName=n=>PRODUCTS.find(p=>p.name===n);
const reduce=matchMedia('(prefers-reduced-motion:reduce)');
window.money=money;window.byId=byId;
const mem={};
const store={
 get(){try{return JSON.parse(localStorage.getItem('tefast-cart')||'[]')}catch(e){return mem.c||[]}},
 set(v){try{localStorage.setItem('tefast-cart',JSON.stringify(v))}catch(e){mem.c=v}}};
function badge(bump){const n=cart.count();$$('.cart i').forEach(e=>{e.textContent=n;e.hidden=!n;if(bump&&n&&!reduce.matches){e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')}});$$('.cart').forEach(e=>e.setAttribute('aria-label','Кошик, товарів: '+n))}
let tt;
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.append(t)}t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2400)}
window.toast=toast;
window.cart={
 get:()=>store.get(),
 add(id,q=1){const c=store.get(),i=c.find(x=>x.id===id);if(i)i.q=Math.min(i.q+q,99);else c.push({id,q});store.set(c);badge(true);toast('Додано в кошик: '+byId(id).name)},
 set(id,q){let c=store.get();c=q<=0?c.filter(x=>x.id!==id):c.map(x=>x.id===id?{id,q:Math.min(q,99)}:x);store.set(c);badge()},
 clear(){store.set([]);badge()},
 total:()=>store.get().reduce((s,x)=>s+byId(x.id).price*x.q,0),
 count:()=>store.get().reduce((s,x)=>s+x.q,0)};
window.cardHTML=p=>`<article class="card" data-id="${p.id}">${p.badge?`<span class="badge">${p.badge}</span>`:''}<a class="ph" href="product.html?id=${p.id}" aria-label="${p.name}"><img src="${p.img}" alt="${p.name}" loading="lazy"></a><div class="bd"><small class="pn">${p.pn}</small><h3><a href="product.html?id=${p.id}">${p.name}</a></h3><div class="tags"><span>${p.type}</span><span>${p.cond}</span><span>${p.models.join(' · ')}</span><span class="ok">В наявності</span></div><div class="pr"><span>${p.old?`<s>${money(p.old)}</s>`:''}<b>${money(p.price)}</b></span><button class="add" data-id="${p.id}" aria-label="Додати в кошик: ${p.name}"><svg class="i"><use href="#plus"/></svg></button></div></div></article>`;
/* каскад появи карток: індекс для затримки */
window.stagger=(root)=>$$('.card',root).forEach((c,i)=>{c.style.setProperty('--i',i);c.classList.remove('enter');void c.offsetWidth;c.classList.add('enter')});
/* головна: прив'язуємо статичні картки до даних */
$$('.card:not([data-id])').forEach(c=>{
 const h=$('h3',c);if(!h)return;const p=byName(h.textContent.trim());if(!p)return;
 c.dataset.id=p.id;h.innerHTML=`<a href="product.html?id=${p.id}">${p.name}</a>`;
 const ph=$('.ph',c);if(ph&&ph.tagName!=='A'){const a=document.createElement('a');a.className='ph';a.href='product.html?id='+p.id;a.setAttribute('aria-label',p.name);a.innerHTML=ph.innerHTML;ph.replaceWith(a)}
 const b=$('.pr button',c);if(b){b.classList.add('add');b.dataset.id=p.id}});
/* додавання: «плюс → галочка» на 1.2 с */
document.addEventListener('click',e=>{const b=e.target.closest('.add');if(!b)return;e.preventDefault();cart.add(b.dataset.id,+(b.dataset.q||1));
 const u=$('use',b),lab=b.classList.contains('btn')?b.lastChild:null;
 if(u){const old=u.getAttribute('href');u.setAttribute('href','#check');b.classList.remove('done');void b.offsetWidth;b.classList.add('done');clearTimeout(b._t);b._t=setTimeout(()=>{u.setAttribute('href',old==='#check'?'#plus':old);b.classList.remove('done')},1200)}});
/* вкладки: ковзний індикатор (transform + width) */
function tabs(){$$('.tabs').forEach(t=>{if(t._ind)return;const ind=document.createElement('span');ind.className='tab-ind';t.prepend(ind);t._ind=ind;t.classList.add('has-ind');
 const move=()=>{const on=$('button.on',t)||$('button',t);if(!on)return;ind.style.width=on.offsetWidth+'px';ind.style.transform=`translateX(${on.offsetLeft}px)`};
 t._move=move;move();requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('ready')));
 t.addEventListener('click',()=>requestAnimationFrame(move))});}
window.initTabs=tabs;
addEventListener('resize',()=>$$('.tabs').forEach(t=>t._move&&t._move()));
(document.fonts&&document.fonts.ready||Promise.resolve()).then(()=>$$('.tabs').forEach(t=>t._move&&t._move()));
/* шапка: тінь після прокрутки */
const hd=$('header.nav');if(hd){const f=()=>hd.classList.toggle('scrolled',scrollY>8);f();addEventListener('scroll',f,{passive:true})}
badge();tabs();
})();
