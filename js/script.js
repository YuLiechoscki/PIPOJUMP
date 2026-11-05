/* ---------------------------------------------------------
   1. Constantes de ajuste
   Distâncias em pixels, tempos em segundos (salvo quando
   o nome termina em _MS, que indica milissegundos).
   --------------------------------------------------------- */

// Tamanho do palco (o CSS usa as mesmas medidas).
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 400;

// Medidas do pintinho. "duckHeight" é a altura dele quando abaixado.
const PLAYER = { x: 80, width: 44, height: 48, duckHeight: 32 };

// Física do pulo.
const GRAVITY = 3000;               // quanto mais alto, mais rápido ele cai
const JUMP_SPEED = 850;             // impulso inicial do pulo
const FAST_FALL_MULTIPLIER = 2.4;   // gravidade extra ao apertar "abaixar" no ar
const SHORT_JUMP_FACTOR = 0.4;      // soltar a tecla cedo corta o pulo para 40%
const JUMP_BUFFER_TIME = 0.12;      // aceita o pulo apertado até 0,12 s antes de pousar

// Velocidade do cenário. Ela aumenta a cada ponto, até o limite.
const START_SPEED = 380;
const SPEED_PER_POINT = 20;
const MAX_SPEED = 950;
const MENU_SPEED = 120;             // cenário andando devagar no menu

// Progressão.
const POINTS_PER_LEVEL = 10;
const BANNER_DURATION_MS = 1400;    // quanto tempo o aviso "NÍVEL X" fica na tela
const RESTART_LOCKOUT_MS = 500;     // evita reiniciar sem querer logo após perder

// Perdão nas colisões: as caixas de colisão são um pouco menores que o desenho.
const PLAYER_HIT_MARGIN = 6;
const OBSTACLE_HIT_MARGIN = 3;

// Limite do tempo entre quadros. Evita "saltos" se a aba ficar parada.
const MAX_FRAME_TIME = 0.033;

// Obstáculos no chão. "cls" é a classe CSS que dá a aparência.
const GROUND_OBSTACLES = [
  { cls: 'stump', width: 36, height: 40 },   // toco
  { cls: 'tall',  width: 32, height: 62 },   // tronco alto
  { cls: 'bush',  width: 58, height: 36 },   // arbusto
];
// Só toco e tronco entram nos pares, para o pulo duplo não ficar impossível.
const CLUSTER_OBSTACLES = GROUND_OBSTACLES.slice(0, 2);

// Tipos de pássaro. Todos voam a 30 px do chão, então dá para passar abaixado.
// "minScore" é a pontuação a partir da qual o tipo começa a aparecer;
// "weight" é a chance relativa de ser sorteado entre os tipos liberados.
const BIRD_TYPES = [
  // Corvo (vermelho): abaixado OU pulando por cima.
  { name: 'corvo', cls: 'bird', width: 42, height: 26, y: 30, minScore: 6, weight: 3 },

  // Bando (roxo): 4 pássaros empilhados formam uma parede alta demais para pular.
  // Só dá para passar ABAIXADO. "layerSpacing" é a distância vertical entre eles.
  { name: 'bando', cls: 'bird flock', width: 42, height: 26, y: 30, minScore: 10, weight: 2,
    stack: 4, layerSpacing: 28 },

  // Falcão (azul): menor e 40% mais rápido que o cenário. Dá para pular ou abaixar,
  // mas o tempo de reação é bem menor.
  { name: 'falcao', cls: 'bird fast', width: 38, height: 22, y: 30, minScore: 14, weight: 2,
    speedBoost: 0.4 },
];

// Quanto cada camada do cenário anda em relação ao chão (efeito de profundidade).
const FAR_HILLS_SPEED_RATIO = 0.15;
const NEAR_HILLS_SPEED_RATIO = 0.35;
const CLOUD_SPEED_RATIO = 0.02;

// Largura de cada "azulejo" repetido do cenário (precisa bater com o CSS).
const GROUND_TILE = 70;
const FAR_HILLS_TILE = 400;
const NEAR_HILLS_TILE = 300;

// Skins do pintinho. "id" bate com data-skin no CSS (style.css, seção 4b);
// "color" e "icon" só desenham o botão de escolha no menu.
// "unlockAt" é o recorde necessário para liberar a skin (0 = já vem liberada).
const SKINS = [
  { id: 'classico', name: 'Clássico',  color: '#ffcf4a', icon: '',   unlockAt: 0 },
  { id: 'rosa',     name: 'Laço',      color: '#ff9ec4', icon: '🎀', unlockAt: 5 },
  { id: 'azul',     name: 'Azulzinho', color: '#6ec3ff', icon: '',   unlockAt: 10 },
  { id: 'verde',    name: 'Limão',     color: '#7ae582', icon: '',   unlockAt: 15 },
  { id: 'ninja',    name: 'Ninja',     color: '#3a3a4a', icon: '🥷', unlockAt: 25 },
  { id: 'rei',      name: 'Rei',       color: '#ffcf4a', icon: '👑', unlockAt: 35 },
  { id: 'mago',     name: 'Mago',      color: '#c9b3ff', icon: '🧙', unlockAt: 50 },
];

// Animação de morte: o caixão bate no chão depois deste tempo (igual ao CSS, seção 4c).
const COFFIN_FALL_MS = 450;

// Frases da tela de game over, conforme o que derrubou o pintinho.
const DEATH_QUIPS = {
  stump: ['Tropeçou no toco. Clássico.', 'O toco nem se mexeu.', 'Toco 1 x 0 Pipo.'],
  tall:  ['Bateu de cara no tronco.', 'Tronco alto demais para o Pipo.', 'Esse tronco veio do nada!'],
  bush:  ['Se perdeu no arbusto.', 'Virou parte da folhagem.', 'O arbusto venceu.'],
  bird:  ['Um corvo não foi com a cara do Pipo.', 'Voo rasante fatal.', 'Corvo 1 x 0 Pipo.'],
  flock: ['O bando passou por cima.', 'Era para ter abaixado...', 'Pássaros demais para um pintinho.'],
  fast:  ['O falcão foi rápido demais.', 'Nem deu tempo de piscar.', 'Mais veloz que o Pipo.'],
};

const JUMP_KEYS = ['ArrowUp', 'Space', 'KeyW'];
const DUCK_KEYS = ['ArrowDown', 'KeyS'];


/* ---------------------------------------------------------
   2. Elementos da página
   --------------------------------------------------------- */

const byId = (id) => document.getElementById(id);

const stage = byId('stage');
const playerEl = byId('player');
const obstacleLayer = byId('obstacles');
const cloudLayer = byId('clouds');

const scoreEl = byId('score');
const bestScoreEl = byId('best');
const levelEl = byId('level');
const levelBanner = byId('level-banner');

const startScreen = byId('start-screen');
const gameOverScreen = byId('over-screen');


/* ---------------------------------------------------------
   3. Estado do jogo
   --------------------------------------------------------- */

// Em que momento o jogo está: 'menu', 'playing', 'paused' ou 'over'.
let gameState = 'menu';

let score = 0;
let bestScore = loadBestScore();
let currentLevel = 0;               // começa em 0; na tela mostramos +1
let scrollSpeed = MENU_SPEED;

// Posição vertical do pintinho: 0 = no chão, valores maiores = no ar.
let playerAltitude = 0;
let playerVelocityY = 0;
let isDucking = false;
let duckPointerId = null;           // qual dedo/mouse está segurando "abaixar"

let jumpBufferTimer = 0;            // tempo restante em que um pulo adiantado ainda vale
let gameOverTime = 0;               // quando o jogador perdeu (para a trava de reinício)

let obstacles = [];
let distanceUntilNextObstacle = 0;

let sceneryOffset = { ground: 0, farHills: 0, nearHills: 0 };
let clouds = [];
let bannerTimeout = null;
let lastFrameTime = performance.now();


/* ---------------------------------------------------------
   4. Som, recorde e escala da tela
   --------------------------------------------------------- */

// Toca um "bip" simples. Os sons são gerados na hora, sem arquivos de áudio.
let audioContext = null;
function playBeep(frequency, duration = 0.1, wave = 'square', volume = 0.05, pitchChange = 0) {
  try {
    // O navegador só libera áudio depois de uma ação do jogador, por isso criamos aqui.
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (pitchChange) {
      oscillator.frequency.exponentialRampToValueAtTime(frequency + pitchChange, now + duration);
    }
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch { /* sem áudio disponível: o jogo segue sem som */ }
}

// O recorde fica salvo no navegador. Se o armazenamento estiver bloqueado, ignoramos.
function loadBestScore() {
  try { return Number(localStorage.getItem('pipoBest')) || 0; } catch { return 0; }
}
function saveBestScore(value) {
  try { localStorage.setItem('pipoBest', value); } catch { /* ignora */ }
}

// A skin escolhida também fica salva no navegador.
function loadSkin() {
  try {
    const saved = localStorage.getItem('pipoSkin');
    const skin = SKINS.find((item) => item.id === saved);
    return skin && bestScore >= skin.unlockAt ? skin.id : SKINS[0].id;
  } catch { return SKINS[0].id; }
}
function saveSkin(id) {
  try { localStorage.setItem('pipoSkin', id); } catch { /* ignora */ }
}

let currentSkin = loadSkin();
let skinHintTimeout = null;

// Aplica a skin no pintinho e marca o botão correspondente no menu.
function applySkin(id) {
  currentSkin = id;
  clearTimeout(skinHintTimeout);
  playerEl.dataset.skin = id;
  saveSkin(id);
  byId('skin-name').textContent = SKINS.find((skin) => skin.id === id).name;
  document.querySelectorAll('.skin-btn').forEach((btn) => {
    btn.setAttribute('aria-checked', btn.dataset.skin === id);
  });
}

// Passa para a skin anterior (-1) ou seguinte (+1), dando a volta na lista.
function cycleSkin(direction) {
  let index = SKINS.findIndex((skin) => skin.id === currentSkin);
  // Anda na lista pulando as skins ainda bloqueadas (o clássico nunca é bloqueado).
  do {
    index = (index + direction + SKINS.length) % SKINS.length;
  } while (!isUnlocked(SKINS[index]));
  applySkin(SKINS[index].id);
  playBeep(520, 0.06, 'square', 0.03);
}

const isUnlocked = (skin) => bestScore >= skin.unlockAt;

// Cadeado nas skins bloqueadas; chamada ao montar o menu e quando o recorde sobe.
function updateSkinLocks() {
  document.querySelectorAll('.skin-btn').forEach((btn) => {
    const skin = SKINS.find((item) => item.id === btn.dataset.skin);
    const locked = !isUnlocked(skin);
    btn.classList.toggle('locked', locked);
    btn.setAttribute('aria-disabled', locked);
    btn.textContent = locked ? '🔒' : skin.icon;
    btn.title = locked ? `Libera com ${skin.unlockAt} pontos` : skin.name;
  });
}

// Clicou numa skin bloqueada: mostra por um instante quantos pontos faltam.
function showLockedHint(skin) {
  playBeep(140, 0.12, 'square', 0.04);
  const nameEl = byId('skin-name');
  nameEl.textContent = `🔒 ${skin.unlockAt} pontos`;
  clearTimeout(skinHintTimeout);
  skinHintTimeout = setTimeout(() => {
    nameEl.textContent = SKINS.find((item) => item.id === currentSkin).name;
  }, 1800);
}

function createSkinPicker() {
  const picker = byId('skin-picker');
  for (const skin of SKINS) {
    const btn = document.createElement('button');
    btn.className = 'skin-btn';
    btn.dataset.skin = skin.id;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-label', skin.name);
    btn.title = skin.name;
    btn.style.background = skin.color;
    btn.textContent = skin.icon;
    btn.addEventListener('click', (event) => {
      event.currentTarget.blur();   // evita que o Espaço "clique" o botão de novo
      if (!isUnlocked(skin)) { showLockedHint(skin); return; }
      applySkin(skin.id);
      playBeep(520, 0.06, 'square', 0.03);
    });
    picker.appendChild(btn);
  }
  updateSkinLocks();
  applySkin(currentSkin);
}

// Ajusta o tamanho do palco para caber em qualquer tela, mantendo a proporção.
function fitStageToWindow() {
  const scale = Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function createClouds() {
  for (let i = 0; i < 4; i++) {
    const cloudEl = document.createElement('div');
    cloudEl.className = 'cloud';
    cloudEl.style.width = 70 + Math.random() * 60 + 'px';
    cloudEl.style.top = 20 + Math.random() * 90 + 'px';
    cloudLayer.appendChild(cloudEl);
    clouds.push({ el: cloudEl, x: i * 220 + Math.random() * 100 });
  }
}


/* ---------------------------------------------------------
   5. Telas: menu, jogo, pausa e game over
   --------------------------------------------------------- */

// Mostra um aviso grande no meio da tela (ex.: "NÍVEL 2").
function showBanner(text, { stayVisible = false } = {}) {
  levelBanner.textContent = text;
  levelBanner.classList.add('show');
  clearTimeout(bannerTimeout);
  if (!stayVisible) {
    bannerTimeout = setTimeout(() => levelBanner.classList.remove('show'), BANNER_DURATION_MS);
  }
}

function hideBanner() {
  clearTimeout(bannerTimeout);
  levelBanner.classList.remove('show');
}

// A cada POINTS_PER_LEVEL pontos sobe de nível; níveis ímpares viram noite.
function updateLevel() {
  const newLevel = Math.floor(score / POINTS_PER_LEVEL);
  if (newLevel <= currentLevel) return;

  currentLevel = newLevel;
  levelEl.textContent = currentLevel + 1;
  stage.classList.toggle('night', currentLevel % 2 === 1);
  showBanner('NÍVEL ' + (currentLevel + 1));
}

// Zera tudo o que muda durante uma partida.
function resetRun(speed) {
  clearObstacles();
  score = 0;
  currentLevel = 0;
  scrollSpeed = speed;
  playerAltitude = 0;
  playerVelocityY = 0;
  distanceUntilNextObstacle = 0;
  jumpBufferTimer = 0;
  scoreEl.textContent = 0;
  levelEl.textContent = 1;
  hideBanner();
}

function startGame() {
  clearDeathEffects();
  resetRun(START_SPEED);
  bestScoreEl.textContent = bestScore;
  stage.classList.remove('menu', 'over', 'night');
  startScreen.classList.remove('visible');
  gameOverScreen.classList.remove('visible');
  gameState = 'playing';
}

function goToMenu() {
  clearDeathEffects();
  resetRun(MENU_SPEED);
  isDucking = false;
  gameState = 'menu';
  stage.classList.remove('over', 'night');
  stage.classList.add('menu');
  gameOverScreen.classList.remove('visible');
  startScreen.classList.add('visible');
}

// Timers da animação de morte, guardados para poder cancelar se o jogador reiniciar logo.
let deathTimers = [];
function later(callback, ms) {
  deathTimers.push(setTimeout(callback, ms));
}

// Desfaz tudo da animação de morte (caixão, fantasma, penas, tremida).
function clearDeathEffects() {
  deathTimers.forEach(clearTimeout);
  deathTimers = [];
  stage.classList.remove('dead', 'shake');
  byId('fx').innerHTML = '';
}

// Explosão de penas na cor da skin atual, saindo de baixo do caixão.
function spawnFeathers() {
  const color = SKINS.find((skin) => skin.id === currentSkin).color;
  const layer = byId('fx');
  for (let i = 0; i < 12; i++) {
    const feather = document.createElement('div');
    feather.className = 'feather';
    feather.style.background = color;
    feather.style.setProperty('--dx', (Math.random() * 180 - 90) + 'px');
    feather.style.setProperty('--rise', -(40 + Math.random() * 80) + 'px');
    feather.style.setProperty('--fall', (30 + Math.random() * 50) + 'px');
    feather.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    layer.appendChild(feather);
  }
}

// Trombone triste: quatro notas descendo.
function playSadTrombone() {
  [[392, 0], [370, 220], [349, 440]].forEach(([note, delay]) => {
    later(() => playBeep(note, 0.2, 'sawtooth', 0.04), delay);
  });
  later(() => playBeep(330, 0.7, 'sawtooth', 0.04, -40), 660);
}

// Um caixão cai sobre o pintinho, as penas voam, a tela treme e um fantasminha sobe.
// As posições e os tempos ficam no CSS (seção 4c); aqui só ligamos o estado "dead".
function playDeathAnimation() {
  stage.style.setProperty('--death-alt', playerAltitude + 'px');   // se morreu no ar, o caixão cai até lá
  stage.classList.add('dead');
  playBeep(700, 0.45, 'sine', 0.04, -500);   // assobio da queda

  later(() => {
    stage.classList.add('shake');
    spawnFeathers();
    playBeep(110, 0.2, 'square', 0.08, -60);   // pancada
    playSadTrombone();
    later(() => stage.classList.remove('shake'), 400);
  }, COFFIN_FALL_MS);
}

function endGame(hitObstacle) {
  gameState = 'over';
  gameOverTime = performance.now();

  const previousBest = bestScore;
  const isNewRecord = score > bestScore;
  if (isNewRecord) {
    bestScore = score;
    saveBestScore(bestScore);
  }

  // Skins que o novo recorde acabou de liberar.
  const unlocked = SKINS.filter((skin) => skin.unlockAt > previousBest && skin.unlockAt <= bestScore);
  updateSkinLocks();

  const quips = DEATH_QUIPS[hitObstacle ? hitObstacle.kind : 'bird'] || DEATH_QUIPS.bird;
  byId('death-quip').textContent = pickRandom(quips);

  byId('final-score').textContent = score;
  byId('final-best').textContent = bestScore;
  byId('new-record').textContent = 'Novo recorde!' +
    (unlocked.length ? ' Skin nova: ' + unlocked.map((skin) => skin.name).join(', ') : '');
  byId('new-record').style.visibility = isNewRecord ? 'visible' : 'hidden';
  bestScoreEl.textContent = bestScore;

  stage.classList.add('over');
  playDeathAnimation();
  gameOverScreen.classList.add('visible');
}

function togglePause() {
  if (gameState === 'playing') {
    gameState = 'paused';
    isDucking = false;
    showBanner('PAUSADO', { stayVisible: true });
  } else if (gameState === 'paused') {
    gameState = 'playing';
    hideBanner();
  }
}

// Só deixa reiniciar depois de um instante, para um clique acidental não pular o game over.
function canRestart() {
  return performance.now() - gameOverTime > RESTART_LOCKOUT_MS;
}

function clearObstacles() {
  obstacles.forEach((obstacle) => obstacle.el.remove());
  obstacles = [];
}


/* ---------------------------------------------------------
   6. Controles (teclado, mouse e toque)
   --------------------------------------------------------- */

function jump() {
  if (gameState !== 'playing') return;

  // Ainda no ar? Guardamos o pedido: se o pintinho pousar logo em seguida, ele pula de novo.
  if (playerAltitude > 0) {
    jumpBufferTimer = JUMP_BUFFER_TIME;
    return;
  }

  playerVelocityY = JUMP_SPEED;
  playBeep(320, 0.15, 'square', 0.04, 260);
}

window.addEventListener('keydown', (event) => {
  if (event.repeat) return;   // ignora a tecla segurada repetindo

  // No game over: Esc ou M voltam ao menu.
  if (gameState === 'over' && (event.code === 'Escape' || event.code === 'KeyM')) {
    goToMenu();
    return;
  }

  // No menu: setas esquerda/direita (ou A/D) trocam a skin.
  if (gameState === 'menu' && ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(event.code)) {
    event.preventDefault();
    cycleSkin(event.code === 'ArrowLeft' || event.code === 'KeyA' ? -1 : 1);
    return;
  }

  if (event.code === 'KeyP' || event.code === 'Escape') {
    togglePause();
    return;
  }

  // Espaço ou Enter começam a partida no menu e reiniciam no game over.
  const isStartKey = event.code === 'Space' || event.code === 'Enter';
  if (isStartKey && (gameState === 'menu' || gameState === 'over')) {
    event.preventDefault();
    if (gameState === 'menu' || canRestart()) startGame();
    return;
  }

  if (JUMP_KEYS.includes(event.code) && gameState === 'playing') {
    event.preventDefault();
    jump();
  }
  if (DUCK_KEYS.includes(event.code)) {
    event.preventDefault();
    isDucking = true;
  }
});

window.addEventListener('keyup', (event) => {
  // Soltar a tecla de pulo ainda subindo rápido = pulo curto.
  const stillRisingFast = playerVelocityY > JUMP_SPEED * SHORT_JUMP_FACTOR;
  if (JUMP_KEYS.includes(event.code) && stillRisingFast) {
    playerVelocityY = JUMP_SPEED * SHORT_JUMP_FACTOR;
  }
  if (DUCK_KEYS.includes(event.code)) isDucking = false;
});

// Toque/mouse: lado esquerdo (35% da tela) abaixa, o resto pula.
stage.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button')) return;   // cliques nos botões não contam como pulo

  const stageBox = stage.getBoundingClientRect();
  const clickPositionX = (event.clientX - stageBox.left) / stageBox.width;

  if (clickPositionX < 0.35) {
    isDucking = true;
    duckPointerId = event.pointerId;
  } else {
    jump();
  }
});

function stopDuckingWithPointer(event) {
  if (event.pointerId === duckPointerId) {
    isDucking = false;
    duckPointerId = null;
  }
}
window.addEventListener('pointerup', stopDuckingWithPointer);
window.addEventListener('pointercancel', stopDuckingWithPointer);

// Se o jogador troca de aba ou janela, pausa e solta a tecla de abaixar.
window.addEventListener('blur', () => {
  isDucking = false;
  if (gameState === 'playing') togglePause();
});

// Botões das telas.
byId('play-btn').addEventListener('click', (event) => {
  event.currentTarget.blur();   // tira o foco para o Espaço não "clicar" o botão de novo
  startGame();
});
byId('retry-btn').addEventListener('click', (event) => {
  event.currentTarget.blur();
  if (canRestart()) startGame();
});
byId('menu-btn').addEventListener('click', (event) => {
  event.currentTarget.blur();
  goToMenu();
});


/* ---------------------------------------------------------
   7. Obstáculos e colisão
   --------------------------------------------------------- */

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

// Cria um obstáculo na posição x. "pointsWhenPassed" é quanto vale ao ser ultrapassado
// (em pares, só o segundo conta, para o par valer 1 ponto no total).
function addObstacle(type, x, pointsWhenPassed) {
  const el = document.createElement('div');
  el.className = 'obstacle ' + type.cls;
  el.style.width = type.width + 'px';
  el.style.height = type.height + 'px';
  if (type.y) el.style.bottom = `calc(var(--ground-h) + ${type.y}px)`;
  obstacleLayer.appendChild(el);

  obstacles.push({
    el, x,
    y: type.y || 0,
    width: type.width,
    height: type.height,
    pointsWhenPassed,
    speedBoost: type.speedBoost || 0,   // 0 = anda junto com o cenário
    alreadyScored: false,
    kind: type.cls.split(' ').pop(),   // stump, tall, bush, bird, flock ou fast (escolhe a frase do game over)
  });
}

// Sorteia um tipo de pássaro entre os já liberados pela pontuação, respeitando os pesos.
function pickBirdType() {
  const available = BIRD_TYPES.filter((bird) => score >= bird.minScore);
  let roll = Math.random() * available.reduce((sum, bird) => sum + bird.weight, 0);
  for (const bird of available) {
    roll -= bird.weight;
    if (roll < 0) return bird;
  }
  return available[0];
}

// Cria um pássaro (ou um bando empilhado) e devolve a largura que ele ocupa.
function spawnBird(x) {
  const type = pickBirdType();
  const layers = type.stack || 1;
  for (let i = 0; i < layers; i++) {
    const layer = { ...type, y: type.y + i * (type.layerSpacing || 0) };
    const isLast = i === layers - 1;
    addObstacle(layer, x, isLast ? 1 : 0);   // o bando todo vale 1 ponto
  }
  return type.width;
}

// Escolhe o que aparece a seguir: pássaro, par de obstáculos ou um obstáculo só.
// Pássaros e pares só aparecem depois de alguns pontos e ficam mais comuns aos poucos.
function spawnObstacle() {
  const spawnX = STAGE_WIDTH + 20;   // logo depois da borda direita
  let occupiedWidth;

  const birdChance    = score >= 6 ? Math.min(0.28, 0.08 + (score - 6) * 0.015) : 0;
  const clusterChance = score >= 3 ? Math.min(0.35, (score - 2) * 0.03) : 0;
  const roll = Math.random();

  if (roll < birdChance) {
    occupiedWidth = spawnBird(spawnX);
  } else if (roll < birdChance + clusterChance) {
    const first = pickRandom(CLUSTER_OBSTACLES);
    const second = pickRandom(CLUSTER_OBSTACLES);
    const spaceBetween = 18 + Math.random() * 16;
    addObstacle(first, spawnX, 0);
    addObstacle(second, spawnX + first.width + spaceBetween, 1);
    occupiedWidth = first.width + spaceBetween + second.width;
  } else {
    const type = pickRandom(GROUND_OBSTACLES);
    addObstacle(type, spawnX, 1);
    occupiedWidth = type.width;
  }

  // A pausa até o próximo obstáculo é proporcional à velocidade, mas encurta com a pontuação.
  const tightness = Math.max(0.8, 1.1 - score * 0.01);
  const gap = scrollSpeed * (tightness + Math.random() * 0.6) + 80;
  distanceUntilNextObstacle = occupiedWidth + gap;
}

// O pintinho bateu no obstáculo? Compara duas caixas retangulares (um pouco encolhidas).
function collidesWithPlayer(obstacle) {
  const playerHeight = (isDucking && playerAltitude === 0) ? PLAYER.duckHeight : PLAYER.height;

  const playerLeft   = PLAYER.x + PLAYER_HIT_MARGIN;
  const playerRight  = PLAYER.x + PLAYER.width - PLAYER_HIT_MARGIN;
  const playerBottom = playerAltitude + PLAYER_HIT_MARGIN;
  const playerTop    = playerAltitude + playerHeight - PLAYER_HIT_MARGIN;

  const obstacleLeft   = obstacle.x + OBSTACLE_HIT_MARGIN;
  const obstacleRight  = obstacle.x + obstacle.width - OBSTACLE_HIT_MARGIN;
  const obstacleBottom = obstacle.y > 0 ? obstacle.y + OBSTACLE_HIT_MARGIN : 0;   // no chão, encosta no solo
  const obstacleTop    = obstacle.y + obstacle.height - OBSTACLE_HIT_MARGIN;

  return playerLeft < obstacleRight && playerRight > obstacleLeft
      && playerBottom < obstacleTop && playerTop > obstacleBottom;
}


/* ---------------------------------------------------------
   8. Atualização, desenho e loop principal
   --------------------------------------------------------- */

// Move o pintinho segundo a gravidade.
function updatePlayerPhysics(dt) {
  const isInAir = playerAltitude > 0 || playerVelocityY > 0;
  if (!isInAir) return;

  // Abaixar durante a queda faz cair mais rápido.
  const isFalling = playerVelocityY < 0;
  const gravity = (isDucking && isFalling) ? GRAVITY * FAST_FALL_MULTIPLIER : GRAVITY;

  playerVelocityY -= gravity * dt;
  playerAltitude += playerVelocityY * dt;

  if (playerAltitude <= 0) {   // pousou
    playerAltitude = 0;
    playerVelocityY = 0;
    if (jumpBufferTimer > 0) jump();   // havia um pulo adiantado esperando
  }
}

// Marca ponto quando o obstáculo passa totalmente por trás do pintinho.
function scoreIfPassed(obstacle) {
  const passedPlayer = obstacle.x + obstacle.width < PLAYER.x;
  if (obstacle.alreadyScored || !passedPlayer) return;

  obstacle.alreadyScored = true;
  if (!obstacle.pointsWhenPassed) return;

  score += obstacle.pointsWhenPassed;
  scoreEl.textContent = score;
  playBeep(660, 0.07, 'square', 0.03);
  updateLevel();
}

// Lógica de um quadro da partida. "dt" é o tempo desde o quadro anterior, em segundos.
function update(dt) {
  scrollSpeed = Math.min(START_SPEED + score * SPEED_PER_POINT, MAX_SPEED);

  updatePlayerPhysics(dt);
  jumpBufferTimer = Math.max(0, jumpBufferTimer - dt);

  // Hora de criar outro obstáculo?
  distanceUntilNextObstacle -= scrollSpeed * dt;
  if (distanceUntilNextObstacle <= -3) spawnObstacle();

  for (const obstacle of obstacles) {
    obstacle.x -= scrollSpeed * (1 + obstacle.speedBoost) * dt;
    scoreIfPassed(obstacle);
    if (collidesWithPlayer(obstacle)) {
      endGame(obstacle);
      return;
    }
  }

  // Remove da página os obstáculos que já saíram pela esquerda.
  obstacles = obstacles.filter((obstacle) => {
    const isOffScreen = obstacle.x + obstacle.width < -20;
    if (isOffScreen) obstacle.el.remove();
    return !isOffScreen;
  });
}

// Atualiza a aparência de acordo com o estado atual.
function render() {
  playerEl.style.transform = `translateY(${-playerAltitude}px)`;
  playerEl.classList.toggle('airborne', playerAltitude > 0);
  playerEl.classList.toggle('ducking', isDucking && playerAltitude === 0 && gameState === 'playing');
  for (const obstacle of obstacles) {
    obstacle.el.style.transform = `translateX(${obstacle.x}px)`;
  }
}

// Move chão, colinas e nuvens. Camadas mais distantes andam mais devagar.
function scrollScenery(dt) {
  sceneryOffset.ground    -= scrollSpeed * dt;
  sceneryOffset.farHills  -= scrollSpeed * FAR_HILLS_SPEED_RATIO * dt;
  sceneryOffset.nearHills -= scrollSpeed * NEAR_HILLS_SPEED_RATIO * dt;

  // O "%" faz o padrão repetir sem o número crescer para sempre.
  stage.style.setProperty('--g',  (sceneryOffset.ground    % GROUND_TILE)    + 'px');
  stage.style.setProperty('--h1', (sceneryOffset.farHills  % FAR_HILLS_TILE)  + 'px');
  stage.style.setProperty('--h2', (sceneryOffset.nearHills % NEAR_HILLS_TILE) + 'px');

  for (const cloud of clouds) {
    cloud.x -= scrollSpeed * CLOUD_SPEED_RATIO * dt;
    if (cloud.x < -160) cloud.x = STAGE_WIDTH + Math.random() * 100;   // reaparece à direita
    cloud.el.style.transform = `translateX(${cloud.x}px)`;
  }
}

// Roda a cada quadro da tela (cerca de 60 vezes por segundo).
function gameLoop(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, MAX_FRAME_TIME);
  lastFrameTime = now;

  if (gameState === 'menu') scrollSpeed = MENU_SPEED;
  if (gameState === 'playing') update(dt);
  if (gameState === 'menu' || gameState === 'playing') scrollScenery(dt);   // congela no pause e no game over
  render();

  requestAnimationFrame(gameLoop);
}


/* ---------------------------------------------------------
   Início
   --------------------------------------------------------- */

bestScoreEl.textContent = bestScore;
createSkinPicker();
createClouds();
fitStageToWindow();
window.addEventListener('resize', fitStageToWindow);
requestAnimationFrame(gameLoop);