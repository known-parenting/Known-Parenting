/* known: parenting — pass-and-play games for two on one phone.
   You play against your kid. When your kid wins, it counts toward their "games won". */

const GAME_START={ttt:'openTTT',hangman:'playHangman',dots:'playDots',c4:'playC4',memory:'playMemory'};
const meColor=k=>k.color==='#c98c6e'?'#33402f':'#c98c6e';      // your color: clay, unless the kid is clay
function kidWon(i){state.kids[i].gamesWon=(state.kids[i].gamesWon||0)+1;save();}
function needKid(){ if(!state.kids.length){toast('Add a child in Settings first');return true;} return false; }
const gArea=()=>document.getElementById('gArea');

/* =========================== Hangman (a flower loses a petal on each miss) =========================== */
const HM_WORDS=['CAT','DOG','SUN','BOAT','FISH','CAKE','BIRD','STAR','MOON','TREE','FROG','DUCK','BEAR','HAT','BUS','PIG','COW','BALL',
  'APPLE','HOUSE','TRAIN','HORSE','CLOUD','PIZZA','TIGER','PUPPY','OCEAN','TRUCK','SNAKE','BREAD','GRAPE','LEMON','ROBOT','CANDY',
  'ROCKET','BANANA','GARDEN','TURTLE','CASTLE','MONKEY','BUBBLE','CANDLE','COOKIE','DRAGON','PENCIL','RABBIT','TURKEY','ZIPPER',
  'RAINBOW','PANCAKE','BICYCLE','PENGUIN','BLANKET','PICNIC','DINOSAUR','BUTTERFLY','ELEPHANT','SANDWICH','TRAMPOLINE'];
const HM_MAX=6;
let hm=null;
function playHangman(i){
  if(needKid()) return;
  if(i===undefined) return pickKid("Who's playing with you?",'playHangman');
  const k=kid(i);
  openS(`<h2>Hangman</h2><div class="small" style="margin-bottom:14px">Guess the word one letter at a time, before the flower loses all its petals.</div>
    <div class="label" style="margin-top:0">Who's guessing?</div>
    <div class="btns">
      <button class="btn full" style="background:${k.color}" onclick="hmSetup(${i},'kid')">${esc(k.name)} guesses</button>
      <button class="btn full light" onclick="hmSetup(${i},'me')">I guess, ${esc(k.name)} picks the word</button>
    </div>`);
}
function hmSetup(i,guesser){
  const k=kid(i), picker=guesser==='kid'?'You':esc(k.name);
  openS(`<h2>Pick a secret word</h2><div class="small" style="margin-bottom:14px">${picker} pick${guesser==='kid'?'':'s'} the word. ${guesser==='kid'?esc(k.name):'You'} look${guesser==='kid'?'s':''} away!</div>
    <div class="field"><input id="hmWord" type="password" autocomplete="off" autocapitalize="characters" placeholder="Type a word (letters only)" maxlength="14"></div>
    <div class="btns">
      <button class="btn full" onclick="hmStart(${i},'${guesser}',hmWord.value)">Start</button>
      <button class="btn full light" onclick="hmStart(${i},'${guesser}','')">Pick a word for us</button>
    </div>`);
  setTimeout(()=>{const el=document.getElementById('hmWord'); if(el) el.focus();},60);
}
function hmStart(i,guesser,word){
  word=(word||'').toUpperCase().replace(/[^A-Z]/g,'');
  if(!word){ const k=kid(i), pool=HM_WORDS.filter(w=>k.years<7?w.length<=5:k.years<10?w.length<=7:true); word=pool[Math.floor(Math.random()*pool.length)]; }
  if(word.length<2) return toast('Use a word with at least 2 letters');
  hm={i,guesser,word,guessed:[],misses:0,over:false};
  openS(`<h2>Hangman</h2><div id="gArea"></div>`); hmRender();
}
function hmFlower(petalsLeft,color){
  const petals=[[50,24],[70,34],[72,56],[50,66],[28,56],[30,34]];
  return `<svg viewBox="0 0 100 130" style="width:110px;height:140px" filter="url(#crayon)" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
    <path d="M50 70 C 50 90, 52 106, 50 124" stroke="#8fa58b"/><path d="M50 104 C 38 94, 28 96, 22 102 C 32 108, 42 108, 50 104Z" stroke="#8fa58b"/>
    ${petals.slice(0,petalsLeft).map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="11" ry="9" stroke="${color}"/>`).join('')}
    <circle cx="50" cy="45" r="9" stroke="#e2bc5e"/></svg>`;
}
function hmRender(){
  const k=kid(hm.i), won=[...new Set(hm.word)].every(c=>hm.guessed.includes(c)), lost=hm.misses>=HM_MAX;
  const who=hm.guesser==='kid'?k.name:'You';
  let msg=`${who} ${hm.guesser==='kid'?'is':'are'} guessing · ${HM_MAX-hm.misses} petal${HM_MAX-hm.misses===1?'':'s'} left`;
  if(won||lost){
    if(!hm.over){ hm.over=true; if((hm.guesser==='kid'&&won)||(hm.guesser==='me'&&lost)) kidWon(hm.i); }
    msg=won?(hm.guesser==='kid'?`${k.name} got it! 🎉`:'You got it!'):`The word was ${hm.word}.${hm.guesser==='me'?` ${k.name} wins! 🎉`:' Try another?'}`;
  }
  gArea().innerHTML=`<div style="display:flex;justify-content:center">${hmFlower(HM_MAX-hm.misses,k.color)}</div>
    <div class="hm-word">${[...hm.word].map(c=>`<span>${hm.guessed.includes(c)||lost?c:''}</span>`).join('')}</div>
    <div class="turn" style="margin:8px 0 12px">${msg}</div>
    <div class="hm-keys">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c=>{const used=hm.guessed.includes(c), hit=used&&hm.word.includes(c);
      return `<button ${used||hm.over?'disabled':''} class="${used?(hit?'hit':'miss'):''}" style="${hit?`background:${k.color};color:#fff`:''}" onclick="hmGuess('${c}')">${c}</button>`;}).join('')}</div>
    <div class="btns" style="margin-top:14px">${hm.over?`<button class="btn full light" onclick="playHangman(${hm.i})">Play again</button>`:''}<button class="btn full" onclick="closeS()">Done</button></div>`;
}
function hmGuess(c){ if(hm.over||hm.guessed.includes(c)) return; hm.guessed.push(c); if(!hm.word.includes(c)) hm.misses++; hmRender(); }

/* =========================== Dots and boxes =========================== */
let db=null;
function playDots(i){
  if(needKid()) return;
  if(i===undefined) return pickKid("Who's playing with you?",'playDots');
  const k=kid(i);
  openS(`<h2>Dots and boxes</h2><div class="small" style="margin-bottom:14px">Take turns drawing one line. Close a box and it's yours, and you go again.</div>
    <div class="btns">
      <button class="btn full" style="background:${k.color}" onclick="dbStart(${i},3)">Small board (3×3)</button>
      <button class="btn full light" onclick="dbStart(${i},4)">Big board (4×4)</button>
    </div>`);
}
function dbStart(i,n){
  db={i,n,h:Array.from({length:n+1},()=>Array(n).fill(0)),v:Array.from({length:n},()=>Array(n+1).fill(0)),
      box:Array.from({length:n},()=>Array(n).fill(0)),turn:'kid',score:{me:0,kid:0},over:false};
  openS(`<h2>Dots and boxes</h2><div id="gArea"></div>`); dbRender();
}
function dbRender(){
  const k=kid(db.i), n=db.n, pad=10, cell=(100-2*pad)/n, P=x=>pad+x*cell, me=meColor(k);
  const col=t=>t==='kid'?k.color:me;
  let svg='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++) if(db.box[r][c]) svg+=`<rect x="${P(c)+1.5}" y="${P(r)+1.5}" width="${cell-3}" height="${cell-3}" rx="3" fill="${col(db.box[r][c])}" opacity=".35"/><text x="${P(c)+cell/2}" y="${P(r)+cell/2+3}" text-anchor="middle" font-size="${cell*.32}" font-family="Fraunces,serif" fill="${col(db.box[r][c])}">${db.box[r][c]==='kid'?esc(k.name[0]):'Me'}</text>`;
  for(let r=0;r<=n;r++)for(let c=0;c<n;c++){const o=db.h[r][c];
    svg+=`<line x1="${P(c)}" y1="${P(r)}" x2="${P(c+1)}" y2="${P(r)}" stroke="${o?col(o):'#ebe2d4'}" stroke-width="${o?2.4:1.2}" stroke-linecap="round" ${o?'':'stroke-dasharray="1.5 2.5"'}/>`;
    if(!o&&!db.over) svg+=`<line class="tap" x1="${P(c)}" y1="${P(r)}" x2="${P(c+1)}" y2="${P(r)}" onclick="dbMove('h',${r},${c})"/>`;}
  for(let r=0;r<n;r++)for(let c=0;c<=n;c++){const o=db.v[r][c];
    svg+=`<line x1="${P(c)}" y1="${P(r)}" x2="${P(c)}" y2="${P(r+1)}" stroke="${o?col(o):'#ebe2d4'}" stroke-width="${o?2.4:1.2}" stroke-linecap="round" ${o?'':'stroke-dasharray="1.5 2.5"'}/>`;
    if(!o&&!db.over) svg+=`<line class="tap" x1="${P(c)}" y1="${P(r)}" x2="${P(c)}" y2="${P(r+1)}" onclick="dbMove('v',${r},${c})"/>`;}
  for(let r=0;r<=n;r++)for(let c=0;c<=n;c++) svg+=`<circle cx="${P(c)}" cy="${P(r)}" r="1.8" fill="#3a322b"/>`;
  let msg=db.turn==='kid'?`${k.name}'s turn`:'Your turn';
  if(db.over){const {me:a,kid:b}=db.score; msg=b>a?`${k.name} wins! 🎉`:a>b?'You win! Rematch?':"It's a tie!";}
  gArea().innerHTML=`<div class="scores"><span style="color:${k.color}">${esc(k.name)} ${db.score.kid}</span><span style="color:${me}">You ${db.score.me}</span></div>
    <svg class="dbboard" viewBox="0 0 100 100">${svg}</svg>
    <div class="turn" style="margin:6px 0 4px;color:${db.over?'var(--muted)':col(db.turn)};font-weight:600">${msg}</div>
    <div class="btns" style="margin-top:12px">${db.over?`<button class="btn full light" onclick="dbStart(${db.i},${db.n})">Play again</button>`:''}<button class="btn full" onclick="closeS()">Done</button></div>`;
}
function dbMove(t,r,c){
  if(db.over) return; const n=db.n; (t==='h'?db.h:db.v)[r][c]=db.turn;
  const done=(R,C)=>R>=0&&C>=0&&R<n&&C<n&&!db.box[R][C]&&db.h[R][C]&&db.h[R+1][C]&&db.v[R][C]&&db.v[R][C+1];
  const cand=t==='h'?[[r-1,c],[r,c]]:[[r,c-1],[r,c]]; let got=0;
  cand.forEach(([R,C])=>{ if(done(R,C)){db.box[R][C]=db.turn;db.score[db.turn]++;got++;} });
  if(!got) db.turn=db.turn==='kid'?'me':'kid';
  if(db.score.me+db.score.kid===n*n){db.over=true; if(db.score.kid>db.score.me) kidWon(db.i);}
  dbRender();
}

/* =========================== Connect four =========================== */
let c4=null;
const C4R=6,C4C=7;
function playC4(i){
  if(needKid()) return;
  if(i===undefined) return pickKid("Who's playing with you?",'playC4');
  c4={i,b:Array.from({length:C4R},()=>Array(C4C).fill(0)),turn:'kid',over:false,win:[]};
  openS(`<h2>Connect four</h2><div class="small">Tap a column to drop a piece. Four in a row wins: across, up and down, or slanted.</div><div id="gArea"></div>`); c4Render();
}
function c4Render(){
  const k=kid(c4.i), me=meColor(k), col=t=>t==='kid'?k.color:me;
  let msg=c4.turn==='kid'?`${k.name}'s turn`:'Your turn';
  if(c4.over) msg=c4.over==='tie'?"It's a tie!":c4.over==='kid'?`${k.name} wins! 🎉`:'You win! Rematch?';
  gArea().innerHTML=`<div class="scores" style="margin-top:12px"><span style="color:${k.color}">● ${esc(k.name)}</span><span style="color:${me}">● You</span></div>
    <div class="c4board">${c4.b.map((row,r)=>row.map((v,c)=>{const w=c4.win.some(([R,C])=>R===r&&C===c);
      return `<button class="c4cell" onclick="c4Drop(${c})" aria-label="Column ${c+1}"><i style="${v?`background:${col(v)};`:''}${w?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+col(v):''}"></i></button>`;}).join('')).join('')}</div>
    <div class="turn" style="margin:10px 0 4px;color:${c4.over?'var(--muted)':col(c4.turn)};font-weight:600">${msg}</div>
    <div class="btns" style="margin-top:12px">${c4.over?`<button class="btn full light" onclick="playC4(${c4.i})">Play again</button>`:''}<button class="btn full" onclick="closeS()">Done</button></div>`;
}
function c4Drop(c){
  if(c4.over) return; let r=C4R-1; while(r>=0&&c4.b[r][c]) r--; if(r<0) return;
  const t=c4.turn; c4.b[r][c]=t;
  for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){
    const line=[[r,c]];
    for(const s of [1,-1]){let R=r+dr*s,C=c+dc*s; while(R>=0&&R<C4R&&C>=0&&C<C4C&&c4.b[R][C]===t){line.push([R,C]);R+=dr*s;C+=dc*s;}}
    if(line.length>=4){c4.over=t;c4.win=line; if(t==='kid') kidWon(c4.i); break;}
  }
  if(!c4.over&&c4.b[0].every(Boolean)) c4.over='tie';
  if(!c4.over) c4.turn=t==='kid'?'me':'kid';
  c4Render();
}

/* =========================== Memory match =========================== */
let mm=null;
function playMemory(i){
  if(needKid()) return;
  if(i===undefined) return pickKid("Who's playing with you?",'playMemory');
  const k=kid(i);
  openS(`<h2>Memory match</h2><div class="small" style="margin-bottom:14px">Flip two cards. Find a match and you keep them.</div>
    <div class="label" style="margin-top:0">How do you want to play?</div>
    <div class="btns">
      <button class="btn full" style="background:${k.color}" onclick="mmStart(${i},'turns',6)">Take turns · easy (12 cards)</button>
      <button class="btn full light" onclick="mmStart(${i},'turns',8)">Take turns · harder (16 cards)</button>
      <button class="btn full light" onclick="mmStart(${i},'team',6)">Team up together (12 cards)</button>
    </div>`);
}
function mmStart(i,mode,pairs){
  const keys=Object.keys(STICKERS).filter(x=>x!=='cross').sort(()=>Math.random()-.5).slice(0,pairs);
  const cards=[...keys,...keys].sort(()=>Math.random()-.5).map(a=>({a,up:false,got:null}));
  mm={i,mode,pairs,cards,open:[],turn:'kid',score:{me:0,kid:0},tries:0,busy:false,over:false};
  openS(`<h2>Memory match</h2><div id="gArea"></div>`); mmRender();
}
function mmRender(){
  const k=kid(mm.i), me=meColor(k), col=t=>t==='kid'?k.color:t==='team'?k.color:me, cols=mm.cards.length===12?3:4;
  let msg, top;
  if(mm.mode==='team'){ top=`<div class="scores"><span style="color:${k.color}">Team ${esc(k.name)} & you</span><span>${mm.tries} tries</span></div>`;
    msg=mm.over?`You found them all in ${mm.tries} tries! 🎉`:'Find all the pairs together'; }
  else { top=`<div class="scores"><span style="color:${k.color}">${esc(k.name)} ${mm.score.kid}</span><span style="color:${me}">You ${mm.score.me}</span></div>`;
    msg=mm.turn==='kid'?`${k.name}'s turn`:'Your turn';
    if(mm.over){const {me:a,kid:b}=mm.score; msg=b>a?`${k.name} wins! 🎉`:a>b?'You win! Rematch?':"It's a tie!";} }
  gArea().innerHTML=top+`<div class="mmgrid" style="grid-template-columns:repeat(${cols},1fr)">${mm.cards.map((c,n)=>
      `<button class="mmcard ${c.up||c.got?'up':''}" style="${c.got?`border-color:${col(c.got)}`:''}" onclick="mmFlip(${n})">${c.up||c.got?STICKERS[c.a].svg(FULL):'<span></span>'}</button>`).join('')}</div>
    <div class="turn" style="margin:6px 0 4px;color:${mm.over?'var(--muted)':mm.mode==='team'?'var(--muted)':col(mm.turn)};font-weight:600">${msg}</div>
    <div class="btns" style="margin-top:12px">${mm.over?`<button class="btn full light" onclick="playMemory(${mm.i})">Play again</button>`:''}<button class="btn full" onclick="closeS()">Done</button></div>`;
}
function mmFlip(n){
  const c=mm.cards[n]; if(mm.busy||mm.over||c.up||c.got) return;
  c.up=true; mm.open.push(n); mmRender();
  if(mm.open.length<2) return;
  const [a,b]=mm.open.map(x=>mm.cards[x]); mm.tries++;
  if(a.a===b.a){
    const who=mm.mode==='team'?'team':mm.turn; a.got=b.got=who; a.up=b.up=false; mm.open=[];
    if(mm.mode!=='team') mm.score[mm.turn]++;
    if(mm.cards.every(x=>x.got)){mm.over=true; if(mm.mode!=='team'&&mm.score.kid>mm.score.me) kidWon(mm.i);}
    mmRender();
  } else {
    mm.busy=true;
    setTimeout(()=>{a.up=b.up=false; mm.open=[]; mm.busy=false; if(mm.mode!=='team') mm.turn=mm.turn==='kid'?'me':'kid'; mmRender();},1000);
  }
}
