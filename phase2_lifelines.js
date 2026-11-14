// PHASE 2: 30 second ka timer + 4 lifelines (har ek game mein sirf ek baar)
(() => {
  const TIME = 30, used = {};
  let t, timer;
  const say = m => $('toast').textContent = m;
  const draw = () => { $('timernum').textContent = t; $('timerbar').style.width = (t / TIME * 100) + '%'; $('timerbar').classList.toggle('low', t <= 10); };

  Game.on('start', () => { Object.keys(used).forEach(k => delete used[k]); document.querySelectorAll('[data-ll]').forEach(b => b.disabled = false); });
  Game.on('shown', () => {
    clearInterval(timer); t = TIME; draw(); say('');
    timer = setInterval(() => { t--; draw(); if (t <= 0) { clearInterval(timer); Game.answer(-1); } }, 1000);
  });
  Game.on('answered', () => clearInterval(timer));

  const LL = {
    fifty() {                                                  // 2 galat option hata do
      const d = Game.pool[Game.i], wrong = shuffle([0, 1, 2, 3].filter(i => i !== d.answer)).slice(0, 2);
      wrong.forEach(i => document.querySelectorAll('.opt')[i].style.visibility = 'hidden');
    },
    poll() {                                                   // sahi option ko sabse zyada vote
      const d = Game.pool[Game.i], c = 45 + Math.floor(Math.random() * 35), w = [0, 1, 2, 3].filter(i => i !== d.answer);
      const r = w.map(() => Math.random() + .1), sum = r.reduce((a, b) => a + b);
      const pct = { [d.answer]: c }; w.forEach((idx, k) => pct[idx] = Math.round(r[k] / sum * (100 - c)));
      document.querySelectorAll('.opt').forEach((b, i) => b.textContent += `  (${pct[i]}%)`);
    },
    expert() {                                                 // expert 80% baar sahi hota hai
      const d = Game.pool[Game.i], sure = Math.random() < .8;
      const pick = sure ? d.answer : shuffle([0, 1, 2, 3].filter(i => i !== d.answer))[0];
      say(`Expert: "Mera jawab ${'ABCD'[pick]} hai."`);
    },
    swap() {                                                   // naya sawaal le aao
      if (!Game.spare.length) return say('Extra sawaal nahi bacha.');
      Game.pool[Game.i] = Game.spare.pop(); Game.show();
    }
  };

  document.querySelectorAll('[data-ll]').forEach(b => b.onclick = () => {
    const k = b.dataset.ll;
    if (Game.locked || used[k]) return;
    used[k] = true; b.disabled = true; LL[k]();
  });
})();
