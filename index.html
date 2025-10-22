// app.js — Banderas Quiz (oct-2025)
// – Arranque directo tras elegir modo/tema/dificultad
// – Supervivencia ☠️
// – Modal de pausa + A11y + atajos 1–4, P
// – Fallback de países si falla la red

// ===== Utils =====
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
const wait = ms => new Promise(r=>setTimeout(r,ms));
const randInt = n => Math.floor(Math.random()*n);
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }
const todayStr = () => new Date().toISOString().slice(0,10);

// ===== Constantes =====
const LEVELS = {
  easy:   { label:'Fácil',   time:15, wrongPenalty: 0, pointsRight:10, pointsWrong:0 },
  medium: { label:'Medio',   time:12, wrongPenalty: 0, pointsRight:10, pointsWrong:0 },
  hard:   { label:'Difícil', time: 8, wrongPenalty:-5, pointsRight:10, pointsWrong:-5 },
  survival: { label:'Supervivencia', time:20, wrongPenalty:'die', pointsRight:10, pointsWrong:'die', bonusPerHit:2 }
};

const MAX_Q = 10;
const API = "https://restcountries.com/v3.1/all?fields=name,flags,continents,capital,cca2";

// Fallback mínimo (por si no hay red)
const FALLBACK = [
  { name:{common:"Spain",nativeName:{spa:{common:"España"}}}, flags:{svg:"https://flagcdn.com/es.svg", png:"https://flagcdn.com/w320/es.png"}, continents:["Europe"], capital:["Madrid"], cca2:"ES" },
  { name:{common:"France"}, flags:{svg:"https://flagcdn.com/fr.svg", png:"https://flagcdn.com/w320/fr.png"}, continents:["Europe"], capital:["Paris"], cca2:"FR" },
  { name:{common:"Brazil"}, flags:{svg:"https://flagcdn.com/br.svg", png:"https://flagcdn.com/w320/br.png"}, continents:["Americas"], capital:["Brasília"], cca2:"BR" },
  { name:{common:"Japan"}, flags:{svg:"https://flagcdn.com/jp.svg", png:"https://flagcdn.com/w320/jp.png"}, continents:["Asia"], capital:["Tokyo"], cca2:"JP" },
  { name:{common:"Australia"}, flags:{svg:"https://flagcdn.com/au.svg", png:"https://flagcdn.com/w320/au.png"}, continents:["Oceania"], capital:["Canberra"], cca2:"AU" },
  { name:{common:"South Africa"}, flags:{svg:"https://flagcdn.com/za.svg", png:"https://flagcdn.com/w320/za.png"}, continents:["Africa"], capital:["Pretoria"], cca2:"ZA" }
];

// ===== Estado =====
const state = {
  mode:null,       // 'flags' | 'capitals' | 'mixed'
  theme:null,      // 'World' | 'Europe' | 'Africa' | 'Americas' | 'Asia' | 'Oceania'
  level:null,      // 'easy' | 'medium' | 'hard' | 'survival'
  pool:[],         // países filtrados
  qIdx:0,
  score:0,
  hits:0,
  streak:0,
  maxStreak:0,
  timeLeft:0,
  timer:null,
  currentQ:null,   // objeto pregunta
  locked:false,    // para evitar doble click
  started:false
};

// ===== Selección UI =====
const setup = {
  modes: $$('.mode-btn'),
  themes: $$('.theme-btn'),
  levels: $$('.level-btn')
};

// ARIA toggle
function setPressed(elGroup, target){
  elGroup.forEach(b=>b.setAttribute('aria-pressed', b===target ? 'true' : 'false'));
}

// ===== Datos =====
let COUNTRY_CACHE = null;

async function loadCountries(){
  if (COUNTRY_CACHE) return COUNTRY_CACHE;
  try{
    const res = await fetch(API, {cache:'force-cache'});
    if(!res.ok) throw new Error('bad status');
    const all = await res.json();
    // limpieza básica
    COUNTRY_CACHE = all.filter(c=>c?.name?.common && (c.flags?.svg||c.flags?.png));
  }catch{
    COUNTRY_CACHE = FALLBACK;
  }
  return COUNTRY_CACHE;
}

function byTheme(countries, theme){
  if (theme==='World') return countries;
  return countries.filter(c=> (c.continents||[]).includes(theme));
}

// ===== Generación de preguntas =====
function buildQuestion(country, mode){
  const name = country.name?.common || '—';
  const capital = (country.capital && country.capital[0]) || '—';
  const flagUrl = country.flags?.svg || country.flags?.png || '';
  if (mode==='flags') {
    return { type:'flag', prompt:`¿De qué país es esta bandera?`, media:flagUrl, answer:name };
  }
  if (mode==='capitals') {
    return { type:'capital', prompt:`¿Cuál es la capital de ${name}?`, media:null, answer:capital };
  }
  // mixed
  return Math.random()<0.5
    ? { type:'flag', prompt:`¿De qué país es esta bandera?`, media:flagUrl, answer:name }
    : { type:'capital', prompt:`¿Cuál es la capital de ${name}?`, media:null, answer:capital };
}

function pickOptions(correct, pool, type){
  // Devuelve 4 opciones mezcladas, 1 correcta + 3 distracciones
  const field = (type==='capital') ? (c=> (c.capital&&c.capital[0]) || null) : (c=> c.name?.common || null);
  const unique = new Set([correct]);
  const fill = [];
  let safety=0;
  while(fill.length<3 && safety<500){
    safety++;
    const cand = field(pool[randInt(pool.length)]);
    if (cand && !unique.has(cand)){
      unique.add(cand);
      fill.push(cand);
    }
  }
  const all = shuffle([correct, ...fill]);
  return all;
}

// ===== Flujo de juego =====
function show(el){ el.classList.remove('hidden') }
function hide(el){ el.classList.add('hidden') }

function setTimeBar(frac){
  $('#timeBar').style.width = `${clamp(frac,0,1)*100}%`;
}

function setQuestionUI(q){
  // loader bandera
  $('#flagSkeleton').classList.remove('hidden');
  $('#flagImg').classList.add('hidden');
  const flagImg = $('#flagImg');

  $('#questionText').textContent = q.prompt;
  if(q.type==='flag'){
    $('#flagWrap').classList.remove('hidden');
    flagImg.src = q.media;
    flagImg.onload = ()=> {
      $('#flagSkeleton').classList.add('hidden');
      flagImg.classList.remove('hidden');
    };
    flagImg.onerror = ()=> { $('#flagSkeleton').classList.add('hidden'); flagImg.classList.add('hidden'); };
  }else{
    $('#flagWrap').classList.remove('hidden');
    $('#flagSkeleton').classList.add('hidden');
    flagImg.classList.add('hidden');
  }
}

function renderQuestion(){
  const q = state.currentQ;
  setQuestionUI(q);
  const options = pickOptions(q.answer, state.pool, q.type);
  $$('.answer-btn').forEach((b,i)=>{
    b.disabled = false;
    b.dataset.value = options[i];
    b.setAttribute('aria-pressed','false');
    b.textContent = options[i];
  });
  state.locked = false;
}

function nextQuestion(){
  if(state.level==='survival'){
    $('#uiQTotal').textContent = '∞';
  }else{
    $('#uiQTotal').textContent = String(MAX_Q);
  }
  $('#uiQ').textContent = String(state.qIdx+1);
}

function updateHud(){
  $('#uiScore').textContent = String(state.score);
  $('#uiMode').textContent  = {flags:'Banderas',capitals:'Capitales',mixed:'Mixto'}[state.mode] || '—';
  $('#uiTheme').textContent = state.theme || '—';
  $('#uiLevel').textContent = LEVELS[state.level]?.label || '—';
}

function startTimer(){
  clearInterval(state.timer);
  const base = LEVELS[state.level].time;
  state.timeLeft = base;
  setTimeBar(1);
  $('#uiTime').textContent = String(base);
  state.timer = setInterval(()=>{
    state.timeLeft -= .1;
    $('#uiTime').textContent = String(Math.max(0,Math.ceil(state.timeLeft)));
    setTimeBar(state.timeLeft/base);
    if (state.timeLeft<=0){
      clearInterval(state.timer);
      onAnswer(null); // timeout = fallo
    }
  },100);
}

function stopTimer(){
  clearInterval(state.timer);
}

function buildRound(){
  // elige país y construye pregunta
  const c = state.pool[randInt(state.pool.length)];
  state.currentQ = buildQuestion(c, state.mode);
  renderQuestion();
  startTimer();
  nextQuestion();
  updateHud();
}

function endGame({survivalDead=false}={}){
  stopTimer();
  hide($('#panelGame'));
  show($('#panelEnd'));

  let title = survivalDead ? 'Fin — Supervivencia' : '¡Partida finalizada!';
  let icon  = survivalDead ? '🏅' : '🏆';

  $('#endTitle').textContent = title;
  $('#endIcon').textContent = icon;
  $('#endScore').textContent = String(state.score);
  $('#endHits').textContent  = String(state.hits);
  $('#endStreak').textContent= String(state.maxStreak);
}

function onAnswer(value){
  if(state.locked) return;
  state.locked = true;

  const isSurvival = state.level==='survival';
  const correct = (value === state.currentQ.answer);

  // Marcar UI
  $$('.answer-btn').forEach(b=>{
    const ok = (b.dataset.value === state.currentQ.answer);
    if (ok) b.classList.add('border-emerald-600');
    if (b.dataset.value === value) b.setAttribute('aria-pressed','true');
    b.disabled = true;
  });

  // Puntuación
  if (correct){
    state.hits++;
    state.streak++;
    state.maxStreak = Math.max(state.maxStreak, state.streak);
    state.score += LEVELS[state.level].pointsRight;
    // bonus supervivencia
    if (isSurvival){
      stopTimer();
      const add = LEVELS.survival.bonusPerHit || 2;
      const base = state.timeLeft + add;
      state.timeLeft = Math.min(base, 99);
      startTimer();
    }
  }else{
    // fallo
    if (isSurvival){
      endGame({survivalDead:true});
      return;
    }else{
      state.streak = 0;
      state.score += (LEVELS[state.level].pointsWrong||0);
    }
  }

  updateHud();

  // Siguiente
  if (isSurvival){
    state.qIdx++;
    setTimeout(()=>{ buildRound() }, 550);
  }else{
    state.qIdx++;
    if (state.qIdx>=MAX_Q){
      endGame({});
    }else{
      setTimeout(()=>{ buildRound() }, 550);
    }
  }
}

// ===== Controles =====
function bindSetup(){
  setup.modes.forEach(b=> b.addEventListener('click', ()=>{
    state.mode = b.dataset.mode;
    setPressed(setup.modes, b);
    tryStartIfReady();
  }));

  setup.themes.forEach(b=> b.addEventListener('click', ()=>{
    state.theme = b.dataset.theme;
    setPressed(setup.themes, b);
    tryStartIfReady();
  }));

  setup.levels.forEach(b=> b.addEventListener('click', ()=>{
    state.level = b.dataset.level;
    setPressed(setup.levels, b);
    tryStartIfReady();
  }));
}

function bindGame(){
  $$('.answer-btn').forEach(b=>{
    b.addEventListener('click', ()=>{
      if (state.locked) return;
      onAnswer(b.dataset.value);
    });
  });

  document.addEventListener('keydown', (e)=>{
    if (!state.started) return;
    const k = e.key;
    if (k>='1' && k<='4'){
      const idx = Number(k)-1;
      const btn = $(`.answer-btn[data-idx="${idx}"]`);
      btn?.click();
    }
    if (k==='p' || k==='P'){
      if (state.level==='survival') return; // no pausar en supervivencia
      openPause();
    }
  });

  $('#btnPause').addEventListener('click', ()=>{
    if (state.level==='survival') return;
    openPause();
  });
  $('#resumeBtn').addEventListener('click', ()=>{
    closePause();
  });

  $('#btnAgain').addEventListener('click', ()=>{
    // repetir con misma config
    startGame(true);
  });
  $('#btnSetup').addEventListener('click', ()=>{
    stopTimer();
    state.started = false;
    show($('#panelSetup'));
    hide($('#panelGame'));
    hide($('#panelEnd'));
  });

  $('#btnFullscreen').addEventListener('click', async ()=>{
    try{
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    }catch{}
  });
}

// ===== Pausa =====
function openPause(){
  stopTimer();
  $('#pauseModal')?.showModal();
}
function closePause(){
  $('#pauseModal')?.close();
  startTimer();
}

// ===== Inicio =====
async function startGame(keepConfig=false){
  if (!keepConfig){
    state.qIdx=0; state.score=0; state.hits=0; state.streak=0; state.maxStreak=0;
  }
  // preparar pool
  const all = await loadCountries();
  let pool = byTheme(all, state.theme||'World');
  // filtrar elementos válidos
  pool = pool.filter(c=>{
    const hasFlag = !!(c.flags?.svg || c.flags?.png);
    const hasCapital = !!(c.capital && c.capital[0]);
    if (state.mode==='flags') return hasFlag;
    if (state.mode==='capitals') return hasCapital;
    return hasFlag || hasCapital;
  });
  // seguridad
  if (pool.length<4) pool = all;

  state.pool = pool;

  // UI
  hide($('#panelSetup'));
  hide($('#panelEnd'));
  show($('#panelGame'));
  state.started = true;

  buildRound();
}

function tryStartIfReady(){
  if (state.mode && state.theme && state.level){
    startGame(false);
  }
}

// ===== Boot =====
bindSetup();
bindGame();
updateHud();

// Exponer para debugging (opcional)
// window.__state = state;
