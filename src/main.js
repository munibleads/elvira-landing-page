// ─── Nav scroll + mobile menu ────────────────────────────
const header = document.getElementById('navbar');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

const menuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('active');
    menuBtn.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuBtn.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ─── Scroll Spy ──────────────────────────────────────────
const observerOptions = {
  root: null,
  rootMargin: '-40% 0px -40% 0px',
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      if (!id) return;
      
      navLinks.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${id}`) {
          link.classList.add('current');
        } else {
          link.classList.remove('current');
        }
      });
    }
  });
}, observerOptions);

document.querySelectorAll('section[id], footer[id]').forEach((section) => {
  observer.observe(section);
});

// ─── Use-case tabs ───────────────────────────────────────
const tabs = document.querySelectorAll('.tab');
const ucCards = document.querySelectorAll('.uc-card');
const ucTrack = document.getElementById('uc-track');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    const cat = tab.dataset.tab;
    ucCards.forEach(card => {
      const show = cat === 'all' || card.dataset.cat === cat;
      card.classList.toggle('is-hidden', !show);
    });
    if (ucTrack) ucTrack.scrollTo({ left: 0, behavior: 'smooth' });
  });
});

// ─── Hero — agentic enterprise mesh ──────────────────────
// A subtle infrastructure grid + drifting agent nodes + hub
// nodes that emit pulse rings + directional data packets
// traveling along network edges. Cursor acts as an attractor.
const canvas = document.getElementById('hero-canvas');
if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  let agents = [];
  let hubs = [];
  let packets = [];
  let rings = [];
  const mouse = { x: -9999, y: -9999, active: false };

  // tuning
  const LINK = 170;
  const LINK2 = LINK * LINK;
  const AGENT_DENSITY = 26000;   // px² per agent
  const HUB_RATIO = 0.18;        // proportion of agents that are hubs

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    init();
  };

  const init = () => {
    const count = Math.max(18, Math.min(48, Math.round((W * H) / AGENT_DENSITY)));
    agents = new Array(count).fill(0).map((_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.14,
      vy: (Math.random() - 0.5) * 0.14,
      r: 1.4 + Math.random() * 1.0,
      hub: Math.random() < HUB_RATIO,
      ringT: Math.random(),
      breath: Math.random() * Math.PI * 2,
    }));
    hubs = agents.filter(a => a.hub).map(h => ({ ref: h, ringT: Math.random() }));
    packets = [];
    rings = [];
  };

  // Spawn a packet between two near agents (prefer hub→spoke)
  const spawnPacket = () => {
    if (agents.length < 2) return;
    const fromList = hubs.length && Math.random() < 0.7
      ? hubs.map(h => h.ref) : agents;
    const a = fromList[Math.floor(Math.random() * fromList.length)];
    const candidates = [];
    for (const n of agents) {
      if (n === a) continue;
      const dx = n.x - a.x, dy = n.y - a.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < LINK2 && d2 > 200) candidates.push(n);
    }
    if (!candidates.length) return;
    const b = candidates[Math.floor(Math.random() * candidates.length)];
    packets.push({ from: a, to: b, t: 0, speed: 0.011 + Math.random() * 0.012 });
  };

  // Draw the soft infrastructure grid (dots only, very low contrast)
  const drawGrid = () => {
    const step = 38;
    ctx.fillStyle = 'rgba(20, 30, 60, 0.06)';
    for (let x = step; x < W; x += step) {
      for (let y = step; y < H; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  let last = performance.now();
  let pTimer = 0, ringTimer = 0;

  const tick = (now) => {
    const dt = Math.min(48, now - last);
    last = now;
    pTimer += dt;
    ringTimer += dt;

    if (pTimer > 220 && packets.length < 9) { pTimer = 0; spawnPacket(); }
    if (ringTimer > 1600 && hubs.length) {
      ringTimer = 0;
      const h = hubs[Math.floor(Math.random() * hubs.length)].ref;
      rings.push({ x: h.x, y: h.y, t: 0 });
    }

    ctx.clearRect(0, 0, W, H);

    // 1. Infrastructure grid
    drawGrid();

    // 2. Update agents
    for (const a of agents) {
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < -30) a.x = W + 30;
      if (a.x > W + 30) a.x = -30;
      if (a.y < -30) a.y = H + 30;
      if (a.y > H + 30) a.y = -30;
      // gentle attraction to cursor
      if (mouse.active) {
        const dx = mouse.x - a.x, dy = mouse.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 36000 && d2 > 100) {
          const f = (1 - d2 / 36000) * 0.25;
          const d = Math.sqrt(d2);
          a.x += (dx / d) * f;
          a.y += (dy / d) * f;
        }
      }
      a.breath += 0.018;
    }

    // 3. Connections (edges of the mesh)
    ctx.lineWidth = 1;
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const a = agents[i], b = agents[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK2) {
          const op = (1 - d2 / LINK2) * 0.16;
          ctx.strokeStyle = `rgba(20, 30, 60, ${op})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // 4. Hub pulse rings (concentric, expanding)
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.t += dt / 1400;
      if (r.t >= 1) { rings.splice(i, 1); continue; }
      const radius = 6 + r.t * 70;
      const op = (1 - r.t) * 0.28;
      ctx.strokeStyle = `rgba(40, 90, 220, ${op})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 5. Data packets — bright dot trailing a glow, traveling along edges
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += p.speed;
      if (p.t >= 1) { packets.splice(i, 1); continue; }
      const x = p.from.x + (p.to.x - p.from.x) * p.t;
      const y = p.from.y + (p.to.y - p.from.y) * p.t;
      // trail
      const tx = p.from.x + (p.to.x - p.from.x) * Math.max(0, p.t - 0.12);
      const ty = p.from.y + (p.to.y - p.from.y) * Math.max(0, p.t - 0.12);
      const trail = ctx.createLinearGradient(tx, ty, x, y);
      trail.addColorStop(0, 'rgba(40,90,220,0)');
      trail.addColorStop(1, 'rgba(40,90,220,0.55)');
      ctx.strokeStyle = trail;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();
      // glow head
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 12);
      grd.addColorStop(0, 'rgba(40,90,220,0.85)');
      grd.addColorStop(0.5, 'rgba(40,90,220,0.25)');
      grd.addColorStop(1, 'rgba(40,90,220,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Agent nodes (with hub differentiation)
    for (const a of agents) {
      const breath = (Math.sin(a.breath) + 1) * 0.5;
      if (a.hub) {
        // hub: solid core + soft halo + thin ring
        const halo = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 18);
        halo.addColorStop(0, 'rgba(40,90,220,0.22)');
        halo.addColorStop(1, 'rgba(40,90,220,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(20,30,60,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(20,30,60,0.85)';
        ctx.beginPath();
        ctx.arc(a.x, a.y, 2.4 + breath * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(20,30,60,${0.32 + breath * 0.30})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(tick);
  };

  resize();
  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  canvas.addEventListener('mouseleave', () => { mouse.active = false; });
  requestAnimationFrame(tick);
}
