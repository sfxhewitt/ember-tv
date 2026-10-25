'use strict';
/* Ember — Xtream Codes player. Credentials live only in this device's localStorage. */
const $=(s,r=document)=>r.querySelector(s);
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem('ember.'+k))??d}catch{return d}},set:(k,v)=>localStorage.setItem('ember.'+k,JSON.stringify(v))};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const b64=s=>{try{return decodeURIComponent(escape(atob(s)))}catch{return s||''}};
const I={home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',live:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M8 2l4 4 4-4"/>',guide:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',films:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4"/>',series:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M7 3h10"/>',library:'<path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l4 1-3 15-4-1"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',play:'<path d="M7 4v16l13-8z" fill="currentColor"/>',pause:'<path d="M7 4h4v16H7zM13 4h4v16h-4z" fill="currentColor"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',heart:'<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/>',back:'<path d="M15 5l-7 7 7 7"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',bell:'<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/>',rw:'<path d="M11 6l-7 6 7 6zM20 6l-7 6 7 6z" fill="currentColor"/>',ff:'<path d="M13 6l7 6-7 6zM4 6l7 6-7 6z" fill="currentColor"/>',audio:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 8a5 5 0 0 1 0 8"/>',cc:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 10a2 2 0 1 0 0 4M17 10a2 2 0 1 0 0 4"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',pip:'<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="11" width="7" height="6" rx="1" fill="currentColor"/>',plus:'<path d="M12 5v14M5 12h14"/>'};
const ic=(n,f)=>`<svg viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;
const NAV=[['home','Home'],['live','Live TV'],['guide','TV Guide'],['films','Films'],['series','Series'],['library','My Library'],['search','Search'],['settings','Settings']];
const TABS=[['home','Home'],['live','Live'],['films','Films'],['series','Series'],['search','Search'],['library','Library']];

/* ---------- state ---------- */
const S={creds:LS.get('creds',null),demo:new URLSearchParams(location.search).has('demo'),cache:{},route:'home',arg:null};
const prof=()=>LS.get('profile','Main');
const pk=k=>k+'.'+prof();
const favs=()=>LS.get(pk('favs'),[]);
const hist=()=>LS.get(pk('hist'),[]);
const watch=()=>LS.get(pk('watch'),[]);
const settings=()=>Object.assign({allowHttp:true,stats:false,autoNext:true,logos:true,adult:false,format:'m3u8'},LS.get('settings',{}));
function toggleList(key,item){let l=LS.get(pk(key),[]);const i=l.findIndex(x=>x.k===item.k);i>=0?l.splice(i,1):l.unshift(item);LS.set(pk(key),l);return i<0}
function pushHist(item){let l=hist().filter(x=>x.k!==item.k);l.unshift(Object.assign({t:Date.now()},item));LS.set(pk('hist'),l.slice(0,60))}
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}

/* ---------- networking ---------- */
const DEFAULT_PROXY='https://ember-proxy.sfxhewitt.workers.dev';
const pageHttps=()=>location.protocol==='https:';
// Never upgrade the upstream: http:// stays http://. The browser talks HTTPS to the Worker, the Worker fetches http upstream.
function normServer(u){u=(u||'').trim().replace(/\/+$/,'');if(!/^https?:\/\//i.test(u))u='http://'+u;return u}
function proxyFor(c=S.creds){if(!c)return '';const p=(c.proxy??LS.get('proxyurl',DEFAULT_PROXY))||'';if(p)return p.replace(/\/+$/,'');return (settings().allowHttp&&pageHttps()&&/^http:/i.test(normServer(c.server)))?DEFAULT_PROXY:''}
const proxyKey=(c=S.creds)=>(c&&c.key)||LS.get('proxykey','');
function wrap(url,force,c=S.creds){if(!url||/^data:/.test(url))return url;const p=proxyFor(c);if(!p)return url;
 const http=/^http:/i.test(url);if(force||(http&&pageHttps()&&settings().allowHttp))return p+'/?k='+encodeURIComponent(proxyKey(c))+'&url='+encodeURIComponent(url);return url}
// Share link: https://…/ember-tv/#k=KEY (optional &p=PROXY). Stored locally, then removed from the address bar.
(()=>{const m=location.hash.match(/^#k=([^&]+)(?:&p=([^&]+))?/);if(m){LS.set('proxykey',decodeURIComponent(m[1]));if(m[2])LS.set('proxyurl',decodeURIComponent(m[2]));history.replaceState(null,'',location.pathname+location.search)}})();
const base=()=>normServer(S.creds.server);
async function api(action,params={},creds=S.creds){
 if(S.demo)return DEMO.api(action,params);
 const key=action+JSON.stringify(params);if(S.cache[key])return S.cache[key];
 const q=new URLSearchParams(Object.assign({username:creds.user,password:creds.pass},action?{action}:{},params));
 const url=wrap(normServer(creds.server)+'/player_api.php?'+q,true,creds);
 const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error((r.headers.get('x-ember-error')||'HTTP '+r.status));
 const j=await r.json();if(action)S.cache[key]=j;return j}
function streamUrl(type,id,ext,fmt){const c=S.creds;if(S.demo)return DEMO.stream;
 const seg={live:'live',movie:'movie',episode:'series'}[type];
 const U=encodeURIComponent(c.user),Pw=encodeURIComponent(c.pass);if(type==='live'&&ext==='raw')return wrap(`${base()}/${U}/${Pw}/${id}`);
 return wrap(`${base()}/${seg}/${U}/${Pw}/${id}.${type==='live'?(ext||settings().format):(ext||'mp4')}`)}
const img=u=>!u?'':(S.demo?u:wrap(u));

/* ---------- demo data (original placeholder art; no provider content) ---------- */
const DEMO=(()=>{const hues=[18,200,280,140,340,45,220,0,170,260,30,310];
 const art=(t,h,w=400,hh=600)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${hh}"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},70%,45%)"/><stop offset="1" stop-color="hsl(${(h+50)%360},60%,10%)"/></linearGradient><radialGradient id="b" cx=".7" cy=".3" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#a)"/><rect width="100%" height="100%" fill="url(#b)"/><circle cx="${w*.7}" cy="${hh*.35}" r="${w*.22}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/><text x="24" y="${hh-34}" font-family="Helvetica,Arial" font-weight="800" font-size="${w/11}" fill="#fff">${t}</text></svg>`);
 const logo=(t,h)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><rect width="120" height="80" rx="14" fill="hsl(${h},65%,42%)"/><text x="60" y="50" text-anchor="middle" font-family="Helvetica" font-weight="900" font-size="26" fill="#fff">${t}</text></svg>`);
 const chn=['Nova One','Pulse Sport','Arena 2','Northwind','Cinema Max','Kids Planet','Global News','Docu World','Retro TV','Velocity','Coastline','Metro Live'];
 const shows=['Morning Briefing','Matchday Live','The Late Edit','Wild Frontiers','Studio Sessions','Night Drive','Grand Prix Build-up','Cooking Without Limits','City Lights','World Tonight'];
 const films=['Neon Harbour','The Last Orbit','Silent Meridian','Glass Kingdom','Afterglow','Iron Tide','Velvet Run','Northern Echo','The Quiet Shore','Paper Moons','Crimson Lane','Halcyon','Outer Rim','Midnight Atlas','Solstice','Stormline'];
 const ser=['Hollow Creek','The Archive','Saltwater','Fault Lines','Ember Falls','Low Orbit','The Syndicate','Blue Hour','Northbound','Kingsway','Parallel','Driftwood'];
 const live=chn.map((n,i)=>({num:101+i,name:n,stream_id:1000+i,stream_icon:logo(n.split(' ').map(w=>w[0]).join(''),hues[i]),category_id:String(i%4+1)}));
 const vod=films.map((n,i)=>({name:n,stream_id:2000+i,stream_icon:art(n,hues[i%12]),rating:(6+i%4+.3).toFixed(1),category_id:String(i%3+1),added:String(1700000000+i*86400*9),container_extension:'mp4',year:2018+i%7}));
 const series=ser.map((n,i)=>({name:n,series_id:3000+i,cover:art(n,hues[(i+5)%12]),rating:(7+i%3+.1).toFixed(1),category_id:String(i%3+1),last_modified:String(1700000000+i*86400*7),releaseDate:String(2016+i%9)}));
 const now=Math.floor(Date.now()/1000/1800)*1800;
 const epg=id=>{const o=[];let t=now-1800*(id%3);for(let k=0;k<10;k++){const d=1800*(1+((id+k)%3));o.push({title:btoa(shows[(id+k)%shows.length]),description:btoa('An original programme placeholder for demo mode.'),start_timestamp:String(t),stop_timestamp:String(t+d)});t+=d}return o};
 return {art,stream:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  api(a,p){const W=v=>Promise.resolve(JSON.parse(JSON.stringify(v)));
   switch(a){case 'get_live_categories':return W([['1','Entertainment'],['2','Sports'],['3','News'],['4','Kids']].map(([category_id,category_name])=>({category_id,category_name})));
   case 'get_vod_categories':case 'get_series_categories':return W([['1','Action'],['2','Drama'],['3','Sci-Fi']].map(([category_id,category_name])=>({category_id,category_name})));
   case 'get_live_streams':return W(live.filter(x=>!p.category_id||x.category_id==p.category_id));
   case 'get_vod_streams':return W(vod.filter(x=>!p.category_id||x.category_id==p.category_id));
   case 'get_series':return W(series.filter(x=>!p.category_id||x.category_id==p.category_id));
   case 'get_short_epg':case 'get_simple_data_table':return W({epg_listings:epg(+p.stream_id).slice(0,p.limit||10)});
   case 'get_vod_info':{const v=vod.find(x=>x.stream_id==p.vod_id);return W({info:{plot:'A demo-mode placeholder synopsis. Sign in with your provider to see real titles, artwork and plots.',genre:'Drama, Thriller',duration:'1h 58m',releasedate:v.year+'-05-01',rating:v.rating,backdrop_path:[DEMO.art('',(v.stream_id*37)%360,1600,900)],cast:'—',director:'—'},movie_data:v})}
   case 'get_series_info':{const s=series.find(x=>x.series_id==p.series_id);const eps={};[1,2].forEach(se=>{eps[se]=Array.from({length:6},(_,e)=>({id:String(s.series_id*100+se*10+e),episode_num:e+1,title:`Chapter ${e+1}`,container_extension:'mp4',info:{duration:'52m',movie_image:DEMO.art('',(s.series_id+e*30)%360,640,360),plot:'Demo episode.'}}))});return W({info:Object.assign({plot:'A demo-mode placeholder series. Your provider\u2019s seasons and episodes appear here once you sign in.',genre:'Drama',backdrop_path:[DEMO.art('',(s.series_id*53)%360,1600,900)]},s),seasons:[{season_number:1},{season_number:2}],episodes:eps})}
   default:return W({user_info:{auth:1,status:'Active',exp_date:String(Date.now()/1000+86400*200|0),max_connections:'2'},server_info:{url:'demo'}})}}}})();

/* ---------- layout ---------- */
function shell(){const app=$('#app');
 app.innerHTML=`<div class="shell"><aside class="side"><div class="logo"><img src="icon.svg" alt="">EMBER</div>${NAV.map(([k,l])=>`<button class="nav" data-go="${k}">${ic(k)}${l}</button>`).join('')}</aside><main id="main"></main></div><nav class="tabbar">${TABS.map(([k,l])=>`<button data-go="${k}">${ic(k)}${l}</button>`).join('')}</nav>`;
 app.onclick=e=>{const g=e.target.closest('[data-go]');if(g){location.hash=g.dataset.go}}}
function hdr(title,extra=''){return `<div class="top">${extra}<h1>${esc(title)}</h1><button class="ib" data-go="search">${ic('search')}</button><button class="ib" data-go="profiles">${ic('user')}</button><span class="clk">${new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span></div>`}
function setMain(html){const m=$('#main');m.innerHTML=`<div class="page">${html}</div>`;m.scrollTop=0;
 const r=S.route;document.querySelectorAll('[data-go]').forEach(b=>b.classList.toggle('on',b.dataset.go===r||(r==='detail'&&b.dataset.go===(S.arg||'').split(':')[0])))}
const spinner='<div class="spin"></div>';
const ts=t=>new Date(t*1000).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});

/* ---------- router ---------- */
const R={};
async function route(){if(!S.creds&&!S.demo)return renderLogin();if(!$('#main'))shell();
 const [r,...a]=(location.hash.slice(1)||'home').split('/');S.route=R[r]?r:'home';S.arg=decodeURIComponent(a.join('/'));
 try{await R[S.route](S.arg)}catch(e){console.error(e);setMain(hdr('Something went wrong')+`<div class="pad"><div class="card"><p class="err">${esc(e.message)}</p><p class="note">${netHelp()}</p><div class="btns"><button class="btn p" onclick="route()">Retry</button><button class="btn" data-go="provider">Provider settings</button></div></div></div>`)}}
const netHelp=()=>'If this keeps failing, the provider may only allow plain-HTTP or block browser requests. Check Settings \u2192 Connection (top of Settings): Proxy URL, Proxy access key and \u201cAllow HTTP streams\u201d are on. If it says \u201cBlocked host\u201d, that host must be added to the Worker\u2019s ALLOWED_HOSTS.';
window.addEventListener('hashchange',route);

/* ---------- pages ---------- */
R.home=async()=>{setMain(hdr('Home')+spinner);
 const [live,vod,ser]=await Promise.all([api('get_live_streams'),api('get_vod_streams'),api('get_series')]);
 const f=favs().find(x=>x.type==='live');const ch=f?live.find(x=>x.stream_id==f.id)||live[0]:live[0];
 let epg=[];if(ch)try{epg=(await api('get_short_epg',{stream_id:ch.stream_id,limit:2})).epg_listings||[]}catch{}
 const n=epg[0];const recent=[...vod].sort((a,b)=>(b.added||0)-(a.added||0)).slice(0,18);
 const w=watch().filter(x=>x.pos>30&&x.pos<x.dur*.95);
 const bg=(vod.find(v=>v.stream_icon)||{}).stream_icon;
 setMain(hdr('Home')+`<section class="hero"><div class="bgi" style="background-image:url('${esc(img(bg))}')"></div><div class="in"><span class="badge">LIVE</span><h2>${esc(n?b64(n.title):ch?.name||'Live TV')}</h2><p>${esc(ch?.name||'')}${n?` &middot; ${ts(n.start_timestamp)} \u2013 ${ts(n.stop_timestamp)}`:''}</p><div class="btns"><button class="btn p" id="hw">${ic('play')}Watch Live</button><button class="btn" data-go="guide">${ic('info')}More Info</button></div></div></section>
 <div class="pad">${w.length?`<div class="sec"><h3>Continue Watching</h3></div><div class="row">${w.map(x=>`<div class="cw" data-k="${esc(x.k)}"><div class="thumb" style="background-image:url('${esc(img(x.img))}')"><div class="prog" style="width:${Math.min(100,x.pos/x.dur*100)}%"></div></div><div class="t1">${esc(x.title)}</div><div class="t2">${esc(x.sub||'')} \u00b7 ${Math.round((x.dur-x.pos)/60)}m left</div></div>`).join('')}</div>`:''}
 ${favs().length?`<div class="sec"><h3>Favourites</h3><a data-go="library">See all</a></div><div class="row">${favs().slice(0,14).map(posterLib).join('')}</div>`:''}
 <div class="sec"><h3>Recently Added Films</h3><a data-go="films">See all</a></div><div class="row">${recent.map(v=>`<div style="flex:none;width:140px">${poster(v,'movie')}</div>`).join('')}</div>
 <div class="sec"><h3>Series</h3><a data-go="series">See all</a></div><div class="row">${ser.slice(0,18).map(v=>`<div style="flex:none;width:140px">${poster(v,'series')}</div>`).join('')}</div></div>`);
 $('#hw').onclick=()=>ch&&playLive(ch,live);
 document.querySelectorAll('.cw').forEach(el=>el.onclick=()=>{const x=w.find(y=>y.k===el.dataset.k);play(x.play)});};
function poster(v,type){const id=type==='movie'?v.stream_id:v.series_id;const im=v.stream_icon||v.cover;const yr=v.year||(v.releaseDate||v.release_date||'').slice(0,4);
 return `<div class="post" onclick="location.hash='detail/${type}:${id}'"><div class="im" style="background-image:url('${esc(img(im))}')">${+v.rating?`<span class="rating">\u2605 ${(+v.rating).toFixed(1)}</span>`:''}${im?'':`<div class="nm">${esc(v.name)}</div>`}</div><div class="t1">${esc(v.name)}</div><div class="t2">${esc(yr||'')}</div></div>`}
function posterLib(x){const go=x.type==='live'?`live`:`detail/${x.type}:${x.id}`;return `<div style="flex:none;width:140px"><div class="post" onclick="location.hash='${go}'"><div class="im" style="background-image:url('${esc(img(x.img))}');${x.type==='live'?'background-size:60%;background-repeat:no-repeat;aspect-ratio:16/10':''}"></div><div class="t1">${esc(x.title)}</div><div class="t2">${{live:'Channel',movie:'Film',series:'Series'}[x.type]}</div></div></div>`}

R.live=async()=>{setMain(hdr('Live TV')+spinner);
 const cats=await api('get_live_categories');const cur=LS.get('livecat','all');
 const list=await api('get_live_streams',cur==='all'||cur==='fav'?{}:{category_id:cur});
 const fv=new Set(favs().filter(x=>x.type==='live').map(x=>String(x.id)));
 let chans=cur==='fav'?list.filter(c=>fv.has(String(c.stream_id))):list;
 setMain(hdr('Live TV')+`<div class="chips"><button class="chip ${cur==='all'?'on':''}" data-c="all">All</button><button class="chip ${cur==='fav'?'on':''}" data-c="fav">Favourites</button>${cats.map(c=>`<button class="chip ${cur==c.category_id?'on':''}" data-c="${esc(c.category_id)}">${esc(c.category_name)}</button>`).join('')}</div>
 <div class="pad live"><div class="chl" id="chl"></div><div class="prev" id="prev"></div></div>`);
 document.querySelectorAll('.chip[data-c]').forEach(b=>b.onclick=()=>{LS.set('livecat',b.dataset.c);R.live()});
 const box=$('#chl');const sent=document.createElement('div');box.appendChild(sent);let shown=0;const PAGE=60;
 const more=()=>{const part=chans.slice(shown,shown+PAGE);shown+=part.length;sent.insertAdjacentHTML('beforebegin',part.map((c,i)=>`<div class="ch" data-id="${c.stream_id}"><span class="num">${c.num||shown-part.length+i+1}</span><div class="logo2" style="background-image:url('${esc(img(c.stream_icon))}')">${c.stream_icon?'':esc((c.name||'').slice(0,3))}</div><div class="meta"><b>${esc(c.name)}</b><span class="np">&nbsp;</span><div class="bar"><i style="width:0"></i></div></div><button class="fav ${fv.has(String(c.stream_id))?'on':''}">${ic('heart',fv.has(String(c.stream_id)))}</button></div>`).join(''));
  part.forEach(c=>loadNow(c))};
 if(!chans.length)sent.outerHTML='<div class="empty">No channels here yet.</div>';else more();
 const io=new IntersectionObserver(e=>{if(e[0].isIntersecting&&shown<chans.length)more()});io.observe(sent);
 box.onclick=e=>{const row=e.target.closest('.ch');if(!row)return;const c=chans.find(x=>x.stream_id==row.dataset.id);
  if(e.target.closest('.fav')){const on=toggleList('favs',{k:'live:'+c.stream_id,type:'live',id:c.stream_id,title:c.name,img:c.stream_icon});const b=e.target.closest('.fav');b.classList.toggle('on',on);b.innerHTML=ic('heart',on);toast(on?'Added to Favourites':'Removed');return}
  if(innerWidth<=820||row.classList.contains('on'))return playLive(c,chans);
  document.querySelectorAll('.ch.on').forEach(x=>x.classList.remove('on'));row.classList.add('on');preview(c,chans)};
 if(chans[0]&&innerWidth>820){box.firstElementChild?.classList.add('on');preview(chans[0],chans)}};
async function loadNow(c){try{const e=(await api('get_short_epg',{stream_id:c.stream_id,limit:2})).epg_listings||[];const el=document.querySelector(`.ch[data-id="${c.stream_id}"]`);if(!el||!e[0])return;
 const n=e[0],p=Math.max(0,Math.min(100,(Date.now()/1000-n.start_timestamp)/(n.stop_timestamp-n.start_timestamp)*100));
 el.querySelector('.np').textContent=`${ts(n.start_timestamp)}  ${b64(n.title)}`+(e[1]?`  \u2192  ${b64(e[1].title)}`:'');el.querySelector('.bar i').style.width=p+'%';c._epg=e}catch{}}
async function preview(c,list){const p=$('#prev');let e=c._epg;if(!e)try{e=(await api('get_short_epg',{stream_id:c.stream_id,limit:3})).epg_listings||[]}catch{e=[]}
 const n=e[0];p.innerHTML=`<div class="v" style="background-image:url('${esc(img(c.stream_icon))}');background-size:30%"></div><div class="b"><div class="t2">${esc(c.name)}</div><h4>${esc(n?b64(n.title):'No guide data')}</h4>${n?`<div class="t2">${ts(n.start_timestamp)} \u2013 ${ts(n.stop_timestamp)}</div>`:''}<p style="margin-top:8px">${esc(n?b64(n.description):'')}</p>${e[1]?`<p style="margin-top:10px"><b style="color:#fff">Next:</b> ${ts(e[1].start_timestamp)} ${esc(b64(e[1].title))}</p>`:''}<div class="btns"><button class="btn p" id="pw">${ic('play')}Watch</button><button class="btn" id="pf">Add to Favourites</button></div></div>`;
 $('#pw').onclick=()=>playLive(c,list);$('#pf').onclick=()=>{toast(toggleList('favs',{k:'live:'+c.stream_id,type:'live',id:c.stream_id,title:c.name,img:c.stream_icon})?'Added to Favourites':'Removed')}}

R.guide=async()=>{setMain(hdr('TV Guide')+spinner);
 const cats=await api('get_live_categories');const cur=LS.get('guidecat',cats[0]?.category_id);
 const chans=(await api('get_live_streams',{category_id:cur})).slice(0,40);
 const PX=4/60,start=Math.floor(Date.now()/1000/1800)*1800-1800,span=6*3600,W=span*PX;
 setMain(hdr('TV Guide')+`<div class="chips">${cats.map(c=>`<button class="chip ${cur==c.category_id?'on':''}" data-c="${esc(c.category_id)}">${esc(c.category_name)}</button>`).join('')}</div><div class="pad"><div class="epg" id="epg"><div class="hd"><div style="width:${innerWidth<=820?70:96}px;position:sticky;left:0;background:#121217;z-index:2;border:0">Today</div>${Array.from({length:12},(_,i)=>`<div style="width:${1800*PX}px">${ts(start+i*1800)}</div>`).join('')}</div>${chans.map(c=>`<div class="er" data-id="${c.stream_id}"><div class="ec"><div class="logo2" style="background-image:url('${esc(img(c.stream_icon))}');width:52px;height:36px">${c.stream_icon?'':esc(c.name.slice(0,3))}</div></div><div class="tl" style="width:${W}px"></div></div>`).join('')}<div class="nowl" id="nowl"></div></div></div>`);
 document.querySelectorAll('.chip[data-c]').forEach(b=>b.onclick=()=>{LS.set('guidecat',b.dataset.c);R.guide()});
 const off=innerWidth<=820?70:96;const nl=$('#nowl');nl.style.left=off+(Date.now()/1000-start)*PX+'px';
 $('#epg').scrollLeft=Math.max(0,(Date.now()/1000-start)*PX-80);
 $('#epg').onclick=e=>{const r=e.target.closest('.er');if(r){const c=chans.find(x=>x.stream_id==r.dataset.id);playLive(c,chans)}};
 for(const c of chans){api('get_short_epg',{stream_id:c.stream_id,limit:12}).then(d=>{const tl=document.querySelector(`.er[data-id="${c.stream_id}"] .tl`);if(!tl)return;const now=Date.now()/1000;
  tl.innerHTML=(d.epg_listings||[]).filter(p=>p.stop_timestamp>start&&p.start_timestamp<start+span).map(p=>{const s=Math.max(p.start_timestamp,start),x=(s-start)*PX,w=(Math.min(p.stop_timestamp,start+span)-s)*PX-4;return `<div class="prg ${p.start_timestamp<=now&&p.stop_timestamp>now?'now':''}" style="left:${x+2}px;width:${w}px">${esc(b64(p.title))}<small>${ts(p.start_timestamp)} \u2013 ${ts(p.stop_timestamp)}</small></div>`}).join('')||`<div class="prg" style="left:2px;width:${W-4}px;color:var(--mu)">${esc(c.name)} \u2014 no guide data</div>`}).catch(()=>{})}};

function catalogue(kind){return async()=>{const isM=kind==='films',title=isM?'Films':'Series';setMain(hdr(title)+spinner);
 const cats=await api(isM?'get_vod_categories':'get_series_categories');const st=LS.get(kind+'.f',{sort:isM?'popular':'trending',cat:''});
 let list=await api(isM?'get_vod_streams':'get_series',st.cat?{category_id:st.cat}:{});
 const yr=v=>+(v.year||(v.releaseDate||v.release_date||'').slice(0,4))||0;
 const sorts={popular:(a,b)=>(+b.rating||0)-(+a.rating||0),trending:(a,b)=>(+b.rating||0)-(+a.rating||0),recent:(a,b)=>(+(b.added||b.last_modified)||0)-(+(a.added||a.last_modified)||0),year:(a,b)=>yr(b)-yr(a),az:(a,b)=>String(a.name).localeCompare(b.name)};
 list=[...list].sort(sorts[st.sort]);
 const chip=(k,l)=>`<button class="chip ${st.sort===k?'on':''}" data-s="${k}">${l}</button>`;
 setMain(hdr(title)+`<div class="chips">${chip(isM?'popular':'trending',isM?'Popular':'Trending')}${chip('recent','Recently Added')}${chip('year','Year')}${chip('az','A\u2013Z')}<select class="chip" id="genre"><option value="">Genre: All</option>${cats.map(c=>`<option value="${esc(c.category_id)}" ${st.cat==c.category_id?'selected':''}>${esc(c.category_name)}</option>`).join('')}</select></div><div class="pad"><div class="grid" id="grid"></div></div>`);
 document.querySelectorAll('.chip[data-s]').forEach(b=>b.onclick=()=>{st.sort=b.dataset.s;LS.set(kind+'.f',st);R[kind]()});
 $('#genre').onchange=e=>{st.cat=e.target.value;LS.set(kind+'.f',st);R[kind]()};
 const g=$('#grid');let n=0;const more=()=>{g.insertAdjacentHTML('beforeend',list.slice(n,n+48).map(v=>poster(v,isM?'movie':'series')).join(''));n+=48};more();
 if(!list.length)g.innerHTML='<div class="empty">Nothing here.</div>';
 const s=document.createElement('div');g.after(s);new IntersectionObserver(e=>{if(e[0].isIntersecting&&n<list.length)more()},{rootMargin:'600px'}).observe(s)}}
R.films=catalogue('films');R.series=catalogue('series');

R.detail=async arg=>{const [type,id]=arg.split(':');setMain(spinner);
 const back=`<button class="ib" onclick="history.back()">${ic('back')}</button>`;
 if(type==='movie'){const d=await api('get_vod_info',{vod_id:id});const i=d.info||{},m=d.movie_data||{};
  const name=m.name||i.name||'Film',bg=(i.backdrop_path||[])[0]||i.cover_big||i.movie_image;const k='movie:'+id;const fav=favs().some(x=>x.k===k);
  const item={k,type:'movie',id,title:name,img:i.movie_image||i.cover_big||bg};
  const pl={type:'movie',id,ext:m.container_extension,title:name,sub:'Film',img:bg||item.img};
  const w=watch().find(x=>x.k===k);
  setMain(hdr('',back)+`<section class="det"><div class="bgi" style="background-image:url('${esc(img(bg))}')"></div><div class="in"><h2>${esc(name)}</h2><div class="mm">${esc((i.releasedate||'').slice(0,4))}${i.genre?` \u00b7 ${esc(i.genre)}`:''}${i.duration?` \u00b7 ${esc(i.duration)}`:''}${+i.rating?` <span class="imdb">IMDb</span> ${(+i.rating).toFixed(1)}`:''}</div><p>${esc(i.plot||i.description||'')}</p><div class="btns"><button class="btn p" id="dp">${ic('play')}${w&&w.pos>30?'Resume':'Play'}</button><button class="btn" id="df">${fav?'\u2713 In My List':'+ Add to Watchlist'}</button></div>${i.cast?`<p class="note" style="margin-top:14px">Cast: ${esc(i.cast)}</p>`:''}${i.director?`<p class="note">Director: ${esc(i.director)}</p>`:''}</div></section>`);
  $('#dp').onclick=()=>play(pl);$('#df').onclick=e=>{const on=toggleList('favs',item);e.target.textContent=on?'\u2713 In My List':'+ Add to Watchlist'}}
 else{const d=await api('get_series_info',{series_id:id});const i=d.info||{};const eps=d.episodes||{};const seasons=Object.keys(eps).sort((a,b)=>a-b);
  const bg=(i.backdrop_path||[])[0]||i.cover;const k='series:'+id;const fav=favs().some(x=>x.k===k);let cur=LS.get('season.'+id,seasons[0]);if(!eps[cur])cur=seasons[0];
  const item={k,type:'series',id,title:i.name,img:i.cover};
  setMain(hdr('',back)+`<section class="det"><div class="bgi" style="background-image:url('${esc(img(bg))}')"></div><div class="in"><h2>${esc(i.name)}</h2><div class="mm">${esc((i.releaseDate||i.release_date||'').slice(0,4))} \u00b7 ${esc(i.genre||'')} \u00b7 ${seasons.length} Season${seasons.length==1?'':'s'}${+i.rating?` <span class="imdb">IMDb</span> ${(+i.rating).toFixed(1)}`:''}</div><p>${esc(i.plot||'')}</p><div class="btns"><button class="btn p" id="dp">${ic('play')}Play S${cur} E1</button><button class="btn" id="df">${fav?'\u2713 In My List':'+ Add to Watchlist'}</button></div></div></section><div class="tabs">${seasons.map(s=>`<button class="tab ${s==cur?'on':''}" data-s="${s}">Season ${s}</button>`).join('')}</div><div class="pad"><div class="row" id="eps"></div></div>`);
  const draw=()=>{$('#eps').innerHTML=(eps[cur]||[]).map(e=>`<div class="ep" data-id="${e.id}"><div class="thumb" style="background-image:url('${esc(img(e.info?.movie_image||i.cover))}')"><div class="pl">${ic('play')}</div>${(()=>{const w=watch().find(x=>x.k==='episode:'+e.id);return w?`<div class="prog" style="width:${w.pos/w.dur*100}%"></div>`:''})()}</div><div class="t1">${e.episode_num}. ${esc(e.title)}</div><div class="t2">${esc(e.info?.duration||'')}</div></div>`).join('')};draw();
  const epPlay=(e,list)=>play({type:'episode',id:e.id,ext:e.container_extension,title:i.name,sub:`S${cur} E${e.episode_num} \u00b7 ${e.title}`,img:e.info?.movie_image||bg,series:id,queue:list.map(x=>x.id)});
  document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{cur=t.dataset.s;LS.set('season.'+id,cur);document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===t));draw()});
  $('#eps').onclick=e=>{const el=e.target.closest('.ep');if(el){const list=eps[cur];epPlay(list.find(x=>x.id==el.dataset.id),list)}};
  $('#dp').onclick=()=>{const l=eps[cur]||[];l[0]&&epPlay(l[0],l)};
  $('#df').onclick=e=>{const on=toggleList('favs',item);e.target.textContent=on?'\u2713 In My List':'+ Add to Watchlist'};
  S.epsCache=Object.assign(S.epsCache||{},{[id]:{eps,i,bg}})}};

R.search=async q=>{q=q||'';setMain(hdr('Search')+`<div class="search">${ic('search')}<input id="q" placeholder="Channels, films, series\u2026" value="${esc(q)}" autocomplete="off" enterkeyhint="search"></div><div class="pad" id="sr"></div>`);
 const inp=$('#q');if(innerWidth>820)inp.focus();let t;
 const run=async()=>{const v=inp.value.trim().toLowerCase();history.replaceState(null,'','#search/'+encodeURIComponent(inp.value));const sr=$('#sr');if(v.length<2){sr.innerHTML=`<div class="empty">Type at least 2 letters to search every channel, film and series.</div>`;return}
  sr.innerHTML=spinner;const [l,m,s]=await Promise.all([api('get_live_streams'),api('get_vod_streams'),api('get_series')]);
  const f=a=>a.filter(x=>String(x.name).toLowerCase().includes(v)).slice(0,30);
  const out=[...f(l).map(x=>({x,t:'live'})),...f(m).map(x=>({x,t:'movie'})),...f(s).map(x=>({x,t:'series'}))];
  sr.innerHTML=out.length?out.map(({x,t},i)=>`<div class="res" data-i="${i}"><div class="im ${t==='live'?'w':''}" style="background-image:url('${esc(img(x.stream_icon||x.cover))}')"></div><div><div class="kind">${{live:'Live channel',movie:'Film',series:'Series'}[t]}</div><div class="t1" style="margin:2px 0">${esc(x.name)}</div><div class="t2">${esc(x.year||(x.releaseDate||'').slice(0,4)||'')}</div></div></div>`).join(''):'<div class="empty">No matches.</div>';
  sr.onclick=e=>{const r=e.target.closest('.res');if(!r)return;const {x,t}=out[r.dataset.i];t==='live'?playLive(x,l):location.hash=`detail/${t}:${t==='movie'?x.stream_id:x.series_id}`}};
 inp.oninput=()=>{clearTimeout(t);t=setTimeout(run,250)};run()};

R.library=async tab=>{tab=tab||LS.get('libtab','watchlist');LS.set('libtab',tab);
 const f=favs(),h=hist();const lists={watchlist:f.filter(x=>x.type!=='live'),favourites:f.filter(x=>x.type==='live'),history:h,continue:watch().filter(x=>x.pos>30&&x.pos<x.dur*.95)};
 setMain(hdr('My Library')+`<div class="chips">${[['watchlist','Watchlist'],['favourites','Favourite Channels'],['continue','Continue Watching'],['history','History']].map(([k,l])=>`<button class="chip ${k===tab?'on':''}" data-go="library/${k}">${l}</button>`).join('')}</div><div class="pad">${lists[tab].length?`<div class="grid">${lists[tab].map(x=>{const it=x.play?{type:x.play.type==='episode'?'series':x.play.type,id:x.play.series||x.play.id,title:x.title,img:x.img}:x;return posterLib(it).replace('style="flex:none;width:140px"','')}).join('')}</div>${tab==='history'?'<div class="btns"><button class="btn" id="clr">Clear history</button></div>':''}`:'<div class="empty">Nothing here yet. Tap \u2661 or + Add to Watchlist on anything you like.</div>'}</div>`);
 const c=$('#clr');if(c)c.onclick=()=>{LS.set(pk('hist'),[]);R.library('history')}};

R.settings=async()=>{const s=settings();let acct='';
 try{if(!S.demo){const a=await api('',{},S.creds);const u=a.user_info||{};LS.set('formats',u.allowed_output_formats||[]);acct=`<div class="set"><span>Account<small>${esc(u.status||'')} \u00b7 ${u.exp_date?'expires '+new Date(u.exp_date*1000).toLocaleDateString('en-GB'):'no expiry'} \u00b7 ${esc(u.max_connections||'?')} connection(s)</small></span></div>`}}catch{}
 const tg=(k,l,d)=>`<div class="set"><span>${l}<small>${d}</small></span><button class="tg ${s[k]?'on':''}" data-k="${k}"></button></div>`;
 setMain(hdr('Settings')+`<div class="pad" style="max-width:760px">${S.demo?'':`<div class="sec"><h3>Connection</h3></div><div class="card" style="margin-bottom:18px"><div class="fld"><label>Server URL (kept as http://)</label><input id="cs" value="${esc(S.creds.server)}" inputmode="url" autocapitalize="off" autocorrect="off"></div><div class="fld"><label>Proxy URL</label><input id="cp" value="${esc(S.creds.proxy??LS.get('proxyurl',DEFAULT_PROXY))}" inputmode="url" autocapitalize="off" autocorrect="off"></div><div class="fld"><label>Proxy access key</label><input id="ck" type="password" value="${esc(proxyKey())}" autocapitalize="off" autocorrect="off"></div>${tg('allowHttp','Allow HTTP streams (via proxy)','Routes http:// API, artwork and video through your proxy so Safari doesn\u2019t block them')}<p class="note" id="cm">Active route: ${proxyFor()?'via proxy '+esc(proxyFor()):'direct'}</p><div class="btns"><button class="btn p" id="csv">Save connection</button></div></div>`}<div class="sec"><h3>General</h3></div><div class="card"><div class="set"><span>Provider<small>${S.demo?'Demo mode':esc(normServer(S.creds.server))} \u00b7 ${S.demo?'':esc(S.creds.user)}${S.creds?.proxy?' \u00b7 via proxy':''}</small></span><button class="btn" data-go="provider">Edit</button></div>${acct}
 <div class="set"><span>Live stream format<small>HLS (.m3u8) works best on iPhone</small></span><select class="chip" id="fmt"><option value="m3u8" ${s.format==='m3u8'?'selected':''}>HLS (.m3u8)</option><option value="ts" ${s.format==='ts'?'selected':''}>MPEG-TS (.ts)</option></select></div>
 ${tg('stats','Show stream stats','Overlay bitrate, buffer and recoveries in the player')}${tg('autoNext','Auto-play next episode','Start the next episode when one ends')}${tg('adult','Show adult categories','Hidden behind the profile PIN')}
 <div class="set"><span>Profiles & parental PIN<small>Current: ${esc(prof())}</small></span><button class="btn" data-go="profiles">Manage</button></div>
 <div class="set"><span>Clear cached catalogue<small>Reload channel and film lists</small></span><button class="btn" id="cc">Clear</button></div>
 <div class="set"><span>Sign out<small>Removes your login from this device</small></span><button class="btn" id="so" style="color:#ff6b6b">Sign out</button></div></div>
 <p class="note" style="text-align:center;margin-top:18px">Ember \u00b7 your login is stored only on this device.</p></div>`);
 document.querySelectorAll('.tg').forEach(b=>b.onclick=()=>{s[b.dataset.k]=!s[b.dataset.k];LS.set('settings',s);b.classList.toggle('on')});
 if($('#csv'))$('#csv').onclick=async()=>{const c=Object.assign({},S.creds,{server:$('#cs').value.trim(),proxy:$('#cp').value.trim(),key:$('#ck').value.trim()});const m=$('#cm');m.className='note';m.textContent='Testing\u2026';try{const j=await api('',{},c);if(+(j.user_info||{}).auth!==1)throw new Error('Login rejected');S.creds=c;S.cache={};LS.set('creds',c);m.className='note ok';m.textContent='\u2713 Saved \u00b7 connected';}catch(e){m.className='note err';m.textContent='Not saved: '+e.message}};
 $('#fmt').onchange=e=>{s.format=e.target.value;LS.set('settings',s)};$('#cc').onclick=()=>{S.cache={};toast('Cache cleared')};
 document.querySelectorAll('.tg').forEach(b=>b.addEventListener('click',()=>{S.cache={}}));
 $('#so').onclick=()=>{if(confirm('Sign out of this device?')){localStorage.removeItem('ember.creds');S.creds=null;location.hash='';location.search='';}}};

R.profiles=async()=>{const ps=LS.get('profiles',[{n:'Main',c:'#ff6a2b'},{n:'Kids',c:'#3b82f6',pin:''}]);const cur=prof();
 setMain(hdr('Profiles')+`<div class="pad"><div class="profs">${ps.map((p,i)=>`<div class="prof ${p.n===cur?'on':''}" data-i="${i}"><div class="av" style="background:linear-gradient(135deg,${p.c},#111)">${esc(p.n[0])}${p.pin?'<span class="lock">\ud83d\udd12</span>':''}</div><div>${esc(p.n)}</div></div>`).join('')}<div class="prof" id="add"><div class="av" style="border:2px dashed #444">${ic('plus')}</div><div>Add Profile</div></div></div>
 <div class="card"><div class="set"><span>Parental controls<small>Set a 4-digit PIN for the current profile (${esc(cur)}). Favourites, history and watch progress are kept per profile.</small></span><button class="btn" id="pin">${ps.find(p=>p.n===cur)?.pin?'Change PIN':'Set PIN'}</button></div></div></div>`);
 document.querySelectorAll('.prof[data-i]').forEach(el=>el.onclick=()=>{const p=ps[el.dataset.i];if(p.pin&&prompt('PIN for '+p.n)!==p.pin)return toast('Wrong PIN');LS.set('profile',p.n);toast('Switched to '+p.n);R.profiles()});
 $('#add').onclick=()=>{const n=(prompt('Profile name')||'').trim();if(!n||ps.some(p=>p.n===n))return;ps.push({n,c:`hsl(${Math.random()*360|0},70%,55%)`});LS.set('profiles',ps);R.profiles()};
 $('#pin').onclick=()=>{const p=ps.find(p=>p.n===cur);const v=prompt('New 4-digit PIN (leave empty to remove)');if(v===null)return;if(v&&!/^\d{4}$/.test(v))return toast('PIN must be 4 digits');p.pin=v;LS.set('profiles',ps);toast(v?'PIN set':'PIN removed');R.profiles()}};

/* ---------- provider / login ---------- */
function providerForm(c){c=c||{};return `<div class="form"><div><h2 style="font-size:26px;letter-spacing:-.02em">Add IPTV Provider</h2><p class="note" style="margin:6px 0 18px">Enter your provider details to get started.</p>
 <button class="opt on"><span style="font-size:20px">\u26a1</span><span><b>Xtream Codes</b><small>Server, username & password</small></span></button>
 <button class="opt" disabled style="opacity:.45"><span style="font-size:20px">\ud83d\udcc4</span><span><b>M3U Playlist</b><small>Coming soon</small></span></button>
 <button class="opt" disabled style="opacity:.45"><span style="font-size:20px">\ud83d\uddd3</span><span><b>XMLTV (EPG)</b><small>Guide comes from Xtream</small></span></button>
 <p class="note ok">\ud83d\udd12 Secure: your details are saved only on this device.</p></div>
 <div class="card"><div class="fld"><label>Provider name</label><input id="pn" value="${esc(c.name||'Supreme TV')}"></div><div class="fld"><label>Server URL</label><input id="ps" value="${esc(c.server||'http://apexdfg.com')}" inputmode="url" autocapitalize="off" autocorrect="off"></div>
 <div class="fld"><label>Username</label><input id="pu" value="${esc(c.user||'')}" autocapitalize="off" autocorrect="off" autocomplete="username"></div><div class="fld"><label>Password</label><input id="pp" type="password" value="${esc(c.pass||'')}" autocomplete="current-password"></div>
 <div class="fld"><label>Proxy URL (lets iPhone play http:// streams)</label><input id="px" value="${esc(c.proxy??LS.get('proxyurl',DEFAULT_PROXY))}" inputmode="url" autocapitalize="off" autocorrect="off"></div><div class="fld"><label>Proxy access key</label><input id="pk" type="password" value="${esc(c.key||LS.get('proxykey',''))}" autocapitalize="off" autocorrect="off" placeholder="Filled in automatically from your invite link"><p class="note">Your own Cloudflare Worker. API, guide, artwork and video all go through it; the server URL stays http://.</p></div>
 <p class="note" id="msg"></p><div class="btns"><button class="btn" id="tc">Test Connection</button><button class="btn p" id="sv">Save Provider</button></div>${S.creds?'':'<p class="note" style="margin-top:14px">Just looking? <a href="?demo#home" style="color:var(--ac)">Open demo mode</a></p>'}</div></div>`}
function bindProvider(){const read=()=>({name:$('#pn').value.trim(),server:$('#ps').value.trim(),user:$('#pu').value.trim(),pass:$('#pp').value,proxy:$('#px').value.trim(),key:$('#pk').value.trim()});
 const test=async()=>{const c=read(),m=$('#msg');if(!c.server||!c.user||!c.pass){m.className='note err';m.textContent='Fill in server, username and password.';return false}
  m.className='note';m.textContent='Connecting\u2026';
  const was=S.creds;S.creds=c;try{const j=await api('',{},c);const u=j.user_info||{};if(+u.auth!==1)throw new Error('Login rejected \u2014 check username/password');LS.set('formats',u.allowed_output_formats||[]);
   m.className='note ok';m.textContent=`\u2713 Connected \u00b7 ${u.status||'Active'}${u.exp_date?' \u00b7 expires '+new Date(u.exp_date*1000).toLocaleDateString('en-GB'):''}`;return true}
  catch(e){S.creds=was;m.className='note err';m.textContent=(e instanceof TypeError?'Could not reach the server from the browser (blocked HTTP / CORS). ':'')+e.message+'. '+netHelp();return false}};
 $('#tc').onclick=test;$('#sv').onclick=async()=>{if(await test()){S.creds=read();S.cache={};LS.set('creds',S.creds);toast('Provider saved');if(!$('#main'))shell();location.hash='home';route()}}}
function renderLogin(){$('#app').innerHTML=`<div class="login"><div class="lbox"><div class="logo" style="padding-left:0;margin-bottom:20px"><img src="icon.svg" alt="">EMBER</div>${providerForm()}</div></div>`;bindProvider()}
R.provider=async()=>{if(S.demo){setMain(hdr('Provider')+`<div class="pad"><div class="card"><p>You\u2019re in demo mode.</p><div class="btns"><a class="btn p" href="./">Sign in with your provider</a></div></div></div>`);return}
 setMain(hdr('Provider')+`<div class="pad">${providerForm(S.creds)}</div>`);bindProvider()};

/* ---------- player ---------- */
let P=null;
function playLive(c,list){pushHist({k:'live:'+c.stream_id,type:'live',id:c.stream_id,title:c.name,img:c.stream_icon});play({type:'live',id:c.stream_id,title:c.name,sub:'Live',img:c.stream_icon,list})}
function play(it){closePlayer();if(it.type!=='live')pushHist({k:it.type+':'+it.id,type:it.type==='episode'?'series':'movie',id:it.series||it.id,title:it.title,img:it.img,play:it});
 const el=document.createElement('div');el.className='player';const live=it.type==='live';
 el.innerHTML=`<video playsinline webkit-playsinline autoplay ${S.demo?'muted':''}></video><div class="pmsg" id="pm">${spinner}</div><div class="pui" id="pui"><div class="ptop"><button class="ib" id="px">${ic('back')}</button>${live&&it.img?`<div class="logo2" style="background-image:url('${esc(img(it.img))}')"></div>`:''}<div class="ttl"><b>${esc(it.title)}</b><small id="psub">${esc(it.sub||'')}</small></div>${document.pictureInPictureEnabled||'webkitSupportsPresentationMode' in HTMLVideoElement.prototype?`<button class="ib" id="pip">${ic('pip')}</button>`:''}<button class="ib" id="fs">${ic('full')}</button></div>
 <div class="pbot">${live?`<div class="scrub"><span class="badge">LIVE</span><span id="pnow" style="flex:1"></span></div>`:`<div class="scrub"><span id="cur">0:00</span><input type="range" id="sk" min="0" max="1000" value="0"><span id="dur">0:00</span></div>`}
 <div class="pc">${live?'':`<button id="rw">${ic('rw')}</button>`}<button id="pp">${ic('pause')}</button>${live?'':`<button id="fw">${ic('ff')}</button>`}<span class="sp"></span><button class="bb" id="au">${ic('audio')}Audio</button><button class="bb" id="sb">${ic('cc')}Subtitles</button>${live&&it.list?`<button class="bb" id="cl">${ic('list')}Channels</button>`:''}</div></div></div>`;
 document.body.appendChild(el);const v=el.querySelector('video'),ui=el.querySelector('#pui'),pm=el.querySelector('#pm');
  let hls=null,mp=null;
 const fail=m=>{pm.innerHTML=`<div><p style="font-size:17px;font-weight:600">Can\u2019t play this stream</p><p class="note" style="max-width:420px;margin:8px auto">${esc(m)}</p><p class="note" style="max-width:420px;margin:auto">${netHelp()}</p><p class="note err" id="diag" style="max-width:420px;margin:8px auto"></p>${log.length?`<p class="note" style="max-width:440px;margin:8px auto;text-align:left;font:11px/1.5 ui-monospace,monospace">${log.map(esc).join('<br>')}</p>`:''}</div>`;
  const src=live?streamUrl('live',it.id,fmts[Math.min(fi,fmts.length-1)]):streamUrl(it.type,it.id,it.ext);
  if(!S.demo){const ac=new AbortController();fetch(src,{signal:ac.signal}).then(r=>{ac.abort();const e=r.headers.get('x-ember-error');const d=$('#diag');if(d)d.textContent=`Tried: ${fmts.join(', ')}. Proxy says: `+(e||'HTTP '+r.status)+(af.length?` \u00b7 provider formats: ${af.join(', ')}`:'')}).catch(()=>{})}};
 const kill=()=>{hls?.destroy();hls=null;try{mp?.destroy()}catch{}mp=null;v.removeAttribute('src');v.load()};
 const native=v.canPlayType('application/vnd.apple.mpegurl');
 const loadScript=u=>new Promise((ok,no)=>{const sc=document.createElement('script');sc.src=u;sc.onload=ok;sc.onerror=no;document.head.appendChild(sc)});
 // Live: try m3u8 first, then MPEG-TS (mpegts.js transmux where MSE exists); VOD: direct file.
 const af=(LS.get('formats',null)||[]).map(x=>String(x).toLowerCase());const pref=settings().format;
 let fmts=live?(af.length&&!af.includes('m3u8')?['ts','raw']:pref==='ts'?['ts','raw','m3u8']:['m3u8','ts','raw']):[it.ext||'mp4'];let fi=0,triedNative=false;
 v.disableRemotePlayback=true;
 const log=[];let D={},started=false,stT=null;
 const note=m=>{log.push(`${fmts[fi]}: ${m}${D.speed!=null?` \u00b7 ${D.speed.toFixed(0)} KB/s`:''}${D.vc?` \u00b7 video ${D.vc}`:''}${D.ac?` \u00b7 audio ${D.ac}`:''}${D.frames!=null?` \u00b7 ${D.frames} frames`:''}`)};
 const next=m=>{note(m);clearTimeout(stT);fi++;if(fi<fmts.length){pm.innerHTML=spinner;start()}else fail(m)};
 async function start(){kill();const f=fmts[fi];D={};started=false;clearTimeout(stT);
  stT=setTimeout(()=>{if(started)return;if(v.readyState>=2&&v.paused){askTap();return}next('no picture after 12s')},12000);const src=live?streamUrl('live',it.id,f==='ts-na'?'ts':f):streamUrl(it.type,it.id,it.ext);
  if(S.demo&&f!=='m3u8')return fail('Demo stream is HLS only.');
  if(f==='m3u8'){if(window.Hls&&Hls.isSupported()&&!(native&&!triedNative&&/iPhone|iPad/.test(navigator.userAgent))){hls=new Hls(Object.assign({enableWorker:true,startLevel:-1,capLevelToPlayerSize:true,abrEwmaFastLive:2,abrEwmaSlowLive:6,abrBandWidthFactor:.8,abrBandWidthUpFactor:.6,maxBufferLength:live?30:60,maxMaxBufferLength:live?60:120,maxBufferSize:120e6,backBufferLength:live?15:30,maxBufferHole:.5,nudgeMaxRetry:6,manifestLoadingMaxRetry:4,levelLoadingMaxRetry:6,fragLoadingMaxRetry:6,fragLoadingRetryDelay:800,manifestLoadingTimeOut:15000,fragLoadingTimeOut:25000},live?{liveSyncDurationCount:3,liveMaxLatencyDurationCount:8,liveDurationInfinity:true}:{}));hls.loadSource(src);hls.attachMedia(v);
    hls.on(Hls.Events.MANIFEST_PARSED,()=>{if(hls.levels.length>1)hls.nextLevel=Math.min(1,hls.levels.length-1);tryPlay()});let rec=0,net=0;
    hls.on(Hls.Events.FRAG_LOADED,()=>{net=0});
    hls.on(Hls.Events.ERROR,(e,d)=>{if(!d.fatal)return;
     if(d.type===Hls.ErrorTypes.MEDIA_ERROR&&rec<3){rec++;if(rec===2)hls.swapAudioCodec();hls.recoverMediaError();return}
     if(d.type===Hls.ErrorTypes.NETWORK_ERROR&&net<5){const h=hls;const delay=Math.min(8000,1000*2**net++);pm.innerHTML=spinner;setTimeout(()=>{if(hls!==h)return;h.stopLoad();h.startLoad(-1)},delay);return}
     next(d.details||'HLS error')})}
   else if(native){triedNative=true;v.src=src;tryPlay()}else next('HLS not supported')}
  else if(f==='ts'||f==='raw'||f==='ts-na'){const MS=window.ManagedMediaSource||window.MediaSource;if(!MS)return next('MPEG-TS needs Media Source (iOS 17.1 or later)');
   try{if(!window.mpegts)await loadScript('https://cdn.jsdelivr.net/npm/mpegts.js@1.8.2/dist/mpegts.min.js');}catch{return next('Could not load TS player')}
   const fl=mpegts.getFeatureList();if(!fl.mseLivePlayback)return next('MPEG-TS not supported on this device');
   mp=mpegts.createPlayer({type:'mpegts',isLive:true,url:src,hasAudio:f!=='ts-na'},{enableWorker:true,enableStashBuffer:true,stashInitialSize:384*1024,liveBufferLatencyChasing:true,liveBufferLatencyMaxLatency:8,liveBufferLatencyMinRemain:2,lazyLoad:false,autoCleanupSourceBuffer:true});mp.on(mpegts.Events.MEDIA_INFO,mi=>{D.vc=mi.videoCodec;D.ac=mi.audioCodec;if(mi.audioCodec&&!/mp4a|aac/i.test(mi.audioCodec)&&!fmts.includes('ts-na'))fmts.push('ts-na')});mp.on(mpegts.Events.STATISTICS_INFO,st=>{D.speed=st.speed;D.frames=st.decodedFrames});
   mp.attachMediaElement(v);mp.load();tryPlay();let mr=0;mp.on(mpegts.Events.ERROR,(t,d,info)=>{if(t===mpegts.ErrorTypes.NETWORK_ERROR&&mr++<3){setTimeout(()=>{if(mp){try{mp.unload();mp.load();mp.play()}catch{}}},1000*mr);return}next((d||t)+(info&&info.code?' '+info.code:''))})}
  else{v.src=src;tryPlay()}}
 // iOS blocks un-muted autoplay outside a tap: fall back to muted, else show a tap-to-play button.
 function tryPlay(){const p=v.play();if(p&&p.catch)p.catch(e=>{if(e&&e.name==='NotAllowedError'){v.muted=true;v.play().then(showUnmute).catch(askTap)}})}
 function askTap(){pm.innerHTML=`<button class="btn p" style="pointer-events:auto" id="tap">${ic('play')}Tap to play</button>`;$('#tap',el).onclick=e=>{e.stopPropagation();pm.innerHTML=spinner;v.play().catch(()=>{v.muted=true;v.play().then(showUnmute).catch(()=>{})})}}
 function showUnmute(){if(el.querySelector('#um'))return;const b=document.createElement('button');b.id='um';b.className='btn';b.style.cssText='position:absolute;right:16px;top:calc(76px + env(safe-area-inset-top));z-index:6';b.textContent='\ud83d\udd07 Tap for sound';b.onclick=e=>{e.stopPropagation();v.muted=false;b.remove()};el.appendChild(b)}
 v.addEventListener('error',()=>{if(hls||mp)return;const m=v.error?.message||'The stream could not be loaded.';if(native&&fmts[fi]==='m3u8'&&triedNative&&window.Hls&&Hls.isSupported()&&!hls){start();return}next(m)});
 // Stall watchdog: silent recovery with backoff; jump to live edge; reload source (keeping VOD position); then switch format.
 let lastT=-1,stuckFor=0,reloads=0;const wd=setInterval(()=>{if(!document.body.contains(el))return clearInterval(wd);if(!started)return;if(v.paused&&!v.seeking&&v.readyState>0&&!stuckFor)return;
  const t=v.currentTime;if(t!==lastT&&v.readyState>=3){lastT=t;stuckFor=0;reloads=Math.max(0,reloads-0.02);return}
  stuckFor++;if(stuckFor===4){const b=v.buffered;if(b.length){const end=b.end(b.length-1);if(end-t>1){v.currentTime=live?end-2:t+.5;return}}if(live&&hls&&hls.liveSyncPosition){v.currentTime=hls.liveSyncPosition;return}}
  if(stuckFor===8||stuckFor===16){reloads++;if(reloads>3)return next('Stream kept stalling');const pos=live?0:v.currentTime;pm.innerHTML=spinner;
   if(hls){hls.stopLoad();hls.startLoad(live?-1:pos)}else{const st=pos;start();if(!live)v.addEventListener('loadedmetadata',()=>{v.currentTime=st},{once:true})}}
  if(stuckFor>=24){stuckFor=0;next('Stream stalled')}},1000);
 v.addEventListener('stalled',()=>{if(!hls&&!mp&&live)stuckFor=Math.max(stuckFor,4)});
 // Optional stats overlay
 if(settings().stats){const so=document.createElement('div');so.style.cssText='position:absolute;left:12px;top:calc(70px + env(safe-area-inset-top));font:11px/1.5 ui-monospace,monospace;background:rgba(0,0,0,.6);padding:6px 9px;border-radius:8px;z-index:5;pointer-events:none;color:#ffb27a';el.appendChild(so);
  const st=setInterval(()=>{if(!document.body.contains(el))return clearInterval(st);const b=v.buffered;const ahead=b.length?(b.end(b.length-1)-v.currentTime).toFixed(1):'0';let br='',res=v.videoWidth?v.videoWidth+'\u00d7'+v.videoHeight:'';
   if(hls&&hls.levels[hls.currentLevel])br=(hls.levels[hls.currentLevel].bitrate/1e6).toFixed(2)+' Mb/s \u00b7 est '+(hls.bandwidthEstimate/1e6).toFixed(1)+' Mb/s';
   const q=v.getVideoPlaybackQuality?.();so.innerHTML=`${fmts[fi]}${hls?' (hls.js)':mp?' (mpegts.js)':' (native)'}<br>${res} ${br}<br>buffer ${ahead}s \u00b7 dropped ${q?q.droppedVideoFrames:0}<br>recoveries ${Math.round(reloads)}`},1000)}
 start();
 v.addEventListener('playing',()=>{started=true;clearTimeout(stT);pm.innerHTML=''});v.addEventListener('timeupdate',()=>{if(v.currentTime>0&&!started){started=true;clearTimeout(stT);pm.innerHTML=''}});v.addEventListener('waiting',()=>pm.innerHTML=spinner);
 const k=it.type+':'+it.id;const w=watch().find(x=>x.k===k);if(w&&!live)v.addEventListener('loadedmetadata',()=>{if(w.pos<v.duration*.95)v.currentTime=w.pos},{once:true});
 const fmt=s=>!isFinite(s)?'0:00':(s>=3600?Math.floor(s/3600)+':':'')+String(Math.floor(s/60)%60).padStart(s>=3600?2:1,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');
 let last=0;v.addEventListener('timeupdate',()=>{if(live)return;el.querySelector('#cur').textContent=fmt(v.currentTime);el.querySelector('#dur').textContent=fmt(v.duration);if(!el._drag)el.querySelector('#sk').value=v.currentTime/v.duration*1000||0;
  if(Date.now()-last>5000&&v.duration>60){last=Date.now();let l=watch().filter(x=>x.k!==k);l.unshift({k,pos:v.currentTime,dur:v.duration,title:it.title,sub:it.sub,img:it.img,play:Object.assign({},it,{list:undefined})});LS.set(pk('watch'),l.slice(0,40))}});
 v.addEventListener('ended',()=>{if(it.queue&&settings().autoNext){const i=it.queue.indexOf(it.id);const nx=it.queue[i+1];const c=S.epsCache?.[it.series];if(nx&&c){for(const s in c.eps){const e=c.eps[s].find(x=>x.id==nx);if(e)return play(Object.assign({},it,{id:e.id,ext:e.container_extension,sub:`S${s} E${e.episode_num} \u00b7 ${e.title}`,img:e.info?.movie_image||c.bg}))}}}});
 const pp=el.querySelector('#pp');v.addEventListener('play',()=>pp.innerHTML=ic('pause'));v.addEventListener('pause',()=>pp.innerHTML=ic('play'));pp.onclick=()=>v.paused?v.play():v.pause();
 if(!live){const sk=el.querySelector('#sk');sk.oninput=()=>{el._drag=1;el.querySelector('#cur').textContent=fmt(sk.value/1000*v.duration)};sk.onchange=()=>{v.currentTime=sk.value/1000*v.duration;el._drag=0};el.querySelector('#rw').onclick=()=>v.currentTime-=10;el.querySelector('#fw').onclick=()=>v.currentTime+=30}
 else{api('get_short_epg',{stream_id:it.id,limit:1}).then(d=>{const n=(d.epg_listings||[])[0];if(n)el.querySelector('#pnow').textContent=`${b64(n.title)} \u00b7 ${ts(n.start_timestamp)}\u2013${ts(n.stop_timestamp)}`}).catch(()=>{})}
 const sheet=(items,onpick)=>{el.querySelector('.sheet')?.remove();const s=document.createElement('div');s.className='sheet';s.innerHTML=items.length?items.map((x,i)=>`<button class="${x.on?'on':''}" data-i="${i}">${esc(x.l)}</button>`).join(''):'<button>None available</button>';s.onclick=e=>{const b=e.target.closest('[data-i]');if(b)onpick(+b.dataset.i);s.remove()};ui.appendChild(s)};
 el.querySelector('#au').onclick=e=>{e.stopPropagation();if(hls)sheet(hls.audioTracks.map((t,i)=>({l:t.name||t.lang||'Track '+(i+1),on:i===hls.audioTrack})),i=>hls.audioTrack=i);else{const a=v.audioTracks;sheet(a?[...a].map((t,i)=>({l:t.label||t.language||'Track '+(i+1),on:t.enabled})):[],i=>[...a].forEach((t,j)=>t.enabled=i===j))}};
 el.querySelector('#sb').onclick=e=>{e.stopPropagation();const t=[...v.textTracks];sheet([{l:'Off',on:t.every(x=>x.mode!=='showing')},...t.map(x=>({l:x.label||x.language||'Subtitle',on:x.mode==='showing'}))],i=>t.forEach((x,j)=>x.mode=j===i-1?'showing':'disabled'))};
 const cl=el.querySelector('#cl');if(cl)cl.onclick=e=>{e.stopPropagation();sheet(it.list.slice(0,300).map(c=>({l:(c.num?c.num+'  ':'')+c.name,on:c.stream_id==it.id})),i=>playLive(it.list[i],it.list))};
 el.querySelector('#px').onclick=closePlayer;
 el.querySelector('#fs').onclick=()=>{if(v.webkitEnterFullscreen)v.webkitEnterFullscreen();else (el.requestFullscreen||el.webkitRequestFullscreen).call(el)};
 const pip=el.querySelector('#pip');if(pip)pip.onclick=()=>{if(v.webkitSetPresentationMode)v.webkitSetPresentationMode(v.webkitPresentationMode==='picture-in-picture'?'inline':'picture-in-picture');else v.requestPictureInPicture?.()};
 let hide;const poke=()=>{ui.classList.remove('hide');clearTimeout(hide);hide=setTimeout(()=>{if(!v.paused&&!ui.querySelector('.sheet'))ui.classList.add('hide')},3500)};el.addEventListener('pointermove',poke);el.addEventListener('click',e=>{if(e.target===ui||e.target===v){if(ui.classList.contains('hide'))poke();else ui.classList.add('hide')}else poke()});poke();
 P={el,v,kill:()=>{clearTimeout(stT);kill()}};history.pushState({player:1},'',location.href)}
function closePlayer(){if(!P)return;P.kill?.();P.v.pause();P.v.removeAttribute('src');P.v.load();P.el.remove();P=null;if(S.route==='home'||S.route==='detail')route()}
window.addEventListener('popstate',()=>{if(P)closePlayer()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePlayer()});

/* ---------- boot ---------- */
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js');
setInterval(()=>document.querySelectorAll('.clk').forEach(c=>c.textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})),20000);
if(S.creds&&!S.demo&&LS.get('formats',null)===null)api('',{},S.creds).then(j=>LS.set('formats',(j.user_info||{}).allowed_output_formats||[])).catch(()=>{});
route();
