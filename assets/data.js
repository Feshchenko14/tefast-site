/* Дані прикладу: усі ціни, артикули й залишки умовні. Дерево розділів — assets/tree.js */
const W=p=>'https://upload.wikimedia.org/wikipedia/commons/thumb/'+p+'/1280px-'+p.split('/').pop();
window.MODELS=['Model 3','Model Y','Model S'];
window.MODEL_INFO={
 'Model 3':{years:'2018–2023',slug:'model-3',img:'img/model-3.jpg'},
 'Model Y':{years:'2020–2024',slug:'model-y',img:'img/model-y.jpg'},
 'Model S':{years:'2012–2016',slug:'model-s',img:W('b/b6/2021_Tesla_Model_S_P2_Long_Range_front_right_view.jpg')}};
window.GROUPS=TREE.map(t=>t.g);
/* іконки розділів (24×24, stroke) */
window.GICON={
 'Двері':'<path d="M5 3h9l4 3v15H5zM14 3v4h4M14 13h2"/>',
 'Двигуни':'<path d="M4 9h3l1-2h6l1 2h3v7h-3l-1 2H8l-1-2H4zM2 12v2M22 12v2"/>',
 "Інтер'єр і салон":'<path d="M7 4h4l1 8h4l2 3v3H8l-1-8zM5 18v3M19 18v3"/>',
 'Колеса':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="m6.5 6.5 3.2 3.2M14.3 14.3l3.2 3.2M17.5 6.5l-3.2 3.2M9.7 14.3l-3.2 3.2"/>',
 'Кузов':'<path d="M3 15v-3l2-5h12l3 5v3M3 15h18M7 18a1.5 1.5 0 1 0 0-.01M17 18a1.5 1.5 0 1 0 0-.01"/>',
 'Охолодження':'<path d="M12 2v20M4.5 7l15 10M19.5 7l-15 10"/>',
 'Підвіска і трансмісія':'<path d="M8 3h8M12 3v3m-3 0h6l-1 4 1 4-1 4h-4l-1-4 1-4zM12 18v3"/>',
 'Сайлентблоки та запчастини для ТО':'<path d="M14.5 6a4 4 0 0 0-5 5L3 17.5 6.5 21l6.5-6.5a4 4 0 0 0 5-5l-3 3-2.5-.5-.5-2.5z"/>',
 'Гальмівна система':'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>',
 'Електрика':'<path d="M13 2 5 14h6l-1 8 8-12h-6z"/>'};
const H=(s)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
/* товари, що показані на головній */
const HAND=[
{id:'zaryadnyi-port-ccs2',name:'Зарядний порт CCS2',pn:'1043-02-D',type:'Оригінал',cond:'Новий',models:['Model S'],grp:'Кузов',sub:'Зарядний порт',price:16400,old:18900,stock:4,badge:'ХІТ',img:W('0/0b/Tesla_Model_X_Plaid_CCS2_Charger_Port.jpg'),side:'—',w:'1,2 кг',desc:'Оригінальний зарядний порт CCS2 у зборі для європейських Tesla. Деталь перевірена на складі, реальні фото та відео надішлемо за запитом.'},
{id:'mobilnyi-konektor-gen2',name:'Мобільний конектор Gen2',pn:'1457-33-C',type:'Оригінал',cond:'Новий',models:['Model 3','Model Y'],grp:'Електрика',sub:'Проводка',price:7300,stock:9,badge:'ХІТ',img:W('c/c6/Tesla_Model_3_charging%2C_Windsor%2C_Ontario%2C_2025-05-31.jpg'),side:'—',w:'2,4 кг',desc:'Мобільний зарядний пристрій Gen2 з комплектом перехідників. Підходить для побутової розетки та промислових роз\'ємів.'},
{id:'perednii-bamper-model-y',name:'Передній бампер у зборі',pn:'1493-11-A',type:'Аналог',cond:'Новий',models:['Model Y'],grp:'Кузов',sub:'Бампер передній',price:9750,stock:3,badge:'ХІТ',img:W('b/bd/Tesla_Model_Y_Standard_front_view_dllu.jpg'),side:'Передня частина',w:'6,8 кг',desc:'Новий передній бампер для Model Y. Під фарбування, у комплекті кріплення й накладки.'},
{id:'fara-lh-highland',name:'Фара головного світла LH',pn:'1514-95-A',type:'Оригінал',cond:'Новий',models:['Model 3'],grp:'Кузов',sub:'Оптика передня',price:10580,stock:2,badge:'ХІТ',img:W('9/97/Tesla_Model_3%2C_EMS_2024%2C_Essen_%28P1032260%29.jpg'),side:'Лівий бік',w:'3,1 кг',desc:'Ліва фара для Model 3. Перед замовленням звірте VIN: оптика різних поколінь не завжди сумісна.'},
{id:'adapter-nacs-ccs2',name:'Адаптер NACS → CCS2',pn:'2110-07-A',type:'Аналог',cond:'Новий',models:['Model 3','Model Y','Model S'],grp:'Електрика',sub:'Проводка',price:4200,stock:14,badge:'NEW',img:W('6/6d/Tesla_Supercharger_Inyokern_California_2026_dllu.jpg'),side:'—',w:'0,6 кг',desc:'Адаптер для зарядки американських авто на європейських станціях CCS2. Захист від перегріву, гарантія 12 місяців.'},
{id:'gratka-juniper',name:'Решітка Juniper, комплект',pn:'1688-04-B',type:'Оригінал',cond:'Новий',models:['Model Y'],grp:'Кузов',sub:'Частини кузова',price:6900,stock:5,badge:'NEW',img:W('5/5c/Tesla_Model_Y_1X7A6211.jpg'),side:'Передня частина',w:'1,9 кг',desc:'Комплект решіток для Model Y. Оригінальна якість, готовий до встановлення без допрацювання.'},
{id:'dzerkalo-prave-model-s',name:'Дзеркало праве у зборі',pn:'1100-22-C',type:'Аналог',cond:'Новий',models:['Model S'],grp:'Кузов',sub:'Бокові дзеркала',price:5480,stock:6,badge:'NEW',img:W('b/b6/2021_Tesla_Model_S_P2_Long_Range_front_right_view.jpg'),side:'Правий бік',w:'1,4 кг',desc:'Праве зовнішнє дзеркало з підігрівом і електроприводом. Аналог високої якості для Model S.'},
{id:'nakladka-porogu-model-x',name:'Накладка порогу, пара',pn:'1401-18-A',type:'Аналог',cond:'Новий',models:['Model S'],grp:'Кузов',sub:'Частини кузова',price:3150,stock:8,badge:'NEW',img:W('8/8a/Tesla_Model_X_Plaid_Front.jpg'),side:'Обидва боки',w:'1,1 кг',desc:'Пара накладок порогів із нержавіючої сталі. Захищають лакофарбове покриття, встановлюються на клейку основу.'},
{id:'vazhil-pidviski',name:'Важіль підвіски передній',pn:'1044-84-D',type:'Оригінал',cond:'Новий',models:['Model S'],grp:'Підвіска і трансмісія',sub:'Важелі передні',price:4990,old:5870,stock:7,badge:'−15%',img:W('a/a7/Tesla_Model_S_Plaid_Autofr%C3%BChling_Ulm_IMG_9278.jpg'),side:'Передня вісь',w:'3,2 кг',desc:'Оригінальний передній важіль підвіски для Model S. Акційна ціна діє до кінця місяця.'},
{id:'kolodky-halmivni',name:'Гальмівні колодки, комплект',pn:'1007-31-B',type:'Аналог',cond:'Новий',models:['Model 3','Model Y'],grp:'Гальмівна система',sub:'Супорти та колодки',price:2890,old:3400,stock:20,badge:'−15%',img:W('e/e2/Tesla_Model_Y_2025_at_Santana_Row_dllu_02.jpg'),side:'Передня вісь',w:'1,6 кг',desc:'Комплект передніх колодок для Model 3 та Y. Низький пил, тихий хід, ресурс від 40 000 км.'},
{id:'lihtar-zadnii-rh',name:'Ліхтар задній RH',pn:'1502-08-B',type:'Оригінал',cond:'Б/В',models:['Model Y','Model 3'],grp:'Кузов',sub:'Оптика задня',price:3680,old:4300,stock:2,badge:'−14%',img:W('c/c6/Tesla_Model_X_100D_1X7A6736.jpg'),side:'Правий бік',w:'1,3 кг',desc:'Оригінальний задній ліхтар з нашої розбірки. Стан перевірено, фото конкретного екземпляра надішлемо на запит.'},
{id:'rulova-tiaha',name:'Рульова тяга',pn:'1044-84-A',type:'Оригінал',cond:'Новий',models:['Model 3','Model Y','Model S'],grp:'Підвіска і трансмісія',sub:'Стабілізатор і тяги',price:1150,old:1350,stock:25,badge:'−15%',img:W('2/26/2024_Tesla_Cybertruck%2C_Moab_02.jpg'),side:'—',w:'0,8 кг',desc:'Оригінальна рульова тяга. Рекомендуємо міняти парою та робити розвал-сходження.'}
];
/* решта каталогу генерується з дерева: по одному прикладу на підкатегорію й модель */
const POOL=HAND.map(p=>p.img),TYPES=['Оригінал','Аналог','Оригінал','Аналог','Оригінал','Б/В'];
const GEN=[];
MODELS.forEach((m,mi)=>TREE.forEach((t,gi)=>t.s.forEach((s,si)=>{
  const k=H(m+t.g+s),type=TYPES[k%TYPES.length];
  if(HAND.some(p=>p.sub===s&&p.grp===t.g&&p.models.includes(m)))return;
  GEN.push({id:`p-${mi}-${gi}-${si}`,name:`${s} Tesla ${m}`,pn:`${1000+k%9000}-${String(10+(k>>>8)%90)}-${'ABCD'[(k>>>4)%4]}`,type,cond:type==='Б/В'?'Б/В':'Новий',models:[m],grp:t.g,sub:s,price:(9+k%160)*50,stock:1+(k>>>3)%18,badge:'',img:POOL[k%POOL.length],side:'—',w:`${(1+(k%60)/10).toFixed(1).replace('.',',')} кг`,desc:`${s} для ${m} (${MODEL_INFO[m].years}). Перед замовленням звірте VIN: надішлемо фото конкретного екземпляра на запит.`});
})));
window.PRODUCTS=[...HAND,...GEN];
