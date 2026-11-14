// PHASE 1: quiz ka engine (sawaal, jawab, strikes, level clear/fail)
const $ = id => document.getElementById(id);

const Game = {
  size: 5, pass: 4,              // TESTING. Asli game ke liye: size 30, pass 25
  i: 0, correct: 0, strikes: 0, locked: false, pool: [], spare: [], _h: {},
  on(name, fn) { (this._h[name] ||= []).push(fn); },          // baaki phases yahan judte hain
  emit(name, ...a) { (this._h[name] || []).forEach(f => f(...a)); }
};
Game.maxStrikes = () => Game.size - Game.pass;                // 30-25 = 5 galti allowed

const shuffle = a => [...a].sort(() => Math.random() - .5);
const show = id => document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));

Game.start = () => {
  const all = shuffle(QUESTIONS);
  Object.assign(Game, { i: 0, correct: 0, strikes: 0, pool: all.slice(0, Game.size), spare: all.slice(Game.size) });
  show('quiz'); Game.emit('start'); Game.show();
};

Game.show = () => {
  Game.locked = false;
  const d = Game.pool[Game.i];
  $('count').textContent  = `Sawaal ${Game.i + 1}/${Game.size}`;
  $('money').textContent  = '₹ ' + (Game.correct * 10000).toLocaleString('en-IN');
  $('hearts').textContent = '❤️'.repeat(Game.maxStrikes() + 1 - Game.strikes) + '🖤'.repeat(Game.strikes);
  $('qtext').textContent  = d.q;
  const box = $('opts'); box.innerHTML = '';
  d.options.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'opt'; b.textContent = 'ABCD'[i] + ') ' + t;
    b.onclick = () => Game.answer(i);
    box.appendChild(b);
  });
  Game.emit('shown', d);
};

Game.answer = i => {                                          // i = -1 matlab time khatam
  if (Game.locked) return;
  Game.locked = true;
  const d = Game.pool[Game.i], btns = document.querySelectorAll('.opt'), ok = i === d.answer;
  ok ? Game.correct++ : Game.strikes++;
  if (i >= 0) btns[i].classList.add(ok ? 'correct' : 'wrong');
  if (!ok) btns[d.answer].classList.add('correct');
  Game.emit('answered', ok);
  setTimeout(Game.next, 1500);
};

Game.next = () => {
  Game.i++;
  (Game.strikes > Game.maxStrikes() || Game.i >= Game.size) ? Game.end() : Game.show();
};

Game.end = () => {
  const won = Game.correct >= Game.pass;
  $('rtitle').textContent = won ? 'Level clear!' : 'Level fail';
  $('rtext').textContent = `${Game.correct} sahi jawab. Jeetne ke liye ${Game.pass} chahiye.`;
  show('result'); Game.emit('end', won);
};

$('play').onclick = Game.start;
$('retry').onclick = Game.start;

// Chamakte sitare
for (let i = 0; i < 90; i++) {
  const s = document.createElement('div'), z = Math.random() * 3 + 1;
  s.className = 'star';
  Object.assign(s.style, { width: z + 'px', height: z + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animationDelay: Math.random() * 2 + 's' });
  $('stars').appendChild(s);
}
