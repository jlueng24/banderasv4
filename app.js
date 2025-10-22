// app.js
/*
  Hints + Vibración + Ranking por tema + Medalla semanal (Top 1)
  - 1 pista por partida: o muestra región/tema o descarta 2 opciones.
  - Vibración ligera en móvil al acierto/fallo (si está permitido).
  - Liga por tema: tabla filtrable y medalla semanal para el Top 1 de cada tema.
  - Flujo directo: al elegir modo, tema y dificultad -> empieza la partida.
*/

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const randomInt = n => Math.floor(Math.random()*n);
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] } return arr; }
const flagUrl = code => `https://flagcdn.com/w320/${code}.png`;
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

const screens = { player: $('#screen-player'), mode: $('#screen-mode'), game: $('#screen-game'), final: $('#finalCard') };
function showScreen(name){ Object.values(screens).forEach(s => s.classList.remove('active')); screens[name].classList.add('active'); window.scrollTo({top:0, behavior:'smooth'}); if(name==='mode') updateDailyTile(); }

const LEVELS = {
  kids:   { label: "Niños",  time: 15, wrongPenalty: 0 },
  adult:  { label: "Adultos", time: 12, wrongPenalty: 0 },
  master: { label: "Máster", time: 8,  wrongPenalty: -5 },
};
const THEMES = {
  world: "Mundo",
  europe: "Europa",
  americas: "Américas",
  asia: "Asia",
  africa: "África",
  oceania: "Oceanía",
};
const MAX_Q = 10;
const SURVIVAL = { START: 20, BONUS: 2 }; // fallo = fin

const CAPITAL_ES = {
  "Algiers":"Argel","Oran":"Orán","Tunis":"Túnez","Cairo":"El Cairo","Khartoum":"Jartum","N'Djamena":"Yamena","Abuja":"Abuya","Accra":"Acra",
  "Addis Ababa":"Addís Abeba","Asmara":"Asmara","Bamako":"Bamako","Bangui":"Bangui","Banjul":"Banjul","Bissau":"Bisáu","Conakry":"Conakri",
  "Dakar":"Dakar","Freetown":"Freetown","Gaborone":"Gaborone","Harare":"Harare","Kampala":"Kampala","Kinshasa":"Kinsasa","Libreville":"Libreville",
  "Lilongwe":"Lilongüe","Lomé":"Lomé","Luanda":"Luanda","Lusaka":"Lusaka","Malabo":"Malabo","Maputo":"Maputo","Maseru":"Maseru","Mbabane":"Mbabane",
  "Mogadishu":"Mogadiscio","Monrovia":"Monrovia","Moroni":"Moroni","Nairobi":"Nairobi","Niamey":"Niamey","Nouakchott":"Nuakchot","Ouagadougou":"Uagadugú",
  "Porto-Novo":"Portonovo","Praia":"Praia","Pretoria":"Pretoria","Rabat":"Rabat","Tripoli":"Trípoli","Torshavn":"Tórshavn","Victoria":"Victoria",
  "Windhoek":"Windhoek","Yaoundé":"Yaundé","Yamoussoukro":"Yamusukro","Amsterdam":"Ámsterdam","Athens":"Atenas","Belgrade":"Belgrado","Berlin":"Berlín",
  "Berne":"Berna","Bern":"Berna","Bratislava":"Bratislava","Brussels":"Bruselas","Bucharest":"Bucarest","Budapest":"Budapest","Chisinau":"Chisináu",
  "Copenhagen":"Copenhague","Dublin":"Dublín","Helsinki":"Helsinki","Kyiv":"Kiev","Kiev":"Kiev","Lisbon":"Lisboa","Ljubljana":"Liubliana",
  "London":"Londres","Luxembourg":"Luxemburgo","Madrid":"Madrid","Minsk":"Minsk","Monaco":"Mónaco","Moscow":"Moscú","Nicosia":"Nicosia","Oslo":"Oslo",
  "Paris":"París","Podgorica":"Podgorica","Prague":"Praga","Reykjavik":"Reikiavik","Riga":"Riga","Rome":"Roma","San Marino":"San Marino","Sarajevo":"Sarajevo",
  "Skopje":"Skopie","Sofia":"Sofía","Stockholm":"Estocolmo","Tallinn":"Tallin","Tirana":"Tirana","Vaduz":"Vaduz","Valletta":"La Valeta",
  "Vatican City":"Ciudad del Vaticano","Vienna":"Viena","Vilnius":"Vilna","Warsaw":"Varsovia","Zagreb":"Zagreb","Abu Dhabi":"Abu Dabi","Amman":"Amán",
  "Ankara":"Ankara","Astana":"Astaná","Baghdad":"Bagdad","Baku":"Bakú","Beijing":"Pekín","Peking":"Pekín","Beirut":"Beirut","Damascus":"Damasco",
  "Dhaka":"Daca","Doha":"Doha","Hanoi":"Hanói","Islamabad":"Islamabad","Jakarta":"Yakarta","Jerusalem":"Jerusalén","Kabul":"Kabul","Kathmandu":"Katmandú",
  "Kuala Lumpur":"Kuala Lumpur","Manila":"Manila","Muscat":"Mascate","New Delhi":"Nueva Delhi","Nur-Sultan":"Astaná","Phnom Penh":"Nom Pen",
  "Riyadh":"Riad","Seoul":"Seúl","Singapore":"Singapur","Sri Jayawardenepura Kotte":"Sri Jayawardenapura Kotte","Taipei":"Taipéi",
  "Tashkent":"Taskent","Tehran":"Teherán","Thimphu":"Timbu","Tokyo":"Tokio","Ulaanbaatar":"Ulán Bator","Vientiane":"Vientián","Sanaa":"Saná",
  "Canberra":"Canberra","Suva":"Suva","Wellington":"Wellington","Port Moresby":"Port Moresby","Apia":"Apia","Nukuʻalofa":"Nukualofa","Nuku'alofa":"Nukualofa",
  "Honiara":"Honiara","Funafuti":"Funafuti","Buenos Aires":"Buenos Aires","Asuncion":"Asunción","Asunción":"Asunción","Bogotá":"Bogotá",
  "Brasília":"Brasilia","Brasilia":"Brasilia","Caracas":"Caracas","Georgetown":"Georgetown","Lima":"Lima","La Paz":"La Paz","Sucre":"Sucre",
  "Montevideo":"Montevideo","Paramaribo":"Paramaribo","Quito":"Quito","Santiago":"Santiago","Belmopan":"Belmopán","Guatemala City":"Ciudad de Guatemala",
  "Havana":"La Habana","Kingston":"Kingston","Managua":"Managua","Mexico City":"Ciudad de México","Panama City":"Ciudad de Panamá","Port-au-Price":"Puerto Príncipe",
  "Port-au-Prince":"Puerto Príncipe","Port of Spain":"Puerto España","San Jose":"San José","San José":"San José","Santo Domingo":"Santo Domingo",
  "Ottawa":"Ottawa","Washington, D.C.":"Washington D. C.","Saint John's":"Saint John’s","St. John's":"Saint John’s","Nassau":"Nassau","Bridgetown":"Bridgetown",
  "Kuwait City":"Kuwait","Manama":"Manama","Majuro":"Majuro","Melekeok":"Melekeok","Ngerulmud":"Ngerulmud","Palikir":"Palikir","Tarawa":"Tarawa"
};
const toSpanishCapital = cap => cap ? (CAPITAL_ES[cap] || cap) : "";

let ALL = []; // {code, nameES, capitalES, region}
const LS = {
  name:'dcf_player_name',
  scores:'dcf_scores_v2_theme',
  stats:'dcf_stats',
  challenge:'dcf_challenges',
  last:'dcf_last_sel',
  mute:'dcf_mute',
  medals:'dcf_medals_week_theme'
};

function lsGet(k, def){ try{ const v = localStorage.getItem(k); return v?JSON.parse(v):def; }catch{ return def; } }
function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} }

async function loadData(){
  try{
    const [resNames, resAll] = await Promise.all([
      fetch("https://flagcdn.com/es/codes.json"),
      fetch("https://restcountries.com/v3.1/all?fields=name,cca2,capital,region,translations")
    ]);
    const namesES = await resNames.json();
    const all = await resAll.json();
    ALL = all.map(c=>{
      const code = (c.cca2 || "").toLowerCase();
      const nameES = (c.translations?.spa?.common) || namesES[code] || (c.name?.common || "");
      const capIn = Array.isArray(c.capital) && c.capital.length ? c.capital[0] : "";
      const capitalES = toSpanishCapital(capIn);
      const region = (c.region || "Other");
      return { code, nameES, capitalES, region };
    }).filter(x => x.code && x.nameES);
  }catch(e){
    ALL = [
      {code:"es",nameES:"España",capitalES:"Madrid",region:"Europe"},
      {code:"fr",nameES:"Francia",capitalES:"París",region:"Europe"},
      {code:"de",nameES:"Alemania",capitalES:"Berlín",region:"Europe"},
      {code:"it",nameES:"Italia",capitalES:"Roma",region:"Europe"},
      {code:"pt",nameES:"Portugal",capitalES:"Lisboa",region:"Europe"},
      {code:"br",nameES:"Brasil",capitalES:"Brasilia",region:"Americas"},
      {code:"us",nameES:"Estados Unidos",capitalES:"Washington D. C.",region:"Americas"},
      {code:"jp",nameES:"Japón",capitalES:"Tokio",region:"Asia"},
      {code:"za",nameES:"Sudáfrica",capitalES:"Pretoria",region:"Africa"},
      {code:"au",nameES:"Australia",capitalES:"Canberra",region:"Oceania"},
    ];
  }
}

// ===== Estado =====
let playerName = "";
let currentMode = null;      // 'flags' | 'capitals' | 'mixed' | 'survival'
let currentLevel = 'adult';
let currentTheme = 'world';
let idx = 0, score = 0, hits = 0, misses = 0, locked = false;
let timeLeft = 0, timeInterval = null; // supervivencia usa contador continuo
let order = [];
let optionsPool = [];
let timesMs = []; let qActiveStartMs = 0; let qAccumulatedMs = 0; let paused=false;
let hintLeft = 1;

// ====== Audio ======
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();
let muteFx = false;

function playTone(f=440, d=0.12, type='sine', vol=0.2){
  if (muteFx) return;
  const o=audioCtx.createOscillator(); const g=audioCtx.createGain();
  o.type=type; o.frequency.value=f; g.gain.value=vol;
  o.connect(g).connect(audioCtx.destination); o.start();
  setTimeout(()=>{ g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05); o.stop(audioCtx.currentTime+0.06); }, d*1000);
}
function playCoin(){
  if (muteFx) return;
  let t=0; [{f:523,d:0.08},{f:659,d:0.08},{f:784,d:0.10}]
    .forEach(n=>{ setTimeout(()=>playTone(n.f,n.d,'square',0.15), t); t+=n.d*1000*0.9; });
}
function playBuzzer(){
  if (muteFx) return;
  const s=260,e=140,steps=6,ms=50;
  for(let i=0;i<steps;i++){ const f=s+(e-s)*(i/(steps-1)); setTimeout(()=>playTone(f, ms/1000, 'sawtooth', 0.12), i*ms); }
}
function vib(pattern){ try{ if(navigator.vibrate) navigator.vibrate(pattern); }catch{} }

// ===== UI Refs =====
const ui = {
  playerInput: $('#playerName'),
  uiPlayer: $('#uiPlayer'),
  modeLabel: $('#modeLabel'),
  levelLabel: $('#levelLabel'),
  themeLabel: $('#themeLabel'),
  qNumber: $('#qNumber'),
  qTotal: $('#qTotal'),
  points: $('#points'),
  hits: $('#hits'),
  misses: $('#misses'),
  progressBar: $('#progressBar'),
  timeLeft: $('#timeLeft'),
  timeBar: $('#timeBar'),
  finalPoints: $('#finalPoints'),
  finalHits: $('#finalHits'),
  finalMisses: $('#finalMisses'),
  finalSummary: $('#finalSummary'),
  flagImg: $('#flagImg'),
  capitalName: $('#capitalName'),
  flagImgReveal: $('#flagImgReveal'),
  countryReveal: $('#countryReveal'),
  hintBtn: $('#hintBtn'),
  hintCounter: $('#hintCounter'),
  hintArea: $('#hintArea'),
  hintArea2: $('#hintArea2'),
  btnsFlag: $$("#card-flag .answer-btn"),
  btnsCap: $$("#card-capital .answer-btn.cap"),
};

function filterByTheme(list){
  if(currentTheme==='world') return list;
  const map = { europe:'Europe', americas:'Americas', asia:'Asia', africa:'Africa', oceania:'Oceania' };
  const region = map[currentTheme];
  return list.filter(x=>x.region===region);
}

function pickOptions(correct, pool, n=4){
  const others = pool.filter(x=>x.code!==correct.code);
  shuffle(others);
  const fill = others.slice(0, Math.max(0, n-1));
  while (fill.length < n-1){
    const cand = pool[randomInt(pool.length)];
    if (cand && cand.code!==correct.code && !fill.some(o=>o.code===cand.code)) fill.push(cand);
  }
  return shuffle([correct, ...fill]);
}

// ===== Liga / ranking por tema =====
function recordGameToLeague({name, score, mode, level, theme, durationMs}){
  const arr = lsGet(LS.scores, []);
  arr.unshift({name, score, mode, level, theme, dateISO: new Date().toISOString(), week: isoWeekStringLocal(), durationMs});
  while(arr.length>500) arr.pop();
  lsSet(LS.scores, arr);
  maybeAwardWeeklyMedal(theme, arr);
}
function maybeAwardWeeklyMedal(theme, arr){
  const week = isoWeekStringLocal();
  const thisWeek = arr.filter(x=>x.week===week && x.theme===theme);
  const bestByPlayer = {};
  thisWeek.forEach(s=>{ if(!bestByPlayer[s.name] || s.score>bestByPlayer[s.name].score){ bestByPlayer[s.name] = s; } });
  const rows = Object.values(bestByPlayer).sort((a,b)=> b.score - a.score);
  if(!rows.length) return;
  const top = rows[0];
  const medals = lsGet(LS.medals, {});
  medals[week] = medals[week] || {};
  medals[week][theme] = { name: top.name, score: top.score, dateISO: top.dateISO };
  lsSet(LS.medals, medals);
}
function renderLeague(){
  const week = isoWeekStringLocal();
  $("#leagueWeek").textContent = week;
  $("#leagueName").value = playerName;
  const theme = $("#leagueTheme").value || 'world';

  const arr = lsGet(LS.scores, []);
  const thisWeek = arr.filter(x=>x.week===week && x.theme===theme);
  const bestByPlayer = {};
  thisWeek.forEach(s=>{ if(!bestByPlayer[s.name] || s.score>bestByPlayer[s.name].score){ bestByPlayer[s.name] = s; } });
  const rows = Object.values(bestByPlayer).sort((a,b)=> b.score - a.score).slice(0,20);

  const html = rows.length? `
    <table class="min-w-full text-sm">
      <thead><tr class="text-left text-slate-500">
        <th class="py-2 pr-3">#</th>
        <th class="py-2 pr-3">Jugador</th>
        <th class="py-2 pr-3">Puntos</th>
        <th class="py-2 pr-3">Modo</th>
        <th class="py-2 pr-3">Dificultad</th>
        <th class="py-2 pr-3">Fecha</th>
      </tr></thead>
      <tbody>
        ${rows.map((r,i)=>`
          <tr class="border-t">
            <td class="py-2 pr-3 font-semibold">${i+1}</td>
            <td class="py-2 pr-3">${r.name}</td>
            <td class="py-2 pr-3">${r.score}</td>
            <td class="py-2 pr-3">${r.mode}</td>
            <td class="py-2 pr-3">${LEVELS[r.level]?.label||r.level}</td>
            <td class="py-2 pr-3">${new Date(r.dateISO).toLocaleString('es-ES',{dateStyle:'short', timeStyle:'short'})}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>` : `<div class="text-slate-500 text-sm">Aún no hay partidas esta semana en ${THEMES[theme]}.</div>`;
  $("#leagueTable").innerHTML = html;

  const medals = lsGet(LS.medals, {});
  const current = medals[week]?.[theme];
  $("#medalInfo").textContent = current ? `🥇 Medalla semanal ${THEMES[theme]}: ${current.name} (${current.score} pts)` : 'Aún sin medalla semanal en este tema.';
}

// ===== Stats =====
function updateGlobalStatsFromRun(timesMs, missMap){
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
function renderStats(tab='overview'){
  const st = lsGet(LS.stats, { times:{count:0,sumMs:0,maxMs:0,minMs:0}, countries:{} });
  const content = $("#statsContent");
  const avg = st.times.count? (st.times.sumMs/st.times.count) : 0;

  if(tab==='overview'){
    content.innerHTML = `
      <div class="grid sm:grid-cols-3 gap-3">
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          <div class="text-xs text-slate-500">Preguntas respondidas</div>
          <div class="text-2xl font-black">${st.times.count||0}</div>
        </div>
        <div class="p-4 rounded-2xl bg-sky-50 border border-sky-100">
          <div class="text-xs text-slate-500">Tiempo medio</div>
          <div class="text-2xl font-black">${avg? (avg/1000).toFixed(2) : '—'} s</div>
        </div>
        <div class="p-4 rounded-2xl bg-amber-50 border border-amber-100">
          <div class="text-xs text-slate-500">Rango (rápido / lento)</div>
          <div class="text-2xl font-black">${st.times.minMs? (st.times.minMs/1000).toFixed(2):'—'}s / ${st.times.maxMs? (st.times.maxMs/1000).toFixed(2):'—'}s</div>
        </div>
      </div>`;
  }
  if(tab==='mistakes'){
    const entries = Object.entries(st.countries||{}).map(([code, v])=>({code, ...v, rate: v.wrong/(v.attempts||1)}))
      .filter(x=>x.attempts>=1).sort((a,b)=>b.rate-a.rate).slice(0,15);
    content.innerHTML = `
      <div class="text-sm text-slate-600 mb-2">Top países con mayor tasa de error (mín. 1 intento)</div>
      <table class="min-w-full text-sm">
        <thead><tr class="text-left text-slate-500">
          <th class="py-2 pr-3">País</th>
          <th class="py-2 pr-3">Fallos</th>
          <th class="py-2 pr-3">Intentos</th>
          <th class="py-2 pr-3">Tasa</th>
        </tr></thead>
        <tbody>
          ${entries.map(r=>`
            <tr class="border-t">
              <td class="py-2 pr-3 flex items-center gap-2">
                <img src="${flagUrl(r.code)}" class="w-6 h-4 rounded border" alt="" />
                <span>${r.name}</span>
              </td>
              <td class="py-2 pr-3">${r.wrong}</td>
              <td class="py-2 pr-3">${r.attempts}</td>
              <td class="py-2 pr-3">${(r.rate*100).toFixed(0)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${entries.length? '' : '<div class="text-slate-500 text-sm mt-2">Aún no hay suficientes datos.</div>'}
    `;
  }
  if(tab==='times'){
    content.innerHTML = `
      <div class="text-sm text-slate-600 mb-2">Consejo: fíjate si mejoras tu tiempo medio por tema.</div>
      <div class="text-slate-500 text-sm">Esta vista muestra estadísticas globales acumuladas.</div>
    `;
  }
}

// ===== Reto del día (igual que antes, breve) =====
function updateDailyTile(){
  const challenges = lsGet(LS.challenge, {});
  const done = challenges[todayStr()];
  const tile = $("#tile-daily");
  tile && (tile.style.display = done ? 'none' : '');
}

// ===== Timer =====
function startTimer(seconds){
  clearInterval(timeInterval);
  const total = seconds ?? LEVELS[currentLevel].time;
  let refMs = Date.now();
  let remain = total;
  timeLeft = remain;
  ui.timeLeft.textContent = Math.ceil(remain);
  ui.timeBar.style.width = "100%";
  qActiveStartMs = Date.now();
  paused = false;

  timeInterval = setInterval(()=>{
    const now = Date.now();
    const dt = (now - refMs)/1000;
    refMs = now;
    remain = Math.max(0, remain - dt);
    timeLeft = remain;
    ui.timeLeft.textContent = Math.ceil(remain);
    const denom = (currentMode==='survival') ? SURVIVAL.START : LEVELS[currentLevel].time;
    ui.timeBar.style.width = Math.max(0,(remain/denom)*100) + "%";
    if (remain <= 0){
      clearInterval(timeInterval);
      handleTimeout();
    }
  }, 80);
}
function stopTimer(){ clearInterval(timeInterval); }

// ===== Juego =====
let missMap = {};
let usedCodes = new Set();

function buildOrder(){
  const base = filterByTheme([...ALL]);
  shuffle(base);
  const withCap = base.filter(x=>x.capitalES && x.capitalES.trim().length);
  order = [];
  if(currentMode==='capitals'){
    for(let i=0;i<MAX_Q;i++) order.push({kind:'capital', item: withCap[i % withCap.length] || base[i % base.length]});
  } else if(currentMode==='flags'){
    for(let i=0;i<MAX_Q;i++) order.push({kind:'flag', item: base[i % base.length]});
  } else if(currentMode==='mixed'){
    for(let i=0;i<MAX_Q;i++){
      const kind = (Math.random()<0.5 && withCap.length)?'capital':'flag';
      const pool = (kind==='capital')? (withCap.length?withCap:base) : base;
      order.push({kind, item: pool[i % pool.length]});
    }
  } else if(currentMode==='survival'){
    // empezamos con base; luego se irá pidiendo una a una
    for(let i=0;i<MAX_Q;i++) order.push({kind:'flag', item: base[i % base.length]});
  }
  optionsPool = base;
}

function startGame(){
  hintLeft = 1;
  usedCodes = new Set();
  missMap = {};
  timesMs = [];
  idx = 0; score = 0; hits = 0; misses = 0; locked=false;
  ui.points.textContent = 0; ui.hits.textContent = 0; ui.misses.textContent = 0;
  ui.hintCounter.textContent = hintLeft;
  ui.hintArea.textContent = ""; ui.hintArea2.textContent = "";
  ui.qTotal.textContent = (currentMode==='survival') ? '' : '/10';
  ui.modeLabel.textContent = currentMode==='flags' ? 'Banderas'
                           : currentMode==='capitals' ? 'Capitales'
                           : currentMode==='mixed' ? 'Mixto'
                           : 'Supervivencia';
  ui.themeLabel.textContent = THEMES[currentTheme];
  ui.levelLabel.textContent = (currentMode==='survival') ? '—' : LEVELS[currentLevel].label;
  ui.uiPlayer.textContent = playerName || 'Anónimo';

  buildOrder();
  showScreen('game');

  if(currentMode==='survival'){
    startTimer(SURVIVAL.START);
  } else {
    startTimer(LEVELS[currentLevel].time);
  }
  renderQuestion();
}

function renderQuestion(){
  const q = order[idx];
  if(!q){ endGame(); return; }
  ui.qNumber.textContent = (currentMode==='survival') ? (idx+1) : (idx+1);
  qAccumulatedMs = 0;
  ui.hintArea.textContent = ""; ui.hintArea2.textContent = "";

  if(q.kind==='flag'){
    $("#card-flag").classList.remove('hidden');
    $("#card-capital").classList.add('hidden');
    ui.flagImg.src = flagUrl(q.item.code);
    ui.flagImg.alt = `Bandera de ${q.item.nameES}`;
    const opts = pickOptions(q.item, optionsPool, 4);
    ui.btnsFlag.forEach((btn,i)=>{ btn.textContent = opts[i].nameES; btn.dataset.correct = (opts[i].code===q.item.code)?"1":"0"; btn.disabled=false; btn.className="answer-btn px-4 py-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-100 text-left font-bold"; });
  } else {
    $("#card-flag").classList.add('hidden');
    $("#card-capital").classList.remove('hidden');
    ui.capitalName.textContent = q.item.capitalES || "—";
    ui.flagImgReveal.src = flagUrl(q.item.code);
    ui.countryReveal.textContent = `Es ${q.item.nameES}`;
    const base = optionsPool.filter(x=>x.capitalES && x.capitalES.trim().length);
    const opts = pickOptions(q.item, base.length?base:optionsPool, 4);
    ui.btnsCap.forEach((btn,i)=>{ btn.textContent = opts[i].nameES; btn.dataset.correct = (opts[i].code===q.item.code)?"1":"0"; btn.disabled=false; btn.className="answer-btn cap px-4 py-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-100 text-left font-bold"; });
    ui.flagImgReveal.classList.add('hidden');
    ui.countryReveal.classList.add('hidden');
  }
  locked=false;
}

function handleTimeout(){
  if (locked) return;
  locked = true;
  qAccumulatedMs += (Date.now() - qActiveStartMs);
  timesMs.push(qAccumulatedMs);

  const q = order[idx];
  if(!missMap[q.item.code]) missMap[q.item.code] = {name:q.item.nameES, attempts:0, wrong:0};
  missMap[q.item.code].attempts += 1;
  missMap[q.item.code].wrong += 1;
  misses++; ui.misses.textContent = misses;
  if(currentMode!=='survival' && LEVELS[currentLevel].wrongPenalty<0){
    score = Math.max(0, score + LEVELS[currentLevel].wrongPenalty);
    ui.points.textContent = score;
  }

  // Supervivencia: fallo = fin
  if(currentMode==='survival'){ vib([120,60,120]); playBuzzer(); endGame(); return; }

  markButtons(q.kind==='flag' ? ui.btnsFlag : ui.btnsCap, null);
  vib([80]); playBuzzer();
  advanceProgress();
  nextQuestionSoon();
}

function onSelect(e){
  if (locked || paused) return;
  locked = true;
  qAccumulatedMs += (Date.now() - qActiveStartMs);
  stopTimer();

  const btn = e.currentTarget;
  const correct = btn.dataset.correct === "1";
  const q = order[idx];
  if(!missMap[q.item.code]) missMap[q.item.code] = {name:q.item.nameES, attempts:0, wrong:0};
  missMap[q.item.code].attempts += 1;

  if (correct){
    score += 10; hits += 1; ui.points.textContent = score; ui.hits.textContent = hits;
    vib([40]); playCoin();
    // Supervivencia: +2s
    if(currentMode==='survival'){
      timeLeft = Math.min(timeLeft + SURVIVAL.BONUS, SURVIVAL.START);
      startTimer(timeLeft);
    }
  } else {
    misses += 1; missMap[q.item.code].wrong += 1;
    if(currentMode!=='survival' && LEVELS[currentLevel].wrongPenalty<0){
      score = Math.max(0, score + LEVELS[currentLevel].wrongPenalty);
      ui.points.textContent = score;
    }
    vib([120,60,120]); playBuzzer();
  }

  if(q.kind==='flag'){
    markButtons(ui.btnsFlag, btn);
  } else {
    ui.flagImgReveal.classList.remove('hidden');
    ui.countryReveal.classList.remove('hidden');
    markButtons(ui.btnsCap, btn);
  }
  timesMs.push(qAccumulatedMs);
  advanceProgress();

  // Supervivencia: si fallas = fin instantáneo
  if(currentMode==='survival' && !correct){ endGame(); return; }

  nextQuestionSoon();
}

function markButtons(buttons, targetBtn){
  buttons.forEach(btn=>{
    const isCorrect = btn.dataset.correct === "1";
    const base = ["bg-sky-50","hover:bg-sky-100","border-sky-100"];
    btn.classList.remove(...base);
    if (btn === targetBtn){
      if (isCorrect) btn.classList.add("bg-emerald-100","border-emerald-300","text-emerald-900");
      else btn.classList.add("bg-rose-100","border-rose-300","text-rose-900");
    } else if (isCorrect){ btn.classList.add("bg-emerald-100","border-emerald-300","text-emerald-900"); }
    else { btn.classList.add("bg-slate-50","border-slate-200","text-slate-500"); }
    btn.disabled = true;
  });
}

function advanceProgress(){ if(currentMode!=='survival') ui.progressBar.style.width = (((idx + 1) / MAX_Q) * 100) + "%"; }
function nextQuestionSoon(){ setTimeout(nextQuestion, 800); }

function nextQuestion(){
  if(currentMode!=='survival'){
    if (idx < MAX_Q - 1){
      idx++; startTimer(LEVELS[currentLevel].time); renderQuestion();
    } else { endGame(); }
  } else {
    idx++; // infinito “estilo” pero mostramos conteo
    // rotar si se acaban 10
    if(idx % MAX_Q === 0) buildOrder();
    startTimer(timeLeft); renderQuestion();
  }
}

function endGame(){
  stopTimer();
  ui.finalPoints.textContent = score;
  ui.finalHits.textContent = hits;
  ui.finalMisses.textContent = misses;

  // resumen corto
  const totalQs = (currentMode==='survival') ? idx : MAX_Q;
  const acc = totalQs ? Math.round((hits/totalQs)*100) : 0;
  ui.finalSummary.innerHTML = `
    <div class="grid sm:grid-cols-3 gap-3 text-xs sm:text-sm">
      <div class="p-3 rounded-xl bg-slate-50 border">
        <div class="text-slate-500">Modo / Tema</div>
        <div class="font-bold">${ui.modeLabel.textContent} · ${THEMES[currentTheme]}</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-50 border">
        <div class="text-slate-500">% acierto</div>
        <div class="font-bold">${acc}%</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-50 border">
        <div class="text-slate-500">Semana</div>
        <div class="font-bold">${isoWeekStringLocal()}</div>
      </div>
    </div>`;

  showScreen('final');

  const durationMs = timesMs.reduce((a,b)=>a+b,0);
  recordGameToLeague({
    name: playerName||'Anónimo',
    score,
    mode: ui.modeLabel.textContent,
    level: currentLevel,
    theme: currentTheme,
    durationMs
  });
  updateGlobalStatsFromRun(timesMs, missMap);
}

// ===== PISTA =====
function useHint(){
  if(hintLeft<=0 || locked) return;
  const q = order[idx];
  if(!q) return;
  hintLeft--; ui.hintCounter.textContent = hintLeft;

  // 50/50 o región, aleatorio
  if(Math.random()<0.5){
    // Región / tema
    const regionText = (currentTheme==='world') ? (`Región: ${q.item.region}`) : (`Tema: ${THEMES[currentTheme]}`);
    if(q.kind==='flag') ui.hintArea.textContent = `💡 ${regionText}`;
    else ui.hintArea2.textContent = `💡 ${regionText}`;
  } else {
    // Eliminar 2 opciones incorrectas
    const pool = (q.kind==='flag') ? ui.btnsFlag : ui.btnsCap;
    const wrongs = pool.filter(b=>b.dataset.correct!=="1");
    shuffle(wrongs);
    wrongs.slice(0,2).forEach(b=>{ b.disabled = true; b.classList.add('opacity-60'); });
    if(q.kind==='flag') ui.hintArea.textContent = `💡 50/50 aplicado`;
    else ui.hintArea2.textContent = `💡 50/50 aplicado`;
  }
}

// ===== Pausa =====
function pauseGame(){
  if (paused) return;
  paused = true;
  qAccumulatedMs += (Date.now() - qActiveStartMs);
  stopTimer();
  disableAnswers(true);
  $("#pauseModal").showModal();
}
function resumeGame(){
  if (!paused) return;
  paused = false;
  qActiveStartMs = Date.now();
  startTimer(timeLeft);
  disableAnswers(false);
  $("#pauseModal").close();
}
function disableAnswers(disabled){
  ui.btnsFlag.forEach(b=> b.disabled = disabled);
  ui.btnsCap.forEach(b=> b.disabled = disabled);
}

// ===== Eventos =====
$("#goToMode").addEventListener('click', ()=>{
  playerName = (ui.playerInput.value||'').trim() || 'Anónimo';
  lsSet(LS.name, playerName);
  showScreen('mode');
});

// Selección modo/tema/nivel -> iniciar automáticamente
let _sel = { mode:null, theme:null, level:null };
$$(".mode-btn").forEach(b=>{
  b.addEventListener('click', ()=>{
    _sel.mode = b.dataset.mode;
    $$(".mode-btn").forEach(x=>x.classList.remove("ring-2","ring-emerald-400"));
    b.classList.add("ring-2","ring-emerald-400");
    maybeStart();
  });
});
$$(".theme-btn").forEach(b=>{
  b.addEventListener('click', ()=>{
    _sel.theme = b.dataset.theme;
    currentTheme = _sel.theme;
    $$(".theme-btn").forEach(x=>x.classList.remove("ring-2","ring-emerald-400"));
    b.classList.add("ring-2","ring-emerald-400");
    maybeStart();
  });
});
$$(".level-btn").forEach(b=>{
  b.addEventListener('click', ()=>{
    _sel.level = b.dataset.level;
    currentLevel = _sel.level;
    $$(".level-btn").forEach(x=>x.classList.remove("ring-2","ring-emerald-400"));
    b.classList.add("ring-2","ring-emerald-400");
    maybeStart();
  });
});

function maybeStart(){
  if(_sel.mode && _sel.theme && (_sel.level || _sel.mode==='survival')){
    currentMode = _sel.mode;
    if(currentMode==='survival') currentLevel = 'adult'; // ignora nivel
    lsSet(LS.last, {mode:currentMode, theme:currentTheme, level:currentLevel});
    try{ audioCtx.resume(); }catch{}
    startGame();
  }
}

// Botones juego
$("#restartBtn").addEventListener('click', ()=>{ stopTimer(); startGame(); });
$("#restartBtn2").addEventListener('click', ()=>{ stopTimer(); startGame(); });
$("#exitBtn").addEventListener('click', ()=>{ stopTimer(); showScreen('mode'); });
$("#exitBtn2").addEventListener('click', ()=>{ stopTimer(); showScreen('mode'); });

// Pausa
$("#pauseBtn").addEventListener('click', ()=>{ pauseGame(); });
$("#pauseBtn2").addEventListener('click', ()=>{ pauseGame(); });
$("#resumeBtn").addEventListener('click', ()=>{ resumeGame(); });
$("#pauseExitBtn").addEventListener('click', ()=>{ paused=false; stopTimer(); $("#pauseModal").close(); showScreen('mode'); });

// Hint
ui.hintBtn.addEventListener('click', useHint);

// Teclado
document.addEventListener('keydown', (e)=>{
  if($("#pauseModal")?.open){
    if(e.key==='Escape') { $("#pauseModal").close(); resumeGame(); }
    return;
  }
  if(screens.game.classList.contains('active')){
    if(['1','2','3','4'].includes(e.key)){
      const idxBtn = parseInt(e.key,10)-1;
      const pool = $("#card-flag").classList.contains('hidden') ? ui.btnsCap : ui.btnsFlag;
      if(pool[idxBtn] && !pool[idxBtn].disabled) pool[idxBtn].click();
    }
    if(e.key.toLowerCase()==='p') pauseGame();
  }
});

// Final
$("#playAgainBtn").addEventListener('click', ()=>{ startGame(); });
$("#goHomeBtn").addEventListener('click', ()=>{ stopTimer(); showScreen('mode'); });
$("#shareResult").addEventListener('click', ()=>{
  const text = `🏆 ${playerName} · ${ui.modeLabel.textContent} · ${THEMES[currentTheme]} (${currentMode==='survival'?'—':LEVELS[currentLevel].label}) · ${score} puntos · ${isoWeekStringLocal()}`;
  if (navigator.share) navigator.share({text}).catch(()=>{ navigator.clipboard.writeText(text); alert("Copiado al portapapeles"); });
  else { navigator.clipboard.writeText(text); alert("Copiado al portapapeles"); }
});

// Modales
$("#helpBtn").addEventListener('click', ()=> $("#helpModal").showModal());
$("#closeHelp").addEventListener('click', ()=> $("#helpModal").close());

// Liga
$("#btnLeague").addEventListener('click', ()=>{ $("#leagueTheme").value = currentTheme; renderLeague(); $("#leagueModal").showModal(); });
$("#closeLeague").addEventListener('click', ()=> $("#leagueModal").close());
$("#leagueTheme").addEventListener('change', ()=> renderLeague());
$("#saveLeagueName").addEventListener('click', ()=>{
  const n = $("#leagueName").value.trim();
  if(n){ playerName = n; lsSet(LS.name, playerName); $("#uiPlayer").textContent = playerName; }
});
$("#resetLeague").addEventListener('click', ()=>{
  if(confirm("¿Seguro que quieres borrar ranking, estadísticas y medallas locales?")){
    localStorage.removeItem(LS.scores);
    localStorage.removeItem(LS.stats);
    localStorage.removeItem(LS.medals);
    renderLeague();
  }
});

// Estadísticas
$("#btnStats").addEventListener('click', ()=>{ renderStats('overview'); $("#statsModal").showModal(); setActiveTab('overview'); });
$("#closeStats").addEventListener('click', ()=> $("#statsModal").close());
$$("#statsModal .tab-btn").forEach(btn=> btn.addEventListener('click', ()=>{ setActiveTab(btn.dataset.tab); renderStats(btn.dataset.tab); }));
function setActiveTab(tab){ $$("#statsModal .tab-btn").forEach(b=> b.classList.remove('active')); $(`#statsModal .tab-btn[data-tab="${tab}"]`).classList.add('active'); }

// Daily (placeholder mínimo)
$("#closeDaily")?.addEventListener('click', ()=> $("#dailyModal").close());

// Mute persistente
const btnMute = $("#btnMute");
muteFx = lsGet(LS.mute, false);
btnMute.setAttribute('aria-pressed', String(muteFx));
btnMute.textContent = muteFx ? '🔇' : '🔊';
btnMute.addEventListener('click', ()=>{
  muteFx = !muteFx; lsSet(LS.mute, muteFx);
  btnMute.setAttribute('aria-pressed', String(muteFx));
  btnMute.textContent = muteFx ? '🔇' : '🔊';
});

// Carga inicial
window.addEventListener('DOMContentLoaded', async ()=>{
  playerName = lsGet(LS.name, "") || "";
  if(playerName) $("#playerName").value = playerName;
  const last = lsGet(LS.last, null);
  if(last){ currentTheme = last.theme || 'world'; currentLevel = last.level || 'adult'; currentMode = last.mode || null; }
  await loadData();
  updateDailyTile();
});

// Asignar handlers de respuestas
$$("#card-flag .answer-btn").forEach(b=> b.addEventListener('click', onSelect));
$$("#card-capital .answer-btn.cap").forEach(b=> b.addEventListener('click', onSelect));
