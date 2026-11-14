// PHASE 3: 3D studio (Three.js). Samne baitha host, desk, lights, chamakti dhool.
// Baaki phases host ko control karte hain: Game.host.say(seconds) aur Game.host.react('cheer' | 'sad')
(() => {
  if (typeof THREE === 'undefined') { console.warn('Three.js load nahi hua (internet check karo)'); return; }

  // ---------- 1. Canvas, renderer, scene, camera ----------
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '-1', pointerEvents: 'none' });
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 2.4, 10);
  camera.lookAt(0, 1.9, 0);

  // ---------- 2. Lights ----------
  scene.add(new THREE.AmbientLight(0x7a6cff, 0.7));
  const key = new THREE.SpotLight(0xffffff, 1.3, 30, 0.6, 0.5); key.position.set(0, 7, 7); scene.add(key);
  const accent = new THREE.PointLight(0xffc933, 1.4, 22); accent.position.set(-3, 3, 4); scene.add(accent);
  const rim = new THREE.PointLight(0x7a4dff, 1.6, 22); rim.position.set(3, 4, -3); scene.add(rim);

  // ---------- 3. Chhote helper ----------
  const M = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.5, metalness: 0.1 }, o));
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
  const lerp = (a, b, k) => a + (b - a) * k;

  // ---------- 4. Studio set ----------
  scene.add(Object.assign(mesh(new THREE.CircleGeometry(7, 48), M(0x120a33, { metalness: .6, roughness: .25 })), { rotation: new THREE.Euler(-Math.PI / 2, 0, 0) }));
  const ring = mesh(new THREE.TorusGeometry(3.4, 0.05, 12, 80), M(0xffc933, { emissive: 0xffa800, emissiveIntensity: 1.2 }), 0, 0.03, 0);
  ring.rotation.x = Math.PI / 2; scene.add(ring);
  const bars = [];
  for (let i = 0; i < 15; i++) {
    const b = mesh(new THREE.BoxGeometry(0.3, 6, 0.2), M(i % 2 ? 0x5b2bff : 0xffa800, { emissive: i % 2 ? 0x5b2bff : 0xffa800, emissiveIntensity: 0.6 }), -7 + i, 3, -4);
    bars.push(b); scene.add(b);
  }

  // ---------- 5. Host (primitives se bana) ----------
  const host = new THREE.Group(); scene.add(host);
  const skin = M(0xe0a878), gold = M(0xd89b00, { metalness: .6, roughness: .35 }), dark = M(0x1a1030, { roughness: .8 });
  host.add(mesh(new THREE.CylinderGeometry(0.55, 0.7, 1.3, 24), gold, 0, 1.5, 0));          // jacket
  host.add(mesh(new THREE.BoxGeometry(0.3, 0.14, 0.08), M(0xe0263d), 0, 2.08, 0.5));        // bow-tie

  const head = new THREE.Group(); head.position.y = 2.15; host.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.42, 28, 20), skin, 0, 0.5, 0));
  const hair = mesh(new THREE.SphereGeometry(0.46, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), dark, 0, 0.56, -0.03); head.add(hair);
  const eyes = [-1, 1].map(s => { const e = mesh(new THREE.SphereGeometry(0.05, 12, 12), dark, s * 0.15, 0.56, 0.38); head.add(e);
    const g = mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 24), gold, s * 0.15, 0.56, 0.4); head.add(g); return e; });
  head.add(mesh(new THREE.BoxGeometry(0.1, 0.012, 0.012), gold, 0, 0.57, 0.41));            // glasses bridge
  head.add(mesh(new THREE.SphereGeometry(0.05, 10, 10), skin, 0, 0.47, 0.42));              // nose
  const mouth = mesh(new THREE.BoxGeometry(0.2, 0.05, 0.04), M(0x8a1c2b), 0, 0.33, 0.4); head.add(mouth);

  const makeArm = side => {
    const p = new THREE.Group(); p.position.set(side * 0.68, 2.0, 0);
    p.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.9, 12), gold, 0, -0.45, 0));
    p.add(mesh(new THREE.SphereGeometry(0.15, 12, 12), skin, 0, -0.95, 0));
    host.add(p); return p;
  };
  const armL = makeArm(-1), armR = makeArm(1);

  // Desk + naam ki plate
  host.add(mesh(new THREE.BoxGeometry(3, 1.5, 0.9), M(0x2a1670, { roughness: .4 }), 0, 0.75, 0.9));
  host.add(mesh(new THREE.BoxGeometry(3.15, 0.08, 1.05), gold, 0, 1.52, 0.9));
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#1a1030'; g.fillRect(0, 0, 512, 128); g.strokeStyle = '#ffc933'; g.lineWidth = 8; g.strokeRect(4, 4, 504, 120);
  g.fillStyle = '#ffc933'; g.font = 'bold 52px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  Game.host = { name: 'Bhaukaal Bhaiya' };                                                   // naam yahan badal sakte ho
  g.fillText(Game.host.name, 256, 64);
  host.add(mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }), 0, 0.85, 1.36));

  // ---------- 6. Chamakti dhool ----------
  const N = 140, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 16; pos[i * 3 + 1] = Math.random() * 7; pos[i * 3 + 2] = (Math.random() - .5) * 8; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffd75e, size: 0.06, transparent: true, opacity: 0.8 })));

  // ---------- 7. Host ki reactions (baaki phases isse use karenge) ----------
  const S = { cheer: 0, sad: 0, talk: 0, flash: 0, arm: 0, color: new THREE.Color(0xffc933) };
  Game.host.say = sec => S.talk = sec;
  Game.host.react = kind => { if (kind === 'cheer') { S.cheer = 2.2; S.color.set(0x1bd67a); } else { S.sad = 1.6; S.color.set(0xe0263d); } S.flash = 0.8; };
  Game.on('start',    () => { S.cheer = 1.2; Game.host.say(2); });
  Game.on('shown',    () => Game.host.say(2));
  Game.on('answered', ok => Game.host.react(ok ? 'cheer' : 'sad'));
  Game.on('end',      won => { won ? Game.host.react('cheer') : Game.host.react('sad'); if (won) S.cheer = 4; });

  // ---------- 8. Screen ke hisaab se host ki jagah ----------
  function resize() {
    const w = innerWidth, h = innerHeight, aspect = w / h;
    renderer.setSize(w, h, false); camera.aspect = aspect; camera.updateProjectionMatrix();
    const halfW = Math.tan(THREE.MathUtils.degToRad(20)) * 10 * aspect;
    if (aspect > 1.1) { host.scale.setScalar(1.15); host.position.set(halfW * 0.55, 0, 0); }       // computer: host dayen taraf
    else { host.scale.setScalar(Math.max(0.45, aspect * 0.85)); host.position.set(0, 2.2, 0); }   // phone: host upar
  }
  addEventListener('resize', resize); resize();

  // ---------- 9. Animation loop ----------
  let last = performance.now();
  (function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.1), t = now / 1000; last = now;
    for (const k of ['cheer', 'sad', 'talk', 'flash']) S[k] = Math.max(0, S[k] - dt);

    S.arm = lerp(S.arm, S.cheer > 0 ? 1 : 0, Math.min(1, dt * 6));
    armL.rotation.set(lerp(-0.95, 0, S.arm), 0, lerp(0, -2.5, S.arm));
    armR.rotation.set(lerp(-0.95, 0, S.arm), 0,  lerp(0, 2.5, S.arm));
    head.rotation.y = S.sad > 0 ? Math.sin(t * 14) * 0.35 : Math.sin(t * 0.6) * 0.15;
    head.rotation.x = S.talk > 0 ? Math.sin(t * 5) * 0.05 : 0;
    host.position.y = (innerWidth / innerHeight > 1.1 ? 0 : 2.2) + Math.sin(t * 1.5) * 0.01 + (S.cheer > 0 ? Math.abs(Math.sin(t * 10)) * 0.12 : 0);
    mouth.scale.y = S.talk > 0 ? 0.5 + Math.abs(Math.sin(t * 16)) * 2 : 0.6;
    eyes.forEach(e => e.scale.y = (t % 3.5) < 0.12 ? 0.1 : 1);

    accent.color.set(S.flash > 0 ? S.color : 0xffc933); accent.intensity = S.flash > 0 ? 3 : 1.4;
    ring.rotation.z += dt * 0.4;
    bars.forEach((b, i) => b.material.emissiveIntensity = 0.5 + Math.sin(t * 2 + i) * 0.3);
    const p = dustGeo.attributes.position;
    for (let i = 0; i < N; i++) { p.array[i * 3 + 1] += dt * 0.2; if (p.array[i * 3 + 1] > 7) p.array[i * 3 + 1] = 0; }
    p.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  })(last);
})();
