/* known: parenting — "Make a book together"
   Each page is a little scene: place crayon pictures, drag them around, make them bigger or smaller,
   draw freehand, and write the words underneath.
   Page data: {items:[{a:sticker key,x,y (0–1 of the page),s:size,r:rotation°}], strokes:[{c:color,w:width,e:eraser,p:[x,y,x,y…]}], text}
   Older stories saved as {art,text} still open: the picture becomes one sticker. */

const BK_COLORS=['#3a322b','#c98c6e','#8fa58b','#8aa3b8','#d6b05a','#c48c8c','#8f7d9e','#a46a4f'];
const BK_SIZES=[['S',.012],['M',.022],['L',.04]];
const BK_ASPECT=.8;   // page height = 80% of width
let bkCanvasCtx=null, bkStroke=null, bkDrag=null;

function normPage(p){
  p=p||{};
  if(!p.items) p.items=p.art?[{a:p.art,x:.5,y:.5,s:1.4,r:0}]:[];
  p.strokes=p.strokes||[]; p.text=p.text||''; delete p.art; return p;
}
const stickerKeys=()=>Object.keys(STICKERS).filter(k=>state.settings.faith||k!=='cross');

/* ---------- starting a book ---------- */
function startStory(i){
  if(!state.kids.length) return toast('Add a child in Settings first');
  if(i===undefined) return pickKid('Who are you making a book with?','startStory');
  story={i,title:'',pages:[normPage({items:[{a:'house',x:.5,y:.55,s:1.3,r:0}]})],at:0,mode:'move',sel:null,color:BK_COLORS[0],size:1};
  drawStory();
}

/* ---------- the editor ---------- */
function drawStory(){
  const k=kid(story.i), pg=story.pages[story.at];
  openS(`<div class="pbadge">A book with ${esc(k.name)}</div>
    <input class="stitle" placeholder="Book title" value="${esc(story.title)}" oninput="story.title=this.value">
    <div class="seg bkmode"><button class="${story.mode==='move'?'on':''}" onclick="bkMode('move')">Pictures</button><button class="${story.mode==='draw'?'on':''}" onclick="bkMode('draw')">Draw</button></div>
    <div class="bk-page ${story.mode==='draw'?'drawing':''}" id="bkPage" style="border-color:${k.color}">
      <canvas id="bkCanvas"></canvas><div class="bk-items" id="bkItems"></div>
      <div class="pnum">Page ${story.at+1} of ${story.pages.length}</div>
    </div>
    <div id="bkTools"></div>
    <textarea class="stext bk-text" placeholder="Write this page together…" oninput="story.pages[story.at].text=this.value">${esc(pg.text)}</textarea>
    <div class="snav">
      <button class="btn light" ${story.at===0?'disabled':''} onclick="bkGo(-1)">‹ Back</button>
      ${story.at<story.pages.length-1?`<button class="btn light" onclick="bkGo(1)">Next ›</button>`:`<button class="btn light" onclick="bkAddPage()">+ Page</button>`}
    </div>
    ${story.pages.length>1?`<button class="ob-skip" style="display:block;margin:10px auto 0" onclick="bkDelPage()">Remove this page</button>`:''}
    <button class="btn full" style="margin-top:10px" onclick="saveStory()">Save to ${esc(k.name)}'s memories</button>`);
  requestAnimationFrame(bkSetup);
}
function bkSetup(){
  const page=document.getElementById('bkPage'); if(!page) return;
  const cv=document.getElementById('bkCanvas'), dpr=window.devicePixelRatio||1, W=page.clientWidth, H=page.clientHeight;
  cv.width=W*dpr; cv.height=H*dpr; bkCanvasCtx=cv.getContext('2d'); bkCanvasCtx.scale(dpr,dpr);
  paintStrokes(bkCanvasCtx,story.pages[story.at].strokes,W,H);
  bkItemsRender(); bkToolsRender();
  cv.onpointerdown=bkPenDown; cv.onpointermove=bkPenMove; cv.onpointerup=cv.onpointercancel=bkPenUp;
  page.onpointerdown=e=>{ if(story.mode==='move'&&(e.target===page||e.target.id==='bkItems'||e.target===cv)){story.sel=null;bkItemsRender();bkToolsRender();} };
}
function bkMode(m){story.mode=m;story.sel=null;
  document.querySelectorAll('.bkmode button').forEach((b,n)=>b.classList.toggle('on',(n===0)===(m==='move')));
  document.getElementById('bkPage').classList.toggle('drawing',m==='draw'); bkItemsRender(); bkToolsRender();}
function bkGo(d){story.at+=d;story.sel=null;drawStory();}
function bkAddPage(){story.pages.push(normPage({}));story.at=story.pages.length-1;story.sel=null;drawStory();}
function bkDelPage(){ if(!confirm('Remove this page?')) return; story.pages.splice(story.at,1); story.at=Math.max(0,story.at-1); story.sel=null; drawStory(); }

/* ---------- pictures (stickers) ---------- */
function itemHTML(it,n,interactive){
  return `<div class="bk-item ${interactive&&story.sel===n?'sel':''}" data-n="${n}" style="left:${it.x*100}%;top:${it.y*100}%;width:${it.s*24}%;transform:translate(-50%,-50%) rotate(${it.r||0}deg)">${(STICKERS[it.a]||STICKERS.heart).svg(FULL)}</div>`;
}
function bkItemsRender(){
  const box=document.getElementById('bkItems'); if(!box) return;
  const items=story.pages[story.at].items;
  box.innerHTML=items.map((it,n)=>itemHTML(it,n,true)).join('');
  box.querySelectorAll('.bk-item').forEach(el=>el.onpointerdown=bkItemDown);
}
function bkItemDown(e){
  if(story.mode!=='move') return;
  e.preventDefault(); e.stopPropagation();
  const n=+e.currentTarget.dataset.n, page=document.getElementById('bkPage').getBoundingClientRect(), it=story.pages[story.at].items[n];
  if(story.sel!==n){story.sel=n; document.querySelectorAll('.bk-item').forEach(x=>x.classList.toggle('sel',+x.dataset.n===n)); bkToolsRender();}
  bkDrag={n,el:e.currentTarget,page,dx:(e.clientX-page.left)/page.width-it.x,dy:(e.clientY-page.top)/page.height-it.y};
  e.currentTarget.setPointerCapture(e.pointerId);
  e.currentTarget.onpointermove=bkItemMove; e.currentTarget.onpointerup=e.currentTarget.onpointercancel=()=>{bkDrag=null;};
}
function bkItemMove(e){
  if(!bkDrag) return; const {page,el,n,dx,dy}=bkDrag, it=story.pages[story.at].items[n];
  it.x=Math.min(1,Math.max(0,(e.clientX-page.left)/page.width-dx)); it.y=Math.min(1,Math.max(0,(e.clientY-page.top)/page.height-dy));
  el.style.left=it.x*100+'%'; el.style.top=it.y*100+'%';
}
function bkAddSticker(a){
  const items=story.pages[story.at].items, n=items.length;
  const spots=[[.25,.3],[.75,.3],[.25,.72],[.75,.72],[.5,.5],[.5,.25],[.5,.75],[.15,.5],[.85,.5]], [x,y]=spots[n%spots.length];
  items.push({a,x,y,s:1,r:0}); story.sel=items.length-1;
  if(story.mode!=='move') return bkMode('move');
  bkItemsRender(); bkToolsRender();
}
function bkSel(fn){
  const items=story.pages[story.at].items, it=items[story.sel]; if(!it) return;
  if(fn==='big') it.s=Math.min(3,+(it.s+.2).toFixed(2));
  if(fn==='small') it.s=Math.max(.4,+(it.s-.2).toFixed(2));
  if(fn==='turn') it.r=((it.r||0)+15)%360;
  if(fn==='front'){items.push(items.splice(story.sel,1)[0]); story.sel=items.length-1;}
  if(fn==='del'){items.splice(story.sel,1); story.sel=null;}
  bkItemsRender(); bkToolsRender();
}

/* ---------- freehand drawing ---------- */
function paintStrokes(ctx,strokes,W,H){
  ctx.clearRect(0,0,W,H);
  strokes.forEach(s=>paintStroke(ctx,s,W,H,0));
}
function paintStroke(ctx,s,W,H,from){
  const p=s.p; if(p.length<2) return;
  ctx.save(); ctx.globalCompositeOperation=s.e?'destination-out':'source-over';
  ctx.strokeStyle=s.c; ctx.fillStyle=s.c; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=s.w*W; ctx.globalAlpha=s.e?1:.9;
  if(p.length===2){ctx.beginPath();ctx.arc(p[0]*W,p[1]*H,s.w*W/2,0,Math.PI*2);ctx.fill();ctx.restore();return;}
  ctx.beginPath(); const st=Math.max(0,from-2); ctx.moveTo(p[st]*W,p[st+1]*H);
  for(let n=st+2;n<p.length;n+=2) ctx.lineTo(p[n]*W,p[n+1]*H);
  ctx.stroke(); ctx.restore();
}
function bkPenDown(e){
  if(story.mode!=='draw') return; e.preventDefault();
  const r=e.currentTarget.getBoundingClientRect(), x=+((e.clientX-r.left)/r.width).toFixed(3), y=+((e.clientY-r.top)/r.height).toFixed(3);
  const eraser=story.color==='erase';
  bkStroke={c:eraser?'#000':story.color,w:BK_SIZES[story.size][1]*(eraser?2:1),e:eraser?1:0,p:[x,y]};
  story.pages[story.at].strokes.push(bkStroke);
  e.currentTarget.setPointerCapture(e.pointerId);
  paintStroke(bkCanvasCtx,bkStroke,r.width,r.height,0);
}
function bkPenMove(e){
  if(!bkStroke) return;
  const r=e.currentTarget.getBoundingClientRect(), x=+((e.clientX-r.left)/r.width).toFixed(3), y=+((e.clientY-r.top)/r.height).toFixed(3), p=bkStroke.p;
  if(Math.hypot(x-p[p.length-2],y-p[p.length-1])<.004) return;
  p.push(x,y);
  if(p.length===4){ // redraw the first dot as a line
    paintStrokes(bkCanvasCtx,story.pages[story.at].strokes,r.width,r.height); return; }
  paintStroke(bkCanvasCtx,{...bkStroke,p:p.slice(-4)},r.width,r.height,0);
}
function bkPenUp(){bkStroke=null; bkToolsRender();}
function bkUndo(){const s=story.pages[story.at].strokes; s.pop(); bkRepaint(); bkToolsRender();}
function bkClear(){ if(!story.pages[story.at].strokes.length) return; if(!confirm('Erase all the drawing on this page? Pictures stay.')) return; story.pages[story.at].strokes=[]; bkRepaint(); bkToolsRender(); }
function bkRepaint(){const page=document.getElementById('bkPage'); paintStrokes(bkCanvasCtx,story.pages[story.at].strokes,page.clientWidth,page.clientHeight);}
function bkPen(c){story.color=c;bkToolsRender();}
function bkSize(n){story.size=n;bkToolsRender();}

/* ---------- toolbars ---------- */
function bkToolsRender(){
  const t=document.getElementById('bkTools'); if(!t) return;
  if(story.mode==='move'){
    const has=story.sel!==null&&story.pages[story.at].items[story.sel];
    t.innerHTML=`<div class="bk-selbar ${has?'':'off'}">
        <button onclick="bkSel('small')" aria-label="Smaller">−</button><button onclick="bkSel('big')" aria-label="Bigger">+</button>
        <button onclick="bkSel('turn')">Turn</button><button onclick="bkSel('front')">Front</button><button onclick="bkSel('del')" class="del">Remove</button></div>
      <div class="small" style="margin:8px 2px 6px">${has?'Drag the picture to move it.':'Tap a picture to add it to the page. Tap one on the page to move or resize it.'}</div>
      <div class="artstrip">${stickerKeys().map(key=>`<button class="artopt" onclick="bkAddSticker('${key}')">${STICKERS[key].svg(FULL)}${STICKERS[key].name}</button>`).join('')}</div>`;
  } else {
    const s=story.pages[story.at].strokes;
    t.innerHTML=`<div class="bk-pens">${BK_COLORS.map(c=>`<button class="swatch ${story.color===c?'on':''}" style="background:${c}" aria-label="Crayon color" onclick="bkPen('${c}')"></button>`).join('')}
        <button class="swatch eraser ${story.color==='erase'?'on':''}" aria-label="Eraser" onclick="bkPen('erase')">⌫</button></div>
      <div class="bk-drawbar">
        <div class="bk-sizes">${BK_SIZES.map(([l],n)=>`<button class="${story.size===n?'on':''}" onclick="bkSize(${n})">${l}</button>`).join('')}</div>
        <button ${s.length?'':'disabled'} onclick="bkUndo()">Undo</button><button ${s.length?'':'disabled'} onclick="bkClear()">Clear</button>
      </div>
      <div class="small" style="margin:6px 2px 0">Draw right on the page with a finger. Pictures stay on top of the drawing.</div>`;
  }
}

/* ---------- saving + reading ---------- */
function saveStory(){
  const k=kid(story.i), pages=story.pages.filter(p=>p.items.length||p.strokes.length||p.text.trim());
  if(!pages.length) return toast('Add a picture, a drawing or some words first');
  state.kids[story.i].stories.unshift({title:story.title.trim()||`A book with ${k.name}`,pages,date:iso(today())});
  save(); closeS(); render(); toast(`Book saved to ${k.name}'s memories`);
}
function readStory(i,n,pg=0){
  const s=state.kids[i].stories[n], p=normPage(s.pages[pg]), k=kid(i);
  openS(`<div class="pbadge">${esc(s.title)}</div>
    <div class="bk-page read" id="rdPage" style="border-color:${k.color}"><canvas id="rdCanvas"></canvas><div class="bk-items">${p.items.map((it,m)=>itemHTML(it,m,false)).join('')}</div>
      <div class="pnum">${pg+1} / ${s.pages.length}</div></div>
    ${p.text?`<p class="bk-read-text">${esc(p.text)}</p>`:''}
    <div class="snav"><button class="btn light" ${pg===0?'disabled':''} onclick="readStory(${i},${n},${pg-1})">‹</button>
    ${pg<s.pages.length-1?`<button class="btn light" onclick="readStory(${i},${n},${pg+1})">›</button>`:`<button class="btn light" onclick="closeS()">The end</button>`}</div>
    <button class="ob-skip" style="display:block;margin:12px auto 0" onclick="delStory(${i},${n})">Delete this book</button>`);
  requestAnimationFrame(()=>{const page=document.getElementById('rdPage'),cv=document.getElementById('rdCanvas'); if(!page) return;
    const dpr=window.devicePixelRatio||1,W=page.clientWidth,H=page.clientHeight; cv.width=W*dpr; cv.height=H*dpr;
    const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr); paintStrokes(ctx,p.strokes,W,H);});
}
function delStory(i,n){ if(!confirm('Delete this book? This can’t be undone.')) return; state.kids[i].stories.splice(n,1); save(); closeS(); render(); toast('Book deleted'); }

/* =========================== read-together books (Library > Books) =========================== */
function openReadBook(n,pg=0){
  const b=KP_BOOKS[n];
  if(pg>=b.pages.length){ // last page: talk about it
    openS(`<div class="pbadge">${esc(b.t)}</div><h2>Talk about it</h2>
      <div class="btns" style="margin:12px 0">${b.q.map(q=>`<div class="why" style="margin:0"><b>ASK</b>${esc(q)}</div>`).join('')}</div>
      <div class="snav"><button class="btn light" onclick="openReadBook(${n},${b.pages.length-1})">‹ Back</button><button class="btn light" onclick="openReadBook(${n},0)">Read again</button></div>
      <button class="btn full" style="margin-top:10px" onclick="closeS()">The end</button>`); return;
  }
  const p=b.pages[pg];
  openS(`<div class="pbadge">${esc(b.t)}</div>
    <div class="bk-page read"><div class="bk-items">${p.items.map((it,m)=>itemHTML(it,m,false)).join('')}</div><div class="pnum">${pg+1} / ${b.pages.length}</div></div>
    <p class="bk-read-text">${esc(p.text)}</p>
    <div class="snav"><button class="btn light" ${pg===0?'disabled':''} onclick="openReadBook(${n},${pg-1})">‹</button>
      <button class="btn light" onclick="openReadBook(${n},${pg+1})">${pg<b.pages.length-1?'›':'Talk about it ›'}</button></div>`);
}

/* =========================== letters to them at 18 =========================== */
function writeLetter(i,edit){
  const k=kid(i), raw=state.kids[i], yr=k.years, existing=(raw.letters||[]).find(l=>l.age===yr);
  openS(`<div class="pbadge">A letter for ${esc(k.name)} at 18</div>
    <h2>${existing?'This year’s letter':'Write this year’s letter'}</h2>
    <div class="small" style="margin:4px 0 12px">Once a year, write to the grown-up ${esc(k.name)} will be. Who they are right now, what you love, what you’re praying for. It goes into The Book of ${esc(k.name)}.</div>
    <textarea id="letterBox" class="ans" style="min-height:220px" placeholder="Dear ${esc(k.name)}, this year you…">${existing?esc(existing.text):''}</textarea>
    <button class="btn full" style="margin-top:10px" onclick="saveLetter(${i})">Save letter</button>`);
}
function saveLetter(i){
  const t=letterBox.value.trim(); if(!t) return toast('Write a few words first');
  const k=kid(i), raw=state.kids[i]; raw.letters=raw.letters||[];
  const ex=raw.letters.find(l=>l.age===k.years);
  if(ex){ex.text=t;ex.date=iso(today());} else raw.letters.push({age:k.years,date:iso(today()),text:t});
  raw.letters.sort((a,b)=>a.age-b.age); save(); closeS(); render(); toast(`Letter saved for ${k.name}`);
}

/* =========================== The Book of [Name] =========================== */
function bookOfHTML(i){
  const k=kid(i), raw=state.kids[i], b=k.b;
  const ageAt=d=>{const x=parse(d); let m=(x.getFullYear()-b.getFullYear())*12+(x.getMonth()-b.getMonth()); if(x.getDate()<b.getDate()) m--; return Math.max(0,Math.floor(m/12));};
  const years={};
  (raw.memories||[]).forEach(m=>{const a=ageAt(m.date);(years[a]=years[a]||{a:[],s:[]}).a.push(m);});
  (raw.stories||[]).forEach(s=>{const a=ageAt(s.date);(years[a]=years[a]||{a:[],s:[]}).s.push(s);});
  const ages=Object.keys(years).map(Number).sort((x,y)=>x-y), letters=raw.letters||[];
  const daysConnected=Object.keys(raw.log||{}).length, weeks=Object.keys(raw.wlog||{}).length;
  return `<div class="pb-cover" style="border-color:${k.color}"><div class="pbadge">known: parenting</div><h2 style="font-size:30px">The Book of ${esc(k.name)}</h2>
      <div class="small">Born ${b.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}</div>
      <div class="stats"><div class="stat"><b style="color:${k.color}">${daysConnected+weeks}</b><span>${weeks?'days & weeks':'days'} connected</span></div><div class="stat"><b style="color:${k.color}">${raw.best||0}</b><span>longest streak</span></div>
      <div class="stat"><b style="color:${k.color}">${(raw.memories||[]).length}</b><span>answers saved</span></div><div class="stat"><b style="color:${k.color}">${(raw.stories||[]).length}</b><span>books made together</span></div></div></div>
    ${letters.length?`<div class="mhead">Letters to ${esc(k.name)} at 18</div>`+letters.map(l=>`<div class="mem"><i>Written when you were ${l.age}</i><p class="pb-letter">${esc(l.text).replace(/\n/g,'<br>')}</p></div>`).join(''):''}
    ${ages.length?ages.map(a=>`<div class="mhead">At ${a===0?'under 1':a}</div>
      ${years[a].a.map(m=>`<div class="mem"><i>${esc(m.q)}</i><p>“${esc(m.a)}”</p><span>${parse(m.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</span></div>`).join('')}
      ${years[a].s.map(s=>`<div class="mem"><i>A book you made together</i><p style="font-family:Fraunces,serif">${esc(s.title)}</p><span>${s.pages.length} pages</span></div>`).join('')}`).join('')
      :`<div class="small" style="margin:14px 0">Nothing saved yet. Draw a question on ${esc(k.name)}'s page and save the answer, make a book together, or write this year's letter.</div>`}`;
}
function openBookOf(i){
  const k=kid(i), hasLetter=(state.kids[i].letters||[]).some(l=>l.age===k.years);
  openS(bookOfHTML(i)+`<div class="btns" style="margin-top:14px">
    <button class="btn full light" onclick="writeLetter(${i})">${hasLetter?'Edit this year’s letter':'Write this year’s letter'}</button>
    <button class="btn full" onclick="printBookOf(${i})">Print or save as PDF</button>
    <button class="btn full light" onclick="closeS()">Close</button></div>`);
}
function printBookOf(i){printArea.innerHTML=bookOfHTML(i);window.print();}
