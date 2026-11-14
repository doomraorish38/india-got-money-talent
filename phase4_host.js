// PHASE 4: host ki awaaz, dialogues, sound effects, confetti, aur asli human 3D model (optional)
(() => {
  Game.host = Game.host || {};
  const pick = a => a[Math.floor(Math.random() * a.length)];

  // ===== 1. DIALOGUES. Phase 6 mein admin panel yahi list badlega. Hindi voice ke liye Devanagari mein likho =====
  const LINES = {
    start:   ["नमस्ते दोस्तों! इंडिया गॉट मनी टैलेंट में आपका स्वागत है। चलिए, खेल शुरू करते हैं!"],
    ask:     ["सवाल नंबर {n}. ध्यान से सुनिए।", "ये रहा सवाल नंबर {n}.", "सवाल नंबर {n}, दिमाग लगाइए!"],
    correct: ["शानदार! बिल्कुल सही जवाब!", "वाह भाई वाह! दिमाग तो तेज़ चल रहा है!", "सही पकड़ा है! क्या बात है!"],
    wrong:   ["ओह हो! ये तो गलत हो गया।", "अरे अरे अरे! इतना आसान था, फिर भी! खैर, आगे बढ़ते हैं।", "गलत जवाब! पर हिम्मत मत हारिए।"],
    timeout: ["समय खत्म! इतना सोचेंगे तो सवाल चाय पीने चला जाएगा!", "घड़ी रुकी नहीं, और आपका जवाब आया नहीं!"],
    roast:   ["वैसे, आपका दिमाग गरम चाय जैसा है। थोड़ा धीरे चलता है, पर चलता ज़रूर है!", "घबराइए मत, मेरा चश्मा भी कभी कभी आपसे ज़्यादा जवाब जानता है!"],
    win:     ["बधाई हो! आपने ये लेवल जीत लिया! क्या खेले आप!"],
    lose:    ["अफसोस! इस बार लेवल पूरा नहीं हो पाया। पर एक बार और कोशिश कीजिए!"]
  };

  // ===== 2. Awaaz: browser ki apni Hindi voice (free). Queue se line ek ke baad ek bolti hai =====
  const synth = window.speechSynthesis;
  let voice = null, muted = false, queue = [], cur = null, mouthTimer;
  const pickVoice = () => { const v = synth.getVoices().filter(x => /^hi/i.test(x.lang)); voice = v.find(x => /hemant|madhur|male/i.test(x.name)) || v[0] || null; };
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }

  const sub = document.createElement('div'); sub.id = 'subtitle'; document.body.appendChild(sub);
  const mute = document.createElement('button'); mute.id = 'mute'; mute.textContent = '🔊'; document.body.appendChild(mute);
  mute.onclick = () => { muted = !muted; mute.textContent = muted ? '🔇' : '🔊'; if (muted) stop(); };
  const css = document.createElement('style');
  css.textContent = `#subtitle{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:min(900px,92vw);padding:10px 20px;border-radius:14px;background:#000b;color:#fff;font:600 1.1rem Mukta,sans-serif;text-align:center;opacity:0;transition:opacity .3s;pointer-events:none;z-index:6}
#subtitle.on{opacity:1}#mute{position:fixed;top:12px;right:12px;z-index:7;font-size:1.3rem;background:#0008;border:2px solid #ffc933;border-radius:50%;width:46px;height:46px;cursor:pointer}`;
  document.head.appendChild(css);

  function talking(on) {
    Game.host.talking = on; clearInterval(mouthTimer);
    if (on) mouthTimer = setInterval(() => Game.host.say && Game.host.say(0.3), 200);   // phase 3 ka muh hilta rahe
  }
  function stop() { queue = []; cur = null; talking(false); if (synth) synth.cancel(); sub.classList.remove('on'); }
  function next() {
    if (cur || !queue.length) return;
    const me = cur = queue.shift();
    const done = () => { if (cur !== me) return; cur = null; talking(false); sub.classList.remove('on'); next(); };
    sub.textContent = me.text; sub.classList.add('on'); talking(true);
    if (muted || !synth) return void setTimeout(done, Math.max(1500, me.text.length * 70));
    const u = new SpeechSynthesisUtterance(me.text);
    u.lang = 'hi-IN'; if (voice) u.voice = voice; u.rate = 0.95; u.pitch = 0.85;
    u.onend = u.onerror = done; synth.speak(u);
  }
  const say = (text, kind = '') => { queue.push({ text, kind }); next(); };

  // ===== 3. Sound effects (WebAudio se, koi file nahi chahiye) =====
  let ctx; const ac = () => ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());
  function beep(f, d, type = 'triangle', v = 0.18, at = 0) {
    if (muted) return;
    const c = ac(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d);
  }
  const sfx = {
    correct: () => [523, 659, 784].forEach((f, i) => beep(f, 0.25, 'triangle', 0.2, i * 0.1)),
    wrong:   () => beep(110, 0.6, 'sawtooth', 0.2),
    win:     () => [523, 659, 784, 1047, 1319].forEach((f, i) => beep(f, 0.4, 'triangle', 0.22, i * 0.15))
  };

  // ===== 4. Confetti =====
  const cv = document.createElement('canvas'), cx = cv.getContext('2d'); let parts = [], running = false;
  Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '5' });
  document.body.appendChild(cv);
  function confetti(n) {
    cv.width = innerWidth; cv.height = innerHeight;
    for (let i = 0; i < n; i++) parts.push({ x: Math.random() * cv.width, y: -20 - Math.random() * 200, vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4, s: 5 + Math.random() * 7, r: Math.random() * 6, c: `hsl(${Math.random() * 360},90%,60%)` });
    if (running) return; running = true;
    (function frame() {
      cx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.r += 0.2; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); cx.restore(); });
      parts = parts.filter(p => p.y < cv.height + 20);
      parts.length ? requestAnimationFrame(frame) : (running = false, cx.clearRect(0, 0, cv.width, cv.height));
    })();
  }

  // ===== 5. Game ke signals se jodna =====
  Game.on('start', () => { stop(); say(pick(LINES.start), 'start'); });
  Game.on('shown', d => {
    queue = queue.filter(x => x.kind !== 'ask');
    if (cur && cur.kind === 'ask') stop();
    say(pick(LINES.ask).replace('{n}', Game.i + 1), 'ask');
    say(d.q + '... ' + d.options.map((o, i) => 'ABCD'[i] + ', ' + o).join('... '), 'ask');
  });
  Game.on('answered', ok => {
    stop();
    if (ok) { say(pick(LINES.correct), 'react'); sfx.correct(); confetti(90); }
    else    { say(pick(Game.lastPick === -1 ? LINES.timeout : LINES.wrong), 'react'); sfx.wrong(); }
    if (Math.random() < 0.35) say(pick(LINES.roast), 'roast');
  });
  Game.on('end', won => { say(pick(won ? LINES.win : LINES.lose), 'end'); won ? (sfx.win(), confetti(300)) : sfx.wrong(); });

  // ===== 6. Asli human 3D model (optional): repo mein host.glb rakho to cartoon ki jagah wahi dikhega =====
  const st = Game.studio;
  if (st && THREE.GLTFLoader) new THREE.GLTFLoader().load('host.glb', gltf => {
    const m = gltf.scene, box = new THREE.Box3().setFromObject(m);
    m.scale.setScalar(3.3 / (box.max.y - box.min.y));                  // lambai 3.3 unit
    box.setFromObject(m); m.position.y -= box.min.y; m.position.x -= (box.max.x + box.min.x) / 2;
    st.cartoon.visible = false; st.host.add(m);
    if (gltf.animations.length) {                                       // idle animation chalao
      const mx = new THREE.AnimationMixer(m);
      mx.clipAction(gltf.animations.find(a => /idle/i.test(a.name)) || gltf.animations[0]).play();
      st.hooks.push(dt => mx.update(dt));
    }
    const morphs = [];                                                  // muh ki lip-sync (agar model mein ho)
    m.traverse(o => { if (o.morphTargetDictionary) { const k = ['mouthOpen', 'jawOpen', 'viseme_aa'].find(n => n in o.morphTargetDictionary); if (k) morphs.push([o, o.morphTargetDictionary[k]]); } });
    st.hooks.push((dt, t) => morphs.forEach(([o, i]) => o.morphTargetInfluences[i] = Game.host.talking ? Math.abs(Math.sin(t * 12)) * 0.7 : 0));
    console.log('host.glb load ho gaya');
  }, undefined, () => console.log('host.glb nahi mila, cartoon host chalega'));
})();
