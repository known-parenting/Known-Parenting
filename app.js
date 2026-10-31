/* known: parenting — app logic (PWA beta)
   Everything is saved on the device in localStorage under "kp.v1".
   Content lives in /content/*.js so it can be edited without touching this file. */

const APP_VERSION='0.5.2';   // shown in Settings. Bump with VERSION in sw.js.

/* =========================== dates =========================== */
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=v=>{const[y,m,d]=v.split('-').map(Number);return new Date(y,m-1,d);};
const today=()=>{const t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate());};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
const dayNum=d=>Math.round((d-new Date(2020,0,6))/86400000);          // days since a Monday
const weekStart=d=>addDays(d,-((d.getDay()+6)%7));                     // Monday of that week
const weekKey=d=>iso(weekStart(d));
const doy=()=>Math.floor((today()-new Date(today().getFullYear(),0,0))/86400000);
const fmt=n=>n.toLocaleString();
const ord=n=>{const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* =========================== saved state =========================== */
const STORE='kp.v1';
const PALETTE=[{n:'Sage',c:'#8fa58b'},{n:'Clay',c:'#c98c6e'},{n:'Blue',c:'#8aa3b8'},{n:'Mustard',c:'#d6b05a'},{n:'Rose',c:'#c48c8c'},{n:'Plum',c:'#8f7d9e'},{n:'Teal',c:'#6f9a97'}];
const ART_ORDER=['flower','car','redwood','rainbow','balls'];
let memoryOnly=false;
function freshState(){return {v:1,kids:[],settings:{faith:true,reminder:'19:30',onboarded:false},bdayShown:{}};}
function load(){
  try{const raw=localStorage.getItem(STORE); if(raw){const s=JSON.parse(raw); return {...freshState(),...s,settings:{...freshState().settings,...(s.settings||{})}};}}
  catch(e){memoryOnly=true;}
  return freshState();
}
let state=load();
function save(){ if(memoryOnly) return; try{localStorage.setItem(STORE,JSON.stringify(state));}catch(e){memoryOnly=true;} }
// ask the browser not to clear our saved data when the phone is low on space
if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(()=>{});
const premium=true; // beta: everything unlocked
const uid=()=>Math.random().toString(36).slice(2,9);
function newKid(name,birth,i){
  const used=state.kids.map(k=>k.color);
  return {id:uid(),name,birth,color:(PALETTE.find(p=>!used.includes(p.c))||PALETTE[(i??0)%PALETTE.length]).c,
    art:ART_ORDER[(i??state.kids.length)%ART_ORDER.length],log:{},wlog:{},seen:{q:[],m:[]},memories:[],stories:[],gamesWon:0,best:0,created:iso(today())};
}

/* =========================== content =========================== */
const STAGE=m=> m<3?'m0': m<6?'m3': m<12?'m6': m<18?'m12': m<24?'m18': m<36?'y2': m<60?'y3': m<120?'y5': m<156?'y10': m<192?'y13': m<216?'y16':'grown';
function ageText(m){ if(m<24) return m+(m===1?' month':' months'); return Math.floor(m/12)+' years'; }
function stageContent(st){
  const c=KP_STAGES[st], f=list=>(list||[]).map((x,i)=>({...x,id:st+':'+i})).filter(x=>state.settings.faith||!x.fa);
  return {label:c.label,ch:f(c.ch),q:f(c.q),m:f(c.m)};
}
/* seeded shuffle so each kid gets their own order and nothing repeats until everything's been used */
function seeded(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);return((h^=h>>>16)>>>0)/4294967296;};}
function orderFor(seed,n){const r=seeded(seed),a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

/* =========================== kids =========================== */
function kid(i){
  const k=state.kids[i]; if(!k) return null;
  const b=parse(k.birth), t=today();
  let months=(t.getFullYear()-b.getFullYear())*12+(t.getMonth()-b.getMonth()); if(t.getDate()<b.getDate()) months--; months=Math.max(0,months);
  const stage=STAGE(months), grown=stage==='grown';
  const isBday=b.getMonth()===t.getMonth()&&b.getDate()===t.getDate()&&t>b;
  const done=grown?!!k.wlog[weekKey(t)]:!!k.log[iso(t)];
  const st=grown?weeklyStreak(k):dailyStreak(k);
  if(st.count>(k.best||0)){k.best=st.count;save();}
  return {...k,i,b,months,stage,grown,isBday,done,years:Math.floor(months/12),streak:st};
}
function calc(b){
  const t=today(),end=new Date(b.getFullYear()+18,b.getMonth(),b.getDate());
  if(end<=t) return null;
  const days=Math.round((end-t)/86400000);
  let months=(end.getFullYear()-t.getFullYear())*12+(end.getMonth()-t.getMonth()); if(end.getDate()<t.getDate()) months--;
  return {days,months,years:Math.floor(months/12),end};
}

/* =========================== streaks + grace day ===========================
   Daily: today counts once it's done; until then the streak runs through yesterday.
   One missed day per calendar week (Mon–Sun) is forgiven automatically: the grace day.
   A second miss in the same week ends the streak. Grown kids: weekly streak, 7 days to finish. */
function dailyStreak(k){
  const dates=Object.keys(k.log).filter(d=>k.log[d]).sort(); if(!dates.length) return {count:0,grace:[]};
  const first=dates[0]; let d=today(); if(!k.log[iso(d)]) d=addDays(d,-1);
  let count=0; const graceWeeks=new Set(), grace=[];
  for(let n=0;n<5000;n++){
    const key=iso(d); if(key<first) break;
    if(k.log[key]) count++;
    else { const wk=weekKey(d); if(graceWeeks.has(wk)) break; graceWeeks.add(wk); grace.push(key); }
    d=addDays(d,-1);
  }
  // a grace day only counts if a completed day sits before it in the streak
  while(grace.length&&grace[grace.length-1]<=first) grace.pop();
  return {count,grace};
}
function weeklyStreak(k){
  let w=weekStart(today()); if(!k.wlog[iso(w)]) w=addDays(w,-7);
  let count=0; while(k.wlog[iso(w)]){count++;w=addDays(w,-7);}
  return {count,grace:[]};
}
const streakText=k=>k.grown?`${k.streak.count} wk`:`${k.streak.count}`;
function bolt(stroke,fill){return `<svg viewBox="0 0 24 28" filter="url(#crayon)"><path d="M14 2 L4 16 H11 L9 26 L20 11 H13 Z" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round" fill="${fill}"/></svg>`;}

function todaysChallenge(k){
  const c=stageContent(k.stage); if(!c.ch.length) return null;
  const order=orderFor(k.id+k.stage,c.ch.length);
  const n=k.grown?Math.floor(dayNum(today())/7):dayNum(today());
  return c.ch[order[n%order.length]];
}

/* =========================== navigation =========================== */
let sel=0, view='home';
const SCREENS=['onboard','home','kidpage','games','library','settings','kidsettings'];
const SUBPAGE={kidpage:'home',kidsettings:'settings'};   // pages that sit "on top of" a tab
function go(v,fromBack){
  const was=view; view=v;
  SCREENS.forEach(s=>document.getElementById(s).classList.toggle('hidden',s!==v));
  const tabOf={home:'home',kidpage:'home',games:'games',library:'library',settings:'settings',kidsettings:'settings'};
  ['home','games','library','settings'].forEach(t=>document.getElementById('t-'+t).classList.toggle('on',tabOf[v]===t));
  tabs.classList.toggle('hidden',v==='onboard');
  // let the phone's back button/gesture leave a kid page instead of closing the app
  if(!fromBack&&SUBPAGE[v]&&was!==v) history.pushState({kp:v},'');
  window.scrollTo(0,0);
  render();
  if(v==='home') checkBirthdays();
}
function goBack(){
  if(history.state&&history.state.kp===view) history.back();
  else go(SUBPAGE[view]||'home',true);
}
window.addEventListener('popstate',()=>{
  if(overlay.classList.contains('open')) closeS();
  if(SUBPAGE[view]) go(SUBPAGE[view],true);
});
function openKid(i){sel=i;go('kidpage');}

/* =========================== render =========================== */
function render(){
  if(view==='onboard') return renderOnboard();
  const h=new Date().getHours();
  greet.textContent=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  const all=state.kids.map((_,i)=>kid(i));
  sunHat.style.display=all.some(k=>k.isBday)?'':'none';

  /* home */
  kidgrid.innerHTML=all.map(k=>{
    const meta=k.isBday?`Happy ${ord(k.years)} birthday!`:k.done?(k.grown?'Done this week':'Done today'):(k.grown?"This week's waiting":"Today's moment waiting");
    return `<div class="kidcard ${k.isBday?'isbday':''}" style="background:${k.color}" onclick="openKid(${k.i})">
      <div class="kart">${ART[k.art].svg(WHITE)}</div>
      <div class="toprow"><span class="bolt">${bolt('#fff',k.done?'#fff':'none')}${streakText(k)}</span>${k.isBday?'<span class="hat">🎂</span>':''}</div>
      <div class="kinfo"><div class="kname">${esc(k.name)}</div><div class="kmeta">${meta}</div></div></div>`;
  }).join('');
  const v=KP_VERSES[doy()%KP_VERSES.length];
  vText.textContent='“'+v.t+'”'; vRef.textContent=v.r+' (ESV)'; vEnc.textContent=v.e;
  vart.innerHTML=(STORY_ART[v.art]||ART.flower).svg(FULL);
  const rm=KP_REMINDERS[doy()%KP_REMINDERS.length]; rTitle.textContent=rm.t; rText.textContent=rm.p;
  verseWrap.classList.toggle('hidden',!state.settings.faith);

  /* kid page */
  if(view==='kidpage'&&all[sel]) renderKid(all[sel]);

  /* settings */
  setList.innerHTML=all.map(k=>`<div class="setrow" onclick="openKidSettings(${k.i})">
      <div class="sw" style="background:${k.color}">${ART[k.art].svg(WHITE)}</div>
      <div><b>${esc(k.name)}</b><span class="small">${KP_STAGES[k.stage].label} · ${ageText(k.months)}</span></div><span class="chev">›</span></div>`).join('');
  faithSw.classList.toggle('on',state.settings.faith);
  remTimeLbl.textContent=timeLabel12(state.settings.reminder);
  appVer.textContent='Version '+APP_VERSION;
  if(view==='kidsettings'&&all[sel]) renderKidSettings(all[sel]);
  if(view==='games') renderGames();
  if(view==='library') renderLibrary();
}

function renderKid(k){
  const c=stageContent(k.stage), r=calc(k.b);
  kName.textContent=k.name; kUnder.setAttribute('stroke',k.color);
  kStreak.innerHTML=bolt(k.color,k.done?k.color:'none')+`<span style="color:${k.color}">${streakText(k)}</span>`;
  kStage.textContent=c.label+' · '+ageText(k.months);
  qCard.classList.toggle('hidden',!c.q.length); mCard.classList.toggle('hidden',!c.m.length);
  drawRow.style.gridTemplateColumns=(c.q.length&&c.m.length)?'1fr 1fr':'1fr';
  drawRow.classList.toggle('hidden',!c.q.length&&!c.m.length);
  if(r){timeLabel.textContent='Time at home';
    timeCard.innerHTML=`<div><div class="num" style="color:${k.color}">${fmt(r.days)}</div><div class="small">days until ${esc(k.name)} turns 18</div></div><span class="chev">›</span>`;}
  else{timeLabel.textContent='Still known';
    timeCard.innerHTML=`<div><div class="num" style="color:${k.color};font-size:24px">Grown & gone, still yours</div><div class="small">Weekly challenges now</div></div><span class="chev">›</span>`;}
  chLabel.textContent=k.grown?"This week's challenge":"Today's challenge";
  const ch=todaysChallenge(k);
  forTag.style.background=k.color; forTag.textContent='For '+k.name;
  chTitle.textContent=ch?ch.t:''; chText.textContent=ch?ch.p:''; chWhy.textContent=ch?'Why: '+ch.w:'';
  art.innerHTML=ART[k.art].svg(FULL);
  doneBtn.textContent=k.done?(k.grown?'Done this week ✓':'Done today ✓'):'We did it →'; doneBtn.classList.toggle('donebtn',k.done);

  if(k.grown){
    const weeks=[...Array(7)].map((_,n)=>addDays(weekStart(today()),-7*(6-n)));
    week.innerHTML=weeks.map(w=>{const d=k.wlog[iso(w)];return `<span class="dot" style="${d?`background:${k.color};border-color:${k.color}`:''}"></span>`;}).join('');
    const left=7-((new Date().getDay()+6)%7);
    streakLbl.textContent=`${k.streak.count} WEEK STREAK WITH ${k.name.toUpperCase()} · ${left} DAY${left===1?'':'S'} LEFT THIS WEEK`;
    graceLbl.textContent='';
  } else {
    const mon=weekStart(today()), t=iso(today());
    week.innerHTML=[...Array(7)].map((_,n)=>{const key=iso(addDays(mon,n)), d=k.log[key], g=k.streak.grace.includes(key);
      return `<span class="dot ${g?'grace':''}" title="${g?'Grace day':''}" style="${d?`background:${k.color};border-color:${k.color}`:g?`border-color:${k.color}`:''}${key===t&&!d?';outline:2px solid var(--line);outline-offset:2px':''}"></span>`;}).join('');
    streakLbl.textContent=`${k.streak.count} DAY STREAK WITH ${k.name.toUpperCase()}`;
    const wk=weekKey(today()), used=k.streak.grace.some(g=>weekKey(parse(g))===wk);
    graceLbl.textContent=used?'Grace day used this week. Tomorrow keeps the streak alive.':'1 grace day left this week.';
  }

  const {answers,stories}=yearMemories(k.i);
  kBonus.innerHTML=(k.months>=36&&!k.grown)?`<div class="label">Bonus challenge</div>
    <div class="storycta" onclick="startStory(${k.i})"><div><b>Make a book with ${esc(k.name)}</b><span>Place pictures, draw together, and write their words.</span></div></div>`:'';
  kMem.innerHTML=`<div class="memtop"><b style="color:${k.color}">${answers.length}</b> ${answers.length===1?'answer':'answers'} and <b style="color:${k.color}">${stories.length}</b> ${stories.length===1?'story':'stories'} saved this year</div>
    ${answers[0]?`<div class="memq"><i>${esc(answers[0].q)}</i>“${esc(answers[0].a)}”</div>`:''}
    <button class="btn full light" onclick="openRecap(${k.i})">See memories from this year ›</button>
    <button class="btn full light" style="margin-top:8px" onclick="memKid=${k.i};libSeg='memories';go('library')">All of ${esc(k.name)}'s memories ›</button>`;
}

function markDone(){
  const k=kid(sel), raw=state.kids[sel];
  if(k.grown){const wk=weekKey(today()); if(raw.wlog[wk]) delete raw.wlog[wk]; else raw.wlog[wk]=1;}
  else{const d=iso(today()); if(raw.log[d]) delete raw.log[d]; else raw.log[d]=1;}
  save(); render();
  if(kid(sel).done) toast(`${k.name}: ${k.grown?'done this week':'done today'} ✓`);
}

/* =========================== kid settings =========================== */
function openKidSettings(i){sel=i;closeS();go('kidsettings');}
function renderKidSettings(k){
  ksTitle.textContent=k.name; ksUnder.setAttribute('stroke',k.color);
  if(document.activeElement!==ksName) ksName.value=k.name;
  if(document.activeElement!==ksBirth) ksBirth.value=k.birth;
  ksBirth.max=iso(today());
  ksAge.textContent=`${ageText(k.months)} old · ${KP_STAGES[k.stage].label} stage`;
  ksColors.innerHTML=PALETTE.map(p=>`<button class="swatch ${k.color===p.c?'on':''}" title="${p.n}" aria-label="${p.n}" style="background:${p.c}" onclick="editKid('color','${p.c}')"></button>`).join('');
  ksArt.innerHTML=Object.entries(ART).map(([key,a])=>`<button class="artopt ${k.art===key?'on':''}" onclick="editKid('art','${key}')">${a.svg(FULL)}${a.name}</button>`).join('');
}
function editKid(field,val){
  if(field==='birth'&&(!val||parse(val)>today())) return;
  if(field==='name'&&!val.trim()) return;
  state.kids[sel][field]=val; save(); render();
}
function addKid(){
  const t=today();
  state.kids.push(newKid('New baby',iso(addDays(t,-1)))); save();
  openKidSettings(state.kids.length-1);
  setTimeout(()=>{ksName.focus();ksName.select();},50);
}
function removeKid(){
  if(!confirm(`Remove ${state.kids[sel].name}? Their streaks and memories will be deleted. This can't be undone.`)) return;
  state.kids.splice(sel,1); sel=0; save();
  if(history.state&&history.state.kp) history.replaceState(null,'');
  go(state.kids.length?'settings':'onboard',true);
}
function setFaith(v){state.settings.faith=v;save();render();}

/* =========================== first-time setup =========================== */
let ob={step:0,draft:[]};
function renderOnboard(){
  const steps=[
    ()=>`<div class="ob-welcome"><div class="ob-step">Welcome</div>
      <div class="ob-art">${ART.flower.svg(FULL)}</div>
      <h1>known: parenting</h1>
      <p class="ob-lead">One small moment with each of your kids, every day. Open it for a minute, then put the phone down and go be with them.</p>
      <div class="ob-actions"><button class="btn full" onclick="ob.step=1;render()">Get started</button></div>
      <button class="ob-skip" onclick="loadDemo()">Just looking? Try it with a demo family</button></div>`,
    ()=>`<div class="ob-step">Step 1 of 2</div>
      <h1>Your kids</h1>
      <p class="ob-lead">Add each child's name and birthday. Everything in the app matches their age, and it's saved only on this phone.</p>
      ${ob.draft.map((d,n)=>`<div class="ob-kid"><span class="sw" style="background:${PALETTE[n%PALETTE.length].c}"></span><div><b>${esc(d.name)}</b><div class="small">${parse(d.birth).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}</div></div><button aria-label="Remove" onclick="ob.draft.splice(${n},1);render()">×</button></div>`).join('')}
      <div class="field"><label for="obName">Name</label><input id="obName" autocomplete="off" placeholder="First name or nickname"></div>
      <div class="field"><label for="obBirth">Birthday</label><input id="obBirth" type="date" max="${iso(today())}"></div>
      <button class="btn full light" onclick="obAdd()">+ Add ${ob.draft.length?'another child':'this child'}</button>
      <div class="ob-actions"><button class="btn full" onclick="obNext()">Next</button></div>`,
    ()=>`<div class="ob-step">Step 2 of 2</div>
      <h1>A daily nudge</h1>
      <p class="ob-lead">Pick a time that's usually calm, like after dinner or bedtime. We'll put a daily reminder on your calendar.</p>
      <input type="time" id="obTime" value="${state.settings.reminder}">
      <div class="ob-actions">
        <button class="btn full light" onclick="state.settings.reminder=obTime.value;save();downloadICS()">Add reminder to my calendar</button>
        <div class="hint"><b>Make it an app.</b> ${installText()}</div>
        <button class="btn full" onclick="state.settings.reminder=obTime.value;finishOnboard()">Start</button>
      </div>`
  ];
  obBody.innerHTML=steps[ob.step]();
}
function obAdd(){
  const name=obName.value.trim(), b=obBirth.value;
  if(!name){obName.focus();return toast('Add a name');}
  if(!b||parse(b)>today()){obBirth.focus();return toast('Add their birthday');}
  ob.draft.push({name,birth:b}); render(); return true;
}
function obNext(){
  // a name or birthday typed but not added yet counts as added
  if(obName.value.trim()||obBirth.value){ if(!obAdd()) return; }
  if(!ob.draft.length) return toast('Add at least one child');
  ob.step=2; render();
}
function finishOnboard(){
  ob.draft.forEach((d,n)=>state.kids.push(newKid(d.name,d.birth,n)));
  state.settings.onboarded=true; save(); ob={step:0,draft:[]}; go('home');
}
function loadDemo(){
  const t=today(), y=n=>iso(addDays(t,-Math.round(n*365.25)));
  const demo=[['Ellie',y(3.4),'flower'],['Sam',y(1.6),'car'],['Noah',y(22),'redwood'],['June',y(0.3),'rainbow']];
  state.kids=[]; demo.forEach(([n,b,a],i)=>state.kids.push({...newKid(n,b,i),art:a}));
  // a little history so streaks and memories show
  state.kids.forEach((k,i)=>{for(let d=1;d<=[12,5,0,2][i];d++) if(d!==3) k.log[iso(addDays(t,-d))]=1;});
  [1,2,3].forEach(w=>state.kids[2].wlog[iso(addDays(weekStart(t),-7*w))]=1);
  state.kids[0].memories=[{q:"What's making you happy today?",a:"The puppy at the park. Because he licked my hand and it tickled.",date:iso(addDays(t,-3)),months:40},
    {q:"Who was kind to you today?",a:"Sam. He gave me his cracker.",date:iso(addDays(t,-19)),months:40}];
  state.kids[0].stories=[{title:"Ellie and the Night Sky",date:iso(addDays(t,-10)),pages:[{art:'moon',text:"One night Ellie looked out her window and saw the moon smiling."},{art:'boat',text:"She sailed a little boat all the way up to say hello."},{art:'house',text:"Then she came home and Daddy tucked her in."}]}];
  state.kids[0].gamesWon=7;
  state.settings.onboarded=true; state.demo=true; save(); go('home');
  toast('Demo family loaded. Remove them anytime in Settings.');
}

/* =========================== reminders + install =========================== */
function timeLabel12(t){const[h,m]=t.split(':').map(Number);return `${(h%12)||12}:${pad(m)} ${h<12?'AM':'PM'}`;}
function reminderSheet(){
  openS(`<h2>Daily reminder</h2><div class="small" style="margin:4px 0 14px">Pick a calm time of day. This adds a repeating reminder to your phone's calendar.</div>
    <input type="time" id="remTime" value="${state.settings.reminder}">
    <div class="btns" style="margin-top:14px"><button class="btn full" onclick="state.settings.reminder=remTime.value;save();render();downloadICS()">Add to my calendar</button>
    <button class="btn full light" onclick="state.settings.reminder=remTime.value;save();render();closeS()">Just save the time</button></div>`);
}
function downloadICS(){
  const [h,m]=(state.settings.reminder||'19:30').split(':'), d=iso(addDays(today(),1)).replace(/-/g,'');
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//known parenting//EN','BEGIN:VEVENT',`UID:kp-daily-${Date.now()}@knownparenting`,`DTSTAMP:${stamp}`,
    `DTSTART:${d}T${h}${m}00`,'DURATION:PT10M','RRULE:FREQ=DAILY','SUMMARY:known: one small moment with your kids',
    "DESCRIPTION:Open known: parenting\\, read today's challenge\\, then put the phone down and go do it.",
    'BEGIN:VALARM','ACTION:DISPLAY',"DESCRIPTION:Today's moment with your kids",'TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  if(isIOS){
    // iPhone: opening the calendar file directly brings up "Add to Calendar"
    window.open('data:text/calendar;charset=utf-8,'+encodeURIComponent(ics),'_blank');
    toast('Tap “Add All” to put it on your calendar');
    return;
  }
  saveFile(new Blob([ics],{type:'text/calendar'}),'known-daily-reminder.ics');
  toast('Open the file to add it to your calendar');
}
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone;
let installEvt=null; window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;});
function installText(){
  if(standalone) return 'You’re already using it from your Home Screen.';
  if(isIOS) return 'In Safari, tap the Share button, then “Add to Home Screen.”';
  return 'In Chrome, open the ⋮ menu and tap “Add to Home screen” or “Install app.”';
}
function installSheet(){
  openS(`<h2>Add to Home Screen</h2><div class="hint" style="margin-top:12px">${installText()}</div>
    ${installEvt?'<button class="btn full" onclick="installEvt.prompt();closeS()">Install now</button>':''}
    <button class="btn full light" style="margin-top:8px" onclick="closeS()">Got it</button>`);
}

/* =========================== backup =========================== */
function saveFile(blob,name){
  // On phones, the share sheet is the dependable way to save a file ("Save to Files", Drive, email…)
  try{
    const file=new File([blob],name,{type:blob.type});
    if((isIOS||standalone)&&navigator.canShare&&navigator.canShare({files:[file]})){
      navigator.share({files:[file],title:name}).catch(()=>{}); return;
    }
  }catch(e){}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
}
function exportData(){saveFile(new Blob([JSON.stringify(state,null,1)],{type:'application/json'}),`known-parenting-backup-${iso(today())}.json`);toast('Backup ready');}
function importData(file){
  if(!file) return; const r=new FileReader();
  r.onload=()=>{try{const s=JSON.parse(r.result); if(!Array.isArray(s.kids)) throw 0;
    if(!confirm('Replace everything on this phone with this backup?')) return;
    state={...freshState(),...s,settings:{...freshState().settings,...(s.settings||{})}}; save(); go('home'); toast('Backup restored');}
    catch(e){toast('That file isn’t a known: parenting backup');}};
  r.readAsText(file); importPick.value='';
}

/* =========================== delete all data ===========================
   Two steps: offer a backup first, then a clear yes / no confirmation. */
function deleteStart(){
  openS(`<h2>Before you delete</h2>
    <div class="small" style="margin:6px 0 16px">Would you like to save your data to a file before you delete all your data? You could restore it later.</div>
    <div class="btns">
      <button class="btn full" onclick="exportData();setTimeout(deleteConfirm,400)">Yes, save my data first</button>
      <button class="btn full light" onclick="deleteConfirm()">No, don't save a copy</button>
      <button class="btn full light" onclick="closeS()">Cancel</button>
    </div>`);
}
function deleteConfirm(){
  const n=state.kids.length, mem=state.kids.reduce((t,k)=>t+(k.memories||[]).length+(k.stories||[]).length,0);
  openS(`<h2>Confirm deletion of data</h2>
    <div class="small" style="margin:6px 0 16px">This erases ${n} ${n===1?'child':'kids'}, every streak, and ${mem} saved ${mem===1?'memory':'memories'} from this phone. It can't be undone.</div>
    <div class="btns">
      <button class="btn full" style="background:#a04e3e" onclick="deleteAll()">Yes, delete my data</button>
      <button class="btn full light" onclick="closeS()">No, don't delete my data</button>
    </div>`);
}
function deleteAll(){
  try{localStorage.removeItem(STORE);}catch(e){}
  state=freshState(); save(); sel=0; memKid=0; ob={step:0,draft:[]};
  if(history.state&&history.state.kp) history.replaceState(null,'');
  closeS(); go('onboard',true); toast('All data deleted');
}

/* =========================== sheets + toast =========================== */
function openS(html){sheet.innerHTML='<div class="grab"></div>'+html;overlay.classList.add('open');}
function closeS(){overlay.classList.remove('open');}
overlay.onclick=e=>{if(e.target===overlay)closeS();};
function toast(t){document.querySelectorAll('.toast').forEach(x=>x.remove());const el=document.createElement('div');el.className='toast';el.textContent=t;phone.appendChild(el);setTimeout(()=>el.remove(),2400);}

function timeSheet(){
  const k=kid(sel), r=calc(k.b);
  if(!r){openS(`<h2>${esc(k.name)}, still known</h2><div class="small" style="margin:4px 0 14px">Grown and out of the house. Weekly challenges now, and you have all 7 days to finish each one.</div>
    <button class="btn full" style="margin-top:14px" onclick="closeS()">Close</button>`);return;}
  openS(`<h2>${esc(k.name)}'s time at home</h2><div class="small" style="margin-bottom:16px">Until ${r.end.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}</div>
    ${[['years',r.years],['months',r.months],['days',r.days]].map(([u,n])=>`<div class="row"><span class="n" style="color:${k.color}">${fmt(n)}</span><span class="u">${u}</span></div>`).join('')}
    <button class="btn full" style="margin-top:14px" onclick="closeS()">Make today count</button>`);
}

/* =========================== draw cards (no repeats until all are seen) =========================== */
let lastDrawn=null;
function drawCard(kind){
  const k=kid(sel), raw=state.kids[sel], c=stageContent(k.stage), list=kind==='question'?c.q:c.m, key=kind==='question'?'q':'m';
  if(!list.length) return;
  raw.seen=raw.seen||{q:[],m:[]};
  let pool=list.filter(x=>!raw.seen[key].includes(x.id));
  if(!pool.length){raw.seen[key]=raw.seen[key].filter(id=>!list.some(x=>x.id===id));pool=list;}
  const item=pool[Math.floor(Math.random()*pool.length)];
  raw.seen[key].push(item.id); save();
  const bg=kind==='question'?'var(--clay)':'var(--sage)';
  const body=kind==='question'
    ?`<div class="kind">Ask ${esc(k.name)}</div><div class="text">${esc(item.t)}</div>${item.f?`<div class="follow">Then: ${esc(item.f)}</div>`:''}`
    :`<div class="kind">A moment with ${esc(k.name)}</div><div class="text">${esc(item.t)}</div><div class="how">${esc(item.h)}</div>`;
  lastDrawn=item;
  openS(`<div class="drawn" style="background:${bg}">${body}</div>
    <div class="why"><b>WHY IT MATTERS</b>${esc(item.w)}</div>
    <div class="btns">
    ${kind==='question'?`<button class="btn full" onclick="saveAnswer(${k.i})">Save ${esc(k.name)}'s answer</button>`:''}
    ${item.play?`<button class="btn full" onclick="${GAME_START[item.game||'ttt']}(${k.i})">Play it here</button>`:''}
    <button class="btn full light" onclick="drawCard('${kind}')">Draw another</button>
    <button class="btn full light" onclick="closeS()">Done</button></div>`);
}

/* =========================== memories =========================== */
function saveAnswer(i){
  const k=kid(i), q=lastDrawn.t;
  openS(`<div class="pbadge">${esc(k.name)} said</div>
    <h2 style="font-style:italic;font-weight:400;margin:6px 0 12px">${esc(q)}</h2>
    <textarea id="ansBox" class="ans" placeholder="Type what ${esc(k.name)} said, in their words…"></textarea>
    <button class="btn full" style="margin-top:10px" onclick="commitAnswer(${i})">Save to ${esc(k.name)}'s memories</button>`);
  setTimeout(()=>ansBox.focus(),50);
}
function commitAnswer(i){
  const a=ansBox.value.trim(); if(!a) return;
  const k=kid(i); state.kids[i].memories.unshift({q:lastDrawn.t,a,date:iso(today()),months:k.months});
  save(); closeS(); render(); toast(`Saved to ${k.name}'s memories`);
}
function yearMemories(i){
  const k=kid(i), b=k.b, t=today();
  let start=new Date(t.getFullYear(),b.getMonth(),b.getDate()); if(start>t) start.setFullYear(start.getFullYear()-1);
  const inYear=d=>parse(d)>=start;
  return {k,start,answers:state.kids[i].memories.filter(m=>inYear(m.date)),stories:state.kids[i].stories.filter(s=>inYear(s.date))};
}
function recapHTML(i,forPrint){
  const {k,start,answers,stories}=yearMemories(i), raw=state.kids[i];
  const daysConnected=Object.keys(raw.log).filter(d=>parse(d)>=start).length+Object.keys(raw.wlog).filter(d=>parse(d)>=start).length;
  const stats=[[k.grown?'Weeks connected':'Days connected',daysConnected],['Longest streak',(raw.best||0)+(k.grown?' wks':' days')],['Games '+k.name+' won',raw.gamesWon||0],['Stories made',stories.length]];
  return `<div class="pbadge">${forPrint?'known: parenting':'Memories from this year'}</div>
    <h2>${forPrint?'Memories from this year':esc(k.name)+"'s year"}</h2>
    <div class="small">${esc(k.name)} · since ${start.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}</div>
    <div class="stats">${stats.map(([l,n])=>`<div class="stat"><b style="color:${k.color}">${n}</b><span>${esc(l)}</span></div>`).join('')}</div>
    ${answers.length?`<div class="mhead">In ${esc(k.name)}'s words</div>`+answers.map(m=>`<div class="mem"><i>${esc(m.q)}</i><p>“${esc(m.a)}”</p><span>${parse(m.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})} · ${ageText(m.months)}</span></div>`).join(''):`<div class="small" style="margin:14px 0">No answers saved yet this year. Draw a question and save what they say.</div>`}
    ${stories.length?`<div class="mhead">Stories you made together</div>`+stories.map(s=>`<div class="mem"><p style="font-family:Fraunces,serif">${esc(s.title)}</p><span>${s.pages.length} pages</span></div>`).join(''):''}
    <div class="small" style="margin-top:14px">Every year is saved into <b>The Book of ${esc(k.name)}</b>, ready for their 18th birthday.</div>`;
}
function openRecap(i){
  closeBday(true);
  const {stories}=yearMemories(i);
  openS(recapHTML(i,false)+`<div class="btns" style="margin-top:14px">
    ${stories.map(s=>`<button class="btn full light" onclick="readStory(${i},${state.kids[i].stories.indexOf(s)})">Read “${esc(s.title)}”</button>`).join('')}
    <button class="btn full" onclick="printRecap(${i})">Print or save as PDF</button>
    <button class="btn full light" onclick="closeS()">Close</button></div>`);
}
function printRecap(i){printArea.innerHTML=recapHTML(i,true);window.print();}

/* stories / books live in books.js */
let story=null;
function pickKid(title,fn){openS(`<h2>${title}</h2><div class="kidpick">${state.kids.map((k,i)=>`<button style="background:${k.color}" onclick="${fn}(${i})">${esc(k.name)}</button>`).join('')}</div>`);}

/* =========================== games =========================== */
function renderGames(){
  gameList.innerHTML=KP_GAMES.filter(g=>state.settings.faith||!g.fa).map(g=>{
    const pill=g.play?`<span class="pill" style="background:var(--sage);color:#fff">Play</span>`:`<span class="pill">Soon</span>`;
    return `<div class="game" onclick="${g.play?GAME_START[g.key]+'()':`toast('Coming soon')`}"><div><b>${g.t}</b>${g.sub?`<div class="small">${g.sub}</div>`:''}</div>${pill}</div>`;}).join('');
}
let board,player,over,tttKid;
function openTTT(i){
  if(!state.kids.length) return toast('Add a child in Settings first');
  if(i===undefined) return pickKid("Who's playing with you?",'openTTT');
  tttKid=i; board=Array(9).fill(''); player='X'; over=false;
  const k=kid(i);
  openS(`<h2>Tic-tac-toe</h2><div class="small">You're <b style="color:#c98c6e">X</b> · ${esc(k.name)} is <b style="color:${k.color}">O</b>. Pass the phone back and forth.</div>
    <div class="ttt">${board.map((_,n)=>`<button class="cell" onclick="move(${n})"></button>`).join('')}</div>
    <div class="turn" id="turn">You go first</div>
    <div class="small" style="text-align:center;margin-top:6px">${esc(k.name)} has won ${state.kids[i].gamesWon} game${state.kids[i].gamesWon===1?'':'s'}</div>
    <div class="btns" style="margin-top:14px"><button class="btn full light" onclick="openTTT(${i})">New game</button><button class="btn full" onclick="closeS()">Done</button></div>`);
}
function move(n){
  if(over||board[n]) return; board[n]=player; const k=kid(tttKid);
  const cell=document.querySelectorAll('.cell')[n]; cell.textContent=player; cell.style.color=player==='X'?'#c98c6e':k.color;
  if([[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].some(l=>l.every(j=>board[j]===player))){
    over=true; if(player==='O'){state.kids[tttKid].gamesWon++;save();turn.textContent=k.name+' wins! 🎉';} else turn.textContent='You win! Rematch?'; return;}
  if(board.every(Boolean)){over=true;turn.textContent="It's a tie. Rematch?";return;}
  player=player==='X'?'O':'X'; turn.textContent=player==='X'?'Your turn':k.name+"'s turn";
}

/* =========================== library =========================== */
let libSeg='learn', memKid=0;
function setSeg(s){libSeg=s;renderLibrary();}
function renderLibrary(){
  document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.seg===libSeg));
  let h='';
  if(libSeg==='learn') h=KP_LEARN.map(x=>`<div class="lcard"><b>${x.t}</b>${x.p?`<p>${x.p}</p>`:''}${x.list?`<ul>${x.list.map(l=>`<li>${l}</li>`).join('')}</ul>`:''}</div>`).join('');
  if(libSeg==='books'){
    h=`<div class="storycta" onclick="${state.kids.length?'startStory()':"toast('Add a child in Settings first')"}"><div><b>Make your own book together</b><span>Place pictures, draw freehand, and write the words with your kid. It saves to their memories.</span></div></div>
      <div class="label">known: parenting books</div><div class="game-list">`+
      KP_BOOKS.map(b=>`<div class="game" onclick="toast('Books coming soon')"><div><b>${b.t}</b><div class="small">Ages ${b.a}</div></div><span class="pill">Soon</span></div>`).join('')+'</div>';
  }
  if(libSeg==='memories'){
    if(!state.kids[memKid]) memKid=0;
    const k=kid(memKid); if(!k){libBody.innerHTML='<div class="small">Add a child in Settings to start saving memories.</div>';return;}
    const {answers,stories}=yearMemories(memKid), raw=state.kids[memKid], b18=calc(k.b);
    h=`<div class="chips">${state.kids.map((x,i)=>`<button class="${i===memKid?'on':''}" style="${i===memKid?`background:${x.color};border-color:${x.color}`:''}" onclick="memKid=${i};renderLibrary()">${esc(x.name)}</button>`).join('')}</div>
      <div class="lcard"><b>The Book of ${esc(k.name)}</b><p>${b18?`Growing every year. Ready on ${esc(k.name)}'s 18th birthday, ${b18.end.toLocaleDateString(undefined,{month:'long',year:'numeric'})}.`:'Ready to give. Every year you saved is inside.'}</p>
        <div class="small">${raw.memories.length} answers · ${raw.stories.length} ${raw.stories.length===1?'story':'stories'} · ${raw.gamesWon} games won</div></div>
      <div class="game" onclick="openRecap(${memKid})"><div><b>This year</b><div class="small">${answers.length} ${answers.length===1?'answer':'answers'}, ${stories.length} ${stories.length===1?'story':'stories'}</div></div><span class="chev">›</span></div>
      ${raw.stories.length?`<div class="label">Stories you made</div><div class="game-list">${raw.stories.map((s,n)=>`<div class="game" onclick="readStory(${memKid},${n})"><div><b>${esc(s.title)}</b><div class="small">${s.pages.length} pages</div></div><span class="chev">›</span></div>`).join('')}</div>`:''}
      <div class="label">In ${esc(k.name)}'s words</div>
      ${raw.memories.length?raw.memories.map((m,n)=>`<div class="mem"><i>${esc(m.q)}</i><p>“${esc(m.a)}”</p><span>${parse(m.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})} · ${ageText(m.months)} · <a href="#" onclick="delMemory(${memKid},${n});return false">delete</a></span></div>`).join(''):`<div class="small">Nothing saved yet. Draw a question on ${esc(k.name)}'s page and save the answer.</div>`}`;
  }
  if(libSeg==='resources'){
    h=`<div class="small" style="margin-bottom:10px">Books we love and recommend. Some links are affiliate links, which means Known may earn a small commission at no extra cost to you.</div>`+
      KP_RESOURCES.map(c=>`<div class="label">${c.cat}</div><div class="game-list">${c.items.map(r=>`<div class="game res" onclick="${r.url?`window.open('${r.url}','_blank')`:`toast('Store link coming soon')`}"><div><b>${r.t}</b><div class="small">${r.by} · ${r.a}</div><div class="small" style="margin-top:4px;color:var(--text)">${r.why}</div></div><span class="pill">Shop</span></div>`).join('')}</div>`).join('');
  }
  libBody.innerHTML=h;
}
function delMemory(i,n){ if(!confirm('Delete this memory?')) return; state.kids[i].memories.splice(n,1); save(); renderLibrary(); }

/* =========================== birthdays =========================== */
const BDAY_CHALLENGE=k=> !state.settings.faith ? (k.grown
    ? `Call ${k.name} today and tell them one thing you're proud of from this past year.`
    : `Tell ${k.name} your favorite memory from this past year, and one thing you're excited to see in them this year.`)
  : k.grown ? `Call ${k.name} today and tell them one thing you're proud of from this past year. Then pray for the year ahead.`
  : k.months<36 ? `Tonight, hold ${k.name}, tell them one favorite memory from this past year, and pray a blessing over the year ahead.`
  : `Tell ${k.name} your favorite memory from this past year, then ask: "What are you most excited about this year?" Pray over the year ahead together.`;
function celebrate(i,preview){
  const k=kid(i), yrs=k.isBday?k.years:k.years+1, r=calc(k.b);
  bArt.innerHTML=ART[k.art].svg(FULL);
  bTitle.innerHTML=`Happy ${ord(Math.max(1,yrs))} birthday,<br>${esc(k.name)}!`;
  bSub.textContent=k.grown?'Grown and gone, still known. Still yours.':r?`${fmt(r.days)} days at home to go. Make this year count.`:'';
  bChal.textContent=BDAY_CHALLENGE(k);
  bBtn.style.background=k.color;
  bMem.textContent=`See ${k.name}'s memories from this year`; bMem.onclick=()=>openRecap(i);
  const cols=[k.color,'#e2bc5e','#c98c6e','#8fa58b','#8aa3b8'];
  confetti.innerHTML=Array.from({length:60},(_,n)=>`<i style="left:${Math.random()*100}%;background:${cols[n%5]};animation-duration:${2.2+Math.random()*2.4}s;animation-delay:${Math.random()*1.2}s;transform:rotate(${Math.random()*180}deg)"></i>`).join('');
  bday.classList.remove('hidden');
  sun.classList.remove('partysun'); void sun.offsetWidth; sun.classList.add('partysun'); sunHat.style.display='';
}
function closeBday(quiet){ bday.classList.add('hidden'); if(!quiet) render(); }
function checkBirthdays(){
  const y=today().getFullYear();
  const k=state.kids.map((_,i)=>kid(i)).find(k=>k.isBday&&state.bdayShown[k.id]!==y);
  if(k){state.bdayShown[k.id]=y;save();celebrate(k.i);}
}

/* =========================== start =========================== */
function boot(){
  go(state.kids.length?'home':'onboard');
  // re-render when the day changes or the app comes back to the front
  const msToMidnight=()=>addDays(today(),1)-new Date()+1000;
  const tick=()=>{render(); setTimeout(tick,msToMidnight());}; setTimeout(tick,msToMidnight());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) render();});
  // offline support + automatic updates: when a new version is published, the page reloads itself once
  if('serviceWorker' in navigator && location.protocol.startsWith('http')){
    const hadController=!!navigator.serviceWorker.controller; let reloaded=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(hadController&&!reloaded){reloaded=true;location.reload();} });
    navigator.serviceWorker.register('sw.js').then(reg=>{
      document.addEventListener('visibilitychange',()=>{if(!document.hidden) reg.update().catch(()=>{});});
    }).catch(()=>{});
  }
}
boot();
