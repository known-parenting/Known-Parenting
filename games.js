/* known: parenting — pass-and-play games for two on one phone.
   You play against your kid. When your kid wins, it counts toward their "games won". */

const GAME_START={ttt:'openTTT',hangman:'playHangman',dots:'playDots',c4:'playC4',memory:'playMemory',trivia:'playTrivia',twenty:'playTwenty',chain:'playChain'};
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
  if(!gArea()) return;   // the sheet was closed before the cards flipped back
  const k=kid(mm.i), me=meColor(k), col=t=>t==='kid'?k.color:t==='team'?k.color:me, cols=mm.cards.length===12?3:4;
  let msg, top;
  if(mm.mode==='team'){ top=`<div class="scores"><span style="color:${k.color}">Team ${esc(k.name)} & you</span><span>${mm.tries} tries</span></div>`;
    msg=mm.over?`You found them all in ${mm.tries} tries! 🎉`:'Find all the pairs together'; }
  else { top=`<div class="scores"><span style="color:${k.color}">${esc(k.name)} ${mm.score.kid}</span><span style="color:${me}">You ${mm.score.me}</span></div>`;
    msg=mm.turn==='kid'?`${k.name}'s turn`:'Your turn';
    if(mm.over){const {me:a,kid:b}=mm.score; msg=b>a?`${k.name} wins! 🎉`:a>b?'You win! Rematch?':"It's a tie!";} }
  gArea().innerHTML=top+`<div class="mmgrid" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${mm.cards.map((c,n)=>
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

/* =========================== Bible trivia =========================== */
/* Questions live in content/trivia.js, by age group. */
const tvTier=k=>k.years<7?'little':k.years<11?'middle':'big';
const TV_LABEL={little:'Easy questions for ages 6 and under.',middle:'Medium questions for ages 7–10.',big:'Harder questions for ages 11 and up.'};
let tv=null;
function playTrivia(i){
  if(needKid()) return;
  if(i===undefined) return pickKid("Who's playing with you?",'playTrivia');
  const k=kid(i);
  openS(`<h2>Bible trivia</h2><div class="small" style="margin-bottom:14px">Ten questions. Read each one out loud and pick the answer together, or take turns.</div>
    <div class="btns">
      <button class="btn full" style="background:${k.color}" onclick="tvStart(${i},'team')">Team up together</button>
      <button class="btn full light" onclick="tvStart(${i},'turns')">Take turns</button>
    </div>
    <div class="small" style="margin-top:12px">${TV_LABEL[tvTier(k)]} ${KP_TRIVIA[tvTier(k)].length} questions in the pile.</div>`);
}
function tvStart(i,mode){
  const k=kid(i), raw=state.kids[i], tier=tvTier(k), bank=KP_TRIVIA[tier];
  // no repeats: work through the whole pile for this age before any question comes back
  raw.seenTrivia=raw.seenTrivia||{}; let seen=raw.seenTrivia[tier]||[];
  let pool=bank.map((_,n)=>n).filter(n=>!seen.includes(n));
  if(pool.length<10){ seen=[]; pool=bank.map((_,n)=>n); }
  const pick=pool.sort(()=>Math.random()-.5).slice(0,10);
  raw.seenTrivia[tier]=[...seen,...pick]; save();
  tv={i,mode,qs:pick.map(n=>{const [q,right,w1,w2,r]=bank[n];return {q,a:[right,w1,w2],r,opts:[right,w1,w2].sort(()=>Math.random()-.5)};}),at:0,picked:null,turn:'kid',score:{me:0,kid:0,team:0},over:false};
  openS(`<h2>Bible trivia</h2><div id="gArea"></div>`); tvRender();
}
function tvRender(){
  const k=kid(tv.i), me=meColor(k), q=tv.qs[tv.at];
  if(tv.over){
    const {me:a,kid:b,team:t}=tv.score;
    const msg=tv.mode==='team'?`You got ${t} out of 10 together! 🎉`:b>a?`${k.name} wins! 🎉`:a>b?'You win! Rematch?':"It's a tie!";
    gArea().innerHTML=`<div class="tv-end">${msg}</div><div class="btns"><button class="btn full light" onclick="tvStart(${tv.i},'${tv.mode}')">Play again</button><button class="btn full" onclick="closeS()">Done</button></div>`; return;
  }
  const who=tv.mode==='team'?'Answer together':tv.turn==='kid'?`${k.name}'s turn`:'Your turn';
  const top=tv.mode==='team'?`<span style="color:${k.color}">Team: ${tv.score.team}</span>`:`<span style="color:${k.color}">${esc(k.name)} ${tv.score.kid}</span><span style="color:${me}">You ${tv.score.me}</span>`;
  gArea().innerHTML=`<div class="scores">${top}<span class="small" style="align-self:center">${tv.at+1} / 10</span></div>
    <div class="turn" style="margin:0 0 8px;font-weight:600;color:${tv.mode==='team'?'var(--muted)':tv.turn==='kid'?k.color:me}">${who}</div>
    <div class="tv-q">${esc(q.q)}</div>
    <div class="btns">${q.opts.map((o,n)=>{const right=o===q.a[0], show=tv.picked!==null;
      return `<button class="btn full tv-opt ${show?(right?'right':(tv.picked===n?'wrong':'')):''}" ${show?'disabled':''} onclick="tvPick(${n})">${esc(o)}</button>`;}).join('')}</div>
    ${tv.picked!==null?`<div class="small" style="margin:10px 2px">${q.opts[tv.picked]===q.a[0]?'That’s right!':'The answer is '+esc(q.a[0])+'.'}${q.r?' · '+q.r:''}</div>
      <button class="btn full" onclick="tvNext()">${tv.at<9?'Next question':'See the score'}</button>`:''}`;
}
function tvPick(n){
  if(tv.picked!==null) return; tv.picked=n;
  if(tv.qs[tv.at].opts[n]===tv.qs[tv.at].a[0]) tv.score[tv.mode==='team'?'team':tv.turn]++;
  tvRender();
}
function tvNext(){
  tv.picked=null; tv.at++; if(tv.mode==='turns') tv.turn=tv.turn==='kid'?'me':'kid';
  if(tv.at>=10){tv.over=true; if(tv.mode==='turns'&&tv.score.kid>tv.score.me) kidWon(tv.i);}
  tvRender();
}

/* =========================== Twenty questions =========================== */
const TQ_WORDS={
  Animal:['dog','cat','elephant','giraffe','penguin','frog','horse','lion','shark','owl','turtle','monkey','bee','cow','dolphin'],
  Food:['pizza','banana','pancakes','ice cream','carrot','apple','spaghetti','popcorn','cookie','watermelon','taco','cheese'],
  Place:['the beach','the park','Grandma’s house','the zoo','church','the grocery store','the library','space','a farm','the mountains'],
  Thing:['a toothbrush','a bicycle','a pillow','a car','a book','a ball','a spoon','a lamp','a backpack','a tree','an umbrella','a crayon']
};
let tq=null;
function playTwenty(i){
  if(needKid()) return;
  if(i===undefined) return pickKid("Who's playing with you?",'playTwenty');
  const k=kid(i);
  openS(`<h2>Twenty questions</h2><div class="small" style="margin-bottom:14px">One of you thinks of something. The other asks yes-or-no questions and tries to guess it in 20.</div>
    <div class="label" style="margin-top:0">Who's guessing?</div>
    <div class="btns">
      <button class="btn full" style="background:${k.color}" onclick="tqSetup(${i},'kid')">${esc(k.name)} guesses</button>
      <button class="btn full light" onclick="tqSetup(${i},'me')">I guess</button>
    </div>`);
}
function tqSetup(i,guesser){
  const k=kid(i), thinker=guesser==='kid'?'You':esc(k.name);
  openS(`<h2>Think of something</h2><div class="small" style="margin-bottom:14px">${thinker} think${guesser==='kid'?'':'s'} of something, or let the app pick one secretly.</div>
    <div class="btns">${Object.keys(TQ_WORDS).map(c=>`<button class="btn full light" onclick="tqPick(${i},'${guesser}','${c}')">Pick a secret ${c.toLowerCase()}</button>`).join('')}
      <button class="btn full" onclick="tqStart(${i},'${guesser}','')">We've got one in mind</button></div>`);
}
function tqPick(i,guesser,cat){
  const list=TQ_WORDS[cat], w=list[Math.floor(Math.random()*list.length)], k=kid(i);
  openS(`<h2>Your secret ${cat.toLowerCase()}</h2><div class="small">Only ${guesser==='kid'?'you':esc(k.name)} should look!</div>
    <div class="tq-secret">${esc(w)}</div>
    <button class="btn full" onclick="tqStart(${i},'${guesser}','${esc(w).replace(/'/g,"\\'")}','${cat}')">Got it, hide it</button>`);
}
function tqStart(i,guesser,word,cat){
  tq={i,guesser,word,cat:cat||'',asked:0,over:false,won:false,showWord:false};
  openS(`<h2>Twenty questions</h2><div id="gArea"></div>`); tqRender();
}
function tqRender(){
  const k=kid(tq.i), who=tq.guesser==='kid'?k.name:'You', left=20-tq.asked;
  let msg=`${who} ${tq.guesser==='kid'?'asks':'ask'} a yes-or-no question. Tap Yes or No to count it.`;
  if(tq.over) msg=tq.won?`${tq.guesser==='kid'?k.name+' got it':'You got it'} in ${tq.asked} question${tq.asked===1?'':'s'}! 🎉`:`Out of questions!${tq.word?' It was '+tq.word+'.':''}`;
  gArea().innerHTML=`${tq.cat?`<div class="small" style="text-align:center">It's ${/^[aeiou]/i.test(tq.cat)?'an':'a'} ${tq.cat.toLowerCase()}</div>`:''}
    <div class="tq-count" style="color:${k.color}">${left}</div><div class="small" style="text-align:center;margin-top:-4px">question${left===1?'':'s'} left</div>
    <div class="tq-dots">${Array.from({length:20},(_,n)=>`<i style="${n<tq.asked?`background:${k.color}`:''}"></i>`).join('')}</div>
    <div class="turn" style="margin:10px 0 12px">${msg}</div>
    ${tq.over?'':`<div class="tq-row"><button class="btn" style="background:var(--sage)" onclick="tqAsk()">Yes</button><button class="btn" style="background:var(--clay)" onclick="tqAsk()">No</button></div>
      <button class="btn full" style="margin-top:8px;background:${k.color}" onclick="tqEnd(true)">${who} guessed it!</button>
      <button class="btn full light" style="margin-top:8px" onclick="tqEnd(false)">Give up</button>`}
    ${tq.word&&!tq.over?`<button class="ob-skip" style="display:block;margin:10px auto 0" onclick="tq.showWord=!tq.showWord;tqRender()">${tq.showWord?esc(tq.word):'Peek at the secret (thinker only)'}</button>`:''}
    ${tq.over?`<div class="btns" style="margin-top:12px"><button class="btn full light" onclick="playTwenty(${tq.i})">Play again</button><button class="btn full" onclick="closeS()">Done</button></div>`:''}`;
}
function tqAsk(){ if(tq.over) return; tq.asked++; if(tq.asked>=20){tq.over=true; if(tq.guesser==='me') kidWon(tq.i);} tqRender(); }
function tqEnd(won){ tq.over=true; tq.won=won; if(won&&tq.asked===0) tq.asked=1;
  if((won&&tq.guesser==='kid')||(!won&&tq.guesser==='me')) kidWon(tq.i); tqRender(); }

/* =========================== Word chain =========================== */
const WC_START=['apple','sun','tiger','boat','cake','frog','star','house','music','garden','rabbit','pizza','dragon','cloud'];
let wc=null;
function playChain(i){
  if(needKid()) return;
  if(i===undefined) return pickKid("Who's playing with you?",'playChain');
  const k=kid(i), best=state.kids[i].bestChain||0;
  const start=WC_START[Math.floor(Math.random()*WC_START.length)];
  wc={i,words:[start],turn:'kid',over:false};
  openS(`<h2>Word chain</h2><div class="small">Take turns saying a word that starts with the last letter of the word before. No repeats! See how long a chain you can make together.${best?` Best chain with ${esc(k.name)}: <b>${best}</b>.`:''}</div><div id="gArea"></div>`); wcRender();
}
function wcRender(){
  const k=kid(wc.i), me=meColor(k), last=wc.words[wc.words.length-1], letter=last.replace(/[^a-z]/gi,'').slice(-1).toUpperCase();
  const who=wc.turn==='kid'?`${k.name}'s turn`:'Your turn';
  gArea().innerHTML=`<div class="wc-chain">${wc.words.map((w,n)=>`<span style="${n?`border-color:${n%2?k.color:me}`:''}">${esc(w)}</span>`).join('<b>→</b>')}</div>
    ${wc.over?`<div class="tv-end">Your chain: ${wc.words.length-1} word${wc.words.length===2?'':'s'}!${(wc.words.length-1)>=(state.kids[wc.i].bestChain||0)&&wc.words.length>1?' New best! 🎉':''}</div>
      <div class="btns"><button class="btn full light" onclick="playChain(${wc.i})">Play again</button><button class="btn full" onclick="closeS()">Done</button></div>`
    :`<div class="turn" style="margin:12px 0 8px;font-weight:600;color:${wc.turn==='kid'?k.color:me}">${who}: a word starting with <span class="wc-letter">${letter}</span></div>
      <div class="field" style="margin:8px 0"><input id="wcIn" autocomplete="off" autocapitalize="none" placeholder="Type a word that starts with ${letter}" onkeydown="if(event.key==='Enter')wcAdd()"></div>
      <div class="btns"><button class="btn full" onclick="wcAdd()">Add to the chain</button><button class="btn full light" onclick="wcStop()">We're stuck, end the chain</button></div>`}`;
}
function wcAdd(){
  const el=document.getElementById('wcIn'), w=(el.value||'').trim().toLowerCase();
  const last=wc.words[wc.words.length-1].replace(/[^a-z]/g,''), need=last.slice(-1);
  if(w.replace(/[^a-z]/g,'').length<2){toast('Type a word');return el.focus();}
  if(w[0]!==need){toast(`It has to start with ${need.toUpperCase()}`);return el.focus();}
  if(wc.words.includes(w)){toast('Already used that one!');return el.focus();}
  wc.words.push(w); wc.turn=wc.turn==='kid'?'me':'kid'; wcRender();
  const n=document.getElementById('wcIn'); if(n) n.focus();
}
function wcStop(){
  wc.over=true; const len=wc.words.length-1, raw=state.kids[wc.i];
  if(len>(raw.bestChain||0)){raw.bestChain=len;save();}
  wcRender();
}
