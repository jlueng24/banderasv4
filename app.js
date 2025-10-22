// app.js
/*
  Banderas — Quiz (pro v5)
  - Tema: renombrado y nuevos iconos
  - Arranque directo (sin pantalla de confirmación)
  - Responsive/táctil mejorado para móvil/tablet/desktop
  - Resto: modos, estudio, logros, PWA, accesibilidad, atajos
*/

// ===== Utilidades =====
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const randomInt = n => Math.floor(Math.random() * n);
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] } return arr; }
const todayStr = () => new Date().toISOString().slice(0,10);
function isoWeekStringLocal(d=new Date()){
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNum = (date.getDay() || 7);
  date.setDate(date.getDate() + 4 - dayNum);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  const y = date.getFullYear();
  return `${y}-W${String(weekNo).padStart(2,'0')}`;
}
function flagUrl(code){ return `https://flagcdn.com/w320/${code}.png`; }
function regionBadge(r){ return r||'Other'; }

// ===== Config =====
const LEVELS = {
  kids:   { label: "Niños",  time: 15, wrongPenalty: 0 },
  adult:  { label: "Adultos", time: 12, wrongPenalty: 0 },
  master: { label: "Máster", time: 8,  wrongPenalty: -5 },
};
const MAX_Q = 10;

// Supervivencia
const SURVIVAL_START = 20;
const SURVIVAL_BONUS = 2;

// ===== Capitales ES =====
const CAPITAL_ES = { "Algiers":"Argel","Oran":"Orán","Tunis":"Túnez","Cairo":"El Cairo","Khartoum":"Jartum","N'Djamena":"Yamena","Abuja":"Abuya","Accra":"Acra","Addis Ababa":"Addís Abeba","Asmara":"Asmara","Bamako":"Bamako","Bangui":"Bangui","Banjul":"Banjul","Bissau":"Bisáu","Conakry":"Conakri","Dakar":"Dakar","Freetown":"Freetown","Gaborone":"Gaborone","Harare":"Harare","Kampala":"Kampala","Kinshasa":"Kinsasa","Libreville":"Libreville","Lilongwe":"Lilongüe","Lomé":"Lomé","Luanda":"Luanda","Lusaka":"Lusaka","Malabo":"Malabo","Maputo":"Maputo","Maseru":"Maseru","Mbabane":"Mbabane","Mogadishu":"Mogadiscio","Monrovia":"Monrovia","Moroni":"Moroni","Nairobi":"Nairobi","Niamey":"Niamey","Nouakchott":"Nuakchot","Ouagadougou":"Uagadugú","Porto-Novo":"Portonovo","Praia":"Praia","Pretoria":"Pretoria","Rabat":"Rabat","Tripoli":"Trípoli","Torshavn":"Tórshavn","Victoria":"Victoria","Windhoek":"Windhoek","Yaoundé":"Yaundé","Yamoussoukro":"Yamusukro","Amsterdam":"Ámsterdam","Athens":"Atenas","Belgrade":"Belgrado","Berlin":"Berlín","Berne":"Berna","Bern":"Berna","Bratislava":"Bratislava","Brussels":"Bruselas","Bucharest":"Bucarest","Budapest":"Budapest","Chisinau":"Chisináu","Copenhagen":"Copenhague","Dublin":"Dublín","Helsinki":"Helsinki","Kyiv":"Kiev","Kiev":"Kiev","Lisbon":"Lisboa","Ljubljana":"Liubliana","London":"Londres","Luxembourg":"Luxemburgo","Madrid":"Madrid","Minsk":"Minsk","Monaco":"Mónaco","Moscow":"Moscú","Nicosia":"Nicosia","Oslo":"Oslo","Paris":"París","Podgorica":"Podgorica","Prague":"Praga","Reykjavik":"Reikiavik","Riga":"Riga","Rome":"Roma","San Marino":"San Marino","Sarajevo":"Sarajevo","Skopje":"Skopie","Sofia":"Sofía","Stockholm":"Estocolmo","Tallinn":"Tallin","Tirana":"Tirana","Vaduz":"Vaduz","Valletta":"La Valeta","Vatican City":"Ciudad del Vaticano","Vienna":"Viena","Vilnius":"Vilna","Warsaw":"Varsovia","Zagreb":"Zagreb","Abu Dhabi":"Abu Dabi","Amman":"Amán","Ankara":"Ankara","Astana":"Astaná","Baghdad":"Bagdad","Baku":"Bakú","Beijing":"Pekín","Peking":"Pekín","Beirut":"Beirut","Damascus":"Damasco","Dhaka":"Daca","Doha":"Doha","Hanoi":"Hanói","Islamabad":"Islamabad","Jakarta":"Yakarta","Jerusalem":"Jerusalén","Kabul":"Kabul","Kathmandu":"Katmandú","Kuala Lumpur":"Kuala Lumpur","Manila":"Manila","Muscat":"Mascate","New Delhi":"Nueva Delhi","Nur-Sultan":"Astaná","Phnom Penh":"Nom Pen","Riyadh":"Riad","Seoul":"Seúl","Singapore":"Singapur","Sri Jayawardenepura Kotte":"Sri Jayawardenapura Kotte","Taipei":"Taipéi","Tashkent":"Taskent","Tehran":"Teherán","Thimphu":"Timbu","Tokyo":"Tokio","Ulaanbaatar":"Ulán Bator","Vientiane":"Vientián","Sanaa":"Saná","Canberra":"Canberra","Suva":"Suva","Wellington":"Wellington","Port Moresby":"Port Moresby","Apia":"Apia","Nukuʻalofa":"Nukualofa","Nuku'alofa":"Nukualofa","Honiara":"Honiara","Funafuti":"Funafuti","Buenos Aires":"Buenos Aires","Asuncion":"Asunción","Asunción":"Asunción","Bogotá":"Bogotá","Brasília":"Brasilia","Brasilia":"Brasilia","Caracas":"Caracas","Georgetown":"Georgetown","Lima":"Lima","La Paz":"La Paz","Sucre":"Sucre","Montevideo":"Montevideo","Paramaribo":"Paramaribo","Quito":"Quito","Santiago":"Santiago","Belmopan":"Belmopán","Guatemala City":"Ciudad de Guatemala","Havana":"La Habana","Kingston":"Kingston","Managua":"Managua","Mexico City":"Ciudad de México","Panama City":"Ciudad de Panamá","Port-au-Prince":"Puerto Príncipe","Port of Spain":"Puerto España","San Jose":"San José","San José":"San José","Santo Domingo":"Santo Domingo","Ottawa":"Ottawa","Washington, D.C.":"Washington D. C.","Saint John's":"Saint John’s","St. John's":"Saint John’s","Nassau":"Nassau","Bridgetown":"Bridgetown","Kuwait City":"Kuwait","Manama":"Manama","Sanaa":"Saná","Majuro":"Majuro","Melekeok":"Melekeok","Ngerulmud":"Ngerulmud","Palikir":"Palikir","Tarawa":"Tarawa" };
const toSpanishCapital = cap => cap ? (CAPITAL_ES[cap] || cap) : "";

// ===== Estado =====
let ALL = []; // {code, nameES, capitalES, region, population}
let playerName = "";
let currentMode = null;       // flags | capitals | mixed | survival | study | daily
let currentLevel = 'adult';
let currentTheme = 'all';     // all | Europe | Africa | Asia | Americas | Oceania
let optionsPool = [];
let order = [];
let idx = 0;
let score = 0, hits = 0, misses = 0;
let locked = false;
let paused = false;
let timeLeft = 0, timeInterval = null, nextTimer = null;
let qActiveStartMs = 0, qAccumulatedMs = 0;
let timesMs = [];
let missMap = {};
let streak = 0;
let muteFx = false;
let studyQueue = [];

// ===== LocalStorage =====
const LS = {
  name:'pro_player_name',
  scores:'pro_scores',
  stats:'pro_stats',
  challenge:'pro_challenges',
  last:'pro_last_sel',
  mute:'pro_mute',
  achievements:'pro_achievements'
};

// ===== Audio =====
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();
function playTone(f=440,d=0.12,type='sine',vol=0.2){
  if (muteFx) return;
  const o=audioCtx.createOscillator(); const g=audioCtx.createGain();
  o.type=type; o.frequency.value=f; g.gain.value=vol;
  o.connect(g).connect(audioCtx.destination); o.start();
  setTimeout(()=>{ g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+0.05); o.stop(audioCtx.currentTime+0.06); }, d*1000);
}
function fxCorrect(){ let t=0; [{f:523,d:0.07},{f:659,d:0.07},{f:784,d:0.09}].forEach(n=>{ setTimeout(()=>playTone(n.f,n.d,'square',0.12), t); t+=n.d*1000*0.9; }); }
function fxWrong(){ const s=260,e=140,steps=6,ms=50; for(let i=0;i<steps;i++){ const f=s+(e-s)*(i/(steps-1)); setTimeout(()=>playTone(f, ms/1000,'sawtooth',0.12), i*ms); } }
function fxStreak(){ let t=0; [660,880,990,1180].forEach((f)=>{ setTimeout(()=>playTone(f,0.06,'triangle',0.13), t); t+=60; }); }

// ===== Storage helpers =====
function lsGet(k, def){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):def; }catch{ return def; } }
function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} }

// ===== Carga datos =====
async function loadData(){
  try{
    const [resNames, resAll] = await Promise.all([
      fetch("https://flagcdn.com/es/codes.json"),
      fetch("https://restcountries.com/v3.1/all?fields=name,cca2,capital,region,population,translations")
    ]);
    const namesES = await resNames.json();
    const all = await resAll.json();
    ALL = all.map(c=>{
      const code = (c.cca2||"").toLowerCase();
      const nameES = (c.translations?.spa?.common) || namesES[code] || (c.name?.common||"");
      const capIn = Array.isArray(c.capital) && c.capital.length ? c.capital[0] : "";
      const capitalES = toSpanishCapital(capIn);
      const region = c.region || "Other";
      const population = c.population || 0;
      return { code, nameES, capitalES, region, population };
    }).filter(x=>x.code && x.nameES);
  }catch{
    ALL = [
      {code:"es",nameES:"España",capitalES:"Madrid",region:"Europe",population:47000000},
      {code:"fr",nameES:"Francia",capitalES:"París",region:"Europe",population:65000000},
      {code:"de",nameES:"Alemania",capitalES:"Berlín",region:"Europe",population:83000000},
      {code:"br",nameES:"Brasil",capitalES:"Brasilia",region:"Americas",population:210000000},
      {code:"us",nameES:"Estados Unidos",capitalES:"Washington D. C.",region:"Americas",population:330000000},
      {code:"jp",nameES:"Japón",capitalES:"Tokio",region:"Asia",population:126000000},
      {code:"za",nameES:"Sudáfrica",capitalES:"Pretoria",region:"Africa",population:58000000},
      {code:"au",nameES:"Australia",capitalES:"Canberra",region:"Oceania",population:25000000}
    ];
  }
}

// ===== UI refs =====
const ui = {
  playerInput: $('#playerName'),
  goToMode: $('#goToMode'),
  backToPlayer: $('#backToPlayer'),
  startGame: $('#startGame'),

  selMode: $('#selMode'),
  selTheme: $('#selTheme'),
  selLevel: $('#selLevel'),

  hudPlayer: $('#hudPlayer'),
  hudMode: $('#hudMode'),
  hudTheme: $('#hudTheme'),

  qNumber: $('#qNumber'),
  qTotal: $('#qTotal'),
  points: $('#points'),
  hits: $('#hits'),
  misses: $('#misses'),
  progressBar: $('#progressBar'),
  timeLeft: $('#timeLeft'),
  timeBar: $('#timeBar'),

  flagImg: $('#flagImg'),
  capitalName: $('#capitalName'),
  flagImgReveal: $('#flagImgReveal'),
  countryReveal: $('#countryReveal'),

  whyFlag: $('#whyBoxFlag'),
  whyCap: $('#whyBoxCap'),

  finalPoints: $('#finalPoints'),
  finalHits: $('#finalHits'),
  finalMisses: $('#finalMisses'),
  achievementsList: $('#achievementsList'),
};

// ===== Pantallas =====
const screens = {
  player: $('#screen-player'),
  mode: $('#screen-mode'),
  game: $('#screen-game'),
  final: $('#finalCard'),
};
function showScreen(name){
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  if (name==='mode') updateDailyTile();
}

// ===== Mute persistente =====
(function initMute(){
  muteFx = lsGet(LS.mute, false);
  const btn = $('#btnMute');
  if (btn){
    btn.setAttribute('aria-pressed', String(muteFx));
    btn.textContent = muteFx ? '🔇' : '🔊';
    btn.addEventListener('click', ()=>{
      muteFx = !muteFx;
      lsSet(LS.mute, muteFx);
      btn.setAttribute('aria-pressed', String(muteFx));
      btn.textContent = muteFx ? '🔇' : '🔊';
    });
  }
})();

// ===== Liga / Stats =====
function recordGameToLeague({name, score, mode, level, theme, durationMs}){
  const arr = lsGet(LS.scores, []);
  arr.unshift({name, score, mode, level, theme, dateISO:new Date().toISOString(), week: isoWeekStringLocal(), durationMs});
  while(arr.length>300) arr.pop();
  lsSet(LS.scores, arr);
}
function updateGlobalStatsFromRun(){
  const st = lsGet(LS.stats, { times:{count:0,sumMs:0,maxMs:0,minMs:0}, countries:{} });
  for(const ms of timesMs){
    st.times.count += 1;
    st.times.sumMs += ms;
    st.times.maxMs = Math.max(st.times.maxMs||0, ms);
    st.times.minMs = st.times.minMs? Math.min(st.times.minMs, ms) : ms;
  }
  for(const code in missMap){
    const m = missMap[code];
    if(!st.countries[code]) st.countries[code] = {name:m.name, attempts:0, wrong:0};
    st.countries[code].attempts += m.attempts;
    st.countries[code].wrong += m.wrong;
  }
  lsSet(LS.stats, st);
}

// ===== Achievements =====
const ACH = {
  streak3: {id:'streak3', name:'Racha 3', desc:'Consigue 3 aciertos seguidos'},
  streak5: {id:'streak5', name:'Racha 5', desc:'Consigue 5 aciertos seguidos'},
  survival60: {id:'survival60', name:'Supervivencia 60s', desc:'Aguanta 60s en Supervivencia'},
  europePerfect: {id:'euPerfect', name:'Europa sin fallos', desc:'Acaba Europa sin fallos'},
  study10: {id:'study10', name:'Estudio aplicado', desc:'Resuelve 10 en Estudio'}
};
function getAchievements(){ return lsGet(LS.achievements, {}); }
function unlockAchievement(key){
  const all = getAchievements();
  if (all[key]) return;
  all[key] = { date: new Date().toISOString(), ...ACH[key] };
  lsSet(LS.achievements, all);
}
function listAchievements(){ return Object.values(getAchievements()); }

// ===== UI: Liga =====
function renderLeague(){
  const week = isoWeekStringLocal();
  $('#leagueWeek').textContent = week;
  $('#leagueName').value = playerName;
  const arr = lsGet(LS.scores, []);
  const thisWeek = arr.filter(x=>x.week===week);
  const bestByPlayer = {};
  thisWeek.forEach(s=>{ if(!bestByPlayer[s.name] || s.score>bestByPlayer[s.name].score){ bestByPlayer[s.name] = s; } });
  const rows = Object.values(bestByPlayer).sort((a,b)=> b.score - a.score).slice(0,20);
  const html = rows.length ? `
    <table class="min-w-full text-sm">
      <thead><tr class="text-left text-slate-500">
        <th class="py-2 pr-3">#</th><th class="py-2 pr-3">Jugador</th><th class="py-2 pr-3">Puntos</th>
        <th class="py-2 pr-3">Modo</th><th class="py-2 pr-3">Tema</th><th class="py-2 pr-3">Dificultad</th><th class="py-2 pr-3">Fecha</th>
      </tr></thead>
      <tbody>
        ${rows.map((r,i)=>`
          <tr class="border-t">
            <td class="py-2 pr-3 font-semibold">${i+1}</td>
            <td class="py-2 pr-3">${r.name}</td>
            <td class="py-2 pr-3">${r.score}</td>
            <td class="py-2 pr-3">${r.mode}</td>
            <td class="py-2 pr-3">${r.theme}</td>
            <td class="py-2 pr-3">${LEVELS[r.level]?.label||r.level}</td>
            <td class="py-2 pr-3">${new Date(r.dateISO).toLocaleString('es-ES',{dateStyle:'short', timeStyle:'short'})}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>` : `<div class="text-slate-500 text-sm">Aún no hay partidas esta semana.</div>`;
  $('#leagueTable').innerHTML = html;
}

// ===== UI: Stats =====
function renderStats(tab='overview'){
  const st = lsGet(LS.stats, { times:{count:0,sumMs:0,maxMs:0,minMs:0}, countries:{} });
  const content = $('#statsContent');
  const avg = st.times.count? (st.times.sumMs/st.times.count) : 0;

  if(tab==='overview'){
    content.innerHTML = `
      <div class="grid sm:grid-cols-3 gap-3">
        <div class="p-4 rounded-xl border bg-slate-50/60">
          <div class="text-xs text-slate-500">Preguntas</div>
          <div class="text-2xl font-black">${st.times.count||0}</div>
        </div>
        <div class="p-4 rounded-xl border bg-slate-50/60">
          <div class="text-xs text-slate-500">Tiempo medio</div>
          <div class="text-2xl font-black">${avg? (avg/1000).toFixed(2) : '—'} s</div>
        </div>
        <div class="p-4 rounded-xl border bg-slate-50/60">
          <div class="text-xs text-slate-500">Rango</div>
          <div class="text-2xl font-black">${st.times.minMs? (st.times.minMs/1000).toFixed(2):'—'}s / ${st.times.maxMs? (st.times.maxMs/1000).toFixed(2):'—'}s</div>
        </div>
      </div>`;
  }
  if(tab==='mistakes'){
    const entries = Object.entries(st.countries||{}).map(([code, v])=>({code, ...v, rate: v.wrong/(v.attempts||1)}))
      .filter(x=>x.attempts>=1).sort((a,b)=>b.rate-a.rate).slice(0,15);
    content.innerHTML = `
      <div class="text-sm text-slate-600 mb-2">Top países con mayor tasa de error</div>
      <table class="min-w-full text-sm">
        <thead><tr class="text-left text-slate-500"><th class="py-2 pr-3">País</th><th class="py-2 pr-3">Fallos</th><th class="py-2 pr-3">Intentos</th><th class="py-2 pr-3">Tasa</th></tr></thead>
        <tbody>
          ${entries.map(r=>`
            <tr class="border-t">
              <td class="py-2 pr-3 flex items-center gap-2"><img src="${flagUrl(r.code)}" class="w-6 h-4 rounded border" alt="" /><span>${r.name}</span></td>
              <td class="py-2 pr-3">${r.wrong}</td><td class="py-2 pr-3">${r.attempts}</td><td class="py-2 pr-3">${(r.rate*100).toFixed(0)}%</td>
            </tr>`).join('')}
        </tbody>
      </table>
      ${entries.length? '' : '<div class="text-slate-500 text-sm mt-2">Aún no hay suficientes datos.</div>'}
    `;
  }
  if(tab==='times'){
    content.innerHTML = `
      <div class="text-sm text-slate-600 mb-2">Tiempos de esta sesión</div>
      <div class="flex flex-wrap gap-2">
        ${timesMs.map((ms,i)=>`<span class="px-2 py-1 rounded-lg bg-slate-100 border text-xs">${i+1}: ${(ms/1000).toFixed(2)}s</span>`).join('') || '<div class="text-slate-500 text-sm">Juega una partida para ver tiempos.</div>'}
      </div>`;
  }
  if(tab==='achievements'){
    const ach = listAchievements();
    content.innerHTML = ach.length ? `
      <div class="flex flex-wrap gap-2">
        ${ach.map(a=>`<span class="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold" title="${a.desc}">🏅 ${a.name}</span>`).join('')}
      </div>
    ` : `<div class="text-slate-500 text-sm">Aún no hay logros. ¡A por ellos!</div>`;
  }
}

// ===== Daily challenge =====
function dailySeedIndex(max){
  const d = todayStr().replaceAll('-','');
  let h = 0; for(let i=0;i<d.length;i++){ h = (h*31 + d.charCodeAt(i)) % 2147483647; }
  return h % max;
}
function pickVeryHardSet(){
  const hardCodes = ["nr","tv","ws","to","ki","fm","mh","sb","pw","gd","ag","lc","vc","kn","bb","bz","gy","sr","gw","gn","ga","gq","bj","ne","td","cg","cd","bi","rw","er","dj","km","cv","st","bt","tm","kg","tj","la","bn","mm","af","ye","om","qa","bh","kw","mc","li","ad","sm","va","fo","ax"];
  const hardPool = ALL.filter(x=>hardCodes.includes(x.code));
  if(hardPool.length<4) return shuffle([...ALL]).slice(0,4);
  return shuffle(hardPool).slice(0,4);
}
function makeDailyQuestion(){
  const options = pickVeryHardSet();
  const idxSeed = dailySeedIndex(options.length);
  const correct = options[idxSeed];
  const useCapital = correct.capitalES && (idxSeed % 2 === 0);
  const mixed = shuffle([...options]);
  return { kind: useCapital?'capital':'flag', correct, options: mixed };
}
function updateDailyTile(){
  const challenges = lsGet(LS.challenge, {});
  const done = challenges[todayStr()];
  const tile = $("#tile-daily");
  if (tile) tile.style.display = done ? 'none' : '';
}
function obfuscateText(txt){
  const chars = txt.split(''); let letters = [];
  for(let i=0;i<chars.length;i++){ if(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(chars[i])) letters.push(i); }
  if(letters.length<=2) return txt;
  const hideCount = Math.max(2, Math.floor(letters.length*0.4));
  shuffle(letters); const toHide = new Set(letters.slice(0, hideCount));
  return chars.map((ch,i)=> toHide.has(i) ? ' _ ' : ch).join('');
}
function renderDailyModal(){
  const challenges = lsGet(LS.challenge, {});
  const done = challenges[todayStr()];
  const container = $("#dailyQuestion");
  $("#dailyPrize").classList.add("hidden");
  $("#dailyEmoji").textContent = "⭐";

  if(done){
    container.innerHTML = `<div class="p-4 rounded-xl border bg-emerald-50 text-sm">Ya hiciste el reto de hoy (${todayStr()}). Resultado: <strong>${done.correct? '✅ correcto' : '❌ incorrecto'}</strong>.</div>`;
    return;
  }
  const q = makeDailyQuestion();
  let html = "";
  if(q.kind==='flag'){
    html += `
      <div class="mb-3 text-sm text-slate-700">¿De qué país es esta bandera?</div>
      <div class="w-full max-h-64 overflow-hidden rounded-xl border bg-white mb-3 grid place-items-center p-2">
        <img src="${flagUrl(q.correct.code)}" class="max-h-60 w-auto object-contain" style="filter: blur(2px);" alt="Bandera (difuminada)" />
      </div>`;
  } else {
    const obsc = obfuscateText(q.correct.capitalES);
    html += `<div class="mb-3 text-sm text-slate-700">¿De qué país es la capital <strong>${obsc}</strong>?</div>`;
  }
  html += `<div class="grid grid-cols-1 gap-2">`;
  q.options.forEach((opt,i)=>{ html += `<button class="dailyOpt px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border text-left font-semibold" data-code="${opt.code}">${i+1}) ${opt.nameES}</button>`; });
  html += `</div>`;
  container.innerHTML = html;

  $$(".dailyOpt").forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const chosenCode = btn.dataset.code;
      const correct = (chosenCode === q.correct.code);
      const challenges = lsGet(LS.challenge, {});
      challenges[todayStr()] = { name: playerName||'Anónimo', correct, score: correct? 10: 0 };
      lsSet(LS.challenge, challenges);

      $$(".dailyOpt").forEach((b)=>{
        b.classList.remove("bg-slate-50","hover:bg-slate-50","border");
        const isCorrect = b.dataset.code === q.correct.code;
        b.classList.add("border");
        if(isCorrect){ b.classList.add("bg-emerald-50","border-emerald-300"); }
        else if (b === btn){ b.classList.add("bg-rose-50","border-rose-300"); }
        else { b.classList.add("bg-slate-50","border-slate-200"); }
        b.disabled = true;
      });

      $("#dailyPrize").classList.remove("hidden");
      $("#dailyEmoji").textContent = correct ? "⭐" : "💤";
      if(correct){ fxCorrect(); } else { fxWrong(); }
      updateDailyTile();
    });
  });
}

// ===== Tiempo y pausa =====
function startTimer(tRemain){
  clearInterval(timeInterval);
  const total = (typeof tRemain === 'number') ? tRemain : LEVELS[currentLevel].time;
  timeLeft = total;
  ui.timeLeft.textContent = Math.ceil(timeLeft);
  ui.timeBar.style.width = "100%";
  qActiveStartMs = Date.now();
  paused = false;

  timeInterval = setInterval(()=>{
    const elapsed = (Date.now()-qActiveStartMs)/1000;
    const remain = Math.max(0, total - elapsed);
    timeLeft = remain;
    ui.timeLeft.textContent = Math.ceil(remain);
    ui.timeBar.style.width = Math.max(0,(remain/LEVELS[currentLevel].time)*100) + "%";
    if (remain <= 0){
      clearInterval(timeInterval);
      handleTimeout();
    }
  }, 100);
}
function stopTimer(){ clearInterval(timeInterval); }
function pauseGame(){
  if (paused) return;
  paused = true;
  qAccumulatedMs += (Date.now() - qActiveStartMs);
  stopTimer();
  disableAnswers(true);
  $("#pauseModal")?.showModal();
}
function resumeGame(){
  if (!paused) return;
  paused = false;
  qActiveStartMs = Date.now();
  startTimer(timeLeft);
  disableAnswers(false);
  $("#pauseModal")?.close();
}
function disableAnswers(disabled){
  $$("#card-flag .answer-btn").forEach(b=> b.disabled = disabled);
  $$("#card-capital .answer-btn.cap").forEach(b=> b.disabled = disabled);
}

// ===== Juego =====
function applyThemePool(){
  if (currentTheme==='all') return [...ALL];
  return ALL.filter(x=>x.region===currentTheme);
}
function pickOptions(correct, pool, n=4){
  const others = pool.filter(x=>x.code!==correct.code);
  shuffle(others);
  const fill = others.slice(0, Math.max(0, n-1));
  while (fill.length < n-1 && ALL.length){
    const cand = ALL[randomInt(ALL.length)];
    if (cand && cand.code!==correct.code && !fill.some(o=>o.code===cand.code)) fill.push(cand);
  }
  return shuffle([correct, ...fill]);
}

function modeLabel(m){
  return m==='flags'?'Banderas':m==='capitals'?'Capitales':m==='mixed'?'Mixto':m==='survival'?'Supervivencia':m==='study'?'Estudio':m;
}

function newGame(){
  const base = applyThemePool();
  optionsPool = base.length ? base : [...ALL];
  shuffle(optionsPool);

  order = [];
  const withCapital = optionsPool.filter(x=>x.capitalES && x.capitalES.trim().length);

  if (currentMode==='study'){
    ui.qTotal.textContent = '/∞';
  } else if (currentMode==='survival'){
    ui.qTotal.textContent = '';
  } else {
    ui.qTotal.textContent = '/'+MAX_Q;
  }

  const count = MAX_Q;
  for (let i=0; i<count; i++){
    if (currentMode === 'flags')      order.push({ kind:'flag',    item: optionsPool[i % optionsPool.length] });
    else if (currentMode === 'capitals') order.push({ kind:'capital', item: withCapital[i % withCapital.length] || optionsPool[i % optionsPool.length] });
    else { // mixed / survival / study
      const kind = (withCapital.length && Math.random()<0.5) ? 'capital' : 'flag';
      const baseK = (kind==='capital') ? (withCapital.length?withCapital:optionsPool) : optionsPool;
      order.push({ kind, item: baseK[i % baseK.length] });
    }
  }

  idx = 0; score = 0; hits = 0; misses = 0; locked = false;
  timesMs = []; missMap = {}; streak = 0; studyQueue = [];
  qAccumulatedMs = 0; paused = false;

  ui.points.textContent = score; ui.hits.textContent = hits; ui.misses.textContent = misses;
  ui.qNumber.textContent = 1; ui.progressBar.style.width = "0%";
  ui.hudPlayer.textContent = playerName || 'Anónimo';
  ui.hudMode.textContent = modeLabel(currentMode);
  ui.hudTheme.textContent = (currentTheme==='all'?'Todo':currentTheme);

  lsSet(LS.last, { mode: currentMode, level: currentLevel, theme: currentTheme });

  showScreen('game');
  renderQuestion();
}

function renderQuestion(){
  const q = order[idx];
  ui.whyFlag.textContent = ''; ui.whyCap.textContent = '';
  qAccumulatedMs = 0;

  if (q.kind === 'flag'){
    $("#card-flag").classList.remove('hidden');
    $("#card-capital").classList.add('hidden');
    ui.flagImg.src = flagUrl(q.item.code);
    ui.flagImg.alt = `Bandera de ${q.item.nameES}`;

    const opts = pickOptions(q.item, optionsPool, 4);
    $$("#card-flag .answer-btn").forEach((btn,i)=>{
      btn.textContent = opts[i].nameES;
      btn.dataset.correct = (opts[i].code===q.item.code) ? '1' : '0';
      btn.disabled = false;
      btn.className = "answer-btn px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border text-left font-semibold";
    });
  } else {
    $("#card-flag").classList.add('hidden');
    $("#card-capital").classList.remove('hidden');
    ui.capitalName.textContent = q.item.capitalES || "—";
    ui.flagImgReveal.src = flagUrl(q.item.code);
    ui.countryReveal.textContent = `Es ${q.item.nameES}`;
    const base = optionsPool.filter(x=>x.capitalES && x.capitalES.trim().length);
    const opts = pickOptions(q.item, base.length?base:optionsPool, 4);
    $$("#card-capital .answer-btn.cap").forEach((btn,i)=>{
      btn.textContent = opts[i].nameES;
      btn.dataset.correct = (opts[i].code===q.item.code) ? '1' : '0';
      btn.disabled = false;
      btn.className = "answer-btn cap px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border text-left font-semibold";
    });
    ui.flagImgReveal.classList.add('hidden');
    ui.countryReveal.classList.add('hidden');
  }

  locked = false;
  ui.qNumber.textContent = (currentMode==='study' ? (idx+1+studyQueue.length) : (idx+1));
  if (currentMode==='study'){
    $('#timeBar').style.width = '0%';
    ui.timeLeft.textContent = '∞';
  } else if (currentMode==='survival'){
    if (idx===0){ timeLeft = SURVIVAL_START; startSurvivalTimer(); }
  } else {
    startTimer();
  }
}

function markButtons(buttons, targetBtn){
  buttons.forEach(btn=>{
    const isCorrect = btn.dataset.correct === "1";
    btn.classList.remove("bg-slate-50","border-slate-200");
    if (btn === targetBtn){
      if (isCorrect) btn.classList.add("bg-emerald-50","border","border-emerald-300");
      else btn.classList.add("bg-rose-50","border","border-rose-300");
    } else if (isCorrect){ btn.classList.add("bg-emerald-50","border","border-emerald-300"); }
    else { btn.classList.add("bg-slate-50","border","border-slate-200"); }
    btn.disabled = true;
  });
}

function whyText(country){
  const pop = country.population ? ` · Población aprox.: ${(country.population/1e6).toFixed(1)}M` : '';
  return `${country.nameES} — Región: ${regionBadge(country.region)}${pop}`;
}

function onSelect(e){
  if (locked || paused) return;
  locked = true;
  if (currentMode!=='study') { qAccumulatedMs += (Date.now() - qActiveStartMs); stopTimer(); }

  const btn = e.currentTarget;
  const correct = btn.dataset.correct === "1";
  const q = order[idx];

  if(!missMap[q.item.code]) missMap[q.item.code] = {name: q.item.nameES, attempts:0, wrong:0};
  missMap[q.item.code].attempts += 1;

  if (q.kind === 'flag'){
    if (correct){ score += 10; hits += 1; streak += 1; fxCorrect(); ui.whyFlag.textContent = whyText(q.item); }
    else { misses += 1; streak = 0; missMap[q.item.code].wrong += 1; if (currentMode!=='study' && LEVELS[currentLevel].wrongPenalty<0) score = Math.max(0, score + LEVELS[currentLevel].wrongPenalty); fxWrong(); if(currentMode==='study'){ studyQueue.push({ ...q }); } }
    ui.points.textContent = score; ui.hits.textContent = hits; ui.misses.textContent = misses;
    markButtons($$("#card-flag .answer-btn"), btn);
  } else {
    if (correct){ score += 10; hits += 1; streak += 1; fxCorrect(); ui.flagImgReveal.classList.remove('hidden'); ui.countryReveal.classList.remove('hidden'); ui.whyCap.textContent = whyText(q.item); }
    else { misses += 1; streak = 0; missMap[q.item.code].wrong += 1; if (currentMode!=='study' && LEVELS[currentLevel].wrongPenalty<0) score = Math.max(0, score + LEVELS[currentLevel].wrongPenalty); fxWrong(); ui.flagImgReveal.classList.remove('hidden'); ui.countryReveal.classList.remove('hidden'); if(currentMode==='study'){ studyQueue.push({ ...q }); } }
    ui.points.textContent = score; ui.hits.textContent = hits; ui.misses.textContent = misses;
    markButtons($$("#card-capital .answer-btn.cap"), btn);
  }

  if (streak===3) unlockAchievement('streak3');
  if (streak===5) { unlockAchievement('streak5'); fxStreak(); }

  if (currentMode==='survival'){
    if (!correct){
      endGame(true);
      return;
    } else {
      timeLeft += SURVIVAL_BONUS;
    }
  }

  if (currentMode!=='study') timesMs.push(qAccumulatedMs);
  advanceProgress();
  scheduleNext();
}

function handleTimeout(){
  if (locked) return;
  locked = true;
  qAccumulatedMs += (Date.now() - qActiveStartMs);
  timesMs.push(qAccumulatedMs);
  const q = order[idx];

  if(!missMap[q.item.code]) missMap[q.item.code] = {name: q.item.nameES, attempts:0, wrong:0};
  missMap[q.item.code].attempts += 1;
  missMap[q.item.code].wrong += 1;

  if (currentMode==='survival'){
    fxWrong();
    endGame(true);
    return;
  }

  const { wrongPenalty } = LEVELS[currentLevel];
  if (wrongPenalty < 0) score = Math.max(0, score + wrongPenalty);
  misses += 1; streak = 0;
  ui.points.textContent = score; ui.misses.textContent = misses;

  if (q.kind === 'flag'){
    markButtons($$("#card-flag .answer-btn"), null);
    ui.whyFlag.textContent = whyText(q.item);
  } else {
    ui.flagImgReveal.classList.remove('hidden'); ui.countryReveal.classList.remove('hidden');
    markButtons($$("#card-capital .answer-btn.cap"), null);
    ui.whyCap.textContent = whyText(q.item);
  }
  fxWrong();
  advanceProgress();
  scheduleNext();
}

function advanceProgress(){
  if (currentMode==='survival') {
    const pct = Math.min(100, ((idx + 1) / MAX_Q) * 100);
    ui.progressBar.style.width = pct + '%';
  } else if (currentMode==='study'){
    ui.progressBar.style.width = '0%';
  } else {
    ui.progressBar.style.width = (((idx + 1) / MAX_Q) * 100) + "%";
  }
}
function scheduleNext(){ if(nextTimer){ clearTimeout(nextTimer); } nextTimer = setTimeout(nextQuestion, 700); }
function nextQuestion(){
  if (currentMode==='study'){
    if (idx < order.length - 1){
      idx++;
    } else if (studyQueue.length){
      order.push(studyQueue.shift());
      idx++;
    } else {
      endGame(false);
      return;
    }
    renderQuestion();
    return;
  }

  if (idx < MAX_Q - 1){
    idx++;
    renderQuestion();
  } else {
    endGame(false);
  }
}

let survivalInterval = null;
let timeSurvivedSec = 0;
function startSurvivalTimer(){
  stopSurvivalTimer();
  ui.timeLeft.textContent = Math.ceil(timeLeft);
  ui.timeBar.style.width = "100%";
  qActiveStartMs = Date.now();
  timeSurvivedSec = 0;
  survivalInterval = setInterval(()=>{
    timeLeft = Math.max(0, timeLeft - 0.1);
    timeSurvivedSec += 0.1;
    ui.timeLeft.textContent = Math.ceil(timeLeft);
    ui.timeBar.style.width = Math.max(0, (timeLeft / SURVIVAL_START) * 100) + "%";
    if (timeLeft<=0){
      fxWrong();
      endGame(true);
    }
  }, 100);
}
function stopSurvivalTimer(){ if (survivalInterval) { clearInterval(survivalInterval); survivalInterval=null; } }

function endGame(fromSurvival){
  stopTimer(); stopSurvivalTimer(); if(nextTimer){ clearTimeout(nextTimer); nextTimer=null; }
  ui.finalPoints.textContent = score;
  ui.finalHits.textContent = hits;
  ui.finalMisses.textContent = misses;

  if (currentMode==='survival' && timeSurvivedSec>=60) unlockAchievement('survival60');
  if (currentTheme==='Europe' && misses===0) unlockAchievement('europePerfect');
  if (currentMode==='study' && (hits>=10)) unlockAchievement('study10');

  const ach = listAchievements();
  ui.achievementsList.innerHTML = ach.length ? ach.map(a=>`<span class="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold" title="${a.desc}">🏅 ${a.name}</span>`).join('') : `<span class="text-slate-500 text-sm">Sin logros aún.</span>`;

  showScreen('final');

  const durationMs = timesMs.reduce((a,b)=>a+b,0);
  recordGameToLeague({name: playerName||'Anónimo', score, mode: modeLabel(currentMode), level: currentLevel, theme: currentTheme, durationMs});
  updateGlobalStatsFromRun();
}

// ===== Eventos =====
ui.goToMode.addEventListener('click', ()=>{
  playerName = ui.playerInput.value.trim() || 'Anónimo';
  lsSet(LS.name, playerName);
  showScreen('mode');
});
$('#backToPlayer').addEventListener('click', ()=> showScreen('player'));

// Selecciones
$$('.mode-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    const m = b.dataset.mode;
    if (m==='daily'){ renderDailyModal(); $("#dailyModal").showModal(); return; }
    currentMode = m;
    $$('.mode-btn').forEach(x=>x.classList.remove('ring-2','ring-sky-400'));
    b.classList.add('ring-2','ring-sky-400');
    ui.selMode.textContent = modeLabel(currentMode);
  });
});
$$('.theme-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    currentTheme = b.dataset.theme;
    $$('.theme-btn').forEach(x=>x.classList.remove('ring-2','ring-emerald-400'));
    b.classList.add('ring-2','ring-emerald-400');
    ui.selTheme.textContent = currentTheme==='all'?'Todo':currentTheme;
  });
});
$$('.level-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    currentLevel = b.dataset.level;
    $$('.level-btn').forEach(x=>x.classList.remove('ring-2','ring-amber-400'));
    b.classList.add('ring-2','ring-amber-400');
    ui.selLevel.textContent = LEVELS[currentLevel]?.label || '—';
  });
});

// Jugar directo (sin pantalla de confirmación)
ui.startGame.addEventListener('click', ()=>{
  if (!currentMode || currentMode==='daily'){ alert('Elige un modo (excepto Reto del día)'); return; }
  if (!currentTheme){ alert('Elige un tema'); return; }
  if (!currentLevel && currentMode!=='survival' && currentMode!=='study'){ alert('Elige dificultad'); return; }
  try{ audioCtx.resume(); }catch{}
  newGame();
});

// Juego controls
$('#restartBtn').addEventListener('click', ()=>{ stopTimer(); stopSurvivalTimer(); if(nextTimer){ clearTimeout(nextTimer); nextTimer=null; } newGame(); });
$('#restartBtn2').addEventListener('click', ()=>{ stopTimer(); stopSurvivalTimer(); if(nextTimer){ clearTimeout(nextTimer); nextTimer=null; } newGame(); });
$('#exitBtn').addEventListener('click', ()=>{ stopTimer(); stopSurvivalTimer(); if(nextTimer){ clearTimeout(nextTimer); nextTimer=null; } showScreen('mode'); });
$('#exitBtn2').addEventListener('click', ()=>{ stopTimer(); stopSurvivalTimer(); if(nextTimer){ clearTimeout(nextTimer); nextTimer=null; } showScreen('mode'); });

// Atajos y pausa
$('#pauseBtn').addEventListener('click', ()=> pauseGame());
$('#pauseBtn2').addEventListener('click', ()=> pauseGame());
document.addEventListener('keydown', (e)=>{
  if($("#pauseModal")?.open){
    if(e.key==='Escape'){ $("#pauseModal").close(); resumeGame(); }
    return;
  }
  if(screens.game.classList.contains('active')){
    if(['1','2','3','4'].includes(e.key)){
      const pick = parseInt(e.key,10)-1;
      const pool = $("#card-flag").classList.contains('hidden') ? $$("#card-capital .answer-btn.cap") : $$("#card-flag .answer-btn");
      if(pool[pick] && !pool[pick].disabled) pool[pick].click();
    }
    if(e.key.toLowerCase()==='p') pauseGame();
  }
});

// Final
$('#playAgainBtn').addEventListener('click', ()=> newGame());
$('#goHomeBtn').addEventListener('click', ()=>{ stopTimer(); stopSurvivalTimer(); showScreen('mode'); });
$('#shareResult').addEventListener('click', ()=>{
  const text = `🏆 ${playerName} · ${modeLabel(currentMode)} (${LEVELS[currentLevel]?.label||'—'} · ${currentTheme==='all'?'Todo':currentTheme}) · ${score} puntos · ${isoWeekStringLocal()}`;
  if(navigator.share) navigator.share({text}).catch(()=>{ navigator.clipboard.writeText(text); alert("Copiado"); });
  else { navigator.clipboard.writeText(text); alert("Copiado"); }
});

// Modales
$('#helpBtn').addEventListener('click', ()=> $("#helpModal").showModal());
$('#closeHelp').addEventListener('click', ()=> $("#helpModal").close());
$('#btnLeague').addEventListener('click', ()=>{ renderLeague(); $("#leagueModal").showModal(); });
$('#closeLeague').addEventListener('click', ()=> $("#leagueModal").close());
$('#saveLeagueName').addEventListener('click', ()=>{ const n=$('#leagueName').value.trim(); if(n){ playerName=n; lsSet(LS.name, playerName); $('#hudPlayer').textContent=playerName; } });
$('#resetLeague').addEventListener('click', ()=>{ if(confirm('¿Borrar ranking y estadísticas locales?')){ localStorage.removeItem(LS.scores); localStorage.removeItem(LS.stats); renderLeague(); } });
$('#btnStats').addEventListener('click', ()=>{ renderStats('overview'); $("#statsModal").showModal(); setActiveTab('overview'); });
$('#closeStats').addEventListener('click', ()=> $("#statsModal").close());
$$("#statsModal .tab-btn").forEach(btn=> btn.addEventListener('click', ()=>{ setActiveTab(btn.dataset.tab); renderStats(btn.dataset.tab); }));
function setActiveTab(tab){ $$("#statsModal .tab-btn").forEach(b=> b.classList.remove('active')); $(`#statsModal .tab-btn[data-tab="${tab}"]`).classList.add('active'); }
$('#closeDaily').addEventListener('click', ()=> $("#dailyModal").close());

// Respuestas
$$("#card-flag .answer-btn").forEach(b=> b.addEventListener('click', onSelect));
$$("#card-capital .answer-btn.cap").forEach(b=> b.addEventListener('click', onSelect));

// ===== Carga inicial =====
async function ensureDataLoaded(){ if(!ALL.length) await loadData(); }
window.addEventListener('DOMContentLoaded', async ()=>{
  playerName = lsGet(LS.name, "") || "";
  if(playerName) $("#playerName").value = playerName;
  const last = lsGet(LS.last, null);
  if(last){ currentMode = last.mode||null; currentLevel = last.level||'adult'; currentTheme = last.theme||'all';
    ui.selMode.textContent = last.mode?modeLabel(last.mode):'—';
    ui.selTheme.textContent = last.theme? (last.theme==='all'?'Todo':last.theme) : '—';
    ui.selLevel.textContent = LEVELS[last.level||'adult']?.label||'—';
  }
  await ensureDataLoaded();
  updateDailyTile();
});
